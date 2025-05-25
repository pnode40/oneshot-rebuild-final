# OneShot Production Deployment Guide

**Version**: 1.0  
**Updated**: 2025-05-23  
**Sprint**: A-2025-05-23-011  

## 🚀 Overview

This guide covers the complete production deployment of OneShot's enterprise-grade multi-channel notification system built in Sprint A-2025-05-23-010.

## 📋 Prerequisites

- **Node.js**: 18+ LTS
- **PostgreSQL**: 15+
- **Domain**: With SSL/TLS certificate
- **External Services**: SendGrid, Twilio, Slack workspace

## 🔧 Service Configuration

### 1. Email Service (SendGrid - Recommended)

#### Account Setup
```bash
# 1. Create SendGrid account at sendgrid.com
# 2. Verify your email/domain
# 3. Set up domain authentication (DNS records)
# 4. Generate API key with "Mail Send" permissions
```

#### DNS Configuration
```bash
# Add these DNS records for domain authentication:
# CNAME: s1._domainkey.yourdomain.com → s1.domainkey.u12345.wl.sendgrid.net
# CNAME: s2._domainkey.yourdomain.com → s2.domainkey.u12345.wl.sendgrid.net
# CNAME: em12345.yourdomain.com → u12345.wl.sendgrid.net
```

#### Environment Variables
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
SMTP_FROM="OneShot Security <security@yourdomain.com>"
```

### 2. SMS Service (Twilio)

#### Account Setup
```bash
# 1. Create Twilio account at twilio.com
# 2. Complete phone number verification
# 3. Purchase a phone number
# 4. Get Account SID and Auth Token from console
```

#### Environment Variables
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15551234567
```

### 3. Push Notifications (Web Push VAPID)

#### VAPID Key Generation
```bash
# Install web-push CLI
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Output:
# Public Key: BNg...
# Private Key: q1Q...
```

#### Environment Variables
```bash
VAPID_PUBLIC_KEY=BNg_your_public_key_here
VAPID_PRIVATE_KEY=q1Q_your_private_key_here
```

### 4. Slack Integration

#### Slack App Setup
```bash
# 1. Go to api.slack.com/apps
# 2. Create new app → "From scratch"
# 3. Enable "Incoming Webhooks"
# 4. Add webhook to desired channel
# 5. Copy webhook URL
```

#### Environment Variables
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

## 🐳 Docker Production Setup

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S oneshot -u 1001

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=oneshot:nodejs /app/dist ./dist
COPY --from=builder --chown=oneshot:nodejs /app/public ./public

USER oneshot

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "dist/index.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  oneshot-app:
    build: .
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      
      # Email Configuration
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_SECURE: ${SMTP_SECURE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      SMTP_FROM: ${SMTP_FROM}
      
      # SMS Configuration
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
      
      # Push Notifications
      VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY}
      VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY}
      
      # Slack Integration
      SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL}
      
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - oneshot-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - oneshot-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - oneshot-network

volumes:
  postgres_data:

networks:
  oneshot-network:
    driver: bridge
```

## 🔒 Security Configuration

### Environment Variables (.env.production)
```bash
# Core Application
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-at-least-256-bits-long

# Database
DATABASE_URL=postgresql://username:password@postgres:5432/oneshot_prod

# Email Service (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
SMTP_FROM="OneShot Security <security@yourdomain.com>"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15551234567

# Push Notifications
VAPID_PUBLIC_KEY=BNg_your_public_key_here
VAPID_PRIVATE_KEY=q1Q_your_private_key_here

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Security Settings
FORCE_HTTPS=true
SECURE_COOKIES=true
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-session-secret-here
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time notifications
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Deployment Scripts

### deploy.sh
```bash
#!/bin/bash

set -e

echo "🚀 Starting OneShot Production Deployment..."

# Environment check
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Build and deploy
echo "📦 Building Docker images..."
docker-compose -f docker-compose.yml build

echo "🗄️ Running database migrations..."
docker-compose run --rm oneshot-app npm run migrate

echo "🌱 Seeding database..."
docker-compose run --rm oneshot-app npm run seed

echo "🔧 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🧪 Running health checks..."
./scripts/health-check.sh

echo "✅ Deployment completed successfully!"
echo "🌐 Application available at: https://yourdomain.com"
```

### health-check.sh
```bash
#!/bin/bash

BASE_URL="https://yourdomain.com"

echo "🏥 Running health checks..."

# Basic health check
if curl -f "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo "✅ Application health: OK"
else
    echo "❌ Application health: FAILED"
    exit 1
fi

# Database connectivity
if curl -f "$BASE_URL/api/debug/db-test" > /dev/null 2>&1; then
    echo "✅ Database connectivity: OK"
else
    echo "❌ Database connectivity: FAILED"
    exit 1
fi

# Notification service status
if curl -f "$BASE_URL/api/notifications/channels/status" > /dev/null 2>&1; then
    echo "✅ Notification services: OK"
else
    echo "❌ Notification services: FAILED"
    exit 1
fi

echo "🎉 All health checks passed!"
```

## 📊 Monitoring & Logging

### Production Monitoring Setup
```bash
# Install monitoring tools
npm install --save \
  winston \
  morgan \
  helmet \
  compression \
  express-rate-limit

# Environment monitoring variables
LOG_LEVEL=info
LOG_FILE=/var/log/oneshot/app.log
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Logging Configuration
```javascript
// Production logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'oneshot-api' },
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/oneshot/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/oneshot/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🧪 Testing Production Setup

### Notification Service Tests
```bash
# Test email service
curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["email"], "severity": "medium"}'

# Test SMS service
curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["sms"], "severity": "high"}'

# Test push notifications
curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["push"], "severity": "critical"}'

# Test Slack integration
curl -X POST "$BASE_URL/api/notifications/test" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["slack"], "severity": "medium"}'
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Email Not Sending
```bash
# Check SendGrid configuration
curl -X GET "$BASE_URL/api/notifications/channels/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Verify DNS records
dig TXT yourdomain.com
dig CNAME s1._domainkey.yourdomain.com
```

#### SMS Failures
```bash
# Check Twilio account status
# Verify phone number format (+1XXXXXXXXXX)
# Check Twilio console for error messages
# Ensure sufficient account balance
```

#### Push Notifications Not Working
```bash
# Ensure HTTPS is enabled
# Check VAPID keys are correctly set
# Verify service worker is registered
# Check browser developer console for errors
```

#### Slack Messages Not Delivered
```bash
# Verify webhook URL is correct
# Check Slack app permissions
# Test webhook manually:
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test message from OneShot"}'
```

## 📈 Performance Optimization

### Production Optimizations
```javascript
// Enable compression
app.use(compression());

// Security headers
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));
```

## 🔄 Backup & Recovery

### Database Backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/oneshot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker exec oneshot_postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > \
  "$BACKUP_DIR/oneshot_db_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/oneshot_db_$DATE.sql"

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: oneshot_db_$DATE.sql.gz"
```

## 📞 Support & Maintenance

### Monitoring Dashboards
- **Application Health**: `/api/health`
- **Database Status**: `/api/debug/db-test`
- **Notification Status**: `/api/notifications/channels/status`
- **Real-time Metrics**: WebSocket dashboard

### Maintenance Schedule
- **Daily**: Automated backups
- **Weekly**: Log rotation and cleanup
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance optimization review

---

**🎉 PRODUCTION READY**: OneShot notification system is fully configured for enterprise deployment with comprehensive monitoring, security, and reliability features. 