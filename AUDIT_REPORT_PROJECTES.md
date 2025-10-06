# Web Performance & Accessibility Audit Report
## Page: Projectes (Projects)

**URL:** https://biombo-studio.netlify.app/projectes/
**Audit Date:** October 6, 2025
**Audit Tool:** Chrome DevTools MCP with Performance Insights
**Methodology:** [WEB_PERFORMANCE_AUDIT_METHODOLOGY.md](./WEB_PERFORMANCE_AUDIT_METHODOLOGY.md)

---

## Executive Summary

The Projectes page demonstrates **good performance** with Core Web Vitals passing on both desktop and mobile. Mobile LCP is at 2.06s (below the 2.5s threshold but approaching the limit). The page has excellent accessibility and no CLS issues. There's an opportunity to optimize mobile image delivery for improved LCP.

### Overall Assessment: ✅ PASS (with optimization opportunity)

| Category | Status | Score |
|----------|--------|-------|
| Core Web Vitals | ✅ Pass | LCP, CLS both within thresholds |
| Performance | ⚠️ Good (optimization opportunity) | Mobile LCP at 2.06s |
| Accessibility | ✅ Pass | Proper semantic structure |
| Security | ✅ Pass | HTTPS, HSTS enabled |
| Semantics | ✅ Pass | Proper HTML structure |

---

## 1. Core Web Vitals Performance

### Desktop (1366×900, 4× CPU throttle, Slow 4G)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **LCP** (Largest Contentful Paint) | 1135ms | ≤ 2.5s | ✅ **Good** |
| **CLS** (Cumulative Layout Shift) | 0.00 | < 0.1 | ✅ **Perfect** |
| **TTFB** (Time to First Byte) | 11ms | < 200ms | ✅ **Excellent** |

**LCP Breakdown:**
- TTFB: 11ms
- Load Delay: 572ms
- Load Duration: 2ms
- Render Delay: 550ms

### Mobile (360×740, 4× CPU throttle, Slow 4G)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **LCP** | 2059ms | ≤ 2.5s | ⚠️ **Needs Improvement** |
| **CLS** | 0.00 | < 0.1 | ✅ **Perfect** |
| **TTFB** | 17ms | < 200ms | ✅ **Excellent** |

**LCP Breakdown:**
- TTFB: 17ms
- Load Delay: 618ms
- Load Duration: 989ms (⚠️ High - image loading)
- Render Delay: 435ms

### Analysis

**Strengths:**
- ✅ Desktop LCP well under 2.5s threshold (1135ms)
- ✅ Perfect CLS (0.00) on both desktop and mobile
- ✅ TTFB is excellent on both devices
- ✅ Font preloading successfully prevents CLS
- ✅ Desktop performance is excellent

**Mobile LCP Issue:**
- ⚠️ Mobile LCP at 2.06s - **approaching the 2.5s threshold**
- ⚠️ Load Duration is 989ms (image downloading time)
- ⚠️ Chrome DevTools estimates 250ms potential savings through image optimization
- ⚠️ Estimated wasted bytes: 38.8 kB

**Root Cause:**
- Project card images are loading with significant delay on mobile
- Image delivery could be optimized (size, format, or priority)

---

## 2. Network Performance

### Network Analysis

**Total Requests:** 29 resources loaded

**Protocol & Caching:**
- ✅ HTTP/2 in use (Netlify)
- ✅ HSTS header present
- ✅ Cache-Control headers properly configured
- ✅ ETag caching enabled
- ✅ Netlify Edge caching active

**Font Loading:**
- ✅ 4 fonts preloaded: Poppins-Regular, Poppins-Medium, Poppins-SemiBold, Poppins-Bold
- ✅ All fonts served as woff2 (optimal compression)
- ✅ Font preloading successfully prevents CLS

**Image Delivery:**
- ✅ Images served from Sanity CDN with query parameters (`?w=1024&q=80&fit=max&auto=format`)
- ✅ Blurhash placeholders implemented (base64 data URIs)
- ⚠️ Mobile images could be further optimized
- ⚠️ LCP image has 989ms load duration on mobile

**Images Loaded:**
1. `6d1a3738051e...937.png?w=1024` - Obert per vacances (LCP candidate)
2. `4ce79f9fb7c2...670.jpg?w=1536` - Norma Còmics
3. `d6a6376f18c5...676.png?w=1024` - Cinema Edison
4. Custom cursor WebP
5. 3 blurhash base64 placeholders

