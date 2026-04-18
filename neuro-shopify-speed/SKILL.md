---
name: neuro-shopify-speed
description: Shopify speed optimization expert - Core Web Vitals, Lighthouse scoring, LCP/CLS/INP optimization, JavaScript/CSS reduction, image optimization, font loading, third-party app audit, Liquid performance, critical rendering path, and store speed auditing
trigger: auto
globs:
  - "**/*.liquid"
  - "**/assets/*.js"
  - "**/assets/*.css"
  - "**/layout/theme.liquid"
  - "**/sections/*.liquid"
  - "**/snippets/*.liquid"
  - "**/config/settings_schema.json"
---

# Shopify Speed Optimization — Comprehensive Expert Skill

You are a Shopify speed optimization expert. You MUST apply every principle below when working on Shopify theme files. Speed is the single most important factor for conversion rates — every 100ms of delay costs ~7% in conversions. Treat every byte as a cost and every millisecond as lost revenue.

---

## 1. Speed Audit Process

### Tools You MUST Use

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Google PageSpeed Insights | Core Web Vitals (field + lab data) | First step — always |
| Chrome DevTools Performance tab | JavaScript profiling, long tasks | JS bottleneck hunting |
| Chrome DevTools Network tab | Waterfall analysis, file sizes | Asset audit |
| Chrome DevTools Coverage tab | Unused CSS/JS detection | Before optimization |
| WebPageTest.org | Filmstrip, waterfall, TTFB by region | Deep analysis |
| Shopify Theme Inspector | Liquid render time per section | Liquid optimization |
| Lighthouse (Chrome DevTools) | Full audit with diagnostics | Development testing |

### Step-by-Step Audit Process

1. **Baseline measurement** — Run PageSpeed Insights on homepage, top product page, and top collection page. Record scores and all Core Web Vitals.
2. **Network waterfall** — Open Chrome DevTools Network tab, disable cache, throttle to "Slow 3G", reload. Identify the critical path and largest requests.
3. **Coverage analysis** — Open Chrome DevTools Coverage tab, reload page. Identify CSS/JS files with >50% unused code.
4. **JavaScript profiling** — Open Performance tab, record a page load. Look for long tasks (>50ms), identify the scripts causing them.
5. **Liquid profiling** — Install Shopify Theme Inspector Chrome extension. Identify sections with high render times (>50ms).
6. **Third-party audit** — In Network tab, filter by "third-party". List every external domain, its total transfer size, and blocking behavior.
7. **Image audit** — Check every above-fold image for: correct sizing, format (WebP/AVIF), loading attribute, fetchpriority, srcset/sizes.
8. **Font audit** — Check number of font families, weights, formats. Verify font-display: swap is set.

### Priority Matrix for Fixes

| Priority | Category | Expected Impact |
|----------|----------|-----------------|
| CRITICAL | Oversized/unoptimized hero images | LCP -500ms to -2s |
| CRITICAL | Render-blocking JS/CSS | LCP -300ms to -1s |
| CRITICAL | Unused app scripts | INP improvement, LCP -200ms+ |
| HIGH | Missing image dimensions | CLS improvement |
| HIGH | Font loading optimization | LCP -100ms to -300ms, CLS fix |
| HIGH | Critical CSS inlining | LCP -200ms to -500ms |
| MEDIUM | Liquid render optimization | TTFB -50ms to -200ms |
| MEDIUM | Lazy loading below-fold content | Reduced page weight |
| MEDIUM | Resource hints (preconnect/preload) | LCP -50ms to -200ms |
| LOW | CSS/JS minification | Minor file size reduction |
| LOW | HTTP/2 push (automatic on Shopify) | Already handled by platform |

---

## 2. Core Web Vitals Deep Dive

### LCP (Largest Contentful Paint) — Target: < 2.5s

LCP measures the time from navigation start until the largest visible content element is painted. On Shopify, this is almost always the hero image or the largest product image.

**Common Causes on Shopify:**
- Oversized hero images (most common — often 2-5MB unoptimized)
- Render-blocking CSS/JS in `<head>`
- Slow web font loading blocking text paint
- Third-party app scripts blocking the main thread
- CSS background images (invisible to browser preload scanner)
- Image transitions/animations delaying paint

**Shopify-Specific Fixes:**

```liquid
{% comment %} WRONG — No responsive sizing, no priority, no eager loading {% endcomment %}
{{ section.settings.hero_image | image_url: width: 2000 | image_tag }}

{% comment %} RIGHT — Full optimization for LCP hero image {% endcomment %}
{{- section.settings.hero_image
  | image_url: width: 1920
  | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    widths: '375, 550, 750, 1000, 1250, 1500, 1750, 1920',
    sizes: '100vw',
    alt: section.settings.hero_image.alt
-}}
```

```liquid
{% comment %} Preload the hero image in theme.liquid <head> {% endcomment %}
{%- if template.name == 'index' -%}
  <link
    rel="preload"
    as="image"
    href="{{ settings.hero_image | image_url: width: 1500 }}"
    imagesrcset="
      {{ settings.hero_image | image_url: width: 375 }} 375w,
      {{ settings.hero_image | image_url: width: 750 }} 750w,
      {{ settings.hero_image | image_url: width: 1100 }} 1100w,
      {{ settings.hero_image | image_url: width: 1500 }} 1500w"
    imagesizes="100vw"
  >
{%- endif -%}
```

```liquid
{% comment %} NEVER use CSS background images for LCP elements {% endcomment %}
{% comment %} WRONG {% endcomment %}
<div style="background-image: url('{{ section.settings.hero_image | image_url: width: 1500 }}')"></div>

{% comment %} RIGHT — Use <img> so the browser preload scanner can discover it {% endcomment %}
<div class="hero-banner">
  {{- section.settings.hero_image
    | image_url: width: 1500
    | image_tag:
      loading: 'eager',
      fetchpriority: 'high',
      class: 'hero-banner__image',
      widths: '375, 750, 1100, 1500',
      sizes: '100vw'
  -}}
</div>
```

```liquid
{% comment %} Remove image transitions/animations on LCP element {% endcomment %}
{% comment %} WRONG — fade-in delays LCP {% endcomment %}
<img class="hero__image animate-fade-in" ... >

{% comment %} RIGHT — no animation on hero image {% endcomment %}
<img class="hero__image" ... >
```

### CLS (Cumulative Layout Shift) — Target: < 0.1

CLS measures unexpected visual movement of page content. Users hate it when buttons jump as they try to click.

**Common Causes on Shopify:**
- Images without explicit width/height attributes
- Web fonts causing text reflow (FOUT)
- Dynamic content injected by apps (banners, pop-ups, chat widgets)
- Ads or promotional bars pushing content down
- Late-loading product reviews shifting the page
- Variant selector changing product image container size

**Fixes:**

```liquid
{% comment %} ALWAYS set explicit dimensions — image_tag does this automatically {% endcomment %}
{{- product.featured_image
  | image_url: width: 600
  | image_tag:
    loading: 'lazy',
    widths: '200, 300, 400, 600',
    sizes: '(max-width: 749px) calc(100vw - 32px), 600px'
-}}
{% comment %} image_tag automatically outputs width and height attributes {% endcomment %}
```

```css
/* Reserve space for images with aspect-ratio */
.product-card__image-wrapper {
  aspect-ratio: 1 / 1; /* Square product images */
  overflow: hidden;
  background-color: var(--color-background-secondary); /* Placeholder color */
}

.product-card__image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Reserve space for dynamic content */
.announcement-bar {
  min-height: 40px; /* Prevent shift when content loads */
}

.product-reviews-container {
  min-height: 200px; /* Reserve space for reviews */
  contain: layout; /* CSS containment */
}
```

```liquid
{% comment %} Reserve space for app-injected content {% endcomment %}
<div
  id="shopify-product-reviews"
  style="min-height: 300px; contain: layout style;"
  data-product-id="{{ product.id }}"
>
  {% comment %} Reviews app injects content here {% endcomment %}
</div>
```

### INP (Interaction to Next Paint) — Target: < 200ms

INP measures responsiveness across ALL user interactions during the visit — every tap, click, and keypress. It replaced FID in March 2024 and is the hardest Core Web Vital for Shopify stores to pass (only 65% pass).

**Common Causes on Shopify:**
- Heavy JavaScript execution on the main thread
- App scripts running expensive event handlers
- Synchronous DOM manipulation on user interaction
- Unoptimized variant selector / add-to-cart logic
- Complex filtering/sorting without debouncing

