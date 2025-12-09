# Deployment Checklist

## ✅ Pre-Deployment (Complete)
- [x] Vercel config created
- [x] Railway config created  
- [x] PostgreSQL schema ready
- [x] Seed script ready
- [x] Landing page built
- [x] README updated

## 🚀 Deployment Steps

### Step 1: Install CLIs
```bash
npm install -g vercel @railway/cli
```

### Step 2: Deploy Frontend (Vercel)
```bash
cd apps/web
vercel login
vercel --prod
```
**Set environment variable in Vercel dashboard:**
- `NEXT_PUBLIC_API_URL` = (Railway URL from Step 3)

### Step 3: Deploy Backend (Railway)
```bash
cd apps/agent-server
railway login
railway init
railway add postgresql
```
**Set environment variables in Railway dashboard:**
- `DATABASE_URL` (auto-generated)
- `OPENAI_API_KEY` = your_key
- `ETHEREUM_RPC_URL` = your_rpc_url
- `CORS_ORIGIN` = (Vercel URL from Step 2)

```bash
railway up
```

### Step 4: Database Setup
```bash
railway shell
npx prisma db push
npm run db:seed
exit
```

### Step 5: Update Frontend with Backend URL
1. Go to Vercel dashboard
2. Add `NEXT_PUBLIC_API_URL` = `https://your-railway-url.railway.app`
3. Redeploy: `vercel --prod`

### Step 6: Test Live Site
- Frontend: https://your-project.vercel.app
- Backend Health: https://your-railway-url.railway.app/health
- API Docs: https://your-railway-url.railway.app/docs

---

## 📊 Post-Deployment

- [ ] Test frontend loads
- [ ] Test API health check
- [ ] Test Swagger docs accessible
- [ ] Verify database has seed data
- [ ] Test agent start/stop functionality
- [ ] Add custom domain (optional)
- [ ] Setup Sentry monitoring
- [ ] Announce on Twitter/Reddit
