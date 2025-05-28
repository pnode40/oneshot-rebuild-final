#!/bin/bash

# OneShot Development Environment Setup Script
# This script sets up a new development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OneShot Development Environment Setup${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found! Please run from project root.${NC}"
    exit 1
fi

# Check for required tools
echo -e "\n${YELLOW}🔍 Checking required tools...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose or use Docker Desktop which includes it."
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is available${NC}"

# Check Node.js (for local development)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js is installed (${NODE_VERSION})${NC}"
else
    echo -e "${YELLOW}⚠️ Node.js not found (optional for Docker development)${NC}"
fi

# Setup environment variables
echo -e "\n${YELLOW}📋 Setting up environment variables...${NC}"

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo -e "${YELLOW}📄 Creating .env from env.example...${NC}"
        cp env.example .env
        
        # Generate random JWT secret
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
            rm .env.bak 2>/dev/null || true
            echo -e "${GREEN}✅ Generated random JWT secret${NC}"
        else
            echo -e "${YELLOW}⚠️ OpenSSL not found, please manually update JWT_SECRET in .env${NC}"
        fi
        
        # Set development database URL for Docker
        sed -i.bak 's|DATABASE_URL=postgresql://username:password@host:5432/database_name|DATABASE_URL=postgresql://oneshot_dev:local_dev_only@localhost:5432/oneshot_dev|' .env
        rm .env.bak 2>/dev/null || true
        
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}📝 Please review and update .env with your specific values${NC}"
    else
        echo -e "${RED}❌ env.example file not found!${NC}"
        echo "Please create env.example file first."
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create necessary directories
echo -e "\n${YELLOW}📁 Creating necessary directories...${NC}"

directories=(
    "server/uploads"
    "server/uploads/profile-photos"
    "server/uploads/transcripts"
    "server/uploads/og-images"
    "server/logs"
    "client/dist"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✅ Created $dir${NC}"
    else
        echo -e "${GREEN}✅ $dir already exists${NC}"
    fi
done

# Setup Docker environment
echo -e "\n${YELLOW}🐳 Setting up Docker environment...${NC}"

# Pull required images
echo -e "${YELLOW}📦 Pulling Docker images...${NC}"
docker-compose pull postgres redis

# Build application images
echo -e "${YELLOW}🔨 Building application images...${NC}"
docker-compose build

echo -e "${GREEN}✅ Docker environment ready${NC}"

# Setup git hooks (if git is available)
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo -e "\n${YELLOW}🔗 Setting up git hooks...${NC}"
    
    # Create pre-commit hook directory
    mkdir -p .git/hooks
    
    # Create simple pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# OneShot pre-commit hook

echo "Running pre-commit checks..."

# Check for .env file in staging
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ .env file should not be committed!"
    echo "Please remove .env from staging: git reset HEAD .env"
    exit 1
fi

# Check for secrets in staged files
if git diff --cached | grep -i "password\|secret\|key" | grep -v "your-" | grep -v "example"; then
    echo "⚠️ Potential secrets detected in staged files!"
    echo "Please review your changes before committing."
fi

echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Git hooks configured${NC}"
fi

# Create development scripts
echo -e "\n${YELLOW}📜 Creating development scripts...${NC}"

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting OneShot development environment..."
docker-compose up -d postgres redis
echo "⏳ Waiting for database to be ready..."
sleep 10
docker-compose up backend frontend
EOF

chmod +x start-dev.sh

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping OneShot development environment..."
docker-compose down
EOF

chmod +x stop-dev.sh

# Create cleanup script
cat > cleanup-dev.sh << 'EOF'
#!/bin/bash
echo "🧹 Cleaning up OneShot development environment..."
docker-compose down -v
docker system prune -f
echo "✅ Cleanup complete"
EOF

chmod +x cleanup-dev.sh

echo -e "${GREEN}✅ Development scripts created${NC}"

# Final instructions
echo -e "\n${GREEN}🎉 Development environment setup complete!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo -e "1. Review and update .env file with your specific values"
echo -e "2. Start development environment: ${GREEN}./start-dev.sh${NC}"
echo -e "3. Access application at: ${GREEN}http://localhost:5173${NC}"
echo -e "4. Access API at: ${GREEN}http://localhost:3001${NC}"
echo -e "\n${BLUE}📚 Useful commands:${NC}"
echo -e "• Start development: ${GREEN}./start-dev.sh${NC}"
echo -e "• Stop development: ${GREEN}./stop-dev.sh${NC}"
echo -e "• Clean environment: ${GREEN}./cleanup-dev.sh${NC}"
echo -e "• View logs: ${GREEN}docker-compose logs -f [service]${NC}"
echo -e "• Run migrations: ${GREEN}docker-compose exec backend npm run migrate${NC}"

echo -e "\n${YELLOW}⚠️ Important notes:${NC}"
echo -e "• Never commit .env files to git"
echo -e "• Update JWT_SECRET and other secrets for production"
echo -e "• See README-OG-Image-Setup.md for Canvas installation"

echo -e "\n${GREEN}✅ Happy coding! 🚀${NC}" 