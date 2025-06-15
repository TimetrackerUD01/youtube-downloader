# YouTube Downloader Deployment Guide

## 🚀 Deployment Options

### 1. Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
4. Deploy automatically

### 2. Render

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`

### 3. Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

### 4. Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`

### 5. Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Commands:
```bash
docker build -t youtube-downloader .
docker run -p 3000:3000 youtube-downloader
```

## 🔧 Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=50

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=warn
```

## 📦 Production Optimizations

### 1. Enable Production Mode
```bash
NODE_ENV=production npm start
```

### 2. Use Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name youtube-downloader
pm2 startup
pm2 save
```

### 3. Enable Compression
Add to server.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### 4. Security Headers
```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 🔒 Security Considerations

1. **Rate Limiting**: Implemented ✅
2. **Input Validation**: Implemented ✅
3. **CORS Configuration**: Implemented ✅
4. **Error Sanitization**: Implemented ✅
5. **HTTPS**: Configure on platform
6. **Domain Restrictions**: Configure in config.js

## 📊 Monitoring

### Health Check Endpoint
```
GET /health
```

### Logs
- Server logs available in platform dashboard
- Custom logging in development mode

### Performance
- Monitor CPU and memory usage
- Set up alerts for high error rates

## 🆘 Troubleshooting Production

### Common Issues:
1. **Memory Limits**: Increase on platform
2. **Timeout Errors**: Adjust request timeout
3. **Rate Limiting**: Monitor usage patterns
4. **YouTube API Changes**: Update ytdl-core regularly

### Quick Fixes:
```bash
# Update dependencies
npm update

# Clear cache
npm start -- --clear-cache

# Restart service
pm2 restart youtube-downloader
```
