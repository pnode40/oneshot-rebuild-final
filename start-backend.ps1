# OneShot Backend Startup Script
Write-Host "🚀 Starting OneShot Backend..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "🔍 DATABASE_URL: $($env:DATABASE_URL.Substring(0,50))..." -ForegroundColor Yellow

# Change to backend directory and start
Set-Location oneshot-backend
Write-Host "📁 Changed to oneshot-backend directory" -ForegroundColor Green

# Start the server
Write-Host "🚀 Starting server..." -ForegroundColor Green
npm run dev 