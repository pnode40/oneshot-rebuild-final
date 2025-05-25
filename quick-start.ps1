Write-Host "🚀 Starting OneShot..." -ForegroundColor Green

# Start backend in new window
Write-Host "🔧 Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# Wait for backend
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🎨 Starting Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host ""
Write-Host "✅ Both servers starting!" -ForegroundColor Green
Write-Host "⏳ Wait 5-10 seconds for servers to fully initialize" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "If frontend doesn't work, try: http://127.0.0.1:5173" -ForegroundColor Yellow 