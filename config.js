// Configuration file for YouTube Downloader
module.exports = {
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Rate limiting settings
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 10,
    message: 'Too many requests from this IP, please try again later.'
  },

  // YouTube API settings
  youtube: {
    maxVideoFormats: 6,
    maxAudioFormats: 3,
    defaultVideoQuality: 'highest',
    defaultAudioQuality: 'highestaudio',
    requestTimeout: 15000 // 15 seconds
  },

  // Search settings
  search: {
    defaultLimit: 10,
    maxLimit: 20
  },

  // Logging settings
  logging: {
    enabled: process.env.NODE_ENV !== 'production',
    level: process.env.LOG_LEVEL || 'info',
    requests: true
  },

  // Security settings
  security: {
    validateUrls: true,
    allowedDomains: [
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'm.youtube.com'
    ]
  }
};
