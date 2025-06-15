const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.method === 'POST' && req.body) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Rate limiting (simple implementation)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitMiddleware = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimit.has(clientIP)) {
        rateLimit.set(clientIP, []);
    }
    
    const requests = rateLimit.get(clientIP);
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        });
    }
    
    recentRequests.push(now);
    rateLimit.set(clientIP, recentRequests);
    next();
};

// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url);
};

// Helper function to get video ID from URL
const getVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Helper function to format duration
const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format views
const formatViews = (views) => {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
};

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime() 
    });
});

// Get video info by URL
app.post('/api/video-info', rateLimitMiddleware, async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        const videoId = getVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Could not extract video ID' });
        }
        
        // Check if video is available with better error handling
        try {
            const isValid = await ytdl.validateURL(url);
            if (!isValid) {
                return res.status(400).json({ error: 'Video not found or unavailable' });
            }
        } catch (validateError) {
            console.error('Validation error:', validateError.message);
            return res.status(400).json({ 
                error: 'Unable to validate video URL. The video might be private, restricted, or unavailable.',
                details: validateError.message
            });
        }
        
        // Get video info with timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 15000)
        );
        
        const infoPromise = ytdl.getBasicInfo(url);
        const info = await Promise.race([infoPromise, timeoutPromise]);
        const videoDetails = info.videoDetails;
        
        // Get available formats with error handling
        let videoFormats = [];
        let audioFormats = [];
        
        try {
            const formats = await Promise.race([ytdl.getInfo(url), timeoutPromise]);
            
            videoFormats = formats.formats.filter(format => 
                format.hasVideo && format.hasAudio && format.container === 'mp4'
            ).map(format => ({
                itag: format.itag,
                quality: format.qualityLabel || format.quality || 'Unknown',
                container: format.container || 'mp4',
                filesize: format.contentLength,
                fps: format.fps
            })).slice(0, 6); // Limit to 6 formats
            
            audioFormats = formats.formats.filter(format => 
                format.hasAudio && !format.hasVideo
            ).map(format => ({
                itag: format.itag,
                quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Unknown',
                container: format.container || 'mp3',
                filesize: format.contentLength
            })).slice(0, 3); // Limit to 3 formats
        } catch (formatError) {
            console.warn('Could not get detailed formats:', formatError.message);
            // Provide default formats if detailed format info fails
            videoFormats = [
                { itag: 18, quality: '360p', container: 'mp4' },
                { itag: 22, quality: '720p', container: 'mp4' }
            ];
            audioFormats = [
                { itag: 140, quality: '128kbps', container: 'mp3' }
            ];
        }
        
        const response = {
            success: true,
            video: {
                id: videoDetails.videoId,
                title: videoDetails.title,
                description: videoDetails.description?.substring(0, 200) + '...' || 'No description',
                thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || '',
                duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
                views: formatViews(parseInt(videoDetails.viewCount) || 0),
                author: videoDetails.author?.name || 'Unknown',
                uploadDate: videoDetails.uploadDate || 'Unknown',
                isLiveContent: videoDetails.isLiveContent || false
            },
            formats: {
                video: videoFormats,
                audio: audioFormats
            }
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ 
            error: 'Failed to get video information',
            message: error.message 
        });
    }
});

// Search videos
app.post('/api/search', rateLimitMiddleware, async (req, res) => {
    try {
        const { query, limit = 10 } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const searchResults = await ytSearch(query);
        const videos = searchResults.videos.slice(0, limit).map(video => ({
            id: video.videoId,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.duration.timestamp,
            views: formatViews(video.views),
            author: video.author.name,
            uploadDate: video.ago,
            url: video.url
        }));
        
        res.json({
            success: true,
            query,
            results: videos,
            totalResults: searchResults.videos.length
        });
        
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({ 
            error: 'Failed to search videos',
            message: error.message 
        });
    }
});

