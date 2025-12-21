# 🚀 Production Deployment Guide: Strapi + Next.js

## 📋 Overview

For production, you need to deploy **two separate applications**:
1. **Strapi CMS** - Backend/content management
2. **Next.js Frontend** - Your website

## 🏗️ Architecture Options

### Option A: Separate Hosting (Recommended)
- **Strapi:** Deploy to Railway, Render, Fly.io, or DigitalOcean
- **Next.js:** Deploy to Vercel, Netlify, or your own server
- **Database:** PostgreSQL (Strapi) + MongoDB (optional, can remove)
- **Media:** Cloudinary or AWS S3

### Option B: Same Server
- Both on same VPS (DigitalOcean, AWS EC2, etc.)
- Use PM2 or Docker Compose
- More control but more maintenance

## 🎯 Recommended Setup: Railway + Vercel

### Why This Combo?
- ✅ **Railway:** Easy Strapi deployment, auto-scaling, PostgreSQL included
- ✅ **Vercel:** Perfect for Next.js, global CDN, automatic deployments
- ✅ **Free tiers available** for both

---

## 📦 Part 1: Deploy Strapi to Production

### Step 1: Prepare Strapi for Production

#### 1.1 Update Database Config

Edit `C:\Users\Lenovo\Desktop\strapi\config\database.ts`:

```typescript
export default ({ env }) => ({
  connection: {
    client: 'postgres', // Use PostgreSQL in production
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false) ? {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      } : false,
    },
    debug: false,
  },
});
```

#### 1.2 Update Server Config

Edit `C:\Users\Lenovo\Desktop\strapi\config\server.ts`:

```typescript
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  proxy: true, // Important for production
  cron: {
    enabled: false,
  },
});
```

#### 1.3 Create Production Environment File

Create `C:\Users\Lenovo\Desktop\strapi\.env.production`:

