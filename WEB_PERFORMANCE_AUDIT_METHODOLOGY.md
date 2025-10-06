# Web Performance & SEO Audit Methodology
## Comprehensive Chrome DevTools MCP Audit Runbook (2025)

> **Version:** 2.0 (January 2025)
> **Target:** Biombo Studio Website Performance, SEO, Accessibility & Best Practices Audit
> **Tools:** Chrome DevTools MCP, Performance Insights, Lighthouse

> ⚠️ **CRITICAL REQUIREMENT:** All performance audits MUST be conducted with:
> - **Cache disabled** (Chrome DevTools "Disable cache" checkbox or CDP `Network.setCacheDisabled`)
> - **Incognito/private browsing mode** (recommended for clean environment)
> - **Fresh page loads** (close/reopen incognito window between tests)
>
> Cached results will show artificially fast metrics and mask real-world first-visit performance issues.

> 🎨 **DESIGN PRESERVATION REQUIREMENT:**
> - **NO visual, layout, or design changes are allowed** during performance optimization
> - All improvements must maintain exact brand appearance and user experience
> - Font changes, color modifications, spacing adjustments, or any visual alterations are **PROHIBITED**
> - If a performance fix requires design changes, document it as a recommendation only - DO NOT implement
> - Brand consistency and visual integrity take precedence over performance metrics
> - Example: Changing `font-display: swap` to `optional` risks not loading custom fonts - unacceptable

---

## Table of Contents

