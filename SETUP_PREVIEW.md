# 🎯 Quick Setup: Strapi Preview

## Step 1: Add Your API Token

Edit `.env.local` and add your Strapi API token:

```env
USE_STRAPI=true
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_actual_token_here
STRAPI_PREVIEW_SECRET=clensy-preview-secret-2024
```

**To get your token:**
1. Go to `http://localhost:1337/admin`
2. Settings → API Tokens
3. Copy your Full Access token

## Step 2: Restart Next.js Server

**IMPORTANT:** After changing `.env.local`, you MUST restart:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 3: Configure Preview in Strapi

1. Go to `http://localhost:1337/admin`
2. Settings → Content-Type Builder
3. Click on **Hero Section**
4. Click **Settings** tab
5. Scroll to **Preview** section
6. Click **Add preview URL**
7. Enter:
   ```
   http://localhost:3000/api/preview?secret=clensy-preview-secret-2024&slug={slug}&contentType=hero-section
   ```
8. Click **Save**

## Step 4: Test It!

1. **Edit Hero Section:**
   - Go to Content Manager → Hero Section
   - Change the "heading" text
   - Click **Save** then **Publish**

2. **Check Your Website:**
   - Go to `http://localhost:3000`
   - Open Browser Console (F12)
   - Look for: `🔵 Hero API Response`
   - Should show: `source: 'strapi'`
   - Refresh page (Ctrl+Shift+R)
   - Should see updated heading!

3. **Test Preview:**
   - In Strapi, click the **Preview** button (eye icon)
   - Should open your website with preview mode

## ✅ Verification

Check browser console for:
- ✅ `🔵 Fetching from Strapi`
- ✅ `✅ Strapi response`
- ✅ `source: 'strapi'`
- ✅ Updated heading text

## 🐛 Still Not Working?

See `TROUBLESHOOTING.md` for detailed help!

