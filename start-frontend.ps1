# OneShot Frontend Startup Script
Write-Host "🎨 Starting OneShot Frontend..." -ForegroundColor Cyan

# Set environment variables for frontend
$env:VITE_API_URL = "http://localhost:3001"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "🔍 VITE_API_URL: $env:VITE_API_URL" -ForegroundColor Yellow

# Change to client directory and start
Set-Location client
Write-Host "📁 Changed to client directory" -ForegroundColor Green

# Start the frontend development server with Vite
Write-Host "🚀 Starting Vite development server..." -ForegroundColor Green
npm run dev 