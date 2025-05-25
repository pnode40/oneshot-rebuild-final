# Production Environment Configuration Template

Create a `.env.production` file in your project root with the following configuration:

```bash
# OneShot Production Environment Configuration
# Copy this template and fill in your actual values

# =============================================================================
# CORE APPLICATION SETTINGS
# =============================================================================

NODE_ENV=production
PORT=3001

# JWT Secret - Generate a secure random string (minimum 256 bits)
# You can generate one with: openssl rand -base64 32
JWT_SECRET=your-super-secure-jwt-secret-at-least-256-bits-long

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://username:password@localhost:5432/oneshot_prod

# Database credentials (for Docker Compose)
POSTGRES_DB=oneshot_prod
POSTGRES_USER=oneshot_user
POSTGRES_PASSWORD=your-secure-database-password

# =============================================================================
# EMAIL NOTIFICATION SERVICE (SendGrid Recommended)
# =============================================================================

# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key-here
SMTP_FROM="OneShot Security <security@yourdomain.com>"

# Alternative email providers:
# Gmail:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# AWS SES:
# SMTP_HOST=email-smtp.us-east-1.amazonaws.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-aws-access-key-id
# SMTP_PASS=your-aws-secret-access-key

# =============================================================================
# SMS NOTIFICATION SERVICE (Twilio)
# =============================================================================

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+15551234567

# =============================================================================
# PUSH NOTIFICATION SERVICE (Web Push VAPID)
# =============================================================================

# Generate VAPID keys with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=BNg_your_public_key_here
VAPID_PRIVATE_KEY=q1Q_your_private_key_here

# =============================================================================
# SLACK INTEGRATION
# =============================================================================

# Slack Webhook URL
# Create at: https://api.slack.com/apps > Your App > Incoming Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

# =============================================================================
# SECURITY SETTINGS
# =============================================================================

# Force HTTPS in production
FORCE_HTTPS=true
SECURE_COOKIES=true

# Password hashing strength (10-12 recommended for production)
BCRYPT_ROUNDS=12

# Session configuration
SESSION_SECRET=your-session-secret-here
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_MAX_AGE=86400000

# =============================================================================
# RATE LIMITING & SECURITY
# =============================================================================

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS configuration (comma-separated origins)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# =============================================================================
# LOGGING & MONITORING
# =============================================================================

# Logging level (error, warn, info, debug)
LOG_LEVEL=info
LOG_FILE=/var/log/oneshot/app.log

# Enable metrics collection
ENABLE_METRICS=true
METRICS_PORT=9090

# =============================================================================
# REDIS CONFIGURATION (Optional - for session storage and caching)
# =============================================================================

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# =============================================================================
# AWS CONFIGURATION (Optional - for S3 file storage)
# =============================================================================

# AWS credentials for S3 file storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=oneshot-uploads-production

# =============================================================================
# EXTERNAL SERVICE API KEYS (Optional)
# =============================================================================

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Sentry error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# =============================================================================
# NOTIFICATION CUSTOMIZATION
# =============================================================================

# Default notification settings
DEFAULT_NOTIFICATION_THRESHOLD=medium
DEFAULT_QUIET_HOURS_START=22:00
DEFAULT_QUIET_HOURS_END=08:00

# Escalation settings
DEFAULT_ESCALATION_MINUTES=30
CRITICAL_ESCALATION_MINUTES=15

# =============================================================================
# BACKUP & MAINTENANCE
# =============================================================================

# Backup configuration
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=oneshot-backups-production

# =============================================================================
# DEVELOPMENT/TESTING OVERRIDES
# =============================================================================

# Uncomment for testing notification services without sending real notifications
# NOTIFICATION_TEST_MODE=true
# TEST_EMAIL_RECIPIENT=test@yourdomain.com
# TEST_PHONE_NUMBER=+15551234567
```

## Setup Instructions

1. **Copy the template:**
   ```bash
   cp docs/production-deployment/env-template.md .env.production
   ```

2. **Fill in your values:** Replace all placeholder values with your actual configuration

3. **Secure the file:** 
   ```bash
   chmod 600 .env.production
   ```

4. **Validate configuration:**
   ```bash
   ./scripts/health-check.sh
   ```

## External Service Setup

### SendGrid (Email)
1. Create account at [sendgrid.com](https://sendgrid.com/)
2. Verify your domain
3. Generate API key with "Mail Send" permissions
4. Set up domain authentication (DNS records)

### Twilio (SMS)
1. Create account at [twilio.com](https://www.twilio.com/)
2. Purchase a phone number
3. Get Account SID and Auth Token from console

### VAPID Keys (Push Notifications)
```bash
npx web-push generate-vapid-keys
```

### Slack Integration
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app → "From scratch"
3. Enable "Incoming Webhooks"
4. Add webhook to desired channel

## Security Notes

- **Never commit `.env.production` to version control**
- Use strong, unique passwords for all services
- Rotate API keys and secrets regularly
- Enable 2FA on all external service accounts
- Monitor API usage and set up billing alerts
- Regularly review and audit access permissions

## Validation

After configuration, run the health check script to validate all services:

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

This will verify:
- Database connectivity
- Email service configuration
- SMS service setup
- Push notification configuration
- Slack webhook functionality
- Security settings validation 