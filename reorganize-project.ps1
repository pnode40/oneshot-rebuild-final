# OneShot Project Reorganization Script
# This script will create clean, separate repositories for frontend and backend

Write-Host "🔧 OneShot Project Reorganization" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Create backup
Write-Host "`n📦 Creating backup..." -ForegroundColor Yellow
$backupDir = "../oneshot-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
Copy-Item -Path "." -Destination $backupDir -Recurse -Force
Write-Host "✅ Backup created at: $backupDir" -ForegroundColor Green

# 2. Create new frontend repository
Write-Host "`n🎨 Creating frontend repository..." -ForegroundColor Yellow
$frontendDir = "../oneshot-frontend"
New-Item -ItemType Directory -Path $frontendDir -Force | Out-Null
Set-Location $frontendDir
git init

# Copy frontend files
Write-Host "📁 Copying frontend files..." -ForegroundColor Yellow
Copy-Item -Path "../OneShotLocal/client/*" -Destination "." -Recurse -Force
Copy-Item -Path "../OneShotLocal/.gitignore" -Destination "." -Force

# Create proper package.json for root
@'
{
  "name": "oneshot-frontend",
  "version": "1.0.0",
  "description": "OneShot Recruiting Platform - Frontend",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc -b"
  },
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@tanstack/react-query": "^4.35.3",
    "@types/lodash-es": "^4.17.12",
    "axios": "^1.9.0",
    "chart.js": "^4.4.9",
    "lodash-es": "^4.17.21",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.2.0",
    "react-helmet-async": "^2.0.5",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.5.3",
    "socket.io-client": "^4.8.1",
    "react-qr-code": "^2.0.15",
    "vcf": "^2.1.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.22.0",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^9.22.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "globals": "^16.0.0",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "~5.1.6",
    "typescript-eslint": "^8.26.1",
    "vite": "^4.4.5"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding UTF8

# Move client files to root
Write-Host "🔄 Restructuring frontend files..." -ForegroundColor Yellow
Get-ChildItem -Path "client/*" | Move-Item -Destination "." -Force
Remove-Item -Path "client" -Recurse -Force -ErrorAction SilentlyContinue

# Create README
@'
# OneShot Frontend

Mobile-first athlete recruiting platform - React/Vite frontend application.

## Features
- Public athlete profiles with QR codes
- vCard contact downloads
- Transcript preview without downloads
- Progressive Web App support
- Mobile-optimized UI

## Setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
This project is configured for Vercel deployment. Push to main branch to auto-deploy.
'@ | Out-File -FilePath "README.md" -Encoding UTF8

# Git operations
git add .
git commit -m "Initial commit: OneShot frontend application"

Write-Host "✅ Frontend repository created at: $frontendDir" -ForegroundColor Green

# 3. Create new backend repository
Write-Host "`n🚀 Creating backend repository..." -ForegroundColor Yellow
$backendDir = "../oneshot-backend"
New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
Set-Location $backendDir
git init

# Copy backend files
Write-Host "📁 Copying backend files..." -ForegroundColor Yellow
Copy-Item -Path "../OneShotLocal/server/*" -Destination "." -Recurse -Force
Copy-Item -Path "../OneShotLocal/.gitignore" -Destination "." -Force
Copy-Item -Path "../OneShotLocal/.env" -Destination "." -Force -ErrorAction SilentlyContinue

# Create proper package.json
@'
{
  "name": "oneshot-backend",
  "version": "1.0.0",
  "description": "OneShot Recruiting Platform - Backend API",
  "main": "src/index.ts",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate:generate": "drizzle-kit generate",
    "migrate:push": "drizzle-kit push",
    "migrate": "ts-node src/db/migrate.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.9",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "drizzle-orm": "^0.43.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.15.6",
    "postgres": "^3.4.5",
    "zod": "^3.24.3",
    "@sendgrid/mail": "^7.7.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/node": "^22.15.3",
    "@types/pg": "^8.11.14",
    "drizzle-kit": "^0.31.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.8.3"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding UTF8

# Move server files to root
Write-Host "🔄 Restructuring backend files..." -ForegroundColor Yellow
Get-ChildItem -Path "server/*" | Move-Item -Destination "." -Force
Remove-Item -Path "server" -Recurse -Force -ErrorAction SilentlyContinue

# Create README
@'
# OneShot Backend

Express.js API backend for OneShot Recruiting Platform.

## Features
- JWT Authentication
- PostgreSQL with Drizzle ORM
- File uploads with Multer
- Email service with SendGrid
- RESTful API design

## Setup
```bash
npm install
cp .env.example .env
# Configure your database and other settings
npm run dev
```

## Database
```bash
npm run migrate:generate
npm run migrate:push
```

## Deployment
Configure for Railway, Render, or your preferred Node.js host.
'@ | Out-File -FilePath "README.md" -Encoding UTF8

# Create .env.example
@'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oneshot

# JWT
JWT_SECRET=your-secret-key-here

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@oneshotrecruits.com

# Server
PORT=3001
NODE_ENV=development
'@ | Out-File -FilePath ".env.example" -Encoding UTF8

# Git operations
git add .
git commit -m "Initial commit: OneShot backend API"

Write-Host "✅ Backend repository created at: $backendDir" -ForegroundColor Green

# 4. Create deployment instructions
Set-Location "../"
@'
# OneShot Deployment Guide

## Repository Structure
- `oneshot-frontend/` - React/Vite frontend application
- `oneshot-backend/` - Express.js backend API

## Frontend Deployment (Vercel)
1. Push `oneshot-frontend` to GitHub
2. Import to Vercel
3. No configuration needed - it will auto-detect Vite

## Backend Deployment (Railway/Render)
1. Push `oneshot-backend` to GitHub
2. Import to Railway or Render
3. Set environment variables from `.env.example`
4. Deploy

## Local Development
### Frontend
```bash
cd oneshot-frontend
npm install
npm run dev
```

### Backend
```bash
cd oneshot-backend
npm install
npm run dev
```

## Next Steps
1. Create GitHub repositories
2. Push code
3. Deploy to respective platforms
4. Update CORS settings in backend for production frontend URL
'@ | Out-File -FilePath "ONESHOT-DEPLOYMENT-GUIDE.md" -Encoding UTF8

Write-Host "`n✨ Reorganization Complete!" -ForegroundColor Green
Write-Host "📁 Frontend: $frontendDir" -ForegroundColor Cyan
Write-Host "📁 Backend: $backendDir" -ForegroundColor Cyan
Write-Host "📄 Guide: ./ONESHOT-DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the new repositories" -ForegroundColor White
Write-Host "2. Create GitHub repos: oneshot-frontend and oneshot-backend" -ForegroundColor White
Write-Host "3. Push code to GitHub" -ForegroundColor White
Write-Host "4. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "5. Deploy backend to Railway/Render" -ForegroundColor White 