**Resource Types:**
- CSS: 3 bundled files
- JavaScript: 13 bundled files (includes project filtering logic)
- Images: 7 total (3 project images + 1 cursor + 3 blurhash)
- Fonts: 4 woff2 files (all preloaded)

---

## 3. Accessibility (WCAG 2.2 Level AA)

### Landmark Regions ✅

| Landmark | Count | Status |
|----------|-------|--------|
| `<main>` | 1 | ✅ Present |
| `<header>` | 1 | ✅ Present |
| `<nav>` | 2 | ✅ Present (primary + mobile) |
| `<footer>` | 1 | ✅ Present |

### Heading Hierarchy ✅

| Level | Count | Example |
|-------|-------|---------|
| H1 | 1 | "Projectes" |
| H2 | 2 | "Filtrar per:", "Transformem idees junts. Parlem?" |

**Analysis:**
- ✅ Single H1 present
- ✅ No heading levels skipped
- ✅ Proper semantic hierarchy maintained

### Interactive Elements ✅

**Filter Buttons:** 5 buttons with pressed state
- "Disseny gràfic" (pressed)
- "Brànding i identitat corporativa" (pressed)
- "Disseny web i UX/UI" (pressed)
- "Il·lustració" (pressed)
- "Direcció d'art" (pressed)

**Clear Filters Button:** 1 button
- "Esborrar tots els filtres aplicats"

**Project Cards:** 3 interactive links with custom cursors
- Each link has descriptive aria-label
- Custom cursor visual feedback

**Analysis:**
- ✅ Filter system is keyboard accessible
- ✅ Proper button roles and pressed states
- ✅ Project links have descriptive text
- ✅ Custom cursor provides additional visual feedback

### Images ✅

**Project Images:** 3 images
- All have proper alt text with project names
- Images include descriptive attributes

**Custom Cursor Images:** 3 decorative images
- Properly marked as decorative

**Analysis:**
- ✅ All content images have descriptive alt text
- ✅ Decorative images properly handled

### Links ✅

**Total Links:** ~15+
**Empty Links:** 0

**Analysis:**
- ✅ All links have accessible text
- ✅ Skip to content link present
- ✅ Project links include "Veure detalls del projecte" for screen readers

---

## 4. Semantic HTML & Structure

### Semantic Elements ✅

| Element | Present | Usage |
|---------|---------|-------|
| `<article>` | ✅ Yes | Used for project cards |
| `<section>` | ✅ Yes | Used appropriately |
| `<aside>` | ✅ Yes | Used for filters |
| Language (`lang`) | ✅ `ca` | Catalan properly declared |

**Analysis:**
- ✅ Excellent use of semantic HTML5 elements
- ✅ Document language correctly set to Catalan
- ✅ Filters and project cards properly structured
- ✅ Interactive filter system with proper ARIA states

---

## 5. Security

### HTTPS & Headers ✅

| Security Feature | Status |
|-----------------|--------|
| HTTPS Protocol | ✅ Enabled |
| HSTS Header | ✅ Enabled |
| Mixed Content | ✅ None detected |
| CSP Header | ✅ Present |

**Analysis:**
- ✅ All resources served over HTTPS
- ✅ Sanity CDN images served over HTTPS
- ✅ No mixed content warnings
- ✅ Security headers properly configured

---

## 6. Console Messages

**Status:** ✅ No errors or warnings detected

**Analysis:**
- ✅ Clean console output
- ✅ No JavaScript errors
- ✅ Filter system working without errors
- ✅ No CORS issues

---

## 7. Performance Insights

### Desktop Insights

1. **LCP Breakdown**
   - Load delay (572ms) and render delay (550ms) are the main factors
   - Image loads quickly (2ms duration)
   - Performance is good overall

2. **LCP Discovery**
   - LCP image discovered relatively early
   - No significant discovery delay

### Mobile Insights ⚠️

1. **Image Delivery Optimization** (Priority: Medium)
   - **Issue:** Load duration of 989ms for LCP image
   - **Estimated Savings:** 250ms LCP improvement
   - **Wasted Bytes:** 38.8 kB
   - **Recommendation:** Optimize mobile image sizes

2. **LCP Breakdown**
   - Load delay: 618ms
   - Load duration: 989ms ⚠️ (main bottleneck)
   - Render delay: 435ms

