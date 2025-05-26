# OneShot Developer Setup Guide

## 🚀 Quick Start (Windows PowerShell)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (using Neon cloud database)
- PowerShell 5.1+ (comes with Windows)

### One-Time Setup
1. Clone the repository
2. Install dependencies:
   ```powershell
   # In root directory
   npm install
   
   # In server directory
   cd server
   npm install
   
   # In client directory
   cd ../client
   npm install
   ```

### 🟢 Starting Development Servers

**Option 1: Automated Script (Recommended)**
```powershell
# From root directory
./start-oneshot.ps1
```

**Option 2: Manual Start**
```powershell
# Terminal 1 - Backend
cd server
$env:DATABASE_URL="postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET="oneshot_dev_secret_key"
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 🛑 Stopping Servers

**Option 1: Clean Shutdown**
- Press `Ctrl+C` in the PowerShell window running `start-oneshot.ps1`

**Option 2: Emergency Kill**
```powershell
./kill-oneshot.ps1
```

## 🔧 Troubleshooting

### "Port already in use" Error
```powershell
# Kill all Node processes
./kill-oneshot.ps1

# Wait 5 seconds, then start again
./start-oneshot.ps1
```

### "Database connection failed" Error
1. Check your internet connection (database is cloud-hosted)
2. Verify environment variables are set:
   ```powershell
   echo $env:DATABASE_URL
   ```
3. Run migrations if needed:
   ```powershell
   cd server
   $env:DATABASE_URL="postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
   npm run db:migrate
   ```

### "Command not found" or PowerShell errors
- Make sure you're using PowerShell, not Command Prompt
- Run PowerShell as Administrator if permission issues occur
- Enable script execution if needed:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

## 📁 Project Structure

```
OneShot/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── docs/            # Documentation
├── start-oneshot.ps1    # Start development servers
├── kill-oneshot.ps1     # Emergency cleanup script
└── .env files       # Environment configuration (in server/)
```

## 🌐 Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## ⚠️ Important Notes

1. **Never run `npm run dev` from the root directory** - it causes infinite loops
2. **Always use PowerShell** on Windows (not Command Prompt)
3. **Environment variables must be set** before starting the backend
4. **The database is cloud-hosted** - requires internet connection

## 🚨 Common Mistakes to Avoid

1. ❌ Running `cd server && npm run dev` (use semicolon or separate commands)
2. ❌ Starting servers without killing previous instances
3. ❌ Forgetting to set DATABASE_URL environment variable
4. ❌ Using Command Prompt instead of PowerShell
5. ❌ Running commands from wrong directory

## 💡 Pro Tips

1. Keep one PowerShell window dedicated to `start-oneshot.ps1`
2. Use VS Code's integrated terminal for other commands
3. Check `netstat -an | findstr :3001` to verify port status
4. Tail server logs for debugging: `Get-Content -Path "server/logs/app.log" -Tail 50 -Wait`

---

**Need help?** Check server logs in the terminal or run `./kill-oneshot.ps1` and try again. 