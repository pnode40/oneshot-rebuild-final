# OneShot Startup Script
Write-Host "Starting OneShot Platform..."

# Kill existing processes
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2

# Set environment variables
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"
$env:VITE_API_URL = "http://localhost:3001"

Write-Host "Environment variables set"

# Start Backend
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\oneshot-backend'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 8

# Start Frontend
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; `$env:VITE_API_URL='http://localhost:3001'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 8

# Test services
Write-Host "Testing services..."

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/debug/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend: OK ($($backendResponse.StatusCode))"
} catch {
    Write-Host "Backend: Failed"
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend: OK ($($frontendResponse.StatusCode))"
} catch {
    Write-Host "Frontend: Failed"
}

Write-Host "OneShot Platform startup complete"
Write-Host "Backend: http://localhost:3001"
Write-Host "Frontend: http://localhost:5173" 