**Fixes:**

```javascript
/* WRONG — Blocking variant change handler */
document.querySelector('.variant-selector').addEventListener('change', (e) => {
  // Heavy DOM updates, image swaps, price recalculations all synchronous
  updateProductImages(e.target.value);
  updatePrice(e.target.value);
  updateInventory(e.target.value);
  updateMetafields(e.target.value);
});

/* RIGHT — Non-blocking with requestAnimationFrame and chunked work */
document.querySelector('.variant-selector').addEventListener('change', (e) => {
  const variantId = e.target.value;

  /* Update the most visible element immediately */
  requestAnimationFrame(() => {
    updatePrice(variantId);
  });

  /* Defer less critical updates */
  requestIdleCallback(() => {
    updateProductImages(variantId);
    updateInventory(variantId);
    updateMetafields(variantId);
  });
});
```

```javascript
/* Debounce collection filtering to prevent INP spikes */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleFilterChange = debounce((filterValue) => {
  /* Fetch filtered products */
  fetch(`${window.location.pathname}?filter=${filterValue}`, {
    headers: { 'Accept': 'text/html' }
  })
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newGrid = doc.querySelector('.collection-grid');
      document.querySelector('.collection-grid').replaceWith(newGrid);
    });
}, 300);
```

```javascript
/* Break up long tasks with yield-to-main pattern */
function yieldToMain() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function processCartUpdate(items) {
  for (const item of items) {
    updateCartLine(item);
    await yieldToMain(); /* Give browser a chance to process user input */
  }
  updateCartTotal();
}
```

### TTFB (Time to First Byte) — Target: < 800ms

TTFB on Shopify is largely controlled by Shopify's infrastructure. You CANNOT change the server. But you CAN control:

**What You Control:**
- Liquid render complexity (simpler templates = faster TTFB)
- Number of Liquid loops and iterations
- Metafield and API calls in templates
- Redirect chains

**Fixes:**

```liquid
{% comment %} In theme.liquid <head> — preconnect to critical third-party origins {% endcomment %}
<link rel="preconnect" href="https://fonts.shopify.com" crossorigin>
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>

{% comment %} dns-prefetch for lower-priority domains {% endcomment %}
<link rel="dns-prefetch" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
```

---

## 3. Lighthouse Scoring

### Shopify Theme Store Requirement

Themes MUST achieve a minimum average Lighthouse performance score of **60** on mobile. The formula:

```
Score = (product_score × 31 + collection_score × 33 + home_score × 13) / 77
```

Collection pages carry the MOST weight (33/77 = 42.8%), followed by product pages (31/77 = 40.3%), then homepage (13/77 = 16.9%).

### How to Test Correctly

1. ALWAYS test on **mobile** — this is what Google uses for rankings and what Shopify evaluates.
2. Use **incognito mode** — extensions affect scores.
3. Test with **real content** — sections MUST contain actual images and text.
4. Run **5 tests minimum** and take the median — Lighthouse scores vary ±5 points per run.
5. Test on the **exact pages** that matter: homepage, top product, top collection.
6. NEVER test with browser DevTools open in the same window (it affects performance).

### Common Pitfalls

- **Testing desktop instead of mobile** — Desktop scores are always higher and misleading
- **Empty sections** — Lighthouse runs faster on empty pages, giving false high scores
- **Testing with ad blockers** — Hides the real impact of third-party scripts
- **Single test run** — Lighthouse variance means one test is unreliable
- **Ignoring field data** — Lab data (Lighthouse) differs from field data (CrUX). ALWAYS check the "real-world" section in PageSpeed Insights.
- **Comparing different pages** — Always compare the same URL over time

### Scoring Breakdown (Lighthouse 12+)

| Metric | Weight |
|--------|--------|
| Total Blocking Time (TBT) | 30% |
| Largest Contentful Paint (LCP) | 25% |
| Cumulative Layout Shift (CLS) | 25% |
| Speed Index | 10% |
| First Contentful Paint (FCP) | 10% |

TBT is the lab equivalent of INP. It has the HIGHEST weight. This means JavaScript optimization is the single most impactful thing for Lighthouse scores.

---

## 4. Image Optimization (CRITICAL — Biggest Impact)

Images account for 50-80% of page weight on most Shopify stores. This is your single biggest lever for speed improvement.

### The image_url and image_tag Filters

ALWAYS use Shopify's built-in filters. NEVER hardcode image URLs.

```liquid
{% comment %} === HERO IMAGE (above-fold, LCP candidate) === {% endcomment %}
{{- section.settings.image
  | image_url: width: 1920
  | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    widths: '375, 550, 750, 1000, 1250, 1500, 1750, 1920',
    sizes: '100vw',
    class: 'hero__image',
    alt: section.settings.image.alt
-}}

{% comment %} === PRODUCT CARD IMAGE (below-fold, in grid) === {% endcomment %}
{{- product.featured_image
  | image_url: width: 800
  | image_tag:
    loading: 'lazy',
    widths: '200, 300, 400, 600, 800',
    sizes: '(max-width: 749px) calc(50vw - 24px), (max-width: 999px) calc(33vw - 32px), 300px',
    class: 'product-card__image',
    alt: product.featured_image.alt
-}}

{% comment %} === PRODUCT PAGE MAIN IMAGE (above-fold) === {% endcomment %}
{{- product.selected_or_first_available_variant.featured_image
  | default: product.featured_image
  | image_url: width: 1200
  | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    widths: '400, 600, 800, 1000, 1200',
    sizes: '(max-width: 749px) 100vw, 50vw',
    class: 'product__main-image',
    alt: product.title
-}}

{% comment %} === PRODUCT THUMBNAIL IMAGES (below-fold) === {% endcomment %}
{%- for image in product.images -%}
  {{- image
    | image_url: width: 200
    | image_tag:
      loading: 'lazy',
      widths: '100, 150, 200',
      sizes: '80px',
      class: 'product__thumbnail',
      alt: image.alt
  -}}
{%- endfor -%}

{% comment %} === LOGO (small, above-fold) === {% endcomment %}
{{- section.settings.logo
  | image_url: width: 400
  | image_tag:
    loading: 'eager',
    widths: '200, 300, 400',
    sizes: '200px',
    class: 'header__logo',
    alt: shop.name
-}}

{% comment %} === COLLECTION BANNER IMAGE === {% endcomment %}
{%- if collection.image -%}
  {{- collection.image
    | image_url: width: 1500
    | image_tag:
      loading: 'eager',
      fetchpriority: 'high',
      widths: '375, 750, 1100, 1500',
      sizes: '100vw',
      class: 'collection-banner__image',
      alt: collection.title
  -}}
{%- endif -%}
```

### Correct sizes Attribute Patterns

```liquid
{% comment %} Full-width image (hero, collection banner) {% endcomment %}
sizes: '100vw'

{% comment %} Half-width on desktop, full on mobile (product page main image) {% endcomment %}
sizes: '(max-width: 749px) 100vw, 50vw'

{% comment %} 2-column grid on mobile, 4-column on desktop {% endcomment %}
sizes: '(max-width: 749px) calc(50vw - 24px), (max-width: 999px) calc(25vw - 32px), 300px'

{% comment %} 3-column grid {% endcomment %}
sizes: '(max-width: 749px) calc(50vw - 24px), (max-width: 999px) calc(33.3vw - 32px), 300px'

{% comment %} Fixed-width element (logo, icon) {% endcomment %}
sizes: '200px'
```

### Above-Fold vs Below-Fold Rules

| Position | loading | fetchpriority | Preload? |
|----------|---------|---------------|----------|
| Hero / LCP image | `eager` | `high` | YES — in `<head>` |
| Product main image | `eager` | `high` | Consider it |
| Logo | `eager` | omit | No |
| Product cards in grid | `lazy` | omit | No |
| Thumbnails | `lazy` | omit | No |
| Footer images | `lazy` | omit | No |

### WebP/AVIF Automatic Conversion

Shopify's CDN automatically converts images to WebP or AVIF for browsers that support them. You do NOT need to do anything — just use `image_url` and `image_tag` filters and the CDN handles format negotiation via the `Accept` header.

NEVER manually append `.webp` to image URLs. Let the CDN handle it.

### LQIP (Low Quality Image Placeholder) Technique

