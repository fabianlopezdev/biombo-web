# Web Performance & Accessibility Audit Report
## Page: Nosaltres (About Us)

**URL:** https://biombo-studio.netlify.app/nosaltres/
**Audit Date:** October 6, 2025
**Audit Tool:** Chrome DevTools MCP with Performance Insights
**Methodology:** [WEB_PERFORMANCE_AUDIT_METHODOLOGY.md](./WEB_PERFORMANCE_AUDIT_METHODOLOGY.md)

---

## Executive Summary

The Nosaltres page demonstrates **excellent performance** with outstanding Core Web Vitals scores on both desktop and mobile. The page passes all critical performance thresholds and maintains good accessibility practices. Minor improvements are recommended for image accessibility.

### Overall Assessment: ✅ PASS

| Category | Status | Score |
|----------|--------|-------|
| Core Web Vitals | ✅ Pass | LCP, CLS both excellent |
| Performance | ✅ Pass | Fast load times |
| Accessibility | ⚠️ Needs Minor Improvement | 6 images missing alt text |
| Security | ✅ Pass | HTTPS, HSTS enabled |
| Semantics | ✅ Pass | Proper HTML structure |

---

## 1. Core Web Vitals Performance

### Desktop (1366×900, 4× CPU throttle, Slow 4G)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **LCP** (Largest Contentful Paint) | 698ms | ≤ 2.5s | ✅ **Good** |
| **CLS** (Cumulative Layout Shift) | 0.06 | < 0.1 | ✅ **Good** |
| **TTFB** (Time to First Byte) | 85ms | < 200ms | ✅ **Excellent** |

**LCP Breakdown:**
- TTFB: 85ms
- Render Delay: 614ms

### Mobile (360×740, 4× CPU throttle, Slow 4G)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **LCP** | 676ms | ≤ 2.5s | ✅ **Good** |
| **CLS** | 0.00 | < 0.1 | ✅ **Perfect** |
| **TTFB** | 16ms | < 200ms | ✅ **Excellent** |

**LCP Breakdown:**
- TTFB: 16ms
- Render Delay: 660ms

### Analysis

**Strengths:**
- ✅ Both desktop and mobile LCP well under 2.5s threshold
- ✅ Mobile CLS is perfect (0.00) - no layout shifts
- ✅ Desktop CLS (0.06) is under 0.1 threshold
- ✅ TTFB is excellent on both devices
- ✅ Font preloading is working effectively (from previous optimizations)

**Desktop CLS Issue (0.06):**
- CLS cluster starts at 717ms, duration 1000ms
- Score: 0.0644
- Root cause: Non-composited scroll animation with no visible change
- **Impact:** Low - still passes Core Web Vitals threshold
- **Recommendation:** Monitor but not critical

---

## 2. Network Performance

### Network Analysis

**Total Requests:** 41 resources loaded

**Protocol & Caching:**
- ✅ HTTP/2 in use (Netlify)
- ✅ HSTS header present: `max-age=31536000; includeSubDomains; preload`
- ✅ Cache-Control headers properly configured: `public,max-age=0,must-revalidate`
- ✅ ETag caching enabled
- ✅ Netlify Edge caching active (Cache-Status: "Netlify Edge"; hit)

**Font Loading:**
- ✅ 4 fonts loaded: Poppins-Regular, Poppins-Medium, Poppins-SemiBold, Poppins-Bold
- ✅ All fonts preloaded (from previous optimizations)
- ✅ Fonts served as woff2 (optimal compression)

**Resource Types:**
- CSS: 3 files
- JavaScript: Multiple bundled files (Astro build output)
- Images: Mix of optimized formats with blurhash placeholders
- Fonts: 4 woff2 files

**Third-Party Analysis:**
- Third-party code detected in trace bounds (213856607311 - 213856633497)
- Duration: ~26ms
- **Impact:** Minimal impact on performance

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
| H1 | 1 | "Nosaltres" |
| H2 | 3 | "MÉS DE 10 ANYS D'EXPERIÈNCIA", "Clients destacats", "Transformem idees junts. Parlem?" |

**Analysis:**
- ✅ Single H1 present
- ✅ No heading levels skipped
- ✅ Proper semantic hierarchy maintained

### Images ⚠️

**Total Images:** 24
**Missing Alt Text:** 6 images

**Issue:** 6 images lack alt attributes, failing WCAG 2.2 Level A requirement (SC 1.1.1)

