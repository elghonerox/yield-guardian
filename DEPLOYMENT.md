# 🚀 Deployment Guide

## Prerequisites
- Vercel account (frontend hosting)
- Railway account (backend hosting)
- PostgreSQL database (Railway provides free tier)

---

## 1️⃣ Backend Deployment (Railway)

### Step 1: Create Railway Project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd apps/agent-server
railway init
```

### Step 2: Add PostgreSQL
1. Go to Railway dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Copy the `DATABASE_URL` connection string
4. Add to Railway environment variables

### Step 3: Set Environment Variables
In Railway dashboard, add:
```
DATABASE_URL=postgresql://... (auto-generated)
PORT=3001
OPENAI_API_KEY=your_key_here
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key
NODE_ENV=production
CORS_ORIGIN=https://yieldguardian.vercel.app
```

### Step 4: Deploy
```bash
railway up
```

Your API will be live at: `https://agent-api-[random].railway.app`

### Step 5: Run Migrations & Seed
```bash
# SSH into Railway
railway shell

# Run migrations
npx prisma db push

# Seed demo data
npm run db:seed
```

---

## 2️⃣ Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd apps/web
vercel --prod
```

### Step 3: Set Environment Variable
In Vercel dashboard:
- Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://agent-api-[your-domain].railway.app`

### Step 4: Redeploy
```bash
vercel --prod
```

Your app will be live at: `https://yield-guardian.vercel.app`

---

## 3️⃣ Custom Domain (Optional)

### Backend (Railway)
1. Go to Railway project settings
2. Add custom domain: `api.yieldguardian.app`
3. Update DNS (CNAME record)

### Frontend (Vercel)
1. Go to Vercel project settings
2. Add custom domain: `yieldguardian.app`
3. Vercel auto-configures DNS

---

## 4️⃣ Monitoring Setup

### Sentry (Error Tracking)
```bash
# Install Sentry
npm install @sentry/nextjs @sentry/node --workspace=@yield-guardian/web --workspace=@yield-guardian/agent-server

# Initialize
npx @sentry/wizard@latest -i nextjs
npx @sentry/wizard@latest -i node
```

Add to environment:
```
NEXT_PUBLIC_SENTRY_DSN=your_dsn
SENTRY_DSN=your_dsn
```

### Uptime Monitoring
Sign up for [UptimeRobot](https://uptimerobot.com):
- Monitor: `https://yieldguardian.app`
- Monitor: `https://api.yieldguardian.app/health`
- Alert via email when down

---

## 5️⃣ Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API health check returns 200: `curl https://api.yieldguardian.app/health`
- [ ] Swagger docs accessible: `https://api.yieldguardian.app/docs`
- [ ] Database seeded (check Prisma Studio)
- [ ] CORS configured (test from frontend)
- [ ] Environment variables set correctly
- [ ] SSL certificates active (HTTPS)
- [ ] Error monitoring active (trigger test error)

---

## 🆘 Troubleshooting

**Problem:** Frontend can't reach API  
**Solution:** Check CORS_ORIGIN matches frontend domain

**Problem:** Database connection fails  
**Solution:** Verify DATABASE_URL format for Postgres

**Problem:** Build fails on Railway  
**Solution:** Check `railway.json` buildCommand path

---

## 📊 Monitor Your Deployment

- **Railway Dashboard**: View logs, metrics, usage
- **Vercel Analytics**: Track page views, performance
- **Sentry Dashboard**: Monitor errors, performance issues
- **Prisma Studio**: View database contents (`npx prisma studio`)

---

**Next Steps:** Once deployed, update your README.md with live URLs!