```env
# App
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# Database (will be set by Railway/Render)
DATABASE_CLIENT=postgres
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_USERNAME=${DATABASE_USERNAME}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_SSL=true

# Admin
ADMIN_JWT_SECRET=your-super-secret-jwt-key-change-this
APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
API_TOKEN_SALT=your-api-token-salt-change-this
TRANSFER_TOKEN_SALT=your-transfer-token-salt-change-this
ENCRYPTION_KEY=your-encryption-key-change-this

# Public URL (your Strapi production URL)
PUBLIC_URL=https://your-strapi-app.railway.app

# CORS (your Next.js domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Step 2: Deploy to Railway (Easiest)

#### 2.1 Setup Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### 2.2 Deploy Strapi
1. Click "Deploy from GitHub repo"
2. Select your Strapi repository (or create one)
3. Railway will auto-detect Node.js

#### 2.3 Add PostgreSQL Database
1. In Railway project, click "+ New"
2. Select "PostgreSQL"
3. Railway creates database automatically

#### 2.4 Configure Environment Variables
In Railway → Variables tab, add:
```
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_HOST=${{Postgres.DATABASE_HOST}}
DATABASE_PORT=${{Postgres.DATABASE_PORT}}
DATABASE_NAME=${{Postgres.DATABASE_NAME}}
DATABASE_USERNAME=${{Postgres.DATABASE_USERNAME}}
DATABASE_PASSWORD=${{Postgres.DATABASE_PASSWORD}}
DATABASE_SSL=true
PUBLIC_URL=${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://yourdomain.com
```

#### 2.5 Generate Secrets
Run this locally to generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Run 5 times for: ADMIN_JWT_SECRET, APP_KEYS (4 keys), API_TOKEN_SALT, TRANSFER_TOKEN_SALT, ENCRYPTION_KEY

#### 2.6 Deploy
1. Railway will build and deploy automatically
2. Get your Strapi URL: `https://your-app.railway.app`
3. Visit URL → Create admin account

### Step 3: Alternative - Deploy to Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add PostgreSQL database
6. Set environment variables (same as Railway)

---

## 🌐 Part 2: Deploy Next.js to Production

### Step 1: Update Environment Variables

Create production `.env.production`:

```env
# Strapi Production URL
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-app.railway.app
STRAPI_API_TOKEN=your-production-api-token

# Always use Strapi in production
USE_STRAPI=true

# Preview
STRAPI_PREVIEW_SECRET=your-production-preview-secret

# Other vars
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 2: Deploy to Vercel (Recommended)

#### 2.1 Setup Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your Next.js repository

#### 2.2 Configure Environment Variables
In Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_STRAPI_URL` = Your Strapi production URL
- `STRAPI_API_TOKEN` = Your Strapi API token
- `USE_STRAPI` = `true`
- `STRAPI_PREVIEW_SECRET` = Your preview secret

#### 2.3 Deploy
1. Vercel auto-detects Next.js
2. Click "Deploy"
3. Get your production URL: `https://your-app.vercel.app`

### Step 3: Update Strapi CORS

In Strapi production, update CORS:
1. Go to Strapi Admin → Settings → Middlewares
2. Add your Vercel domain to CORS:
   ```
   https://your-app.vercel.app
   https://yourdomain.com
   ```

---

## 🔐 Part 3: Security & Best Practices

### 1. Generate Secure Secrets

**Never use default secrets in production!**

Generate new secrets:
```bash
# Run these commands
node -e "console.log('ADMIN_JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('API_TOKEN_SALT=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('TRANSFER_TOKEN_SALT=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
```

### 2. API Token Security

**Create separate tokens:**
- **Read-only token** for Next.js frontend
- **Full access token** only for admin operations

### 3. Environment Variables

**Never commit secrets to Git!**
- Use `.env.production` (gitignored)
- Use hosting platform's environment variable system
- Rotate secrets regularly

### 4. Database Backups

**Set up automatic backups:**
- Railway: Automatic daily backups
- Render: Enable backups in dashboard
- Or use external backup service

### 5. Media Storage

**For production, use external storage:**

#### Option A: Cloudinary (Recommended)
1. Sign up at https://cloudinary.com
2. Install plugin: `npm install @strapi/provider-upload-cloudinary`
3. Configure in `config/plugins.ts`:
```typescript
export default () => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
      },
    },
  },
});
```

#### Option B: AWS S3
1. Create S3 bucket
2. Install: `npm install @strapi/provider-upload-aws-s3`
3. Configure with AWS credentials

---

## 📊 Part 4: Production Checklist

### Pre-Deployment
- [ ] Generate secure secrets (JWT, API tokens, etc.)
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up media storage (Cloudinary/S3)
- [ ] Test locally with production config

### Strapi Deployment
- [ ] Deploy Strapi to Railway/Render
- [ ] Create admin account
- [ ] Set up API tokens
- [ ] Configure CORS for your domain
- [ ] Test API endpoints
- [ ] Set up automatic backups

### Next.js Deployment
- [ ] Deploy to Vercel/Netlify
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Test API connections
- [ ] Verify content loads correctly

### Post-Deployment
- [ ] Test content editing in Strapi
- [ ] Verify changes appear on website
- [ ] Check image loading
- [ ] Test preview functionality
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

---

## 🔄 Part 5: Migration Process

### Step 1: Deploy Strapi First
1. Deploy Strapi to production
2. Run migration script on production database
3. Verify all content migrated

### Step 2: Update Next.js
1. Update `.env.production` with Strapi URL
2. Deploy Next.js
3. Test API connections

### Step 3: Switch Over
1. Update DNS to point to new deployment
2. Monitor for errors
3. Keep old system running for 24-48 hours as backup

---

## 💰 Cost Estimates

### Railway (Strapi)
- **Free tier:** $5/month credit
- **Hobby:** $5/month (512MB RAM)
- **Pro:** $20/month (2GB RAM)

### Vercel (Next.js)
- **Free tier:** Unlimited (with limits)
- **Pro:** $20/month (for teams)

### Cloudinary (Media)
- **Free tier:** 25GB storage, 25GB bandwidth
- **Paid:** $89/month (100GB)

**Total minimum:** ~$5-10/month
**Recommended:** ~$30-50/month

---

## 🐛 Production Troubleshooting

### Issue: CORS Errors
**Solution:** Add your Next.js domain to Strapi CORS settings

### Issue: API Returns 403
**Solution:** Check API token permissions in Strapi

### Issue: Images Don't Load
**Solution:** Configure Cloudinary/S3 provider

### Issue: Database Connection Fails
**Solution:** Check DATABASE_SSL=true and connection string

### Issue: Slow Performance
**Solution:** 
- Enable caching in Next.js
- Use CDN for media
- Optimize database queries

---

## 📚 Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Strapi Deployment:** https://docs.strapi.io/dev-docs/deployment
- **Cloudinary Setup:** https://cloudinary.com/documentation

---

## ✅ Quick Production Setup (30 minutes)

1. **Deploy Strapi to Railway** (15 min)
   - Connect GitHub repo
   - Add PostgreSQL
   - Set environment variables
   - Deploy

2. **Deploy Next.js to Vercel** (10 min)
   - Import repository
   - Set environment variables
   - Deploy

3. **Configure & Test** (5 min)
   - Update CORS in Strapi
   - Test API connection
   - Verify content loads

**Done!** Your Strapi CMS is now live in production! 🎉

