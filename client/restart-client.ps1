# Simple script to restart just the client app (frontend)
Write-Host "Restarting OneShot client application..." -ForegroundColor Cyan

# Kill any existing npm processes
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "npm" } | Stop-Process -Force

# Clean Vite cache (if permissions issues occur)
Write-Host "Cleaning Vite cache..." -ForegroundColor Yellow
$viteCache = "./node_modules/.vite"
if (Test-Path $viteCache) {
    try {
        Remove-Item -Path $viteCache -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Could not remove Vite cache completely. Continuing anyway." -ForegroundColor Yellow
    }
}

# Start the client
Write-Host "Starting client..." -ForegroundColor Green
npm run dev

Write-Host "`nTEST MODE BOOKMARKS:" -ForegroundColor Magenta
Write-Host "  Full App (Test Mode): http://localhost:5173/?test=true" -ForegroundColor Magenta
Write-Host "  Component Test Page: http://localhost:5173/test-profile" -ForegroundColor Magenta
Write-Host "  Live App: http://localhost:5173/" -ForegroundColor Magenta

Write-Host "`nℹ️ Test mode will persist until you clear localStorage" -ForegroundColor Cyan 