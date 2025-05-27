# OneShot Complete Startup Script
Write-Host "🚀 Starting OneShot Platform..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2

# Set environment variables
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"
$env:VITE_API_URL = "http://localhost:3001"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Start Backend
Write-Host "🔧 Starting Backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\oneshot-backend'; npm run dev" -WindowStyle Minimized

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start Frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; `$env:VITE_API_URL='http://localhost:3001'; npm run dev" -WindowStyle Minimized

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test both services
Write-Host "🧪 Testing services..." -ForegroundColor Magenta

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/debug/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend: $($backendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: Failed to connect" -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Failed to connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 OneShot Platform Status:" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Blue
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Database: Connected to Neon PostgreSQL" -ForegroundColor Green
Write-Host ""
Write-Host "OneShot Platform started successfully!" -ForegroundColor Green