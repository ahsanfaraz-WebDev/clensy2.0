# Strapi CMS Migration Plan

## 🎯 Goal
Migrate from MongoDB-based manual CMS to Strapi headless CMS while maintaining backward compatibility during transition.

## 📋 Current Status

### ✅ Completed
- [x] Strapi CMS setup with all content types
- [x] Data migration from MongoDB to Strapi
- [x] API permissions configured
- [x] Hero section API route updated (with toggle)
- [x] Strapi client library created (`lib/strapi.ts`)

### ⏳ In Progress
- [ ] Migrate all API routes to use Strapi
- [ ] Update frontend components
- [ ] Handle image migration
- [ ] Remove MongoDB dependencies

## 🚀 Migration Strategy

### Phase 1: API Routes Migration (Priority Order)

#### High Priority (Homepage)
1. ✅ Hero Section - DONE
2. ⏳ How It Works
3. ⏳ Comparison Section
4. ⏳ Checklist Section
5. ⏳ Reviews Section
6. ⏳ CTA Section

#### Medium Priority (Pages)
7. ⏳ About Page
8. ⏳ FAQ Page
9. ⏳ Contact Page
10. ⏳ Privacy Policy
11. ⏳ Terms of Service
12. ⏳ Careers Page

#### Lower Priority (Services & Locations)
13. ⏳ All Service Routes (13 services)
14. ⏳ All Location Routes (6 locations)

### Phase 2: Image Handling

**Current State:**
- Images stored as Cloudinary URLs in text fields
- Works but not optimal for Strapi

**Options:**
1. **Keep URLs** (Quickest) - Continue using `backgroundImageUrl` fields
2. **Migrate to Strapi Media** (Best) - Upload images to Strapi Media Library
3. **Hybrid** (Recommended) - Use Strapi Media for new images, keep URLs for existing

### Phase 3: Frontend Updates

**Current:** Components fetch from `/api/cms/*` routes
**Target:** Components can optionally fetch directly from Strapi

**Approach:**
- Keep API routes as proxy (for caching, auth, etc.)
- Optionally allow direct Strapi fetching for better performance

### Phase 4: Cleanup

1. Remove MongoDB models
2. Remove MongoDB connection code
3. Update environment variables
4. Remove old admin pages

## 🔧 Implementation Approach

### Option A: Gradual Migration (Recommended)
- Use feature flag (`USE_STRAPI=true`)
- Migrate routes one by one
- Test each route before moving to next
- Can rollback easily

### Option B: Big Bang Migration
- Migrate all routes at once
- Faster but riskier
- Harder to debug issues

## 📝 Migration Checklist

For each API route:
- [ ] Update route to fetch from Strapi
- [ ] Transform Strapi response to match existing format
- [ ] Add error handling
- [ ] Test with frontend
- [ ] Verify images work
- [ ] Update documentation

## 🖼️ Image Migration Strategy

### Step 1: Keep Current URLs Working
- All existing Cloudinary URLs continue to work
- No immediate changes needed

### Step 2: Upload New Images to Strapi
- Use Strapi Media Library for new uploads
- Update components to handle both URL and Media object

### Step 3: Optional - Migrate Existing Images
- Script to download from Cloudinary
- Upload to Strapi Media Library
- Update content references

## 🔄 Rollback Plan

If issues occur:
1. Set `USE_STRAPI=false` in `.env.local`
2. All routes fall back to MongoDB
3. Fix issues in Strapi
4. Re-enable Strapi

## 📊 Testing Checklist

For each migrated route:
- [ ] API returns correct data format
- [ ] Frontend displays correctly
- [ ] Images load properly
- [ ] SEO fields work
- [ ] Admin can edit in Strapi
- [ ] Changes reflect on website

## 🎯 Success Criteria

- [ ] All homepage sections use Strapi
- [ ] All pages use Strapi
- [ ] All services use Strapi
- [ ] All locations use Strapi
- [ ] Images work correctly
- [ ] Admin can edit all content in Strapi
- [ ] Changes reflect immediately on website
- [ ] No MongoDB dependencies remain

## 📅 Timeline Estimate

- **Phase 1 (API Routes):** 2-3 hours
- **Phase 2 (Images):** 1 hour
- **Phase 3 (Frontend):** 1 hour
- **Phase 4 (Cleanup):** 1 hour

**Total:** ~5-6 hours for complete migration

