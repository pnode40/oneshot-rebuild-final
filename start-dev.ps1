# OneShot Local Development Starter Script
Write-Host "Starting OneShot Local Development Environment" -ForegroundColor Cyan

# Kill any running node processes
Write-Host "Cleaning up environment..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process: $($_.Id)" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Clean problem folders
Write-Host "Removing problematic Vite cache files..." -ForegroundColor Yellow
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue "C:\OneShotLocal\node_modules\.vite"
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue "C:\OneShotLocal\client\node_modules\.vite"

# Start server in a new window
Write-Host "Starting backend server in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location C:\OneShotLocal\server; npm run dev"

# Wait a moment for server to initialize
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Start client
Write-Host "Starting frontend client..." -ForegroundColor Green
Set-Location "C:\OneShotLocal\client"
npm run dev 