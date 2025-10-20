# Blog Implementation - DEV.to Integration

This document describes the complete blog implementation that fetches and renders articles from DEV.to (user: stevenayal) with full SEO, ISR, and Giscus comments integration.

## 📁 Files Created

### Core Implementation

1. **`src/lib/devto.ts`** - DEV.to API client
   - `listPosts()`: Fetch article list with ISR
   - `getPost(slug)`: Fetch single article with body HTML
   - `formatDate()`: Format dates in es-PY locale
   - Automatic error handling for 404/429/500 responses

2. **`src/app/blog/page.tsx`** - Blog listing page
   - Server component with ISR (revalidate: 1800s = 30 min)
   - Full SEO metadata (OpenGraph, Twitter Cards, canonical)
   - Responsive grid layout with cover images
   - Tags, engagement stats, reading time
   - Graceful error handling

3. **`src/app/blog/[slug]/page.tsx`** - Blog post detail page
   - Dynamic route with ISR
   - `generateMetadata()` for per-post SEO
   - `generateStaticParams()` for first 100 posts
   - Full article rendering with `dangerouslySetInnerHTML`
   - Canonical URL points to aiquaa.com (SEO ownership)
   - Giscus comments integration
   - Back to blog navigation

4. **`src/components/Comments.tsx`** - Giscus comments (client component)
   - Auto-loads Giscus script
   - Dark mode support (`preferred_color_scheme`)
   - Spanish language (`es`)
   - Cleanup on unmount

### Supporting Files

5. **`src/app/blog/loading.tsx`** - Loading skeleton for blog list
6. **`src/app/blog/[slug]/loading.tsx`** - Loading skeleton for post detail
7. **`src/app/blog/not-found.tsx`** - Custom 404 page for blog
8. **`src/app/sitemap.ts`** - Dynamic sitemap generator (includes blog posts)
9. **`src/app/rss.xml/route.ts`** - RSS feed route handler
10. **`tailwind.config.js`** - Updated with `@tailwindcss/typography` plugin

## 🔧 Configuration Required

### 1. Giscus Setup

Before deploying, configure Giscus comments in `src/components/Comments.tsx`:

1. Visit https://giscus.app
2. Enter your repository name (e.g., `username/repo`)
3. Choose a category for discussions (e.g., "Comentarios")
4. Copy the generated values and replace in `Comments.tsx`:

```typescript
// In src/components/Comments.tsx, replace these TODO values:
script.setAttribute('data-repo', 'YOUR-USERNAME/YOUR-REPO');
script.setAttribute('data-repo-id', 'R_kgDOxxxxxxx');
script.setAttribute('data-category', 'Comentarios');
script.setAttribute('data-category-id', 'DIC_kwDOxxxxxxx');
```

### 2. Environment Variables

No new environment variables are required. The blog uses public DEV.to API endpoints.

### 3. Canonical URLs in DEV.to

For each article in DEV.to, update the canonical URL to point to your domain:

1. Go to your article on DEV.to
2. Click "Edit"
3. In "Basic" settings, set "Canonical URL" to: `https://aiquaa.com/blog/{slug}`
4. This ensures Google indexes your domain as the primary source

## 🚀 Usage

### Development

```bash
# Start development server
pnpm dev

# Access blog
http://localhost:3001/blog
```

### Testing

```bash
# Run linter
pnpm lint

# Build project (includes sitemap generation)
pnpm build
```

### Deployment

The blog is fully compatible with Vercel deployment:

1. **Automatic ISR**: Pages revalidate every 30 minutes
2. **Static Generation**: First 100 posts are pre-rendered
3. **Dynamic Routes**: New posts are generated on-demand
4. **Sitemap**: Automatically generated during build (`pnpm build`)
5. **RSS Feed**: Available at `https://aiquaa.com/rss.xml`

## 📊 Features

### SEO Optimization

- ✅ Dynamic metadata per post (title, description, OG, Twitter Cards)
- ✅ Canonical URLs point to aiquaa.com (not DEV.to)
- ✅ Structured data with author information
- ✅ Sitemap includes all blog posts
- ✅ RSS feed for subscribers
- ✅ Image optimization with cover images

### Performance

- ✅ ISR with 30-minute revalidation
- ✅ Static generation for first 100 posts
- ✅ Loading skeletons for better UX
- ✅ Client-side caching via Next.js

### Accessibility

- ✅ Semantic HTML (`<article>`, `<time>`, etc.)
- ✅ ARIA labels for comments section
- ✅ Dark mode support
- ✅ Responsive typography with Tailwind prose

