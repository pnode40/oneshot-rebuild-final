# OneShot Infrastructure Decision Document

## Current State
- **Database**: Neon PostgreSQL (free tier)
- **Backend**: Local Node.js/Express
- **Frontend**: Local Vite/React
- **Hosting**: None (local development only)
- **Cost**: $0/month

## Option 1: Stay with Current Stack + Vercel
**Monthly Cost**: ~$0-20
- **Database**: Keep Neon (free tier: 0.5GB, good for testing)
- **Hosting**: Vercel (free tier: perfect for React apps)
- **Backend**: Vercel Functions or Railway ($5/mo)

**Pros**:
- Minimal cost for testing
- Neon is PostgreSQL (you're familiar)
- Vercel has excellent DX
- Can scale later

**Cons**:
- Backend hosting needs separate solution
- Multiple services to manage

## Option 2: All-in-One Supabase
**Monthly Cost**: ~$0-25
- **Everything**: Supabase (free tier includes DB, Auth, Storage, Realtime)
- **Hosting**: Vercel for frontend only

**Pros**:
- Single service for entire backend
- Built-in auth (can replace our JWT)
- Realtime subscriptions included
- File storage included
- Better free tier than Neon

**Cons**:
- Migration effort
- Learning curve
- Vendor lock-in

## Option 3: Railway All-in-One
**Monthly Cost**: ~$5-20
- **Everything**: Railway (DB + Backend + Frontend)
- **Database**: Railway PostgreSQL

**Pros**:
- Single deployment command
- Excellent for monorepos
- Built-in CI/CD
- Great developer experience

**Cons**:
- No free tier (but very cheap)
- Less mature than others

## Option 4: Professional Stack
**Monthly Cost**: ~$50-100
- **Database**: AWS RDS or PlanetScale
- **Backend**: AWS ECS or Fly.io
- **Frontend**: Vercel or Cloudflare
- **CDN**: Cloudflare

**Pros**:
- Production-ready
- Scalable
- Professional

**Cons**:
- Overkill for testing
- Complex setup
- Higher cost

## RECOMMENDATION: Hybrid Approach

### For Test Users (Next 7 Days):
1. **Keep Neon** - It's working, don't migrate now
2. **Deploy Frontend to Vercel** - Free, easy, instant
3. **Deploy Backend to Railway** - $5/mo, simple
4. **Use Cloudflare** - Free SSL & protection

### Setup Steps:
```bash
# 1. Vercel (Frontend)
npm i -g vercel
cd client
vercel --prod

# 2. Railway (Backend)
npm i -g @railway/cli
cd server
railway login
railway up

# 3. Update environment variables
# - Update FRONTEND_URL in Railway
# - Update API_URL in Vercel
```

### For Production (Month 2+):
**IF** you get traction, migrate to:
- **Supabase** for backend (better free tier, more features)
- **Keep Vercel** for frontend
- **Add monitoring** (Sentry free tier)

## Migration Timeline

### Week 1: Get Live
- Day 1: Deploy to Vercel + Railway
- Day 2: Add custom domain
- Day 3: Test with real users

### Week 2-4: Optimize
- Implement cost routing
- Monitor usage
- Gather feedback

### Month 2: Scale Decision
- If <100 users: Stay on current
- If 100-1000 users: Migrate to Supabase
- If >1000 users: Professional stack

## Quick Start Commands

```bash
# Today - Get deployed in 10 minutes
git add .
git commit -m "Ready for deployment"

# Deploy frontend
cd client
vercel --prod
# Note the URL: https://oneshot-xxx.vercel.app

# Deploy backend  
cd ../server
railway up
# Note the URL: https://oneshot-xxx.up.railway.app

# Update configs
# In server/.env: FRONTEND_URL=https://oneshot-xxx.vercel.app
# In client/.env: VITE_API_URL=https://oneshot-xxx.up.railway.app
```

## Cost Breakdown

### Test Phase (0-100 users)
- Neon: $0 (free tier)
- Vercel: $0 (free tier)
- Railway: $5/mo
- **Total: $5/mo**

### Growth Phase (100-1000 users)
- Supabase: $25/mo
- Vercel: $20/mo (Pro)
- Monitoring: $0 (free tiers)
- **Total: $45/mo**

### Scale Phase (1000+ users)
- Database: $100/mo
- Backend: $50/mo
- Frontend: $20/mo
- CDN/Monitoring: $30/mo
- **Total: $200/mo**

## Decision: Start Simple, Scale Smart

Don't overthink it. You can migrate later. The goal is to get test users NOW.

1. Use start-simple.ps1 to run locally
2. Deploy to Vercel + Railway today
3. Get 10 test users this week
4. Optimize based on real usage 