```liquid
{% comment %} Low-quality placeholder for progressive loading {% endcomment %}
{%- capture placeholder_style -%}
  background-image: url('{{ image | image_url: width: 50 }}');
  background-size: cover;
  background-position: center;
  filter: blur(10px);
{%- endcapture -%}

<div class="image-wrapper" style="{{ placeholder_style }}">
  {{- image
    | image_url: width: 800
    | image_tag:
      loading: 'lazy',
      widths: '200, 400, 600, 800',
      sizes: '(max-width: 749px) 100vw, 400px',
      class: 'image-wrapper__img',
      alt: image.alt
  -}}
</div>
```

```css
.image-wrapper {
  position: relative;
  overflow: hidden;
}

.image-wrapper__img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
}
```

### Image Performance Budgets

| Image Type | Max Width | Max File Size |
|------------|-----------|---------------|
| Hero/Banner | 1920px | 200KB |
| Product main | 1200px | 150KB |
| Product card | 800px | 80KB |
| Thumbnail | 200px | 15KB |
| Logo | 400px | 30KB |
| Icon/Badge | 100px | 5KB |

---

## 5. JavaScript Optimization

The average Shopify store loads **1.2MB of JavaScript** but only uses 35-45% on any given page. JavaScript is the primary cause of poor TBT (Total Blocking Time) scores, which carries **30% weight** in Lighthouse scoring.

### Performance Budget: < 16KB minified for theme JS per page

### Audit All JS Files

```liquid
{% comment %} In theme.liquid, temporarily add this to see all loaded scripts {% endcomment %}
<script>
  window.addEventListener('load', () => {
    const scripts = performance.getEntriesByType('resource')
      .filter(r => r.initiatorType === 'script')
      .map(r => ({ name: r.name.split('/').pop(), size: Math.round(r.transferSize / 1024) + 'KB', duration: Math.round(r.duration) + 'ms' }));
    console.table(scripts);
    console.log('Total JS:', scripts.reduce((a, s) => a + parseInt(s.size), 0) + 'KB');
  });
</script>
```

### ALWAYS defer or async Scripts

```liquid
{% comment %} WRONG — Render-blocking {% endcomment %}
<script src="{{ 'app.js' | asset_url }}"></script>

{% comment %} RIGHT — Deferred (maintains execution order) {% endcomment %}
<script src="{{ 'app.js' | asset_url }}" defer></script>

{% comment %} RIGHT — Async (for independent scripts like analytics) {% endcomment %}
<script src="{{ 'analytics.js' | asset_url }}" async></script>
```

### Remove jQuery — Use Vanilla JS

```javascript
/* WRONG — jQuery for simple DOM manipulation */
$('.product-card').on('click', '.quick-add', function() {
  var productId = $(this).data('product-id');
  $.ajax({
    url: '/cart/add.js',
    type: 'POST',
    data: { id: productId, quantity: 1 },
    dataType: 'json',
    success: function(data) {
      $('.cart-count').text(data.item_count);
    }
  });
});

/* RIGHT — Vanilla JS, smaller footprint */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.quick-add');
  if (!btn) return;

  const productId = btn.dataset.productId;

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, quantity: 1 })
  })
    .then((res) => res.json())
    .then((data) => {
      document.querySelector('.cart-count').textContent = data.item_count;
    });
});
```

### Intersection Observer for Lazy Component Initialization

```javascript
/* Only initialize components when they scroll into view */
const lazyComponents = document.querySelectorAll('[data-lazy-component]');

const componentObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const component = entry.target;
      const type = component.dataset.lazyComponent;

      switch (type) {
        case 'slideshow':
          initSlideshow(component);
          break;
        case 'video':
          initVideoPlayer(component);
          break;
        case 'map':
          initMap(component);
          break;
      }

      componentObserver.unobserve(component);
    }
  });
}, { rootMargin: '200px' }); /* Start loading 200px before visible */

lazyComponents.forEach((el) => componentObserver.observe(el));
```

```liquid
{% comment %} Liquid markup for lazy components {% endcomment %}
<div data-lazy-component="slideshow" class="slideshow">
  {% comment %} Slideshow HTML here — JS initializes only when visible {% endcomment %}
</div>
```

### Dynamic Import Pattern

```javascript
/* Load heavy libraries only when needed */
async function initProductZoom(container) {
  const { default: Drift } = await import('./drift-zoom.min.js');
  new Drift(container.querySelector('.product__main-image'), {
    paneContainer: container.querySelector('.product__zoom-pane'),
    inlinePane: false
  });
}

/* Trigger on user interaction */
document.querySelector('.product__media').addEventListener('mouseenter', function handler() {
  initProductZoom(this.closest('.product'));
  this.removeEventListener('mouseenter', handler); /* Run once */
}, { once: true });
```

### Section-Scoped JavaScript Pattern

```liquid
{% comment %} Each section loads only the JS it needs {% endcomment %}
{% comment %} In sections/slideshow.liquid {% endcomment %}
<div class="slideshow" id="Slideshow-{{ section.id }}">
  {% comment %} slideshow markup {% endcomment %}
</div>

<script src="{{ 'section-slideshow.js' | asset_url }}" defer></script>

{% comment %} NEVER load slideshow JS globally in theme.liquid {% endcomment %}
```

### Web Workers for Heavy Computation

```javascript
/* Offload product filtering/sorting to a Web Worker */
/* main-thread.js */
const filterWorker = new Worker(new URL('./filter-worker.js', import.meta.url));

filterWorker.addEventListener('message', (e) => {
  renderFilteredProducts(e.data.products);
});

function filterProducts(filters) {
  filterWorker.postMessage({ products: window.__products, filters });
}

/* filter-worker.js */
self.addEventListener('message', (e) => {
  const { products, filters } = e.data;
  const filtered = products.filter((product) => {
    return filters.every((filter) => {
      return product[filter.key] === filter.value;
    });
  });
  self.postMessage({ products: filtered });
});
```

---

## 6. CSS Optimization

### Critical CSS Inline for Above-Fold

```liquid
{% comment %} In theme.liquid <head> — inline critical CSS {% endcomment %}
<style>
  /* ONLY above-fold styles — header, hero, announcement bar */
  :root {
    --color-background: #ffffff;
    --color-text: #1a1a1a;
    --color-primary: #4a90d9;
    --header-height: 64px;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
  }

  body {
    font-family: var(--font-body-family);
    color: var(--color-text);
    background-color: var(--color-background);
  }

  .header {
    position: sticky;
    top: 0;
    height: var(--header-height);
    display: flex;
    align-items: center;
    z-index: 100;
  }

  .hero {
    position: relative;
    width: 100%;
    min-height: 50vh;
  }

  .hero__image {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
```

### Defer Non-Critical CSS with Preload

```liquid
{% comment %} Defer the main stylesheet {% endcomment %}
<link
  rel="preload"
  href="{{ 'base.css' | asset_url }}"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
>
<noscript>
  <link rel="stylesheet" href="{{ 'base.css' | asset_url }}">
</noscript>
```

### Section-Scoped Inline CSS with {%- style -%} Tag

```liquid
{% comment %} In sections/featured-collection.liquid {% endcomment %}
{%- style -%}
  #shopify-section-{{ section.id }} .featured-collection {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }

  #shopify-section-{{ section.id }} .featured-collection__title {
    font-size: {{ section.settings.heading_size }}px;
    color: {{ section.settings.heading_color }};
  }

  @media (max-width: 749px) {
    #shopify-section-{{ section.id }} .featured-collection {
      padding-top: {{ section.settings.padding_top | divided_by: 2 }}px;
      padding-bottom: {{ section.settings.padding_bottom | divided_by: 2 }}px;
    }
  }
{%- endstyle -%}
```

### CSS Custom Properties — ONE File, Not Per-Section

```liquid
{% comment %} In theme.liquid <head> — define ALL CSS variables once {% endcomment %}
{%- style -%}
  :root {
    --color-background: {{ settings.colors_background }};
    --color-text: {{ settings.colors_text }};
    --color-primary: {{ settings.colors_primary }};
    --color-secondary: {{ settings.colors_secondary }};
    --color-accent: {{ settings.colors_accent }};
    --color-border: {{ settings.colors_border }};

    --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    --font-body-weight: {{ settings.type_body_font.weight }};
    --font-heading-family: {{ settings.type_heading_font.family }}, {{ settings.type_heading_font.fallback_families }};
    --font-heading-weight: {{ settings.type_heading_font.weight }};

    --page-width: {{ settings.page_width }}px;
    --spacing-unit: 8px;
  }
{%- endstyle -%}
```