### Error Handling

- ✅ Graceful degradation when API fails
- ✅ Custom 404 page for missing posts
- ✅ Rate limit handling (429)
- ✅ Friendly error messages

## 🎨 Styling

The blog uses Tailwind CSS with the `@tailwindcss/typography` plugin:

- **Prose classes**: `prose prose-lg dark:prose-invert`
- **Dark mode**: Automatic with `dark:` variants
- **Responsive**: Mobile-first design
- **Custom colors**: Uses existing AIQUAA brand colors

## 📝 Content Updates

Articles update automatically from DEV.to:

- **ISR**: Every 30 minutes (configurable via `revalidate`)
- **On-demand**: Trigger revalidation via Vercel API or manual purge
- **Manual revalidation**: Use `/api/revalidate` endpoint (if implemented)

## 🔍 Sitemap & RSS

### Sitemap

- **Location**: `https://aiquaa.com/sitemap.xml`
- **Includes**: All static pages + dynamic blog posts
- **Update frequency**: Rebuilt on every deployment
- **Dynamic posts**: Fetched from DEV.to during build

### RSS Feed

- **Location**: `https://aiquaa.com/rss.xml`
- **Format**: RSS 2.0 with Dublin Core extensions
- **Items**: Latest 50 posts
- **Revalidation**: Every 30 minutes (ISR)
- **Includes**: Title, description, cover image, tags, author

## 🧪 Testing Checklist

### Manual Testing

- [ ] Visit `/blog` - should show list of articles
- [ ] Click on an article - should navigate to `/blog/{slug}`
- [ ] Verify article content renders correctly
- [ ] Check dark mode toggle works
- [ ] Verify Giscus comments load (after configuration)
- [ ] Test back navigation to blog list
- [ ] Try invalid slug (should show 404)
- [ ] Check mobile responsiveness

### SEO Validation

- [ ] Inspect `<head>` tags for metadata
- [ ] Verify `<link rel="canonical">` points to aiquaa.com
- [ ] Check OpenGraph tags (use debugger: https://www.opengraph.xyz/)
- [ ] Validate Twitter Cards (use validator: https://cards-dev.twitter.com/validator)
- [ ] Verify sitemap.xml includes blog posts
- [ ] Test RSS feed in reader (e.g., Feedly)

### Performance

- [ ] Verify ISR works (update article on DEV, wait 30 min, check if updated)
- [ ] Check loading states appear briefly
- [ ] Verify no console errors
- [ ] Test with Network throttling (slow 3G)

## 🐛 Troubleshooting

### Articles not loading

1. Check DEV.to API is accessible: `curl https://dev.to/api/articles?username=stevenayal`
2. Verify username is correct in `src/lib/devto.ts`
3. Check browser console for errors
4. Review server logs for API errors

### Comments not appearing

1. Ensure Giscus is configured in `src/components/Comments.tsx`
2. Verify GitHub Discussions is enabled on your repo
3. Check repository is public
4. Test Giscus directly on https://giscus.app

### SEO issues

1. Verify `SITE_URL` in `next-sitemap.config.js`
2. Check canonical URLs in page source
3. Rebuild sitemap: `pnpm build`
4. Submit sitemap to Google Search Console

### ISR not working

1. Verify deployment platform supports ISR (Vercel does)
2. Check `revalidate` value in page components
3. Test on-demand revalidation if needed
4. Check cache headers in Network tab

## 📚 Resources

- **DEV.to API Docs**: https://developers.forem.com/api/v1
- **Giscus**: https://giscus.app
- **Next.js ISR**: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
- **Tailwind Typography**: https://tailwindcss.com/docs/typography-plugin
- **Next.js Sitemap**: https://github.com/iamvishnusankar/next-sitemap

## 📦 Dependencies Added

```json
{
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19"
  }
}
```

## 🎯 Next Steps

1. **Configure Giscus** - Replace TODO values in `Comments.tsx`
2. **Update Canonical URLs** - Edit each DEV.to article to set canonical
3. **Submit Sitemap** - Add `https://aiquaa.com/sitemap.xml` to Google Search Console
4. **Promote RSS Feed** - Add RSS link to footer/header
5. **Monitor Performance** - Use Vercel Analytics to track blog traffic
6. **Customize Styling** - Adjust prose styles in `blog/[slug]/page.tsx` if needed

---

**Author**: Claude Code
**Date**: 2025-10-19
**Project**: AIQUAA - QA Platform Paraguay
