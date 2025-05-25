Write-Host "🚀 Starting OneShot Application..." -ForegroundColor Green

# Kill any existing Node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Vite cache
Write-Host "🗑️ Clearing Vite cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "client\node_modules\.vite" -ErrorAction SilentlyContinue

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Start backend
Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "🎨 Starting frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npx vite --host 127.0.0.1 --port 5173" -WindowStyle Normal

Write-Host ""
Write-Host "✅ OneShot is starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Two PowerShell windows will open - one for each server"
Write-Host "Close those windows to stop the servers" 