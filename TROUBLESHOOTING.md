# 🔧 Troubleshooting: Strapi Changes Not Reflecting

## ✅ Quick Fixes

### 1. Restart Next.js Server (REQUIRED)

After changing `.env.local` or API routes, **restart Next.js**:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Check Environment Variables

Verify `.env.local` has:
```env
USE_STRAPI=true
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_token_here
```

### 3. Check Browser Console

Open browser DevTools (F12) → Console tab
- Look for: `🔵 Hero API Response`
- Check `source: 'strapi'` or `source: 'mongodb'`
- If it says `mongodb`, Strapi is not being used!

### 4. Hard Refresh Browser

- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

### 5. Clear Next.js Cache

```bash
# Delete .next folder
rm -rf .next
# Or on Windows:
rmdir /s .next

# Restart server
npm run dev
```

## 🧪 Testing Steps

### Step 1: Test Strapi API Directly

Open browser and go to:
```
http://localhost:1337/api/hero-section
```

You should see JSON with your updated data.

### Step 2: Test Next.js API Route

Open browser and go to:
```
http://localhost:3000/api/cms/hero
```

Check the response:
- Should have `"source": "strapi"`
- Should have updated `heading` field

### Step 3: Check Browser Console

1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Go to Console tab
4. Look for logs:
   - `🔵 Hero API Response`
   - `🔵 Source: strapi`
   - `🔵 Heading: [your updated text]`

## 🐛 Common Issues

### Issue: Still showing old data

**Solution:**
1. Restart Next.js server
2. Hard refresh browser (Ctrl+Shift+R)
3. Check console logs

### Issue: API returns MongoDB data

**Check:**
- `.env.local` has `USE_STRAPI=true`
- Restarted Next.js after changing `.env.local`
- No typos in environment variable name

### Issue: Strapi API returns 403

**Solution:**
1. Go to Strapi Admin → Settings → Roles → Public
2. Enable `find` permission for Hero Section
3. Click Save

### Issue: Changes don't appear after publishing

**Check:**
- Did you click **"Publish"** (not just "Save")?
- Is the content in **"Published"** tab (not "Draft")?
- Wait 1-2 seconds for cache to clear

## 🔍 Debug Mode

The hero component now auto-refreshes every 5 seconds in development mode.

Check browser console for:
- `🔵 Fetching from Strapi`
- `✅ Strapi response`
- `✅ Returning Strapi data`

## 📝 Preview Setup

### In Strapi Admin:

1. Go to **Settings** → **Content-Type Builder**
2. Click on **Hero Section**
3. Go to **Settings** tab
4. Scroll to **Preview** section
5. Add preview URL:
   ```
   http://localhost:3000/api/preview?secret=your-preview-secret&slug={slug}&contentType=hero-section
   ```
6. Set preview secret (add to `.env.local`):
   ```env
   STRAPI_PREVIEW_SECRET=your-preview-secret
   ```

### Test Preview:

1. Edit Hero Section in Strapi
2. Click **"Preview"** button (eye icon)
3. Should open your website with preview mode

## ✅ Verification Checklist

- [ ] `.env.local` has `USE_STRAPI=true`
- [ ] Next.js server restarted after env changes
- [ ] Strapi is running on `http://localhost:1337`
- [ ] Browser console shows `source: 'strapi'`
- [ ] Strapi API returns updated data
- [ ] Next.js API route returns updated data
- [ ] Browser shows updated content

## 🆘 Still Not Working?

1. **Check server logs:**
   - Next.js terminal should show: `🔵 Fetching from Strapi`
   - If not, Strapi is not being used

2. **Test Strapi directly:**
   ```bash
   curl http://localhost:1337/api/hero-section
   ```

3. **Check Next.js API:**
   ```bash
   curl http://localhost:3000/api/cms/hero
   ```

4. **Verify data format:**
   - Strapi returns: `{ data: { heading: "..." } }`
   - Next.js transforms it correctly