1. [Overview & Objectives](#overview--objectives)
2. [Audit Targets & Profiles](#audit-targets--profiles)
3. [7-Phase Audit Workflow](#7-phase-audit-workflow)
4. [Pass/Fail Criteria (2025 Standards)](#passfail-criteria-2025-standards)
5. [Detailed Checkpoint Reference](#detailed-checkpoint-reference)
6. [Reporting Template](#reporting-template)
7. [Chrome DevTools MCP Tool Mapping](#chrome-devtools-mcp-tool-mapping)

---

## Overview & Objectives

### Audit Goals
This methodology provides a **systematic, repeatable process** for auditing web pages using Chrome DevTools Model Context Protocol (MCP). The audit evaluates:

- **Core Web Vitals** (LCP, INP, CLS) - Google's user experience metrics
- **Performance** - Loading speed, JavaScript execution, rendering efficiency
- **SEO** - Technical SEO, metadata, structured data, social sharing
- **Accessibility** - WCAG 2.2 Level AA compliance
- **Security** - HTTPS, headers, third-party safety
- **Semantics** - Proper HTML structure aligned with visual hierarchy
- **Best Practices** - Modern web standards and optimization

### Why This Matters
- **User Experience:** Fast, accessible sites retain users and reduce bounce rates
- **SEO Rankings:** Core Web Vitals are Google ranking factors (since 2021)
- **Conversion Rates:** 1-second delay can reduce conversions by 7%
- **Accessibility:** Legal compliance (WCAG 2.2, EAA 2025) and inclusive design
- **Competitive Advantage:** Performance differentiates premium experiences
- **First Impressions:** New visitors experience cold cache - the most critical performance scenario

### Success Metrics (75th Percentile)
Per Google's recommendations, measure at the **75th percentile** across mobile and desktop:
- **LCP:** ≤ 2.5 seconds (Good) | 2.5–4.0s (Needs Improvement) | > 4.0s (Poor)
- **INP:** ≤ 200ms (Good) | 200–500ms (Needs Improvement) | > 500ms (Poor)
- **CLS:** < 0.1 (Good) | 0.1–0.25 (Needs Improvement) | > 0.25 (Poor)

> **Note:** All metrics should be measured on **cold cache (first visit)** to represent real-world new user experience.

---

## Audit Targets & Profiles

### Test Profiles

#### Desktop Profile
```json
{
  "name": "desktop",
  "viewport": {"width": 1366, "height": 900},
  "cpuSlowdown": 4,
  "network": "Slow 4G",
  "userAgent": "desktop"
}
```

#### Mobile Profile
```json
{
  "name": "mobile",
  "viewport": {"width": 360, "height": 740},
  "cpuSlowdown": 4,
  "network": "Slow 4G",
  "userAgent": "mobile"
}
```

### Why CPU & Network Throttling?
- **Realistic Field Conditions:** Most users don't have high-end devices or fast connections
- **75th Percentile Testing:** Simulates median-to-slower user experiences
- **Core Web Vitals Alignment:** Google's CrUX data reflects real-world throttled conditions

### Network Profiles
- **Slow 4G:** 400ms RTT, 400 Kbps down, 400 Kbps up (conservative mobile)
- **Fast 4G:** 170ms RTT, 9 Mbps down, 1.8 Mbps up (optimistic mobile)
- **Slow 3G:** 2000ms RTT, 400 Kbps down, 400 Kbps up (worst-case scenario)

---

## 7-Phase Audit Workflow

### Phase 1: Navigation & Setup
**Objective:** Load the target page in a controlled environment

#### Steps:
1. **Navigate to URL**
   - Tool: `navigate_page`
   - Wait for: `networkidle` or `domcontentloaded`
   - Timeout: 30 seconds

2. **Set Viewport (Desktop)**
   - Tool: `resize_page`
   - Dimensions: 1366×900

3. **Apply Throttling**
   - Tool: `emulate_cpu` → 4× slowdown
   - Tool: `emulate_network` → Slow 4G

4. **Use Incognito Mode + Disable Cache (CRITICAL for Accurate Metrics)**
   - **Why:** Cache artificially improves LCP/TTFB and can hide CLS issues
   - **Requirement:** All audits MUST be performed in clean environment
   - **Method (Recommended):**
     1. Open Chrome in **Incognito/Private mode** manually (Ctrl+Shift+N / Cmd+Shift+N)
     2. Open DevTools (F12 or right-click → Inspect)
     3. Go to **Network tab** → Check "**Disable cache**" checkbox
     4. Keep DevTools open during entire audit session
     5. Close and reopen incognito window between different page audits

   - **Why This Works:**
     - Incognito mode starts with no cached resources
     - "Disable cache" prevents caching during session
     - Fresh incognito window = guaranteed clean slate

   - **Advanced Alternative:** Use CDP commands for programmatic control:
     - `Target.createBrowserContext()` creates isolated incognito-like context
     - `Network.setCacheDisabled({cacheDisabled: true})` disables cache

#### Chrome DevTools MCP Commands:
```javascript
// Standard navigation and setup
// Note: Chrome DevTools MCP connects to your open Chrome window
// Make sure you opened Chrome in incognito mode first!
navigate_page({url: "https://biombo-studio.netlify.app/contacte"})
resize_page({width: 1366, height: 900})
emulate_cpu({throttlingRate: 4})
emulate_network({throttlingOption: "Slow 4G"})
```

#### Testing Scenarios:
- **First Visit (Cold Cache):** Primary audit scenario - represents new users
- **Return Visit (Warm Cache):** Optional secondary test - represents returning users with cached assets

---

### Phase 2: State Capture (Desktop)
**Objective:** Freeze the page state for visual and structural analysis

#### Steps:
1. **Screenshot (Visual Reference)**
   - Tool: `take_screenshot`
   - Format: PNG
   - Save as: `desktop-screenshot.png`
   - Purpose: Visual hierarchy validation

2. **DOM Snapshot (Structural Reference)**
   - Tool: `take_snapshot`
   - Purpose: Semantic HTML analysis, accessibility checks

3. **Console Messages (Runtime Errors)**
   - Tool: `list_console_messages`
   - Filter: Errors and warnings
   - Purpose: Identify JavaScript errors, CORS issues, CSP violations

#### Chrome DevTools MCP Commands:
```javascript
take_screenshot({filePath: "./audit/desktop-screenshot.png"})
take_snapshot()
list_console_messages()
```

---

### Phase 3: Performance Tracing (Desktop)
**Objective:** Record real-time performance metrics during user interactions

#### Steps:
1. **Start Performance Trace**
   - Tool: `performance_start_trace`
   - Options: `{reload: true, autoStop: false}`

2. **Simulate User Flow**
   - Wait for first paint (LCP)
   - Scroll page (detect layout shifts)
   - Click interactive element (measure INP)
   - Wait for network idle

3. **Stop Performance Trace**
   - Tool: `performance_stop_trace`
   - Generates: Performance Insights

4. **Analyze Insights**
   - Tool: `performance_analyze_insight`
   - Focus: LCP breakdown, render-blocking resources, layout shifts

#### Chrome DevTools MCP Commands:
```javascript
performance_start_trace({reload: true, autoStop: false})
// Wait for interactions...
performance_stop_trace()
performance_analyze_insight({insightName: "LCPBreakdown"})
performance_analyze_insight({insightName: "DocumentLatency"})
performance_analyze_insight({insightName: "RenderBlocking"})
```

#### Key Insights to Extract:
- **LCP Phase Breakdown:** TTFB, Resource Load Time, Render Time
- **Long Tasks:** Tasks > 50ms (warns INP issues)
- **Layout Shift Culprits:** Elements causing CLS
- **Render-Blocking Resources:** CSS/JS delaying first paint

---

### Phase 4: Mobile Audit
**Objective:** Repeat capture and trace for mobile profile

#### Steps:
1. **Resize to Mobile Viewport**
   - Tool: `resize_page`
   - Dimensions: 360×740

2. **Repeat Phase 2 (State Capture)**
   - Screenshot: `mobile-screenshot.png`
   - DOM Snapshot
   - Console Messages

3. **Repeat Phase 3 (Performance Trace)**
   - Mobile interactions
   - Performance Insights

#### Chrome DevTools MCP Commands:
```javascript
resize_page({width: 360, height: 740})
take_screenshot({filePath: "./audit/mobile-screenshot.png"})
take_snapshot()
performance_start_trace({reload: true, autoStop: false})
// Mobile user flow...
performance_stop_trace()
```

---

### Phase 5: Network Analysis
**Objective:** Audit resource delivery, caching, compression

#### Steps:
1. **List All Network Requests**
   - Tool: `list_network_requests`
   - Filters: By resource type (document, script, stylesheet, image, font)

2. **Analyze Individual Requests**
   - Tool: `get_network_request`
   - Examine: Headers, status codes, cache directives, compression

#### Key Network Checks:
```javascript
list_network_requests()

// For each critical resource:
get_network_request({url: "<resource-url>"})
```

#### Data to Extract:
- **Protocol:** HTTP/1.1, HTTP/2, HTTP/3
- **Status Codes:** 200 (OK), 304 (Cached), 4xx/5xx (Errors)
- **Cache Headers:** `Cache-Control`, `Expires`, `ETag`
- **Compression:** `Content-Encoding: gzip | br`
- **MIME Types:** Verify correct content types
- **Transfer Size vs. Resource Size:** Compression ratio
- **Timing:** TTFB, download time

---

### Phase 6: DOM Evaluation (SEO, A11y, Semantics)
**Objective:** Programmatically validate HTML structure, metadata, accessibility

#### DOM Evaluation Script
```javascript
evaluate_script({
  function: `() => {
    const checks = {};

    // ========================================
    // 1. SEO CHECKS
    // ========================================
    checks.seo = {
      // Title
      title: document.title || null,
      titleLength: document.title?.length || 0,
      titleValid: document.title?.length >= 30 && document.title?.length <= 60,

      // Meta Description
      description: document.querySelector('meta[name="description"]')?.content || null,
      descriptionLength: document.querySelector('meta[name="description"]')?.content?.length || 0,
      descriptionValid: (() => {
        const len = document.querySelector('meta[name="description"]')?.content?.length || 0;
        return len >= 120 && len <= 160;
      })(),

      // Canonical
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,

      // Language
      lang: document.documentElement.lang || null,

      // Viewport
      viewport: document.querySelector('meta[name="viewport"]')?.content || null,

      // Robots
      robots: document.querySelector('meta[name="robots"]')?.content || null,
      noindex: document.querySelector('meta[name="robots"]')?.content?.includes('noindex') || false,

      // Open Graph
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
      ogDescription: document.querySelector('meta[property="og:description"]')?.content || null,
      ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
      ogUrl: document.querySelector('meta[property="og:url"]')?.content || null,
      ogType: document.querySelector('meta[property="og:type"]')?.content || null,

      // Twitter Card
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || null,
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content || null,
      twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content || null,
      twitterImage: document.querySelector('meta[name="twitter:image"]')?.content || null,

      // Favicon
      favicon: document.querySelector('link[rel="icon"]')?.href ||
               document.querySelector('link[rel="shortcut icon"]')?.href || null,

      // Structured Data (JSON-LD)
      structuredData: (() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(s => {
          try {
            return JSON.parse(s.textContent);
          } catch {
            return {error: 'Invalid JSON-LD'};
          }
        });
      })()
    };

    // ========================================
    // 2. ACCESSIBILITY CHECKS (WCAG 2.2 AA)
    // ========================================
    checks.accessibility = {
      // Landmarks
      main: document.querySelectorAll('main').length,
      header: document.querySelectorAll('header').length,
      nav: document.querySelectorAll('nav').length,
      footer: document.querySelectorAll('footer').length,

      // Headings Hierarchy
      headings: (() => {
        const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return {
          h1Count: document.querySelectorAll('h1').length,
          h1Text: document.querySelector('h1')?.textContent?.trim() || null,
          hierarchy: h.map(el => ({
            level: parseInt(el.tagName[1]),
            text: el.textContent.trim().substring(0, 50)
          })),
          skipsLevels: (() => {
            const levels = h.map(el => parseInt(el.tagName[1]));
            for (let i = 1; i < levels.length; i++) {
              if (levels[i] - levels[i-1] > 1) return true;
            }
            return false;
          })()
        };
      })(),

      // Form Labels
      forms: (() => {
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
        return inputs.map(input => ({
          id: input.id || null,
          type: input.type || input.tagName.toLowerCase(),
          hasLabel: (() => {
            if (input.id && document.querySelector(\`label[for="\${input.id}"]\`)) return true;
            if (input.closest('label')) return true;
            if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) return true;
            return false;
          })(),
          ariaLabel: input.getAttribute('aria-label') || null
        }));
      })(),

      // Images
      images: (() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          src: img.src.substring(0, 100),
          alt: img.alt || null,
          hasAlt: img.hasAttribute('alt'),
          altLength: img.alt?.length || 0,
          loading: img.loading || null,
          fetchpriority: img.getAttribute('fetchpriority') || null,
          width: img.width,
          height: img.height,
          hasDimensions: !!(img.width && img.height)
        }));
      })(),

      // Links
      links: (() => {
        const links = Array.from(document.querySelectorAll('a'));
        return {
          total: links.length,
          withoutText: links.filter(a => !a.textContent.trim() && !a.getAttribute('aria-label')).length,
          emptyHref: links.filter(a => !a.href || a.href === '#').length
        };
      })(),

      // Focus
      focusableElements: document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])').length,

      // ARIA
      ariaLandmarks: document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').length
    };

    // ========================================
    // 3. SEMANTIC HTML CHECKS
    // ========================================
    checks.semantics = {
      // Lists
      lists: {
        ul: document.querySelectorAll('ul').length,
        ol: document.querySelectorAll('ol').length,
        hasListsForCollections: document.querySelectorAll('ul, ol').length > 0
      },

      // Articles
      articles: document.querySelectorAll('article').length,

      // Sections
      sections: document.querySelectorAll('section').length,

      // Asides
      asides: document.querySelectorAll('aside').length,

      // Figures
      figures: {
        total: document.querySelectorAll('figure').length,
        withCaption: document.querySelectorAll('figure > figcaption').length
      },

      // Tables
      tables: (() => {
        const tables = Array.from(document.querySelectorAll('table'));
        return tables.map(table => ({
          hasTheadTbody: !!(table.querySelector('thead') && table.querySelector('tbody')),
          hasHeaders: !!table.querySelector('th'),
          hasCaption: !!table.querySelector('caption')
        }));
      })(),

      // Breadcrumbs
      breadcrumbs: (() => {
        const bc = document.querySelector('nav[aria-label*="readcrumb" i], nav[aria-label*="bread" i]');
        if (!bc) return null;
        return {
          exists: true,
          hasOl: !!bc.querySelector('ol'),
          hasCurrent: !!bc.querySelector('[aria-current="page"]')
        };
      })()
    };

    // ========================================
    // 4. PERFORMANCE CHECKS
    // ========================================
    checks.performance = {
      // Images
      totalImages: document.querySelectorAll('img').length,
      imagesWithoutDimensions: document.querySelectorAll('img:not([width]):not([height])').length,
      imagesWithLazyLoading: document.querySelectorAll('img[loading="lazy"]').length,
      imagesWithPreload: document.querySelectorAll('img[fetchpriority="high"]').length,

      // LCP Candidate
      lcpCandidate: (() => {
        // Find largest visible image or text block
        const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
          const rect = img.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.width > 100 && rect.height > 100;
        });
        if (imgs.length) {
          const largest = imgs.reduce((max, img) => {
            const area = img.width * img.height;
            const maxArea = max.width * max.height;
            return area > maxArea ? img : max;
          });
          return {
            tag: 'img',
            src: largest.src.substring(0, 100),
            dimensions: \`\${largest.width}x\${largest.height}\`,
            hasFetchPriority: !!largest.getAttribute('fetchpriority'),
            hasPreload: document.querySelector(\`link[rel="preload"][href*="\${largest.src.split('/').pop()}"]\`) !== null
          };
        }
        return null;
      })(),

      // Scripts
      scripts: {
        total: document.querySelectorAll('script').length,
        async: document.querySelectorAll('script[async]').length,
        defer: document.querySelectorAll('script[defer]').length,
        blocking: document.querySelectorAll('script:not([async]):not([defer]):not([type="module"])').length
      },

      // Stylesheets
      stylesheets: {
        total: document.querySelectorAll('link[rel="stylesheet"]').length,
        external: document.querySelectorAll('link[rel="stylesheet"][href^="http"]').length,
        inline: document.querySelectorAll('style').length
      },

      // Fonts
      fonts: {
        preload: document.querySelectorAll('link[rel="preload"][as="font"]').length,
        external: Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule =>
              rule instanceof CSSFontFaceRule
            );
          } catch { return false; }
        })
      },

      // Preconnect/DNS-Prefetch
      resourceHints: {
        preconnect: document.querySelectorAll('link[rel="preconnect"]').length,
        dnsPrefetch: document.querySelectorAll('link[rel="dns-prefetch"]').length,
        preload: document.querySelectorAll('link[rel="preload"]').length
      }
    };

    // ========================================
    // 5. SECURITY CHECKS
    // ========================================
    checks.security = {
      https: window.location.protocol === 'https:',
      mixedContent: (() => {
        if (window.location.protocol !== 'https:') return null;
        const resources = Array.from(document.querySelectorAll('img, script, link, iframe'));
        return resources.some(el => {
          const src = el.src || el.href;
          return src && src.startsWith('http://');
        });
      })(),
      iframes: Array.from(document.querySelectorAll('iframe')).map(iframe => ({
        src: iframe.src.substring(0, 100),
        sandbox: iframe.getAttribute('sandbox') || null,
        loading: iframe.loading || null
      }))
    };

    return checks;
  }`
})
```

---

### Phase 7: Cross-Check with Lighthouse (Optional)
**Objective:** Corroborate findings with Lighthouse automated audits

#### Lighthouse Categories:
1. **Performance:** Core Web Vitals, metrics, opportunities
2. **Accessibility:** Automated a11y tests
3. **Best Practices:** Modern standards compliance
4. **SEO:** Crawlability, metadata, mobile-friendliness
5. **PWA:** Progressive Web App features (optional)

#### How to Run:
```bash
# Via CLI
lighthouse https://biombo-studio.netlify.app/contacte \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=./audit/lighthouse-report.json \
  --throttling.cpuSlowdownMultiplier=4 \
  --throttling-method=devtools
```

---

## Pass/Fail Criteria (2025 Standards)

### 1. Core Web Vitals
| Metric | Good | Needs Improvement | Poor | Test Method |
|--------|------|-------------------|------|-------------|
| **LCP** | ≤ 2.5s | 2.5–4.0s | > 4.0s | Performance trace |
| **INP** | ≤ 200ms | 200–500ms | > 500ms | Interaction during trace |
| **CLS** | < 0.1 | 0.1–0.25 | > 0.25 | Visual + trace |

#### Additional LCP Requirements:
- ✅ **LCP element identified in initial HTML** (not lazy-loaded)
- ✅ **LCP image has explicit `width` and `height`**
- ✅ **LCP image uses `fetchpriority="high"` if above-the-fold**
- ✅ **LCP resource preloaded if external** (`<link rel="preload">`)

#### Additional CLS Requirements:
- ✅ **All images have `width` and `height` attributes**
- ✅ **Fonts use `font-display: swap` or `optional`**
- ✅ **No content shifts from async content injection**

---

### 2. Network & Delivery
| Check | Pass Criteria | Tool |
|-------|---------------|------|
| **HTTP Protocol** | HTTP/2 or HTTP/3 for all resources | Network list |
| **HTTPS** | All resources over HTTPS, no mixed content | Network + DOM |
| **Caching (Versioned Assets)** | `Cache-Control: max-age=31536000, immutable` (≥180 days) | Network headers |
| **Caching (HTML)** | `Cache-Control: no-cache` or `no-store` | Network headers |
| **Compression (Text)** | gzip or Brotli for HTML/CSS/JS/JSON | `Content-Encoding` header |
| **Image Formats** | WebP or AVIF for modern browsers | MIME types |
| **Preload Critical Resources** | `<link rel="preload">` for LCP image, critical CSS/fonts | DOM |
| **Preconnect Third-Party** | `<link rel="preconnect">` for external domains | DOM |

#### Image Optimization Pass Criteria:
- ✅ **AVIF/WebP format with JPEG/PNG fallback**
- ✅ **Responsive images using `srcset` and `sizes`**
- ✅ **Image dimensions match display size** (no oversized images)
- ✅ **Lazy loading for below-the-fold images** (`loading="lazy"`)
- ✅ **LCP image NOT lazy-loaded**

---

### 3. JavaScript & Runtime Cost
| Check | Threshold | Tool |
|-------|-----------|------|
| **Total JS Transfer** | < 300 KB (compressed) | Network |
| **Long Tasks (Warning)** | < 50ms during idle | Trace |
| **Long Tasks (Fail)** | < 200ms during interaction | Trace |
| **Main Thread Blocking** | < 2.5s Total Blocking Time (TBT) | Trace |
| **Third-Party JS** | Enumerated with byte count & impact | Network + Trace |

#### JavaScript Best Practices:
- ✅ **Code splitting:** Separate vendor bundles
- ✅ **Defer non-critical scripts:** `async` or `defer` attributes
- ✅ **Tree shaking:** Remove unused code
- ✅ **Hydration optimization:** Partial/progressive hydration

---

### 4. CSS & Rendering
| Check | Pass Criteria | Tool |
|-------|---------------|------|
| **Unused CSS** | < 30% unused in viewport | Coverage (manual) or Lighthouse |
| **Critical CSS** | Inlined for above-the-fold content | DOM |
| **Non-Critical CSS** | Deferred or async-loaded | DOM |
| **Animations** | Use `transform` / `opacity` only (compositor) | DOM inspection |
| **Reduced Motion** | `prefers-reduced-motion` media query respected | DOM |
| **Content Visibility** | `content-visibility: auto` for below-fold sections | DOM (optional) |

---

### 5. Accessibility (WCAG 2.2 AA)
| Category | Check | Pass Criteria | Tool |
|----------|-------|---------------|------|
| **Landmarks** | One `<main>` | Exactly 1 | DOM |
| | Header/Nav/Footer | Present and properly nested | DOM |
| | No duplicate landmarks | Max 1 banner, 1 contentinfo | DOM |
| **Headings** | Single `<h1>` | Exactly 1 per page topic | DOM + Screenshot |
| | Logical hierarchy | No level skipping (h1→h3) | DOM |
| | Visual ↔ structural match | Screenshot confirms heading levels | Screenshot + DOM |
| **Forms** | All inputs labeled | `<label for>` or `aria-label` | DOM |
| | Fieldsets for groups | `<fieldset><legend>` for radio/checkbox groups | DOM |
| **Images** | Alt text | All `<img>` have `alt` attribute | DOM |
| | Decorative images | `alt=""` for decorative | DOM |
| **Links** | Accessible names | No empty links or "click here" | DOM |
| | Visible focus | Focus indicator visible (manual test) | Screenshot |
| **Color Contrast** | AA compliance | 4.5:1 for normal text, 3:1 for large | Screenshot + computed styles |
| **Keyboard Navigation** | Tab order logical | No keyboard traps | Manual test |
| | Skip link | Working skip to main content | DOM + manual |

#### WCAG 2.2 New Success Criteria (2023):
- **2.4.11 Focus Not Obscured (Minimum) [AA]:** Focus indicator not fully hidden
- **2.4.12 Focus Not Obscured (Enhanced) [AAA]:** Focus indicator not partially hidden
- **2.4.13 Focus Appearance [AAA]:** Focus indicator meets size/contrast requirements
- **2.5.7 Dragging Movements [AA]:** Alternative to dragging for pointer interactions
- **2.5.8 Target Size (Minimum) [AA]:** Touch targets ≥24×24 CSS pixels
- **3.2.6 Consistent Help [A]:** Help mechanisms in consistent order
- **3.3.7 Redundant Entry [A]:** Auto-fill for previously entered information
- **3.3.8 Accessible Authentication (Minimum) [AA]:** No cognitive function test for auth
- **3.3.9 Accessible Authentication (Enhanced) [AAA]:** No cognitive function test at all

---

### 6. SEO & Social
| Check | Pass Criteria | Tool |
|-------|---------------|------|
| **HTTP Status** | 200 OK (not 3xx, 4xx, 5xx) | Network |
| **Canonical URL** | Present and self-referential | DOM |
| **Robots Meta** | No accidental `noindex` | DOM |
| **robots.txt** | Accessible at `/robots.txt` | Manual fetch |
| **Sitemap** | Referenced in `robots.txt` or discoverable | Manual fetch |
| **Title Tag** | 30–60 characters, unique, descriptive | DOM |
| **Meta Description** | 120–160 characters, compelling | DOM |
| **HTML Lang** | `<html lang="es">` or appropriate | DOM |
| **Viewport** | `<meta name="viewport">` present | DOM |
| **Favicon** | `<link rel="icon">` present | DOM |

#### Open Graph / Social:
| Tag | Required | Tool |
|-----|----------|------|
| `og:title` | ✅ | DOM |
| `og:description` | ✅ | DOM |
| `og:image` | ✅ (1200×630px recommended) | DOM |
| `og:url` | ✅ | DOM |
| `og:type` | ✅ | DOM |
| `twitter:card` | ✅ | DOM |
| `twitter:title` | ✅ | DOM |
| `twitter:description` | ✅ | DOM |
| `twitter:image` | ✅ | DOM |

#### Structured Data:
- ✅ **Valid JSON-LD** (Organization, Breadcrumb, Article, Product, etc.)
- ✅ **Content parity:** Structured data matches visible content
- ✅ **No errors in Google's Rich Results Test**

---

### 7. Security & Best Practices
| Check | Pass Criteria | Tool |
|-------|---------------|------|
| **HTTPS Everywhere** | All pages and resources HTTPS | Network |
| **HSTS Header** | `Strict-Transport-Security` present | Network headers |
| **X-Content-Type-Options** | `nosniff` | Network headers |
| **Referrer-Policy** | Set (e.g., `strict-origin-when-cross-origin`) | Network headers |
| **Content-Security-Policy** | CSP header present | Network headers |
| **No Console Errors** | 0 unhandled errors | Console messages |
| **No Mixed Content** | All resources HTTPS if page is HTTPS | Network + DOM |
| **Iframe Sandboxing** | Third-party iframes have `sandbox` attribute | DOM |
| **Lazy-Load Embeds** | `loading="lazy"` on iframes | DOM |

---

### 8. PWA (Optional)
| Check | Pass Criteria | Tool |
|-------|---------------|------|
| **Web App Manifest** | Valid manifest with icons, theme, background | DOM + Network |
| **Service Worker** | Registered and active | DOM (via JS) |
| **Navigation Fallback** | SW provides offline navigation fallback | Manual test |
| **Installability** | Meets install criteria (manifest + SW + HTTPS) | Lighthouse PWA |

---

### 9. Semantics (Screenshot ↔ DOM Consistency)
| Visual Element | Expected HTML | Check Method |
|----------------|---------------|--------------|
| **Primary page title** | Single `<h1>` | Screenshot identifies main title → DOM confirms `<h1>` |
| **Section titles** | `<h2>` | Visual hierarchy matches `h2` |
| **Subsection titles** | `<h3>`, `<h4>`, etc. | No level skipping |
| **Navigation menu** | `<nav>` with `aria-label` | Screenshot shows nav → DOM has `<nav>` |
| **Card grid** | `<ul>` or `<ol>` with `<li>` items | Screenshot shows collection → DOM uses list |
| **Article cards** | `<article>` for self-contained content | DOM inspection |
| **Image with caption** | `<figure><img><figcaption>` | DOM inspection |
| **Data table** | `<table><thead><tbody><th>` | DOM inspection |
| **Breadcrumbs** | `<nav aria-label="Breadcrumb"><ol>` with `aria-current="page"` | DOM inspection |
| **Form fields** | `<label for>` or `aria-label` | DOM inspection |

#### Screenshot-DOM Correlation Process:
1. **Take screenshot** of desktop and mobile
2. **Identify visual hierarchy:** What looks like the main title? What are section titles?
3. **Cross-reference with DOM snapshot:** Does `<h1>` match the visual main title?
4. **Flag mismatches:** If visual hierarchy doesn't match HTML structure, flag for semantic improvement

---

## Detailed Checkpoint Reference

### Core Web Vitals Deep Dive

#### LCP (Largest Contentful Paint)
**What it measures:** Time until the largest visible element renders

**LCP Element Candidates:**
- `<img>` elements
- `<image>` inside `<svg>`
- `<video>` poster images
- Background images via CSS `url()`
- Block-level elements with text

**Common LCP Issues:**
1. **Slow server response (TTFB):** Optimize backend, use CDN
2. **Render-blocking resources:** Defer non-critical CSS/JS
3. **Resource load time:** Optimize image size, use CDN, preload
4. **Client-side rendering:** Use SSR or SSG to deliver content in HTML

**LCP Optimization Checklist:**
- [ ] Identify LCP element via Performance trace
- [ ] Ensure LCP element in initial HTML (not lazy-loaded)
- [ ] Add `fetchpriority="high"` to LCP image
- [ ] Preload LCP image: `<link rel="preload" as="image" href="...">`
- [ ] Optimize image: WebP/AVIF, correct dimensions, compression
- [ ] Reduce TTFB: Server optimization, CDN
- [ ] Eliminate render-blocking: Inline critical CSS, defer JS
- [ ] Target: **LCP < 2.5s at 75th percentile**

#### INP (Interaction to Next Paint)
**What it measures:** Responsiveness to user interactions (clicks, taps, key presses)

**INP vs. FID:** INP (introduced 2024) measures all interactions throughout page lifecycle, not just first input

**Common INP Issues:**
1. **Long tasks on main thread:** Break up with `setTimeout` or web workers
2. **Heavy JavaScript execution:** Reduce bundle size, code-split
3. **Third-party scripts:** Defer or lazy-load analytics, ads
4. **Large DOM size:** Virtualize long lists, simplify structure

**INP Optimization Checklist:**
- [ ] Identify long tasks (>50ms) in Performance trace
- [ ] Break up long tasks into smaller chunks
- [ ] Use `requestIdleCallback` for non-urgent work
- [ ] Defer third-party scripts until after interaction
- [ ] Optimize event handlers (debounce, passive listeners)
- [ ] Target: **INP < 200ms at 75th percentile**

#### CLS (Cumulative Layout Shift)
**What it measures:** Visual stability (unexpected layout shifts)

**Common CLS Culprits:**
1. **Images without dimensions:** Always set `width` and `height`
2. **Ads/embeds/iframes:** Reserve space with min-height
3. **FOIT (Flash of Invisible Text):** Use `font-display: swap`
4. **Dynamic content injection:** Avoid inserting above existing content

**CLS Optimization Checklist:**
- [ ] Set explicit `width` and `height` on all `<img>`
- [ ] Use `aspect-ratio` CSS for responsive images
- [ ] Reserve space for ads/embeds with min-height
- [ ] Use `font-display: swap` or `optional`
- [ ] Preload fonts to reduce font swap
- [ ] Avoid animating layout properties (top, left, width, height)
- [ ] Use `transform` for animations instead
- [ ] Target: **CLS < 0.1**

---

### Image Optimization Best Practices (2025)

#### Modern Formats (AVIF > WebP > JPEG/PNG)
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" width="800" height="600">
</picture>
```

#### Responsive Images (srcset + sizes)
```html
<img
  src="image-800w.jpg"
  srcset="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w,
    image-1600w.jpg 1600w
  "
  sizes="
    (max-width: 768px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="Description"
  width="800"
  height="600"
  loading="lazy"
>
```

#### LCP Image Optimization
```html
<!-- LCP image: above-the-fold hero -->
<link rel="preload" as="image" href="hero.avif" type="image/avif">
<img
  src="hero.jpg"
  srcset="hero-800w.avif 800w, hero-1600w.avif 1600w"
  sizes="100vw"
  alt="Hero description"
  width="1600"
  height="900"
  fetchpriority="high"
>
```

#### Image Checklist:
- [ ] **Format:** AVIF with WebP fallback (50% smaller than JPEG)
- [ ] **Responsive:** `srcset` and `sizes` for different viewports
- [ ] **Dimensions:** Explicit `width` and `height` (prevents CLS)
- [ ] **Lazy loading:** `loading="lazy"` for below-fold images
- [ ] **LCP image:** `fetchpriority="high"` + preload
- [ ] **Alt text:** Descriptive alt for accessibility
- [ ] **Compression:** Quality 80-85 for photos, lossless for graphics

---

### Font Optimization

#### Font Loading Strategy
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

#### Font-Display Options:
- **`swap`:** Show fallback immediately, swap when custom font loads (can cause FOUT)
- **`optional`:** Use custom font if available in 100ms, else fallback (best for performance)
- **`fallback`:** Brief invisible period (100ms), then fallback, swap if loads in 3s
- **`block`:** Invisible text for up to 3s (bad for CLS)

#### Font Checklist:
- [ ] **Preconnect** to font CDN (`rel="preconnect"`)
- [ ] **Subset fonts:** Only load needed character sets
- [ ] **Font-display:** Use `swap` or `optional`
- [ ] **Self-host** for better cache control (optional)
- [ ] **Preload** critical fonts: `<link rel="preload" as="font" href="..." crossorigin>`

---

### JavaScript Optimization

#### Critical Rendering Path
1. **Inline critical JS:** Small scripts needed for first render
2. **Defer non-critical:** `<script defer>` for scripts that can wait
3. **Async for independent:** `<script async>` for analytics, ads
4. **Module scripts:** `<script type="module">` (deferred by default)

```html
<!-- Critical inline JS -->
<script>/* Critical path code */</script>

<!-- Defer main bundle -->
<script src="main.js" defer></script>

<!-- Async for independent scripts -->
<script src="analytics.js" async></script>
```

#### Code Splitting
- **Route-based:** Separate bundles per page
- **Component-based:** Lazy-load components
- **Vendor splitting:** Separate vendor libraries

#### JavaScript Checklist:
- [ ] **Bundle size:** < 300 KB compressed
- [ ] **Code splitting:** Route-based or component-based
- [ ] **Tree shaking:** Remove unused exports
- [ ] **Minification:** Uglify/Terser in production
- [ ] **Defer/async:** No render-blocking scripts
- [ ] **Third-party:** Defer analytics, ads, embeds

---

### CSS Optimization

#### Critical CSS
```html
<style>
  /* Inline critical CSS for above-the-fold */
  body { font-family: sans-serif; }
  .hero { background: blue; }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### CSS Checklist:
- [ ] **Inline critical CSS:** Above-the-fold styles in `<style>`
- [ ] **Defer non-critical:** Load async or defer
- [ ] **Remove unused:** PurgeCSS or similar
- [ ] **Minify:** Remove whitespace, comments
- [ ] **Combine media queries:** Reduce duplicate rules

---

### Network Optimization

#### HTTP/2 & HTTP/3
- **Multiplexing:** Multiple requests over single connection
- **Header compression:** Reduce overhead
- **Server push:** Proactively send resources (use sparingly)

#### Caching Strategy
```
# Versioned assets (hashed filenames)
Cache-Control: public, max-age=31536000, immutable

# HTML (always revalidate)
Cache-Control: no-cache

# API responses
Cache-Control: max-age=3600, must-revalidate
```

#### Compression
- **Brotli (br):** 15-20% better than gzip for text
- **Gzip:** Fallback for older browsers
- **Levels:** Brotli 4-6 for dynamic, 11 for static

#### Network Checklist:
- [ ] **HTTP/2 or HTTP/3** enabled
- [ ] **HTTPS** for all resources
- [ ] **Brotli compression** for text resources
- [ ] **Cache-Control** headers set appropriately
- [ ] **CDN** for static assets
- [ ] **Preconnect** to third-party domains
- [ ] **Preload** critical resources

---

## Reporting Template

### Executive Summary
**Page:** [URL]
**Audit Date:** [Date]
**Overall Score:** [X/100]

**Core Web Vitals:**
- LCP: [X]s ([Good/Needs Improvement/Poor])
- INP: [X]ms ([Good/Needs Improvement/Poor])
- CLS: [X] ([Good/Needs Improvement/Poor])

**Quick Wins:** [Top 3 high-impact, low-effort fixes]

---

### Detailed Findings

#### 1. Performance
**Score:** [X/100]

**Issues:**
| Priority | Issue | Impact | Recommendation |
|----------|-------|--------|----------------|
| High | [Issue] | [Impact] | [Recommendation] |

**Metrics:**
- LCP: [X]s
- FCP: [X]s
- TBT: [X]ms
- Speed Index: [X]s

---

#### 2. SEO
**Score:** [X/100]

**Issues:**
| Priority | Issue | Current | Recommended |
|----------|-------|---------|-------------|
| High | [Issue] | [Current state] | [Fix] |

---

#### 3. Accessibility
**Score:** [X/100]

**WCAG 2.2 AA Issues:**
| Priority | Criterion | Issue | Fix |
|----------|-----------|-------|-----|
| High | [WCAG #] | [Issue] | [Fix] |

---

#### 4. Best Practices
**Score:** [X/100]

**Issues:**
| Priority | Issue | Fix |
|----------|-------|-----|
| High | [Issue] | [Fix] |

---

### Prioritized Action Plan
1. **Critical (Do Now):** [Issues impacting CWV or breaking accessibility]
2. **High (This Sprint):** [Significant SEO/performance wins]
3. **Medium (Next Sprint):** [Optimization opportunities]
4. **Low (Backlog):** [Nice-to-have improvements]

---

### Appendix
- Desktop Screenshot: `desktop-screenshot.png`
- Mobile Screenshot: `mobile-screenshot.png`
- Performance Trace: `trace.json`
- Network Waterfall: `network.json`
- DOM Snapshot: `dom.json`
- Lighthouse Report: `lighthouse-report.json`

---

## Chrome DevTools MCP Tool Mapping

| Audit Task | Chrome DevTools MCP Tool | Notes |
|------------|---------------------------|-------|
| Navigate to URL | `navigate_page({url})` | Wait for networkidle or load event |
| Resize viewport | `resize_page({width, height})` | Desktop: 1366×900, Mobile: 360×740 |
| CPU throttling | `emulate_cpu({throttlingRate})` | 4× for realistic conditions |
| Network throttling | `emulate_network({throttlingOption})` | "Slow 4G" recommended |
| Take screenshot | `take_screenshot({filePath, format})` | PNG for lossless, JPEG for smaller |
| DOM snapshot | `take_snapshot()` | Returns structured DOM tree |
| Console messages | `list_console_messages()` | Errors, warnings, logs |
| Start performance trace | `performance_start_trace({reload, autoStop})` | reload: true for initial load |
| Stop performance trace | `performance_stop_trace()` | Returns trace data |
| Analyze performance insight | `performance_analyze_insight({insightName})` | LCPBreakdown, RenderBlocking, etc. |
| List network requests | `list_network_requests()` | All resources loaded |
| Get specific request | `get_network_request({url})` | Headers, timing, size |
| Evaluate script | `evaluate_script({function})` | Run JS in page context |
| Click element | `click({uid})` | Requires snapshot uid |
| Fill form | `fill_form({elements})` | Batch form filling |
| Wait for condition | `wait_for({text, timeout})` | Wait for text to appear |

---

## Best Practices for AI Auditors

### Screenshot ↔ DOM Correlation
1. **Take screenshot** (desktop + mobile)
2. **Analyze visual hierarchy:**
   - What looks like the main page title?
   - What looks like section headings?
   - What looks like navigation?
3. **Take DOM snapshot**
4. **Cross-reference:**
   - Is the visual main title an `<h1>`?
   - Are section titles `<h2>`, `<h3>`?
   - Is navigation in `<nav>`?
5. **Flag mismatches:**
   - Visual title but not `<h1>` → Semantic issue
   - Heading levels skip (h1→h3) → Accessibility issue

### Performance Trace Interpretation
1. **LCP Breakdown:**
   - TTFB (Time to First Byte): Server response time
   - Resource Load Time: Time to download LCP resource
   - Render Time: Time to paint LCP element
2. **Long Tasks:**
   - Tasks > 50ms: Warning (potential INP issues)
   - Tasks > 200ms: Critical (definite INP issues)
3. **Layout Shifts:**
   - Identify elements causing shifts
   - Check if images lack dimensions
   - Check if fonts cause FOUT/FOIT

### Network Waterfall Analysis
1. **Critical Path:**
   - What blocks first paint? (render-blocking CSS/JS)
   - What loads LCP element?
2. **Optimization Opportunities:**
   - Large resources that could be compressed
   - Resources that could be cached
   - Resources that could be preloaded
3. **Third-Party Impact:**
   - Bytes and time spent on third-party scripts
   - Consider lazy-loading or consent-gating

---

## Changelog

**Version 2.0 (January 2025)**
- Added WCAG 2.2 new success criteria (9 new items)
- Updated Core Web Vitals thresholds (INP replaced FID)
- Added Chrome DevTools Performance Insights integration
- Enhanced image optimization for AVIF format
- Added AI-specific guidance for screenshot-DOM correlation
- Expanded network optimization for HTTP/3

**Version 1.0 (2024)**
- Initial methodology

---

## References

- [Web Vitals (web.dev)](https://web.dev/articles/vitals)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance)
- [WCAG 2.2 (W3C)](https://www.w3.org/TR/WCAG22/)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

**End of Audit Methodology**
