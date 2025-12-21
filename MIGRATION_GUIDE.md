# 🚀 Complete Strapi Migration Guide

## ✅ What's Already Done

1. ✅ Strapi CMS fully configured
2. ✅ All content types created
3. ✅ Data migrated from MongoDB
4. ✅ API permissions set
5. ✅ Hero section route updated
6. ✅ CTA section route updated
7. ✅ CMS Adapter created (`lib/cms-adapter.ts`)

## 📋 Step-by-Step Migration Process

### Step 1: Enable Strapi (Already Done)

Your `.env.local` should have:
```env
USE_STRAPI=true
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_token_here
```

### Step 2: Test Current Setup

1. **Edit content in Strapi:**
   - Go to `http://localhost:1337/admin`
   - Edit Hero Section (change heading text)
   - Click "Save" then "Publish"

2. **Check your website:**
   - Visit `http://localhost:3000`
   - Refresh the page
   - You should see the updated heading!

### Step 3: Migrate Remaining Routes

For each route in `app/api/cms/*`, follow this pattern:

#### Example: Reviews Route

**Before (MongoDB):**
```typescript
export async function GET() {
  await connectToDatabase();
  const data = await Reviews.findOne();
  return NextResponse.json({ success: true, data });
}
```

**After (Strapi + Fallback):**
```typescript
import CMSAdapter from "@/lib/cms-adapter";

export async function GET() {
  try {
    // Try Strapi first
    const strapiData = await CMSAdapter.getReviewsSection();
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    const data = await Reviews.findOne();
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### Step 4: Add Methods to CMS Adapter

For each content type, add a method to `lib/cms-adapter.ts`:

```typescript
static async getReviewsSection() {
  if (USE_STRAPI) {
    const result = await fetchFromStrapi<StrapiResponse<any>>('/review', {
      populate: ['testimonials'],
    });
    
    if (!result?.data) return null;
    
    const data = result.data;
    return {
      heading: data.heading || '',
      buttonText: data.buttonText || '',
      testimonials: data.testimonials || [],
    };
  }
  
  // MongoDB fallback
  const { default: connectToDatabase } = await import('@/lib/db/mongodb');
  const Reviews = (await import('@/models/Reviews')).default;
  
  await connectToDatabase();
  return await Reviews.findOne();
}
```

## 🎯 Priority Order

### Phase 1: Homepage Sections (Do These First)
1. ✅ Hero Section - DONE
2. ✅ CTA Section - DONE  
3. ⏳ How It Works
4. ⏳ Comparison Section
5. ⏳ Checklist Section
6. ⏳ Reviews Section

### Phase 2: Main Pages
7. ⏳ About Page
8. ⏳ FAQ Page
9. ⏳ Contact Page

### Phase 3: Services & Locations
10. ⏳ All 13 Service Routes
11. ⏳ All 6 Location Routes

## 🖼️ Image Handling

### Current Setup (Works Now)
- Images stored as Cloudinary URLs in `backgroundImageUrl` fields
- No changes needed immediately

### Future Enhancement (Optional)
1. Upload images to Strapi Media Library
2. Update components to handle Strapi media objects
3. Use `getImageUrl()` helper from adapter

## 🧪 Testing Each Route

After migrating each route:

1. **Test API directly:**
   ```bash
   curl http://localhost:3000/api/cms/reviews
   ```
   Should return data with `"source": "strapi"`

2. **Edit in Strapi:**
   - Change content in Strapi admin
   - Publish changes

3. **Verify on website:**
   - Refresh page
   - Changes should appear immediately

## 🔄 Rollback Plan

If something breaks:

1. **Quick fix:** Set `USE_STRAPI=false` in `.env.local`
2. **Restart Next.js:** All routes fall back to MongoDB
3. **Fix issue in Strapi**
4. **Re-enable:** Set `USE_STRAPI=true`

## 📊 Migration Checklist

Copy this and check off as you go:

### Homepage
- [x] Hero Section
- [x] CTA Section
- [ ] How It Works
- [ ] Comparison Section
- [ ] Checklist Section
- [ ] Reviews Section

### Pages
- [ ] About Page
- [ ] FAQ Page
- [ ] Contact Page
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Careers Page

### Services
- [ ] Routine Cleaning
- [ ] Deep Cleaning
- [ ] Airbnb Cleaning
- [ ] Moving Cleaning
- [ ] Post Construction Cleaning
- [ ] Office Cleaning
- [ ] Medical Cleaning
- [ ] Gym Cleaning
- [ ] Retail Cleaning
- [ ] School Cleaning
- [ ] Property Cleaning
- [ ] Extras Service
- [ ] Other Commercial Cleaning

### Locations
- [ ] Bergen
- [ ] Essex
- [ ] Hudson
- [ ] Morris
- [ ] Passaic
- [ ] Union

## 🎉 Final Steps (After All Routes Migrated)

1. **Remove MongoDB:**
   - Delete `models/` folder
   - Remove MongoDB connection code
   - Remove MongoDB from `package.json`

2. **Clean up:**
   - Remove old admin pages (`app/admin/*`)
   - Update environment variables
   - Remove `USE_STRAPI` flag (always use Strapi)

3. **Deploy:**
   - Deploy Strapi to production
   - Update `NEXT_PUBLIC_STRAPI_URL` to production URL
   - Deploy Next.js app

## 💡 Pro Tips

1. **Test incrementally** - Migrate one route at a time
2. **Keep MongoDB as fallback** - Don't remove until everything works
3. **Use browser DevTools** - Check Network tab to see which source is used
4. **Strapi caching** - Changes may take a few seconds to appear (60s cache)
5. **Image optimization** - Strapi can serve optimized images automatically

## 🆘 Troubleshooting

### Issue: Changes don't appear on website
- **Check:** Is `USE_STRAPI=true` in `.env.local`?
- **Check:** Did you click "Publish" in Strapi (not just "Save")?
- **Check:** Restart Next.js dev server after changing `.env.local`

### Issue: API returns 403 Forbidden
- **Check:** Public role permissions in Strapi
- **Check:** API token has correct permissions

### Issue: Images don't load
- **Check:** Image URLs are correct
- **Check:** CORS settings in Strapi
- **Check:** Use `getImageUrl()` helper for Strapi media

### Issue: Data format mismatch
- **Check:** Transform Strapi response to match existing format
- **Check:** Use CMS Adapter methods for consistency

## 📞 Need Help?

1. Check `STRAPI_MIGRATION_PLAN.md` for detailed strategy
2. Review `lib/cms-adapter.ts` for examples
3. Test with one route first before migrating all

---

**Estimated Time:** 4-6 hours for complete migration
**Difficulty:** Medium (but we've done the hard parts!)