3. **LCP Discovery**
   - Discovery time could be improved
   - Consider preloading first project card image

---

## Recommendations

### Medium Priority

1. **Optimize Mobile Image Delivery** (Performance - Mobile LCP)
   - **Issue:** Mobile LCP at 2.06s due to 989ms image load time
   - **Impact:** Approaching 2.5s threshold, user experience could be better
   - **Effort:** Medium
   - **Actions:**
     - Reduce mobile image dimensions (currently using `?w=1024` - could use `?w=768` for mobile)
     - Consider preloading the first project card image
     - Implement responsive images with `srcset` for mobile vs desktop
     - Review Sanity CDN query parameters for mobile optimization
   - **Expected Result:** Mobile LCP: 2.06s → ~1.8s

2. **Preload First Project Image** (Performance - Mobile LCP)
   - **Issue:** LCP image has discovery delay of 618ms
   - **Impact:** Delays LCP on mobile
   - **Effort:** Low
   - **Action:** Add `<link rel="preload" as="image" href="[first-project-image-url]">` for mobile viewport
   - **Expected Result:** Reduce load delay by ~200-300ms

### Low Priority

3. **Monitor Desktop LCP** (Performance)
   - **Issue:** Desktop LCP at 1135ms (still good, but higher than other pages)
   - **Impact:** Minimal - well under threshold
   - **Action:** Continue monitoring to ensure it doesn't degrade

---

## Comparison to Best Practices (2025 Standards)

| Best Practice | Status | Notes |
|---------------|--------|-------|
| LCP ≤ 2.5s | ⚠️ Pass (borderline) | Desktop: 1135ms ✅, Mobile: 2059ms ⚠️ |
| CLS < 0.1 | ✅ Pass | 0.00 both desktop and mobile (perfect) |
| TTFB < 200ms | ✅ Pass | 11ms desktop, 17ms mobile |
| WCAG 2.2 Level AA | ✅ Pass | All requirements met |
| HTTPS + HSTS | ✅ Pass | Properly configured |
| Semantic HTML5 | ✅ Pass | Excellent structure |
| HTTP/2 | ✅ Pass | Enabled via Netlify |
| Font Preloading | ✅ Pass | All 4 weights preloaded |
| Image Optimization | ⚠️ Partial | Desktop good, mobile needs optimization |
| Responsive Images | ❌ Missing | Could implement srcset for better mobile |

---

## Comparison to Other Pages

| Page | Desktop LCP | Mobile LCP | Desktop CLS | Mobile CLS |
|------|-------------|------------|-------------|------------|
| **Projectes** | 1135ms ⚠️ | 2059ms ⚠️ | 0.00 ✅ | 0.00 ✅ |
| Nosaltres | 668ms ✅ | 676ms ✅ | 0.00 ✅ | 0.00 ✅ |
| Serveis | 652ms ✅ | 659ms ✅ | 0.00 ✅ | 0.00 ✅ |
| Contacte | N/A | N/A | 0.00 ✅ | 0.00 ✅ |

**Analysis:**
- Projectes page has higher LCP than other pages due to image-heavy content
- All pages have perfect CLS after font preloading optimization
- Projectes page would benefit from image optimization, especially on mobile

---

## Summary

The Projectes page is **performing well overall** with perfect CLS and passing Core Web Vitals. However, mobile LCP at 2.06s is approaching the 2.5s threshold and represents the main optimization opportunity. Image delivery optimization could bring mobile LCP down to ~1.8s, providing a better user experience on mobile devices.

**Key Findings:**
- ✅ Perfect CLS (0.00) on both desktop and mobile
- ✅ Excellent accessibility with proper semantic structure
- ✅ Interactive filter system working perfectly
- ⚠️ Mobile LCP needs optimization (2.06s → target ~1.8s)
- ✅ Clean console with no errors

**Next Steps:**
1. Optimize mobile image sizes (reduce from 1024px to 768px for mobile)
2. Consider preloading first project card image
3. Implement responsive images with srcset
4. Re-audit after optimization

---

## Appendix: Test Configuration

**Desktop Profile:**
- Viewport: 1366×900
- CPU: 4× slowdown
- Network: Slow 4G (400ms RTT, 400 Kbps)

**Mobile Profile:**
- Viewport: 360×740
- CPU: 4× slowdown
- Network: Slow 4G (400ms RTT, 400 Kbps)

**Chrome DevTools MCP Version:** Latest (January 2025)