### CSS Containment for Layout Performance

```css
/* Contain sections to prevent layout recalculations from propagating */
.shopify-section {
  contain: layout style;
}

/* Strict containment for off-screen content */
.shopify-section[data-lazy] {
  contain: strict;
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* Estimated height */
}

/* Product grid cards — prevent reflow from affecting siblings */
.product-card {
  contain: layout style;
}
```

### Remove Unused CSS

```liquid
{% comment %} NEVER load section CSS globally — conditionally load per template {% endcomment %}

{% comment %} WRONG {% endcomment %}
{{ 'section-product.css' | asset_url | stylesheet_tag }}
{{ 'section-collection.css' | asset_url | stylesheet_tag }}
{{ 'section-blog.css' | asset_url | stylesheet_tag }}

{% comment %} RIGHT — load only what the current page needs {% endcomment %}
{%- if template.name == 'product' -%}
  {{ 'section-product.css' | asset_url | stylesheet_tag }}
{%- endif -%}

{%- if template.name == 'collection' -%}
  {{ 'section-collection.css' | asset_url | stylesheet_tag }}
{%- endif -%}
```

---

## 7. Font Optimization

Fonts are the second most common cause of poor LCP and the primary cause of CLS from text reflow.

### System Font Stack (Fastest — ZERO Network Request)

```css
/* If the store doesn't require a specific brand font, use system fonts */
:root {
  --font-body-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  --font-heading-family: var(--font-body-family);
}
```

### font-display: swap (Prevent FOIT)

```liquid
{% comment %} ALWAYS set font-display: swap on @font-face declarations {% endcomment %}
{%- style -%}
  @font-face {
    font-family: 'CustomFont';
    src: url('{{ "custom-font.woff2" | asset_url }}') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'CustomFont';
    src: url('{{ "custom-font-bold.woff2" | asset_url }}') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
{%- endstyle -%}
```

### Preload Critical Fonts

```liquid
{% comment %} In theme.liquid <head> — preload ONLY the primary body font {% endcomment %}
<link
  rel="preload"
  href="{{ settings.type_body_font | font_url }}"
  as="font"
  type="font/woff2"
  crossorigin
>

{% comment %} NEVER preload more than 2 fonts — each preload competes with other critical resources {% endcomment %}
```

### Font Loading with Shopify's Font Picker

```liquid
{% comment %} In theme.liquid <head> {% endcomment %}
{%- comment -%} Load fonts selected in theme customizer {%- endcomment -%}
{{ settings.type_body_font | font_face: font_display: 'swap' }}
{{ settings.type_heading_font | font_face: font_display: 'swap' }}

{%- comment -%} Preload the body font (most critical for LCP text) {%- endcomment -%}
{%- if settings.type_body_font != blank -%}
  <link
    rel="preload"
    href="{{ settings.type_body_font | font_url }}"
    as="font"
    type="font/woff2"
    crossorigin
  >
{%- endif -%}
```

### Font Performance Rules

| Rule | Rationale |
|------|-----------|
| Max 2 font families | Each family requires separate downloads |
| Max 3-4 weights total | 400, 500/600, 700 covers most needs |
| WOFF2 format ONLY | 30% smaller than WOFF, universal browser support |
| ALWAYS font-display: swap | Prevents invisible text (FOIT) |
| Preload max 1-2 fonts | More preloads = more contention |
| Use variable fonts when possible | One file for all weights |
| Subset to latin if English-only | Dramatically smaller file size |

### Variable Font (One File, Multiple Weights)

```css
@font-face {
  font-family: 'BrandFont';
  src: url('brand-font-variable.woff2') format('woff2-variations');
  font-weight: 300 800; /* Supports all weights from 300 to 800 */
  font-style: normal;
  font-display: swap;
}

/* Use any weight without loading additional files */
h1 { font-weight: 700; }
h2 { font-weight: 600; }
body { font-weight: 400; }
.light-text { font-weight: 300; }
```

### Metric-Adjusted Fallback (Minimize CLS from Font Swap)

```css
/* Adjust fallback font metrics to match custom font */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 0%;
  size-adjust: 105%;
}

:root {
  --font-body-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;
}
```

---

## 8. Liquid Performance

Liquid renders on Shopify's servers. Inefficient Liquid = slower TTFB. Every millisecond of Liquid render time adds to every page load for every visitor.

### assign Outside Loops

```liquid
{% comment %} WRONG — recalculates on every iteration {% endcomment %}
{%- for product in collection.products -%}
  {%- assign sale_badge = 'products.badges.sale' | t -%}
  {%- if product.compare_at_price > product.price -%}
    <span>{{ sale_badge }}</span>
  {%- endif -%}
{%- endfor -%}

{% comment %} RIGHT — compute once, use many times {% endcomment %}
{%- assign sale_badge = 'products.badges.sale' | t -%}
{%- for product in collection.products -%}
  {%- if product.compare_at_price > product.price -%}
    <span>{{ sale_badge }}</span>
  {%- endif -%}
{%- endfor -%}
```

### render, Not include

```liquid
{% comment %} WRONG — deprecated, leaks scope, prevents optimization {% endcomment %}
{% include 'product-card' %}

{% comment %} RIGHT — isolated scope, better performance {% endcomment %}
{% render 'product-card', product: product, show_vendor: section.settings.show_vendor %}
```

### Pass Minimal Data to Snippets

```liquid
{% comment %} WRONG — passes entire product object when only a few fields are needed {% endcomment %}
{% render 'price-display', product: product %}

{% comment %} RIGHT — pass only what the snippet needs {% endcomment %}
{% render 'price-display',
  price: product.price,
  compare_at_price: product.compare_at_price,
  currency: cart.currency.iso_code
%}
```

### where / map Filters Instead of Loop + If

```liquid
{% comment %} WRONG — loop through all products to find available ones {% endcomment %}
{%- for product in collection.products -%}
  {%- if product.available -%}
    {% render 'product-card', product: product %}
  {%- endif -%}
{%- endfor -%}

{% comment %} RIGHT — filter first, then iterate {% endcomment %}
{%- assign available_products = collection.products | where: 'available', true -%}
{%- for product in available_products -%}
  {% render 'product-card', product: product %}
{%- endfor -%}
```

```liquid
{% comment %} Extract specific data with map {% endcomment %}
{%- assign product_titles = collection.products | map: 'title' -%}
{%- assign product_images = collection.products | map: 'featured_image' -%}
```

### break / continue for Early Exit

```liquid
{% comment %} Find the first featured product and stop {% endcomment %}
{%- for product in collection.products -%}
  {%- if product.metafields.custom.featured -%}
    {% render 'featured-product', product: product %}
    {%- break -%}
  {%- endif -%}
{%- endfor -%}

{% comment %} Skip out-of-stock products {% endcomment %}
{%- for product in collection.products -%}
  {%- unless product.available -%}
    {%- continue -%}
  {%- endunless -%}
  {% render 'product-card', product: product %}
{%- endfor -%}
```

### Paginate Collections — NEVER Render All

```liquid
{% comment %} WRONG — renders ALL products (could be hundreds) {% endcomment %}
{%- for product in collection.products -%}
  {% render 'product-card', product: product %}
{%- endfor -%}

{% comment %} RIGHT — paginate to limit server-side rendering {% endcomment %}
{%- paginate collection.products by 24 -%}
  {%- for product in collection.products -%}
    {% render 'product-card', product: product %}
  {%- endfor -%}
  {{ paginate | default_pagination }}
{%- endpaginate -%}
```

### Avoid Nested Loops

```liquid
{% comment %} WRONG — O(n²) complexity {% endcomment %}
{%- for product in collection.products -%}
  {%- for tag in product.tags -%}
    {%- if tag == 'featured' -%}
      {% render 'product-card', product: product %}
    {%- endif -%}
  {%- endfor -%}
{%- endfor -%}

{% comment %} RIGHT — use contains or where filter {% endcomment %}
{%- for product in collection.products -%}
  {%- if product.tags contains 'featured' -%}
    {% render 'product-card', product: product %}
  {%- endif -%}
{%- endfor -%}
```

### Whitespace Control {%- -%}

ALWAYS use whitespace-trimming tags `{%-` and `-%}` to prevent outputting unnecessary whitespace. This reduces HTML payload size and makes the output cleaner.

```liquid
{% comment %} WRONG — outputs extra whitespace {% endcomment %}
{% if product.available %}
  <span>In Stock</span>
{% endif %}

{% comment %} RIGHT — trims whitespace {% endcomment %}
{%- if product.available -%}
  <span>In Stock</span>
{%- endif -%}
```

