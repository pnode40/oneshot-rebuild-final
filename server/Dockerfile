# Simple Node.js Dockerfile optimized for Railway
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl bash

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to save space
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads/profile-photos uploads/transcripts uploads/og-images

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "dist/index.js"] 