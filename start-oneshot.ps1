#!/usr/bin/env pwsh
# OneShot Reliable Startup Script
# This script ensures a clean startup every time

Write-Host "Starting OneShot Application..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Kill any existing Node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe /T 2>$null
    Write-Host "Existing Node processes terminated" -ForegroundColor Green
} catch {
    Write-Host "No existing Node processes found" -ForegroundColor Blue
}

# Step 2: Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "client/node_modules/.vite") {
    Remove-Item -Recurse -Force "client/node_modules/.vite" -ErrorAction SilentlyContinue
    Write-Host "Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "No Vite cache to clear" -ForegroundColor Blue
}

# Step 3: Start Backend Server
Write-Host "Starting Backend Server (Port 3001)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\OneShotLocal\server"
    npm run dev
}

# Wait for backend to start
Start-Sleep -Seconds 8

# Check if backend is running
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "Backend Server running on http://localhost:3001" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend Server failed to start" -ForegroundColor Red
    Write-Host "Backend Job Output:" -ForegroundColor Yellow
    Receive-Job $backendJob
    exit 1
}

# Step 4: Start Frontend Server
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\OneShotLocal\client"
    npx vite --host 0.0.0.0 --port 5173 --force
}

# Wait for frontend to start
Start-Sleep -Seconds 8

# Check if frontend is running
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($frontendCheck.StatusCode -eq 200) {
        Write-Host "Frontend Server running on http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend Server failed to start" -ForegroundColor Red
    Write-Host "Frontend Job Output:" -ForegroundColor Yellow
    Receive-Job $frontendJob
    exit 1
}

# Step 5: Final Status Check
Write-Host "" -ForegroundColor White
Write-Host "OneShot Application Started Successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Keep script running and monitor
try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Check backend health
        try {
            Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 3 | Out-Null
        } catch {
            Write-Host "Backend health check failed - restarting..." -ForegroundColor Red
            Stop-Job $backendJob -Force
            $backendJob = Start-Job -ScriptBlock {
                Set-Location "C:\OneShotLocal\server"
                npm run dev
            }
        }
        
        # Check frontend health
        try {
            Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 3 | Out-Null
        } catch {
            Write-Host "Frontend health check failed - restarting..." -ForegroundColor Red
            Stop-Job $frontendJob -Force
            $frontendJob = Start-Job -ScriptBlock {
                Set-Location "C:\OneShotLocal\client"
                npx vite --host 0.0.0.0 --port 5173 --force
            }
        }
    }
} finally {
    # Cleanup on exit
    Write-Host "Stopping OneShot Application..." -ForegroundColor Red
    Stop-Job $backendJob -Force
    Stop-Job $frontendJob -Force
    Remove-Job $backendJob -Force
    Remove-Job $frontendJob -Force
    taskkill /F /IM node.exe /T 2>$null
    Write-Host "OneShot Application stopped" -ForegroundColor Green
} 