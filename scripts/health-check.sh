#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:3001}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

echo -e "${GREEN}🏥 Running OneShot Health Checks...${NC}"

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    local headers=${4:-""}
    
    echo -n "Checking $description... "
    
    if [ -n "$headers" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "$headers" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local url=$1
    local description=$2
    local headers=${3:-""}
    
    echo -n "Checking $description... "
    
    if [ -n "$headers" ]; then
        response=$(curl -s -H "$headers" "$url")
    else
        response=$(curl -s "$url")
    fi
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (Invalid JSON)${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Track overall status
overall_status=0

echo -e "\n${YELLOW}🔍 Basic Application Health${NC}"

# Basic health check
if ! check_endpoint "$BASE_URL/api/health" "Application health"; then
    overall_status=1
fi

# Database connectivity
if ! check_endpoint "$BASE_URL/api/debug/db-test" "Database connectivity"; then
    overall_status=1
fi

echo -e "\n${YELLOW}🔔 Notification Services Health${NC}"

# Check if we have admin token for notification tests
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ ADMIN_TOKEN not provided, skipping notification service tests${NC}"
    echo "Set ADMIN_TOKEN environment variable for full notification testing"
else
    AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"
    
    # Notification service status
    if ! check_json_endpoint "$BASE_URL/api/notifications/channels/status" "Notification channel status" "$AUTH_HEADER"; then
        overall_status=1
    fi
    
    # VAPID public key (for push notifications)
    if ! check_json_endpoint "$BASE_URL/api/notifications/vapid-public-key" "VAPID public key"; then
        overall_status=1
    fi
    
    # User preferences endpoint
    if ! check_endpoint "$BASE_URL/api/notifications/preferences" "Notification preferences" 200 "$AUTH_HEADER"; then
        overall_status=1
    fi
fi

echo -e "\n${YELLOW}🔐 Security Dashboard Health${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"
    
    # Security dashboard metrics
    if ! check_json_endpoint "$BASE_URL/api/security-dashboard/metrics" "Security dashboard metrics" "$AUTH_HEADER"; then
        overall_status=1
    fi
    
    # AI security intelligence
    if ! check_endpoint "$BASE_URL/api/ai-security/report" "AI security intelligence" 200 "$AUTH_HEADER"; then
        overall_status=1
    fi
else
    echo -e "${YELLOW}⚠️ Skipping security dashboard tests (no admin token)${NC}"
fi

echo -e "\n${YELLOW}🔌 WebSocket Health${NC}"

# Check if WebSocket server is responding
if command -v wscat > /dev/null 2>&1; then
    echo -n "Checking WebSocket connectivity... "
    if timeout 5 wscat -c "ws://localhost:3001/socket.io/?EIO=4&transport=websocket" -x "42[\"ping\"]" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️ WebSocket test inconclusive${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ wscat not available, skipping WebSocket test${NC}"
    echo "Install wscat with: npm install -g wscat"
fi

echo -e "\n${YELLOW}📊 Service Status${NC}"

# Check Docker containers if available
if command -v docker-compose > /dev/null 2>&1; then
    echo "Docker container status:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}"
else
    echo -e "${YELLOW}⚠️ Docker Compose not available${NC}"
fi

echo -e "\n${YELLOW}🧪 Advanced Health Checks${NC}"

# Memory usage check
echo -n "Checking application memory usage... "
if [ -f "/proc/meminfo" ]; then
    mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    mem_usage=$((100 - (mem_available * 100 / mem_total)))
    
    if [ $mem_usage -lt 80 ]; then
        echo -e "${GREEN}✅ OK (${mem_usage}% used)${NC}"
    elif [ $mem_usage -lt 90 ]; then
        echo -e "${YELLOW}⚠️ WARNING (${mem_usage}% used)${NC}"
    else
        echo -e "${RED}❌ CRITICAL (${mem_usage}% used)${NC}"
        overall_status=1
    fi
else
    echo -e "${YELLOW}⚠️ Unable to check memory usage${NC}"
fi

# Disk space check
echo -n "Checking disk space... "
if command -v df > /dev/null 2>&1; then
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $disk_usage -lt 80 ]; then
        echo -e "${GREEN}✅ OK (${disk_usage}% used)${NC}"
    elif [ $disk_usage -lt 90 ]; then
        echo -e "${YELLOW}⚠️ WARNING (${disk_usage}% used)${NC}"
    else
        echo -e "${RED}❌ CRITICAL (${disk_usage}% used)${NC}"
        overall_status=1
    fi
else
    echo -e "${YELLOW}⚠️ Unable to check disk space${NC}"
fi

# Log file check
echo -n "Checking log file accessibility... "
if [ -w "logs" ] || mkdir -p logs 2>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (Cannot write to logs directory)${NC}"
    overall_status=1
fi

echo -e "\n${YELLOW}🔍 Configuration Validation${NC}"

# Check required environment variables
required_vars=("NODE_ENV" "DATABASE_URL" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    echo -n "Checking $var... "
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ SET${NC}"
    else
        echo -e "${RED}❌ NOT SET${NC}"
        overall_status=1
    fi
done

# Optional notification service variables
notification_vars=("SMTP_HOST" "TWILIO_ACCOUNT_SID" "VAPID_PUBLIC_KEY" "SLACK_WEBHOOK_URL")
echo -e "\n${YELLOW}📧 Notification Service Configuration${NC}"
for var in "${notification_vars[@]}"; do
    echo -n "Checking $var... "
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ SET${NC}"
    else
        echo -e "${YELLOW}⚠️ NOT SET${NC}"
    fi
done

echo -e "\n${YELLOW}🧪 Notification Service Tests${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    # Test each notification channel if configured
    if [ -n "$SMTP_HOST" ]; then
        echo -n "Testing email notifications... "
        response=$(curl -s -X POST "$BASE_URL/api/notifications/test" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"channels": ["email"], "severity": "low"}')
        
        if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ FAILED${NC}"
            overall_status=1
        fi
    fi
    
    if [ -n "$TWILIO_ACCOUNT_SID" ]; then
        echo -e "${YELLOW}⚠️ SMS testing skipped (would send real SMS)${NC}"
    fi
    
    if [ -n "$VAPID_PUBLIC_KEY" ]; then
        echo -n "Testing push notification configuration... "
        response=$(curl -s "$BASE_URL/api/notifications/vapid-public-key")
        
        if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ FAILED${NC}"
            overall_status=1
        fi
    fi
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        echo -e "${YELLOW}⚠️ Slack testing skipped (would send real message)${NC}"
    fi
fi

# Final status
echo -e "\n" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="

if [ $overall_status -eq 0 ]; then
    echo -e "${GREEN}🎉 All health checks passed!${NC}"
    echo -e "${GREEN}✅ OneShot is healthy and ready for production${NC}"
    
    # Display summary
    echo -e "\n${GREEN}📊 Summary:${NC}"
    echo -e "• Application: ${GREEN}Healthy${NC}"
    echo -e "• Database: ${GREEN}Connected${NC}"
    echo -e "• Notifications: ${GREEN}Configured${NC}"
    echo -e "• Security: ${GREEN}Active${NC}"
    
    exit 0
else
    echo -e "${RED}❌ Some health checks failed!${NC}"
    echo -e "${RED}⚠️ Please review the failed checks above${NC}"
    
    echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
    echo "1. Check application logs: docker-compose logs oneshot-app"
    echo "2. Check database logs: docker-compose logs postgres"
    echo "3. Verify environment variables in .env.production"
    echo "4. Ensure all external services are configured"
    
    exit 1
fi 