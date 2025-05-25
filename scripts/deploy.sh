#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting OneShot Production Deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found! Please run from project root.${NC}"
    exit 1
fi

# Environment check
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "Please create .env.production with all required environment variables."
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}📋 Loading environment variables...${NC}"
export $(grep -v '^#' .env.production | xargs)

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "SMTP_HOST" "SMTP_PASS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set!${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running! Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans || true

# Build Docker images
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose -f docker-compose.yml build --no-cache

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs uploads/profile-photos

# Pull latest database image
echo -e "${YELLOW}🗄️ Pulling PostgreSQL image...${NC}"
docker-compose pull postgres

# Start database first
echo -e "${YELLOW}🗄️ Starting database...${NC}"
docker-compose up -d postgres redis

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
timeout=60
counter=0
while ! docker-compose exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Database failed to start within $timeout seconds${NC}"
        docker-compose logs postgres
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done

echo -e "\n${GREEN}✅ Database is ready${NC}"

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
if ! docker-compose run --rm oneshot-app npm run migrate; then
    echo -e "${RED}❌ Database migrations failed!${NC}"
    docker-compose logs oneshot-app
    exit 1
fi

echo -e "${GREEN}✅ Database migrations completed${NC}"

# Start all services
echo -e "${YELLOW}🔧 Starting all services...${NC}"
docker-compose up -d

# Wait for application to be ready
echo -e "${YELLOW}⏳ Waiting for application to be ready...${NC}"
timeout=120
counter=0
while ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Application failed to start within $timeout seconds${NC}"
        echo "Checking logs..."
        docker-compose logs --tail=50 oneshot-app
        exit 1
    fi
    echo -n "."
    sleep 2
    ((counter+=2))
done

echo -e "\n${GREEN}✅ Application is ready${NC}"

# Run health checks
echo -e "${YELLOW}🧪 Running health checks...${NC}"
if [ -f "./scripts/health-check.sh" ]; then
    chmod +x ./scripts/health-check.sh
    if ./scripts/health-check.sh; then
        echo -e "${GREEN}✅ All health checks passed${NC}"
    else
        echo -e "${RED}❌ Health checks failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ health-check.sh not found, skipping detailed health checks${NC}"
    
    # Basic health check
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Basic health check passed${NC}"
    else
        echo -e "${RED}❌ Basic health check failed${NC}"
        exit 1
    fi
fi

# Display service status
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose ps

# Display access information
echo -e "\n${GREEN}🌐 Access Information:${NC}"
echo -e "Application: ${GREEN}http://localhost:3001${NC}"
echo -e "Health Check: ${GREEN}http://localhost:3001/api/health${NC}"
echo -e "Admin Dashboard: ${GREEN}http://localhost:3001/admin/security${NC}"

# Display notification service status
echo -e "\n${GREEN}🔔 Notification Services:${NC}"
if curl -s http://localhost:3001/api/notifications/channels/status > /dev/null 2>&1; then
    echo -e "Notification Status: ${GREEN}http://localhost:3001/api/notifications/channels/status${NC}"
else
    echo -e "${YELLOW}⚠️ Notification service status endpoint not accessible${NC}"
fi

# Show running containers
echo -e "\n${GREEN}🐳 Running Containers:${NC}"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Show logs command
echo -e "\n${YELLOW}📋 To view logs, run:${NC}"
echo "  docker-compose logs -f [service-name]"
echo "  docker-compose logs -f oneshot-app"

# Show stop command
echo -e "\n${YELLOW}🛑 To stop all services, run:${NC}"
echo "  docker-compose down"

echo -e "\n${GREEN}✅ OneShot is now running in production mode!${NC}" 