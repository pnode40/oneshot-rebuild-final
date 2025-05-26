# 🚀 Deploy OneShot TODAY - Action List

## Pre-Flight Check (5 minutes)
- [ ] Run `./start-simple.ps1` and verify app works locally
- [ ] Test login/register flow
- [ ] Check database connection (profiles load)

## Step 1: Prepare for Deployment (10 minutes)

### Backend Prep
```bash
cd server
```

Create `server/.env.example`:
```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

Update `server/package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

### Frontend Prep
```bash
cd client
```

Create `client/.env.production`:
```
VITE_API_URL=https://your-backend.up.railway.app
```

## Step 2: Deploy Backend to Railway (10 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project in server directory
cd server
railway init

# Set environment variables in Railway dashboard
# Go to https://railway.app/dashboard
# Add: DATABASE_URL, JWT_SECRET, NODE_ENV=production, FRONTEND_URL

# Deploy
railway up
```

## Step 3: Deploy Frontend to Vercel (10 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd ../client
vercel

# Follow prompts:
# - Create new project
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# Set environment variable
vercel env add VITE_API_URL
# Enter your Railway backend URL
```

## Step 4: Update CORS & Test (10 minutes)

1. Update Railway backend environment:
   - Set `FRONTEND_URL` to your Vercel URL

2. Redeploy backend:
   ```bash
   cd server
   railway up
   ```

3. Test production site:
   - Open Vercel URL
   - Test registration
   - Test login
   - Test profile creation

## Step 5: Custom Domain (Optional - 15 minutes)

### Vercel (Frontend)
1. Go to Vercel dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records

### Railway (Backend API)
1. Go to Railway dashboard
2. Settings → Domains
3. Add api.yourdomain.com
4. Update DNS records

## Troubleshooting Quick Fixes

### "CORS Error"
- Check FRONTEND_URL in Railway matches Vercel URL exactly
- Restart Railway service

### "Cannot connect to API"  
- Check VITE_API_URL in Vercel env vars
- Ensure no trailing slash
- Redeploy frontend

### "Database connection failed"
- Verify DATABASE_URL in Railway
- Check Neon isn't sleeping (free tier)
- Look at Railway logs

## Success Checklist
- [ ] Frontend loads at vercel URL
- [ ] Can register new user
- [ ] Can login
- [ ] Can create/view profile
- [ ] No console errors

## Next Steps After Deploy
1. Share URL with 5 test users
2. Monitor Railway/Vercel dashboards
3. Set up error tracking (tomorrow)
4. Plan first iteration based on feedback

## Total Time: ~45 minutes

You'll be live before lunch! 🎉 