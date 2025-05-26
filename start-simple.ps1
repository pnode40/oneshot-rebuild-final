# Simple OneShot Startup Script
# No emojis, no fancy features, just start the servers

# Kill existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Set environment variables
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "Servers starting..."
Write-Host "Backend: http://localhost:3001"
Write-Host "Frontend: http://localhost:5173" 