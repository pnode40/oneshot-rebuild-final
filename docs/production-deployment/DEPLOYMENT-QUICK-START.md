# OneShot Production Deployment - Quick Start Guide

**🚀 Get OneShot running in production in under 30 minutes**

## ⚡ Prerequisites Check

Before starting, ensure you have:

- [ ] **Docker & Docker Compose** installed
- [ ] **Domain name** with SSL certificate
- [ ] **External service accounts** ready:
  - SendGrid (email)
  - Twilio (SMS)
  - Slack workspace (webhooks)

## 🔧 Step 1: Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd oneshot

# Create production environment file
cp docs/production-deployment/env-template.md .env.production
```

## 📝 Step 2: Configure Environment

Edit `.env.production` with your actual values:

### Required Settings
```bash
# Core Application
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-at-least-256-bits-long
DATABASE_URL=postgresql://username:password@postgres:5432/oneshot_prod

# SendGrid Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PASS=SG.your-sendgrid-api-key
SMTP_FROM="OneShot Security <security@yourdomain.com>"

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15551234567

# Push Notifications (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=BNg_your_public_key_here
VAPID_PRIVATE_KEY=q1Q_your_private_key_here

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🚀 Step 3: Deploy

### Linux/macOS
```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/health-check.sh

# Deploy
./scripts/deploy.sh
```

### Windows (PowerShell)
```powershell
# Run deployment
bash scripts/deploy.sh

# Or run steps manually:
docker-compose down --remove-orphans
docker-compose build
docker-compose up -d
```

## 🧪 Step 4: Verify Deployment

### Automatic Health Check
```bash
# Linux/macOS
./scripts/health-check.sh

# Windows
bash scripts/health-check.sh
```

### Manual Verification
1. **Application Health**: http://localhost:3001/api/health
2. **Database**: http://localhost:3001/api/debug/db-test
3. **Notifications**: http://localhost:3001/api/notifications/channels/status

## 🔍 Step 5: Test Notification Services

### Quick Test (replace YOUR_ADMIN_TOKEN)
```bash
# Test email
curl -X POST "http://localhost:3001/api/notifications/test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["email"], "severity": "medium"}'

# Test push notifications
curl -X POST "http://localhost:3001/api/notifications/test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channels": ["push"], "severity": "medium"}'
```

## 🌐 Production Access Points

After successful deployment:

| Service | URL | Purpose |
|---------|-----|---------|
| **Main App** | `http://localhost:3001` | Primary application |
| **Health Check** | `http://localhost:3001/api/health` | System status |
| **Notifications** | `http://localhost:3001/api/notifications/channels/status` | Service status |
| **Admin Dashboard** | `http://localhost:3001/admin/security` | Security management |

## 🔒 Security Hardening

### 1. SSL/TLS Setup
```nginx
# Add to your Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

### 2. Environment Security
```bash
# Secure the environment file (Linux/macOS)
chmod 600 .env.production

# Windows - Right-click → Properties → Security → Advanced
```

### 3. Firewall Configuration
```bash
# Allow only necessary ports
# 3001 - Application
# 5432 - PostgreSQL (internal only)
# 6379 - Redis (internal only)
```

## 📊 Monitoring & Logs

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f oneshot-app
docker-compose logs -f postgres
```

### Monitor Resource Usage
```bash
# Container stats
docker stats

# System resources
docker system df
```

## 🔧 Common Issues & Solutions

### Issue: Database Connection Failed
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Issue: Email Not Sending
1. Verify SendGrid API key is correct
2. Check domain authentication in SendGrid
3. Ensure `SMTP_FROM` uses verified domain

### Issue: Push Notifications Not Working
1. Ensure HTTPS is enabled
2. Check VAPID keys are correctly set
3. Verify service worker registration

### Issue: Port Already in Use
```bash
# Windows - Find process using port 3001
netstat -ano | findstr :3001

# Linux/macOS
lsof -i :3001

# Kill process or change port in .env.production
```

## 🔄 Backup & Maintenance

### Daily Backup (Automated)
```bash
# Database backup
docker exec oneshot_postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql
```

### Update Dependencies
```bash
# Stop services
docker-compose down

# Rebuild with latest dependencies
docker-compose build --no-cache

# Restart
docker-compose up -d
```

## 📞 Support & Troubleshooting

### Health Check Details
The health check script validates:
- ✅ Application connectivity
- ✅ Database connection
- ✅ Email service configuration
- ✅ SMS service setup
- ✅ Push notification configuration
- ✅ Slack webhook functionality
- ✅ System resources (memory, disk)

### Logs & Debugging
```bash
# Application logs
docker-compose logs oneshot-app

# Database logs
docker-compose logs postgres

# All service status
docker-compose ps
```

### Emergency Recovery
```bash
# Stop all services
docker-compose down

# Remove containers and volumes (DANGER: Data loss)
docker-compose down -v

# Fresh start
./scripts/deploy.sh
```

---

## 🎉 Success! OneShot is Production Ready

Your OneShot application is now running with:

- ✅ **Multi-channel notifications** (Email, SMS, Push, Slack)
- ✅ **Enterprise security** (SSL, container security, secrets)
- ✅ **Automated monitoring** (Health checks, logging, metrics)
- ✅ **Scalable infrastructure** (Docker, PostgreSQL, Redis)
- ✅ **Production hardening** (Rate limiting, security headers)

**Next Steps:**
1. Set up domain and SSL certificate
2. Configure monitoring alerts
3. Implement backup automation
4. Scale horizontally as needed

**For detailed configuration, see:** `docs/production-deployment/README.md` 