// Service Worker สำหรับ YouTube Downloader PWA
const CACHE_NAME = 'yt-downloader-v1';
const urlsToCache = [
    '/',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/favicon-192x192.png',
    '/apple-touch-icon.png',
    '/site.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('❌ Cache install failed:', err))
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // Fallback for offline
                if (event.request.destination === 'document') {
                    return caches.match('/');
                }
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