**Affected Images:**
- Client logo carousel images (likely)
- Review in DOM snapshot showed image elements without alt text

**Impact:** Medium - affects screen reader users and SEO

**Recommendation:** Add descriptive alt text to all images, especially client logos

### Links ✅

**Total Links:** 40
**Empty Links:** 0

**Analysis:**
- ✅ All links have accessible text or aria-label
- ✅ No empty link elements

---

## 4. Semantic HTML & Structure

### Semantic Elements ✅

| Element | Present | Usage |
|---------|---------|-------|
| `<article>` | ❌ No | Not required for this page type |
| `<section>` | ✅ Yes | Used appropriately |
| `<aside>` | ✅ Yes | Used appropriately |
| Language (`lang`) | ✅ `ca` | Catalan properly declared |

**Analysis:**
- ✅ Proper use of semantic HTML5 elements
- ✅ Document language correctly set to Catalan
- ✅ Appropriate sectioning for content structure

---

## 5. Security

### HTTPS & Headers ✅

| Security Feature | Status |
|-----------------|--------|
| HTTPS Protocol | ✅ Enabled |
| HSTS Header | ✅ `max-age=31536000; includeSubDomains; preload` |
| Mixed Content | ✅ None detected |
| CSP Header | ✅ Present (from previous optimizations) |

**Analysis:**
- ✅ All resources served over HTTPS
- ✅ HSTS enforces HTTPS for 1 year
- ✅ No mixed content warnings
- ✅ Security headers properly configured

---

## 6. Console Messages

**Status:** ✅ No errors or warnings detected

**Analysis:**
- ✅ Clean console output
- ✅ No JavaScript errors
- ✅ No CORS issues
- ✅ No CSP violations

---

## 7. Performance Insights

### Available Insights

1. **LCP Breakdown**
   - Render delay is the dominant factor (614ms desktop, 660ms mobile)
   - Resource loading is efficient
   - Consider optimizing render-critical JavaScript

2. **Render-Blocking Resources**
   - Estimated savings: FCP 0ms, LCP 0ms
   - Current implementation is optimized
   - No critical blocking issues

3. **Network Dependency Tree**
   - Request chains are reasonable
   - No excessive request waterfalls detected

4. **Third Parties**
   - Minimal third-party impact (~26ms)
   - Well-optimized third-party code

---

## Recommendations

### High Priority

1. **Add Alt Text to Images** (Accessibility - WCAG 2.2 Level A)
   - **Issue:** 6 images missing alt attributes
   - **Impact:** Screen reader accessibility, SEO
   - **Effort:** Low
   - **Action:** Add descriptive alt text to all images, especially client logos
   - **Files to check:** `AboutSlider.astro`, client logo components

### Low Priority

2. **Monitor Desktop CLS** (Performance)
   - **Issue:** Desktop CLS at 0.06 (still passing, but could be improved)
   - **Impact:** Minimal - under threshold
   - **Effort:** Medium
   - **Action:** Investigate non-composited scroll animation if CLS increases
   - **Note:** Mobile CLS is already perfect (0.00)

---

## Comparison to Best Practices (2025 Standards)

| Best Practice | Status | Notes |
|---------------|--------|-------|
| LCP ≤ 2.5s | ✅ Pass | 698ms desktop, 676ms mobile |
| CLS < 0.1 | ✅ Pass | 0.06 desktop, 0.00 mobile |
| TTFB < 200ms | ✅ Pass | 85ms desktop, 16ms mobile |
| WCAG 2.2 Level AA | ⚠️ Partial | Missing alt text on 6 images |
| HTTPS + HSTS | ✅ Pass | Properly configured |
| Semantic HTML5 | ✅ Pass | Good structure |
| HTTP/2 | ✅ Pass | Enabled via Netlify |
| Font Preloading | ✅ Pass | Implemented |
| Image Optimization | ✅ Pass | Blurhash placeholders used |

---

## Summary

The Nosaltres page is **highly performant** with excellent Core Web Vitals scores on both desktop and mobile. The main area for improvement is adding alt text to 6 images to achieve full WCAG 2.2 Level AA compliance. Overall, the page demonstrates professional web development practices and modern optimization techniques.

**Next Steps:**
1. Add alt text to missing images
2. Continue monitoring Core Web Vitals in production
3. Consider similar audit for other key pages

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