### Limit Metafield Access in Loops

```liquid
{% comment %} WRONG — metafield access in every iteration is expensive {% endcomment %}
{%- for product in collection.products -%}
  <span>{{ product.metafields.custom.subtitle.value }}</span>
  <span>{{ product.metafields.custom.badge.value }}</span>
  <span>{{ product.metafields.custom.material.value }}</span>
{%- endfor -%}

{% comment %} RIGHT — minimize metafield access, use only what's essential {% endcomment %}
{%- for product in collection.products -%}
  {%- assign subtitle = product.metafields.custom.subtitle.value -%}
  {%- if subtitle != blank -%}
    <span>{{ subtitle }}</span>
  {%- endif -%}
{%- endfor -%}
```

---

## 9. Third-Party App Audit

App scripts cause **60-80% of Shopify slowdowns**. A single poorly coded app can add 500ms-1000ms to load time.

### How to Identify Slow Apps

1. Open Chrome DevTools → **Performance** tab
2. Click "Record", reload the page, stop recording
3. Look at the **Bottom-Up** tab — sort by "Total Time"
4. Identify scripts from app domains (not cdn.shopify.com)
5. Cross-reference with your installed apps list

### Common App Performance Killers

| App Category | Typical Impact | Alternative |
|-------------|----------------|-------------|
| Live chat widgets | +300-800ms, blocks main thread | Load on scroll/click, use Shopify Inbox |
| Review apps | +200-500ms, CLS from injection | Lazy load, use native metafields |
| Pop-up/modal apps | +100-400ms, CLS | Build custom with Liquid + minimal JS |
| Analytics/tracking | +100-300ms per tracker | Consolidate via GTM, defer all |
| Social proof/FOMO | +200-500ms, CLS | Remove or custom build |
| Currency converters | +100-300ms | Use Shopify Markets (native) |
| Countdown timers | +50-200ms | Build with vanilla JS (10 lines) |
| Wishlist apps | +100-400ms | Lightweight alternative or custom |

### Pattern: Load Apps After User Interaction

```liquid
{% comment %} Load chat widget only when user scrolls or clicks {% endcomment %}
<script>
  (function() {
    let loaded = false;

    function loadChatWidget() {
      if (loaded) return;
      loaded = true;

      const script = document.createElement('script');
      script.src = 'https://chat-provider.com/widget.js';
      script.defer = true;
      document.body.appendChild(script);
    }

    /* Load on first scroll */
    window.addEventListener('scroll', loadChatWidget, { once: true, passive: true });

    /* Load on first click anywhere */
    document.addEventListener('click', loadChatWidget, { once: true });

    /* Fallback: load after 5 seconds idle */
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadChatWidget, { timeout: 5000 });
    } else {
      setTimeout(loadChatWidget, 5000);
    }
  })();
</script>
```

### Pattern: Defer App Scripts with Intersection Observer

```liquid
{% comment %} Load review app only when reviews section is near viewport {% endcomment %}
<div id="product-reviews" data-product-id="{{ product.id }}">
  <div class="reviews-placeholder" style="min-height: 200px;">
    <p>Loading reviews...</p>
  </div>
</div>

<script>
  (function() {
    const reviewsContainer = document.getElementById('product-reviews');
    if (!reviewsContainer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const script = document.createElement('script');
          script.src = 'https://reviews-app.com/widget.js';
          script.dataset.productId = reviewsContainer.dataset.productId;
          script.defer = true;
          document.body.appendChild(script);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '400px' });

    observer.observe(reviewsContainer);
  })();
</script>
```

### Script Audit: List All External Scripts

```javascript
/* Run in Chrome DevTools Console to audit all scripts */
(function() {
  const resources = performance.getEntriesByType('resource');
  const scripts = resources
    .filter(r => r.initiatorType === 'script' || r.name.endsWith('.js'))
    .map(r => {
      const url = new URL(r.name);
      return {
        domain: url.hostname,
        file: url.pathname.split('/').pop(),
        size: Math.round(r.transferSize / 1024) + 'KB',
        duration: Math.round(r.duration) + 'ms',
        blocking: r.renderBlockingStatus || 'unknown'
      };
    })
    .sort((a, b) => parseInt(b.duration) - parseInt(a.duration));

  console.table(scripts);

  /* Group by domain */
  const byDomain = {};
  scripts.forEach(s => {
    if (!byDomain[s.domain]) byDomain[s.domain] = { count: 0, totalSize: 0 };
    byDomain[s.domain].count++;
    byDomain[s.domain].totalSize += parseInt(s.size);
  });
  console.log('\nScripts by domain:');
  console.table(byDomain);
})();
```

### Measure Individual App Impact

1. Disable the app in Shopify Admin
2. Run PageSpeed Insights 3 times, record median score
3. Re-enable the app
4. Run PageSpeed Insights 3 times, record median score
5. The difference is that app's impact
6. If score drops >5 points, the app needs optimization or replacement

---

## 10. Preloading & Resource Hints

### Preconnect for Third-Party Domains

```liquid
{% comment %} In theme.liquid <head> — BEFORE any external resource requests {% endcomment %}

{% comment %} Shopify CDN (usually automatic, but be explicit) {% endcomment %}
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>

{% comment %} Google Fonts (if used) {% endcomment %}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

{% comment %} Payment provider (if checkout redirect) {% endcomment %}
<link rel="preconnect" href="https://checkout.shopify.com" crossorigin>
```

### DNS-Prefetch for Lower-Priority Domains

```liquid
{% comment %} Analytics and tracking — important but not critical path {% endcomment %}
<link rel="dns-prefetch" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.facebook.com">
<link rel="dns-prefetch" href="https://connect.facebook.net">
```

### Preload Critical Resources

```liquid
{% comment %} Preload critical CSS {% endcomment %}
<link rel="preload" href="{{ 'critical.css' | asset_url }}" as="style">

{% comment %} Preload the LCP image (hero) {% endcomment %}
{%- if template.name == 'index' -%}
  {%- assign hero_image = sections['hero-banner'].settings.image -%}
  {%- if hero_image -%}
    <link
      rel="preload"
      as="image"
      href="{{ hero_image | image_url: width: 1500 }}"
      imagesrcset="
        {{ hero_image | image_url: width: 375 }} 375w,
        {{ hero_image | image_url: width: 750 }} 750w,
        {{ hero_image | image_url: width: 1100 }} 1100w,
        {{ hero_image | image_url: width: 1500 }} 1500w"
      imagesizes="100vw"
      fetchpriority="high"
    >
  {%- endif -%}
{%- endif -%}

{% comment %} Preload critical font (max 1-2) {% endcomment %}
{%- if settings.type_body_font != blank -%}
  <link
    rel="preload"
    href="{{ settings.type_body_font | font_url }}"
    as="font"
    type="font/woff2"
    crossorigin
  >
{%- endif -%}
```

### Shopify's preload_tag Filter

```liquid
{% comment %} Shopify provides a built-in preload filter {% endcomment %}
{{ 'critical.css' | asset_url | preload_tag: as: 'style' }}
{{ 'base.js' | asset_url | preload_tag: as: 'script' }}
```

### Speculation Rules API (Predictive Prefetch)

Shopify rolled out platform-wide Speculation Rules in June 2025, making stores up to 180ms faster. The platform automatically prefetches key navigation routes with "conservative" eagerness (on mouse down / touch start).

For custom speculation rules beyond what Shopify provides:

```liquid
{% comment %} Add custom speculation rules for high-traffic internal links {% endcomment %}
<script type="speculationrules">
{
  "prefetch": [
    {
      "where": {
        "href_matches": ["/collections/*", "/products/*"]
      },
      "eagerness": "moderate"
    }
  ],
  "prerender": [
    {
      "where": {
        "selector_matches": ".nav-link-primary"
      },
      "eagerness": "conservative"
    }
  ]
}
</script>
```

### Resource Hints Budget

NEVER add more than **2-3 preconnect hints** and **2 preload hints** per page. Each resource hint competes with other critical resources for bandwidth. Too many hints = none of them are effective.

---

## 11. Server & Network

### Shopify CDN Optimization

- **ALL static assets** (CSS, JS, images, fonts) MUST be served from Shopify's CDN via the `assets/` folder
- NEVER host assets on external servers — Shopify's CDN is globally distributed, supports HTTP/2, Brotli compression, and automatic WebP/AVIF
- NEVER hotlink images from other domains when you can upload to Shopify

