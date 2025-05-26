#!/usr/bin/env pwsh
# OneShot Development Environment Startup Script
# This script ensures clean startup of both backend and frontend servers

Write-Host "[>] Starting OneShot Development Environment..." -ForegroundColor Cyan

# Step 1: Kill any existing Node processes
Write-Host "`n[*] Cleaning up existing processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Verify ports are free
Write-Host "`n[?] Checking port availability..." -ForegroundColor Yellow
$port3001 = netstat -an | findstr :3001 | findstr LISTENING
$port5173 = netstat -an | findstr :5173 | findstr LISTENING

if ($port3001) {
    Write-Host "[X] Port 3001 is still in use. Waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}

if ($port5173) {
    Write-Host "[X] Port 5173 is still in use. Waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}

# Step 3: Set environment variables
Write-Host "`n[*] Setting environment variables..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"

# Step 4: Start Backend Server
Write-Host "`n[+] Starting Backend Server (Port 3001)..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -PassThru

# Step 5: Wait for backend to be ready
Write-Host "[~] Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 6: Start Frontend Server
Write-Host "`n[+] Starting Frontend Server (Port 5173)..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -PassThru

# Step 7: Display status
Write-Host "`n[OK] OneShot Development Environment Started!" -ForegroundColor Green
Write-Host "`n[i] Server Status:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`n[!] Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Step 8: Monitor processes
Write-Host "`n[*] Monitoring processes (PID: Backend=$($backend.Id), Frontend=$($frontend.Id))..." -ForegroundColor Cyan

# Keep script running and handle cleanup on exit
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if processes are still running
        if ($backend.HasExited -or $frontend.HasExited) {
            Write-Host "`n[!] A server has stopped unexpectedly!" -ForegroundColor Red
            break
        }
    }
} finally {
    # Cleanup on exit
    Write-Host "`n[X] Shutting down servers..." -ForegroundColor Yellow
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Cleanup complete!" -ForegroundColor Green
} 