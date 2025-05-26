# OneShot Emergency Cleanup Script
# Use this when servers are stuck or ports are blocked

Write-Host "🛑 OneShot Emergency Cleanup" -ForegroundColor Red
Write-Host "=============================" -ForegroundColor Red

# Kill all Node processes
Write-Host "`n🔨 Forcefully terminating all Node processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
taskkill /F /IM node.exe /T 2>$null | Out-Null

# Wait a moment
Start-Sleep -Seconds 2

# Check port status
Write-Host "`n🔍 Checking port status..." -ForegroundColor Yellow
$port3001 = netstat -an | findstr :3001 | findstr LISTENING
$port5173 = netstat -an | findstr :5173 | findstr LISTENING

if (-not $port3001) {
    Write-Host "✅ Port 3001 is FREE" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3001 may still be in use (TIME_WAIT)" -ForegroundColor Yellow
}

if (-not $port5173) {
    Write-Host "✅ Port 5173 is FREE" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 5173 may still be in use (TIME_WAIT)" -ForegroundColor Yellow
}

Write-Host "`n✅ Cleanup complete! You can now run ./start-oneshot.ps1" -ForegroundColor Green 