```liquid
{% comment %} WRONG — external hosting {% endcomment %}
<script src="https://my-server.com/custom-script.js"></script>
<link rel="stylesheet" href="https://my-server.com/custom-styles.css">

{% comment %} RIGHT — Shopify CDN {% endcomment %}
<script src="{{ 'custom-script.js' | asset_url }}" defer></script>
{{ 'custom-styles.css' | asset_url | stylesheet_tag }}
```

### Minimize Redirects

Every redirect adds 100-300ms. Common Shopify redirect issues:
- `/collections/all` redirecting to `/collections`
- Non-www redirecting to www (or vice versa)
- HTTP redirecting to HTTPS
- Old product URLs with redirects

Audit redirects in **Shopify Admin → Online Store → Navigation → URL Redirects**. Remove unnecessary ones.

### Automatic Optimizations (You Get for Free)

- **HTTP/2 multiplexing** — multiple resources over one connection
- **Brotli compression** — automatic for text-based assets
- **CDN edge caching** — assets served from nearest edge location
- **TLS 1.3** — faster handshake than TLS 1.2
- **Shopify's Speculation Rules** — automatic prefetch on navigation intent

---

## 12. Page-Specific Optimization

### Homepage

```liquid
{% comment %} layout/theme.liquid — conditional preloading for homepage {% endcomment %}
{%- if template.name == 'index' -%}
  {% comment %} Preload hero image — highest priority {% endcomment %}
  {%- assign hero = sections['hero'].settings.image -%}
  {%- if hero -%}
    <link
      rel="preload"
      as="image"
      href="{{ hero | image_url: width: 1500 }}"
      imagesrcset="{{ hero | image_url: width: 375 }} 375w, {{ hero | image_url: width: 750 }} 750w, {{ hero | image_url: width: 1500 }} 1500w"
      imagesizes="100vw"
    >
  {%- endif -%}
{%- endif -%}
```

```liquid
{% comment %} sections/hero.liquid — above-fold, maximum priority {% endcomment %}
<section class="hero">
  {{- section.settings.image
    | image_url: width: 1920
    | image_tag:
      loading: 'eager',
      fetchpriority: 'high',
      widths: '375, 750, 1100, 1500, 1920',
      sizes: '100vw',
      class: 'hero__image'
  -}}
  <div class="hero__content">
    <h1>{{ section.settings.heading }}</h1>
  </div>
</section>
```

```liquid
{% comment %} Below-fold sections — lazy load everything {% endcomment %}
{% comment %} sections/featured-collection.liquid {% endcomment %}
{%- for product in section.settings.collection.products limit: 8 -%}
  {{- product.featured_image
    | image_url: width: 600
    | image_tag:
      loading: 'lazy',
      widths: '200, 300, 400, 600',
      sizes: '(max-width: 749px) 50vw, 25vw'
  -}}
{%- endfor -%}
```

### Product Page

```liquid
{% comment %} Product main image — above-fold, high priority {% endcomment %}
{%- assign main_image = product.selected_or_first_available_variant.featured_image
  | default: product.featured_image -%}

{{- main_image
  | image_url: width: 1200
  | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    widths: '400, 600, 800, 1000, 1200',
    sizes: '(max-width: 749px) 100vw, 50vw',
    id: 'ProductMainImage',
    class: 'product__main-image'
-}}

{% comment %} Product thumbnails — lazy {% endcomment %}
{%- for image in product.images -%}
  {{- image
    | image_url: width: 200
    | image_tag:
      loading: 'lazy',
      widths: '80, 120, 160, 200',
      sizes: '80px',
      class: 'product__thumbnail',
      data-variant-id: image.variants.first.id
  -}}
{%- endfor -%}

{% comment %} Lazy load reviews section {% endcomment %}
<div id="product-reviews" data-lazy-section style="min-height: 200px; contain: layout style;">
  {% comment %} Reviews loaded via Intersection Observer {% endcomment %}
</div>
```

### Collection Page

```liquid
{% comment %} Paginate — ALWAYS {% endcomment %}
{%- paginate collection.products by 24 -%}
  <div class="collection-grid">
    {%- for product in collection.products -%}
      {%- liquid
        if forloop.index <= 4
          assign img_loading = 'eager'
        else
          assign img_loading = 'lazy'
        endif
      -%}

      <div class="product-card" style="contain: layout style;">
        {{- product.featured_image
          | image_url: width: 600
          | image_tag:
            loading: img_loading,
            widths: '200, 300, 400, 600',
            sizes: '(max-width: 749px) calc(50vw - 24px), (max-width: 999px) calc(33vw - 32px), 300px',
            class: 'product-card__image'
        -}}
        <h3 class="product-card__title">{{ product.title }}</h3>
        <span class="product-card__price">{{ product.price | money }}</span>
      </div>
    {%- endfor -%}
  </div>

  {{ paginate | default_pagination }}
{%- endpaginate -%}
```

### Cart Page

```liquid
{% comment %} Cart page — minimal JS, fast update {% endcomment %}
{% comment %} Use the Section Rendering API for cart updates {% endcomment %}
<script defer>
  document.addEventListener('change', async (e) => {
    const quantityInput = e.target.closest('.cart-item__quantity');
    if (!quantityInput) return;

    const line = quantityInput.dataset.line;
    const quantity = parseInt(quantityInput.value, 10);

    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line: line,
        quantity: quantity,
        sections: ['cart-items', 'cart-footer']
      })
    });

    const data = await response.json();

    /* Update only the changed sections */
    Object.keys(data.sections).forEach((sectionId) => {
      const el = document.getElementById(`shopify-section-${sectionId}`);
      if (el) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.sections[sectionId], 'text/html');
        el.innerHTML = doc.querySelector(`#shopify-section-${sectionId}`).innerHTML;
      }
    });
  });
</script>
```

---

## 13. Speed Monitoring

### Shopify Web Performance Dashboard

Access via **Shopify Admin → Online Store → Themes → Speed** or the **Web Performance** page. This shows:
- Overall speed score
- Core Web Vitals from real users (CrUX data)
- Comparison to similar stores
- Speed changes over time

### Google PageSpeed Insights API Monitoring

```bash
# Automated speed monitoring script (run weekly via cron/CI)
#!/bin/bash
API_KEY="your-psi-api-key"
STORE_URL="https://your-store.myshopify.com"

PAGES=("/" "/collections/all" "/products/your-top-product")

