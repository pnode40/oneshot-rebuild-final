# Multi-stage Dockerfile for OneShot Backend
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/profile-photos uploads/transcripts uploads/og-images

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start development server
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies for production
RUN apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S oneshot -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=oneshot:nodejs /app/dist ./dist
COPY --from=build --chown=oneshot:nodejs /app/uploads ./uploads

# Create necessary directories
RUN mkdir -p uploads/profile-photos uploads/transcripts uploads/og-images && \
    chown -R oneshot:nodejs uploads

# Switch to non-root user
USER oneshot

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start production server
CMD ["node", "dist/index.js"] 