// Download video
app.post('/api/download', rateLimitMiddleware, async (req, res) => {
    try {
        const { url, format, quality } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        // Validate URL first
        try {
            const isValid = await ytdl.validateURL(url);
            if (!isValid) {
                return res.status(400).json({ error: 'Video not found or unavailable' });
            }
        } catch (validateError) {
            return res.status(400).json({ 
                error: 'Unable to access video. It might be private or restricted.',
                details: validateError.message
            });
        }
        
        const info = await ytdl.getBasicInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
        
        let filename;
        let contentType;
        let stream;
        
        if (format === 'audio') {
            filename = `${videoTitle}.mp3`;
            contentType = 'audio/mpeg';
            
            try {
                stream = ytdl(url, {
                    filter: 'audioonly',
                    quality: 'highestaudio'
                });
            } catch (streamError) {
                return res.status(500).json({ 
                    error: 'Unable to create audio stream',
                    details: streamError.message
                });
            }
        } else {
            filename = `${videoTitle}.mp4`;
            contentType = 'video/mp4';
            
            try {
                const options = {
                    filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
                    quality: quality || 'highest'
                };
                
                // Fallback if no combined formats available
                const info = await ytdl.getInfo(url);
                const combinedFormats = info.formats.filter(f => f.hasVideo && f.hasAudio && f.container === 'mp4');
                
                if (combinedFormats.length === 0) {
                    options.filter = 'videoandaudio';
                    options.quality = 'highest';
                }
                
                stream = ytdl(url, options);
            } catch (streamError) {
                return res.status(500).json({ 
                    error: 'Unable to create video stream',
                    details: streamError.message
                });
            }
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache');
        
        stream.pipe(res);
        
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Download failed',
                    details: error.message
                });
            }
        });
        
        // Handle client disconnect
        req.on('close', () => {
            if (stream && typeof stream.destroy === 'function') {
                stream.destroy();
            }
        });
        
    } catch (error) {
        console.error('Error downloading video:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to download video',
                message: error.message 
            });
        }
    }
});

// Get download URL (alternative method for direct download)
app.post('/api/download-url', rateLimitMiddleware, async (req, res) => {
    try {
        const { url, format, quality, itag } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        // Validate URL first
        try {
            const isValid = await ytdl.validateURL(url);
            if (!isValid) {
                return res.status(400).json({ error: 'Video not found or unavailable' });
            }
        } catch (validateError) {
            return res.status(400).json({ 
                error: 'Unable to access video. It might be private or restricted.',
                details: validateError.message
            });
        }
        
        // Get video info and available formats
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
        
        let selectedFormat;
        let filename;
        
        if (itag) {
            // Find specific format by itag
            selectedFormat = info.formats.find(f => f.itag == itag);
        } else if (format === 'audio') {
            // Find best audio format
            selectedFormat = info.formats
                .filter(f => f.hasAudio && !f.hasVideo)
                .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
            filename = `${videoTitle}.mp3`;
        } else {
            // Find best video format
            const videoFormats = info.formats.filter(f => f.hasVideo && f.hasAudio && f.container === 'mp4');
            
            if (quality && quality !== 'highest') {
                selectedFormat = videoFormats.find(f => f.qualityLabel === quality) || videoFormats[0];
            } else {
                selectedFormat = videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];
            }
            filename = `${videoTitle}.mp4`;
        }
        
        if (!selectedFormat) {
            return res.status(400).json({ error: 'No suitable format found' });
        }
        
        // Return the direct download URL
        res.json({
            success: true,
            downloadUrl: selectedFormat.url,
            filename: filename || `${videoTitle}.${selectedFormat.container}`,
            format: {
                itag: selectedFormat.itag,
                quality: selectedFormat.qualityLabel || `${selectedFormat.audioBitrate}kbps` || 'Unknown',
                container: selectedFormat.container,
                filesize: selectedFormat.contentLength,
                mimeType: selectedFormat.mimeType
            }
        });
        
    } catch (error) {
        console.error('Error getting download URL:', error);
        res.status(500).json({ 
            error: 'Failed to get download URL',
            message: error.message 
        });
    }
});

// Serve static files (for frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Serve manifest
app.get('/site.webmanifest', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'site.webmanifest'));
});

// Serve service worker
app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 YouTube Downloader API Server running on port ${PORT}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});