for page in "${PAGES[@]}"; do
  RESULT=$(curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${STORE_URL}${page}&strategy=mobile&key=${API_KEY}")
  SCORE=$(echo $RESULT | jq '.lighthouseResult.categories.performance.score * 100')
  LCP=$(echo $RESULT | jq '.lighthouseResult.audits["largest-contentful-paint"].numericValue')
  CLS=$(echo $RESULT | jq '.lighthouseResult.audits["cumulative-layout-shift"].numericValue')
  TBT=$(echo $RESULT | jq '.lighthouseResult.audits["total-blocking-time"].numericValue')

  echo "Page: ${page} | Score: ${SCORE} | LCP: ${LCP}ms | CLS: ${CLS} | TBT: ${TBT}ms"
done
```

### Performance Budgets

| Metric | Budget | Action if Exceeded |
|--------|--------|--------------------|
| Total JS (theme) | < 16KB minified | Audit and remove unused code |
| Total JS (all) | < 150KB transferred | Audit third-party scripts |
| Total CSS | < 50KB transferred | Remove unused CSS |
| Hero image | < 200KB | Reduce dimensions, optimize compression |
| Product image | < 150KB | Reduce dimensions |
| LCP | < 2.5s | Image/font/CSS optimization |
| CLS | < 0.1 | Dimension attributes, font-display |
| INP | < 200ms | JS optimization, debouncing |
| TBT | < 300ms | Defer scripts, break long tasks |
| Font files | < 100KB total | Subset, WOFF2, fewer weights |
| Total page weight | < 1MB on homepage | Full audit |

### Real User Monitoring (RUM) vs Lab Data

- **Lab data** (Lighthouse, WebPageTest) = controlled, reproducible, but synthetic
- **Field data** (CrUX, Shopify dashboard) = real users, real devices, real networks
- ALWAYS prioritize **field data** for decision-making — it reflects actual user experience
- Use **lab data** for debugging and development iteration

---

## 14. Complete Speed Audit Checklist

### CRITICAL Impact (Do These First)

| # | Check | Expected Gain | How to Verify |
|---|-------|--------------|---------------|
| 1 | Hero image uses `image_tag` with `fetchpriority: 'high'` and `loading: 'eager'` | LCP -300ms to -1s | View source, check `<img>` attributes |
| 2 | Hero image is preloaded in `<head>` with `imagesrcset` | LCP -200ms to -500ms | View source, check `<link rel="preload">` |
| 3 | No render-blocking JS in `<head>` (all scripts `defer` or `async`) | LCP -200ms to -1s | DevTools → Network → filter JS → check initiator |
| 4 | Remove unused apps (audit every installed app) | LCP/INP -200ms to -2s | Disable one at a time, measure |
| 5 | Hero image is `<img>` not CSS `background-image` | LCP -100ms to -500ms | View source |
| 6 | All images have explicit `width` and `height` (use `image_tag`) | CLS -0.05 to -0.3 | Lighthouse CLS audit |
| 7 | `font-display: swap` on all @font-face declarations | LCP -100ms to -300ms | View source, check CSS |
| 8 | Critical CSS inlined in `<head>` | LCP -100ms to -300ms | View source |
| 9 | Collections are paginated (never render all products) | TTFB -200ms to -2s | Check Liquid templates |
| 10 | No image transitions/animations on LCP element | LCP -100ms to -500ms | Inspect hero image CSS |

### HIGH Impact

| # | Check | Expected Gain | How to Verify |
|---|-------|--------------|---------------|
| 11 | Preconnect to critical third-party domains (max 2-3) | LCP -50ms to -200ms | View source `<head>` |
| 12 | Below-fold images use `loading: 'lazy'` | Page weight -500KB+ | View source, check `<img>` |
| 13 | All images use `srcset` and `sizes` attributes | Bandwidth -30-60% | View source, check `<img>` |
| 14 | JavaScript total < 150KB transferred | TBT -200ms+ | DevTools → Network → filter JS |
| 15 | jQuery removed, using vanilla JS | JS size -80KB+ | DevTools → Network |
| 16 | Third-party chat widget deferred to user interaction | TBT -200ms to -500ms | Performance tab profiling |
| 17 | Review app lazy loaded with Intersection Observer | TBT -100ms to -300ms | Network waterfall |
| 18 | Max 2 font families loaded | Font bytes -50KB+ | Network → filter fonts |
| 19 | Max 3-4 font weights total | Font bytes -30KB+ | Network → filter fonts |
| 20 | WOFF2 format only for custom fonts | Font bytes -30% | Network → filter fonts |
| 21 | Font preloaded for primary body font | LCP -50ms to -150ms | View source `<head>` |
| 22 | Non-critical CSS deferred with `preload` trick | LCP -100ms to -200ms | View source |
| 23 | `{%- render -%}` used instead of `{% include %}` | TTFB -10ms to -50ms | Search Liquid files |
| 24 | No nested Liquid loops | TTFB -20ms to -100ms | Search Liquid files |
| 25 | `assign` used outside loops for repeated values | TTFB -10ms to -50ms | Search Liquid files |

### MEDIUM Impact

| # | Check | Expected Gain | How to Verify |
|---|-------|--------------|---------------|
| 26 | CSS custom properties defined once in `:root` | CSS size -5KB+ | Check base CSS |
| 27 | Section-scoped CSS uses `{%- style -%}` tag | CSS specificity improvement | Check section files |
| 28 | Unused CSS removed (coverage < 50% unused) | CSS size -20KB+ | DevTools → Coverage |
| 29 | Images use LQIP placeholder technique | Perceived speed improvement | Visual inspection |
| 30 | `where` and `map` filters used instead of loop+if | TTFB -5ms to -20ms | Search Liquid files |
| 31 | Whitespace control `{%- -%}` on all Liquid tags | HTML size -5-15% | View source |
| 32 | `dns-prefetch` for analytics/tracking domains | Resource discovery -50ms | View source `<head>` |
| 33 | Intersection Observer for below-fold component init | TBT -50ms to -200ms | Check JS files |
| 34 | Event handlers use debounce/throttle | INP -50ms to -200ms | Check JS files |
| 35 | Cart updates use Section Rendering API | Cart interaction speed | Check cart JS |
| 36 | `requestIdleCallback` for non-critical work | INP -20ms to -100ms | Check JS files |
| 37 | Product cards use `contain: layout style` | Paint performance | Check CSS |
| 38 | `content-visibility: auto` on off-screen sections | Render time -50ms+ | Check CSS |
| 39 | Metafield access minimized in loops | TTFB -10ms to -50ms | Search Liquid files |
| 40 | Pass minimal data to render snippets | TTFB -5ms to -20ms | Check render calls |

### LOW Impact (Polish)

| # | Check | Expected Gain | How to Verify |
|---|-------|--------------|---------------|
| 41 | All assets served from Shopify CDN (no external hosting) | Reliability + speed | Network tab domains |
| 42 | No unnecessary URL redirects | -100ms per redirect | Check redirect list |
| 43 | CSS minified (no comments, no extra whitespace) | CSS size -5-10% | View asset files |
| 44 | JS minified | JS size -10-20% | View asset files |
| 45 | No `!important` in CSS (specificity issues) | Maintainability | Search CSS files |
| 46 | `break` / `continue` used for early loop exit | TTFB -1ms to -10ms | Search Liquid files |
| 47 | Speculation Rules for predictive navigation | Navigation -50ms to -180ms | View source |
| 48 | Variable fonts used (one file, multiple weights) | Font bytes -30KB+ | Check font files |
| 49 | Metric-adjusted font fallback to reduce CLS | CLS -0.01 to -0.05 | Check CSS |
| 50 | `aspect-ratio` CSS on all image containers | CLS improvement | Check CSS |
| 51 | No oversized images (max 2x display size) | Bandwidth reduction | Check image dimensions |
| 52 | Analytics consolidated via GTM (single script) | TBT -50ms to -150ms | Network tab |
| 53 | Responsive images use correct `sizes` for layout | Bandwidth -10-30% | Check `sizes` accuracy |
| 54 | Lighthouse run on mobile with real content (5+ runs) | Accurate baseline | Test methodology |

---

## 15. Before/After Patterns

### Pattern 1: Hero Image

```liquid
{% comment %} ❌ BEFORE — Slow hero image {% endcomment %}
<div class="hero" style="background-image: url('{{ section.settings.image | img_url: 'master' }}')">
  <h1>{{ section.settings.heading }}</h1>
</div>

{% comment %} ✅ AFTER — Optimized hero image {% endcomment %}
<div class="hero">
  {{- section.settings.image
    | image_url: width: 1920
    | image_tag:
      loading: 'eager',
      fetchpriority: 'high',
      widths: '375, 750, 1100, 1500, 1920',
      sizes: '100vw',
      class: 'hero__image'
  -}}
  <h1>{{ section.settings.heading }}</h1>
</div>
```

### Pattern 2: Product Grid Images

```liquid
{% comment %} ❌ BEFORE — All images eager, no srcset {% endcomment %}
{%- for product in collection.products -%}
  <img src="{{ product.featured_image | img_url: '400x400' }}" alt="{{ product.title }}">
{%- endfor -%}

{% comment %} ✅ AFTER — Lazy loading, responsive, proper sizes {% endcomment %}
{%- for product in collection.products -%}
  {%- liquid
    if forloop.index <= 4
      assign loading = 'eager'
    else
      assign loading = 'lazy'
    endif
  -%}
  {{- product.featured_image
    | image_url: width: 600
    | image_tag:
      loading: loading,
      widths: '200, 300, 400, 600',
      sizes: '(max-width: 749px) 50vw, 300px'
  -}}
{%- endfor -%}
```

### Pattern 3: Script Loading

```liquid
{% comment %} ❌ BEFORE — Render-blocking scripts {% endcomment %}
<script src="{{ 'vendor.js' | asset_url }}"></script>
<script src="{{ 'theme.js' | asset_url }}"></script>
<script src="https://cdn.example.com/analytics.js"></script>

{% comment %} ✅ AFTER — Deferred, prioritized {% endcomment %}
<script src="{{ 'theme.js' | asset_url }}" defer></script>
<script src="https://cdn.example.com/analytics.js" async></script>
{% comment %} vendor.js removed — replaced with vanilla JS {% endcomment %}
```

### Pattern 4: Font Loading

```liquid
{% comment %} ❌ BEFORE — Multiple fonts, no optimization {% endcomment %}
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=block" rel="stylesheet">

{% comment %} ✅ AFTER — Minimal fonts, swap, preload {% endcomment %}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

### Pattern 5: Liquid Loops

```liquid
{% comment %} ❌ BEFORE — Inefficient loop {% endcomment %}
{%- for product in collection.products -%}
  {%- assign currency_symbol = cart.currency.symbol -%}
  {%- assign sale_label = 'products.sale' | t -%}
  {%- for tag in product.tags -%}
    {%- if tag == 'featured' -%}
      <span>{{ sale_label }} {{ product.price | money_with_currency }}</span>
    {%- endif -%}
  {%- endfor -%}
{%- endfor -%}

{% comment %} ✅ AFTER — Optimized loop {% endcomment %}
{%- assign sale_label = 'products.sale' | t -%}
{%- for product in collection.products -%}
  {%- if product.tags contains 'featured' -%}
    <span>{{ sale_label }} {{ product.price | money_with_currency }}</span>
  {%- endif -%}
{%- endfor -%}
```

### Pattern 6: CSS Loading

```liquid
{% comment %} ❌ BEFORE — All CSS render-blocking {% endcomment %}
{{ 'base.css' | asset_url | stylesheet_tag }}
{{ 'product.css' | asset_url | stylesheet_tag }}
{{ 'collection.css' | asset_url | stylesheet_tag }}
{{ 'blog.css' | asset_url | stylesheet_tag }}

{% comment %} ✅ AFTER — Critical inline + deferred {% endcomment %}
<style>
  /* Critical above-fold styles inlined */
  :root { --color-bg: #fff; --color-text: #1a1a1a; }
  body { font-family: var(--font-body); color: var(--color-text); }
  .header { position: sticky; top: 0; height: 64px; }
</style>
<link rel="preload" href="{{ 'base.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
{%- if template.name == 'product' -%}
  {{ 'product.css' | asset_url | stylesheet_tag }}
{%- endif -%}
```

### Pattern 7: Third-Party Chat Widget

```liquid
{% comment %} ❌ BEFORE — Loads immediately, blocks main thread {% endcomment %}
<script src="https://chat-provider.com/widget.js"></script>

{% comment %} ✅ AFTER — Loads on user interaction {% endcomment %}
<script>
  (function() {
    let loaded = false;
    function loadChat() {
      if (loaded) return;
      loaded = true;
      const s = document.createElement('script');
      s.src = 'https://chat-provider.com/widget.js';
      s.defer = true;
      document.body.appendChild(s);
    }
    window.addEventListener('scroll', loadChat, { once: true, passive: true });
    document.addEventListener('click', loadChat, { once: true });
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadChat, { timeout: 5000 });
    } else {
      setTimeout(loadChat, 5000);
    }
  })();
</script>
```

### Pattern 8: Collection Rendering

```liquid
{% comment %} ❌ BEFORE — No pagination, renders all products {% endcomment %}
{%- for product in collection.products -%}
  {% include 'product-card' %}
{%- endfor -%}

{% comment %} ✅ AFTER — Paginated, render tag, minimal data {% endcomment %}
{%- paginate collection.products by 24 -%}
  {%- for product in collection.products -%}
    {%- render 'product-card',
      product: product,
      loading: forloop.index | at_most: 4 | minus: forloop.index | plus: 1 | at_most: 1 | replace: '1', 'eager' | replace: '0', 'lazy'
    -%}
  {%- endfor -%}
  {{ paginate | default_pagination }}
{%- endpaginate -%}
```

### Pattern 9: Image Containers (CLS Fix)

```css
/* ❌ BEFORE — No reserved space, causes layout shift */
.product-card img {
  width: 100%;
}

/* ✅ AFTER — Reserved space with aspect-ratio */
.product-card__image-wrapper {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: #f5f5f5;
  contain: layout style;
}

.product-card__image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Pattern 10: Variant Selector (INP Fix)

```javascript
/* ❌ BEFORE — Synchronous, blocks main thread */
variantSelector.addEventListener('change', function(e) {
  const variant = getVariantById(e.target.value);
  document.querySelector('.price').innerHTML = formatMoney(variant.price);
  document.querySelector('.product-image').src = variant.featured_image.src;
  document.querySelector('.inventory').innerHTML = getInventory(variant.id);
  document.querySelector('.sku').innerHTML = variant.sku;
  updateBrowserHistory(variant);
  updatePickupAvailability(variant);
});

/* ✅ AFTER — Prioritized, non-blocking */
variantSelector.addEventListener('change', function(e) {
  const variant = getVariantById(e.target.value);

  /* Critical — update price immediately */
  requestAnimationFrame(() => {
    document.querySelector('.price').textContent = formatMoney(variant.price);
  });

  /* Important but can wait one frame */
  requestAnimationFrame(() => {
    document.querySelector('.product-image').src = variant.featured_image.src;
  });

  /* Non-critical — defer */
  requestIdleCallback(() => {
    document.querySelector('.inventory').textContent = getInventory(variant.id);
    document.querySelector('.sku').textContent = variant.sku;
    updateBrowserHistory(variant);
    updatePickupAvailability(variant);
  });
});
```

### Pattern 11: Analytics Loading

```liquid
{% comment %} ❌ BEFORE — Multiple analytics scripts blocking {% endcomment %}
<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script src="https://connect.facebook.net/en_US/fbevents.js"></script>
<script src="https://snap.licdn.com/li.lms-analytics/insight.min.js"></script>
<script>/* inline init code for each */</script>

{% comment %} ✅ AFTER — Single GTM container, async {% endcomment %}
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX"></script>
{% comment %} All other tracking configured inside GTM with trigger rules {% endcomment %}
```

### Pattern 12: Announcement Bar (CLS Fix)

```liquid
{% comment %} ❌ BEFORE — Dynamic height, causes CLS {% endcomment %}
<div class="announcement-bar">
  {{ section.settings.text }}
</div>

{% comment %} ✅ AFTER — Fixed minimum height reserves space {% endcomment %}
<div class="announcement-bar" style="min-height: 40px; contain: layout;">
  {{- section.settings.text -}}
</div>
```

### Pattern 13: Lazy Sections with content-visibility

```css
/* ❌ BEFORE — All sections rendered immediately */
.shopify-section {
  /* no optimization */
}

/* ✅ AFTER — Off-screen sections deferred */
.shopify-section:not(:first-child):not(:nth-child(2)) {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

### Pattern 14: Preconnect Optimization

```liquid
{% comment %} ❌ BEFORE — Too many resource hints (competing for bandwidth) {% endcomment %}
<link rel="preconnect" href="https://cdn.shopify.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com">
<link rel="preconnect" href="https://www.google-analytics.com">
<link rel="preconnect" href="https://www.facebook.com">
<link rel="preconnect" href="https://connect.facebook.net">
<link rel="preconnect" href="https://chat-provider.com">

{% comment %} ✅ AFTER — Max 2-3 preconnect, rest as dns-prefetch {% endcomment %}
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://connect.facebook.net">
```

### Pattern 15: Whitespace-Trimmed Liquid

```liquid
{% comment %} ❌ BEFORE — Outputs excessive whitespace in HTML {% endcomment %}
{% if product.available %}
  {% if product.compare_at_price > product.price %}
    <span class="badge badge--sale">
      {{ 'products.sale' | t }}
    </span>
  {% endif %}
{% endif %}

{% comment %} ✅ AFTER — Clean HTML output {% endcomment %}
{%- if product.available -%}
  {%- if product.compare_at_price > product.price -%}
    <span class="badge badge--sale">
      {{- 'products.sale' | t -}}
    </span>
  {%- endif -%}
{%- endif -%}
```

---

## Quick Reference: The 5 Highest-Impact Actions

When time is limited, focus on these in order:

1. **Optimize the LCP image** — `image_tag` with `eager`, `fetchpriority: 'high'`, preload in `<head>`, proper `srcset`/`sizes`
2. **Remove or defer app scripts** — Audit every app, remove unused ones, defer the rest to user interaction
3. **Defer all JS, inline critical CSS** — No render-blocking resources in `<head>`
4. **Fix fonts** — Max 2 families, `font-display: swap`, preload primary font, WOFF2 only
5. **Add dimensions to all images** — Use `image_tag` (auto width/height), `aspect-ratio` on containers

These five actions alone can improve Lighthouse scores by 20-40 points on most Shopify stores.
