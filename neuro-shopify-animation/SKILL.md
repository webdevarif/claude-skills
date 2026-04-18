---
name: neuro-shopify-animation
description: Shopify animation expert - GSAP, ScrollTrigger, CSS animations, scroll-driven animations, smooth reveals, parallax, stagger effects, and performance-optimized motion design. Fast loading mandatory - animations must not hurt Core Web Vitals.
trigger: auto
globs:
  - "**/*.liquid"
  - "**/assets/*.js"
  - "**/assets/*.css"
  - "**/sections/*.liquid"
  - "**/snippets/*.liquid"
  - "**/layout/theme.liquid"
---

# Shopify Animation Skill — GSAP, ScrollTrigger, CSS Animations & Performance

You are a Shopify animation expert. You implement smooth, performant animations that NEVER hurt page speed or Core Web Vitals. You prefer CSS-only solutions when possible, use Intersection Observer for lightweight scroll triggers, and lazy-load GSAP only when its power is truly needed.

---

## 1. ANIMATION PERFORMANCE RULES (READ FIRST — NON-NEGOTIABLE)

These rules override EVERYTHING. Every animation you write MUST follow them.

### Loading Rules
- **NEVER** load animation libraries (GSAP, ScrollTrigger, or any JS) in `<head>` or as render-blocking resources.
- **NEVER** add GSAP scripts to `layout/theme.liquid` globally. Load per-section, lazily.
- **ALWAYS** lazy-load GSAP via Intersection Observer or dynamic `import()` / script injection.
- **ALWAYS** use `defer` or `async` on any animation `<script>` tags.

### GPU & Rendering Rules
- **ALWAYS** animate ONLY `transform` and `opacity`. These are GPU-composited and skip layout/paint.
- **NEVER** animate `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border-width`, `font-size`. These trigger layout thrashing and kill performance.
- **ALWAYS** use `translate()` instead of `top`/`left` for position changes.
- **ALWAYS** use `scale()` instead of `width`/`height` for size changes.
- Use `will-change` sparingly — apply it just before animation starts, remove it after animation completes. NEVER leave `will-change` on permanently.

### Accessibility Rules (MANDATORY)
- **ALWAYS** respect `prefers-reduced-motion`. Every animation MUST have a reduced-motion fallback.
- Reduced motion means: instant state (no animation), or a single subtle fade at most.

```css
/* MANDATORY — include in every theme stylesheet */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Performance Budget
| Resource | Budget | Notes |
|----------|--------|-------|
| Total animation JS | < 30KB gzipped | All animation code combined |
| GSAP core | ~24KB gzipped | Acceptable if deferred + lazy |
| GSAP + ScrollTrigger | ~28KB gzipped | Must be lazy-loaded |
| CSS animations | 0KB JS | ALWAYS prefer these |
| Intersection Observer code | ~500 bytes | Negligible cost |
| Custom animation JS | < 2KB | Your glue code |

### Core Web Vitals Rules
- **LCP**: Hero animations MUST start AFTER LCP completes, never before. Use `requestIdleCallback` or a `load` event listener.
- **CLS**: Animated elements MUST have explicit `width`, `height`, or `aspect-ratio`. NEVER let animations shift layout. Starting states (e.g., `opacity: 0; transform: translateY(20px)`) must not cause CLS — the element MUST still occupy its space.
- **INP**: Animation event handlers must complete in < 200ms. NEVER block the main thread with animation setup.

### Decision Hierarchy (Fastest First)
```
1. CSS-only (transitions, keyframes)           → 0 JS cost
2. CSS scroll-driven (animation-timeline)      → 0 JS cost, progressive enhancement
3. Intersection Observer + CSS class toggle    → ~500 bytes JS
4. GSAP (lazy-loaded, deferred)                → ~24KB gzipped
5. GSAP + ScrollTrigger (lazy-loaded)          → ~28KB gzipped
```

You MUST always choose the lightest approach that achieves the desired effect.

---

## 2. CSS-ONLY ANIMATIONS (Prefer These — Zero JS Cost)

### Fade-In on Scroll (with tiny Intersection Observer)

```css
/* assets/animations.css */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .fade-in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Slide-Up Reveal with CSS Animation

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  opacity: 0;
}

.slide-up.is-visible {
  animation: slideUp 0.7s ease-out forwards;
}
```

### Stagger Effect with CSS Custom Properties

```css
/* Each child gets a --delay variable */
.stagger-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  transition-delay: calc(var(--stagger-index, 0) * 100ms);
}

.stagger-parent.is-visible .stagger-item {
  opacity: 1;
  transform: translateY(0);
}
```

```liquid
{%- comment -%} sections/collection-grid.liquid {%- endcomment -%}
<div class="stagger-parent" data-animate>
  {%- for product in collection.products limit: 12 -%}
    <div class="stagger-item" style="--stagger-index: {{ forloop.index0 }};">
      {% render 'product-card', product: product %}
    </div>
  {%- endfor -%}
</div>
```

### Hover Effects (Scale, Color, Shadow)

```css
/* Product card hover */
.product-card {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Button hover */
.btn {
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}
```

### Loading Skeleton Animation

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton {
  background: #e0e0e0;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
```

### Smooth Color/Background Transitions

```css
.section-color-shift {
  background-color: var(--bg-color, #ffffff);
  transition: background-color 0.4s ease-in-out;
}

/* Change via JS class or CSS custom property */
.section-color-shift.alt-theme {
  --bg-color: #1a1a2e;
}
```

### CSS Transition Best Practices

```css
/* GOOD — specific properties, sensible durations */
.element {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* BAD — never use 'all', it transitions everything including layout props */
.element {
  transition: all 0.3s ease; /* NEVER DO THIS */
}
```

**Duration guide:**
- Micro-interactions (hover, focus): 150-250ms
- Reveals / entrances: 400-700ms
- Page transitions: 300-500ms
- NEVER exceed 1000ms for any single animation

**Easing guide:**
- Entrances: `ease-out` or `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Exits: `ease-in` or `cubic-bezier(0.55, 0.085, 0.68, 0.53)`
- State changes: `ease-in-out` or `cubic-bezier(0.645, 0.045, 0.355, 1)`

### Button Micro-Interactions

```css
.btn-interactive {
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-interactive:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.btn-interactive:focus-visible {
  outline: 2px solid var(--focus-color, #4A90D9);
  outline-offset: 2px;
}

/* Ripple effect on click — CSS only with pseudo-element */
.btn-interactive::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.8s ease;
}

.btn-interactive:active::after {
  transform: scale(0);
  opacity: 1;
  transition: 0s;
}
```

### Image Reveal with Clip-Path

```css
@keyframes clipReveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.image-reveal {
  clip-path: inset(0 100% 0 0);
}

.image-reveal.is-visible {
  animation: clipReveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .image-reveal {
    clip-path: none;
  }
}
```

### Text Gradient Animation

```css
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.text-gradient {
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .text-gradient {
    animation: none;
    background-size: 100% 100%;
  }
}
```

### Marquee / Ticker with CSS Only

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.marquee-wrapper {
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  animation: marquee 20s linear infinite;
}

/* Duplicate content in HTML so it loops seamlessly */
.marquee-track:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
```

```liquid
{%- comment -%} snippets/marquee.liquid {%- endcomment -%}
<div class="marquee-wrapper" aria-label="Scrolling announcement">
  <div class="marquee-track">
    {%- for i in (1..2) -%}
      <span class="marquee-item">{{ section.settings.marquee_text }}&nbsp;&nbsp;&nbsp;</span>
    {%- endfor -%}
    {%- for i in (1..2) -%}
      <span class="marquee-item" aria-hidden="true">{{ section.settings.marquee_text }}&nbsp;&nbsp;&nbsp;</span>
    {%- endfor -%}
  </div>
</div>
```

### Parallax with CSS Only (Limited but Zero JS)

```css
.parallax-section {
  background-image: var(--bg-image);
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  min-height: 60vh;
}

/* Disable on mobile — fixed attachment is janky on iOS/Android */
@media (max-width: 768px) {
  .parallax-section {
    background-attachment: scroll;
  }
}
```

---

## 3. CSS SCROLL-DRIVEN ANIMATIONS (Native Browser — 2025+)

CSS scroll-driven animations use `animation-timeline: scroll()` and `animation-timeline: view()` to tie animations directly to scroll progress with ZERO JavaScript. Supported in Chrome 115+, Edge 115+, Safari 18+. Firefox has partial support behind a flag.

**ALWAYS** use `@supports` for progressive enhancement.

### Scroll Progress Animation (Progress Bar)

```css
@keyframes progressBar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@supports (animation-timeline: scroll()) {
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--accent-color, #4A90D9);
    transform-origin: left;
    transform: scaleX(0);
    animation: progressBar linear;
    animation-timeline: scroll();
    z-index: 9999;
  }
}
```

### Reveal on Scroll with `view()`

```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@supports (animation-timeline: view()) {
  .scroll-reveal {
    animation: fadeSlideUp linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
  }
}

/* Fallback for browsers without support */
@supports not (animation-timeline: view()) {
  .scroll-reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  .scroll-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Parallax with Scroll Timeline

```css
@keyframes parallaxShift {
  from { transform: translateY(-60px); }
  to { transform: translateY(60px); }
}

@supports (animation-timeline: scroll()) {
  .parallax-bg {
    animation: parallaxShift linear;
    animation-timeline: scroll();
  }
}
```

### Sticky Header Shrink

```css
@keyframes headerShrink {
  from {
    padding-block: 1.5rem;
    font-size: 1.5rem;
  }
  to {
    padding-block: 0.5rem;
    font-size: 1rem;
  }
}

@supports (animation-timeline: scroll()) {
  .site-header {
    position: sticky;
    top: 0;
    animation: headerShrink linear both;
    animation-timeline: scroll();
    animation-range: 0px 200px;
  }
}
```

### Animation Range Reference

```css
/* Element entry into viewport */
animation-range: entry 0% entry 100%;

/* While element is fully contained in viewport */
animation-range: contain 0% contain 100%;

/* Element exit from viewport */
animation-range: exit 0% exit 100%;

/* Full cover — from first pixel entering to last pixel leaving */
animation-range: cover 0% cover 100%;

/* Custom — start at 25% entry, end at 75% exit */
animation-range: entry 25% exit 75%;
```

### Feature Detection in JavaScript (for fallback logic)

```javascript
const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');

if (!supportsScrollTimeline) {
  // Load Intersection Observer fallback or polyfill
  document.documentElement.classList.add('no-scroll-timeline');
}
```

---

## 4. INTERSECTION OBSERVER ANIMATIONS (Lightweight JS)

This is the sweet spot: ~500 bytes of JS + CSS classes = scroll-triggered animations without any library.

### Reusable Observer Snippet — `animation-observer.liquid`

```liquid
{%- comment -%}
  snippets/animation-observer.liquid
  
  Usage in any section:
    <div data-animate="fade-up">Content</div>
    <div data-animate="fade-up" data-animate-delay="200">Delayed</div>
    <div data-animate="slide-left">Slides from left</div>
    
  Include once in theme.liquid or per-section:
    {% render 'animation-observer' %}
{%- endcomment -%}

<script>
(function() {
  if (window.__animObserverInit) return;
  window.__animObserverInit = true;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = el.getAttribute('data-animate-delay');
        if (delay) {
          el.style.transitionDelay = delay + 'ms';
        }
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-animate]').forEach(function(el) {
    observer.observe(el);
  });

  /* Re-observe after Shopify section events */
  document.addEventListener('shopify:section:load', function(e) {
    e.target.querySelectorAll('[data-animate]').forEach(function(el) {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  });
})();
</script>
```

### CSS for All Animation Types

```css
/* assets/animation-observer.css */

/* ---- Base hidden states ---- */
[data-animate] {
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Fade Up */
[data-animate="fade-up"] {
  opacity: 0;
  transform: translateY(30px);
}

/* Fade Down */
[data-animate="fade-down"] {
  opacity: 0;
  transform: translateY(-30px);
}

/* Slide Left (from right) */
[data-animate="slide-left"] {
  opacity: 0;
  transform: translateX(40px);
}

/* Slide Right (from left) */
[data-animate="slide-right"] {
  opacity: 0;
  transform: translateX(-40px);
}

/* Scale Up */
[data-animate="scale-up"] {
  opacity: 0;
  transform: scale(0.9);
}

/* Blur In */
[data-animate="blur-in"] {
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.6s ease-out, filter 0.6s ease-out;
}

/* Fade only */
[data-animate="fade"] {
  opacity: 0;
}

/* ---- Visible states ---- */
[data-animate].is-visible {
  opacity: 1;
  transform: translateY(0) translateX(0) scale(1);
  filter: blur(0);
}

/* ---- Stagger children ---- */
[data-animate-stagger] > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

[data-animate-stagger].is-visible > *:nth-child(1) { transition-delay: 0ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(2) { transition-delay: 80ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(3) { transition-delay: 160ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(4) { transition-delay: 240ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(5) { transition-delay: 320ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(6) { transition-delay: 400ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(7) { transition-delay: 480ms; opacity: 1; transform: none; }
[data-animate-stagger].is-visible > *:nth-child(8) { transition-delay: 560ms; opacity: 1; transform: none; }

/* ---- Reduced motion override ---- */
@media (prefers-reduced-motion: reduce) {
  [data-animate],
  [data-animate-stagger] > * {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}
```

### Usage in Liquid Sections

```liquid
{%- comment -%} sections/featured-collection.liquid {%- endcomment -%}
<section class="featured-collection">
  <h2 data-animate="fade-up">{{ section.settings.title }}</h2>
  
  <div class="product-grid" data-animate-stagger data-animate="fade-up">
    {%- for product in collection.products limit: 8 -%}
      <div class="product-card">
        {% render 'product-card', product: product %}
      </div>
    {%- endfor -%}
  </div>
</section>

{% render 'animation-observer' %}
```

### Stagger with CSS Custom Property (Dynamic Count)

```liquid
<div class="grid" data-animate>
  {%- for product in collection.products -%}
    <div 
      class="grid-item stagger-item" 
      style="--stagger-index: {{ forloop.index0 }};"
    >
      {% render 'product-card', product: product %}
    </div>
  {%- endfor -%}
</div>
```

```css
.stagger-item {
  opacity: 0;
  transform: translateY(25px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  transition-delay: calc(var(--stagger-index) * 80ms);
}

/* Cap the maximum delay at 800ms */
.stagger-item {
  transition-delay: calc(min(var(--stagger-index), 10) * 80ms);
}

[data-animate].is-visible .stagger-item {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 5. GSAP SETUP IN SHOPIFY (Lazy Loading Pattern)

**NEVER** put GSAP in `theme.liquid` `<head>`. **NEVER** load it globally. Load it lazily, per-section, only when the section enters the viewport.

### Lazy GSAP Loader Snippet — `gsap-loader.liquid`

```liquid
{%- comment -%}
  snippets/gsap-loader.liquid
  
  Lazy-loads GSAP + optional plugins when a section enters the viewport.
  
  Usage:
    {% render 'gsap-loader',
      target_selector: '.my-gsap-section',
      plugins: 'ScrollTrigger',
      callback: 'initMyAnimation'
    %}
    
  Parameters:
    target_selector — CSS selector of the element to observe
    plugins — Comma-separated: 'ScrollTrigger', 'Flip', 'Draggable' (optional)
    callback — Name of a global function to call after GSAP loads (required)
{%- endcomment -%}

<script>
(function() {
  var target = document.querySelector('{{ target_selector }}');
  if (!target) return;

  /* Respect reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var loaded = false;

  function loadGSAP() {
    if (loaded) return;
    loaded = true;

    var scripts = [
      '{{ "gsap.min.js" | asset_url }}'
    ];

    {% if plugins contains 'ScrollTrigger' %}
      scripts.push('{{ "ScrollTrigger.min.js" | asset_url }}');
    {% endif %}
    {% if plugins contains 'Flip' %}
      scripts.push('{{ "Flip.min.js" | asset_url }}');
    {% endif %}
    {% if plugins contains 'Draggable' %}
      scripts.push('{{ "Draggable.min.js" | asset_url }}');
    {% endif %}

    var loadCount = 0;
    scripts.forEach(function(src) {
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = function() {
        loadCount++;
        if (loadCount === scripts.length) {
          {% if plugins contains 'ScrollTrigger' %}
            gsap.registerPlugin(ScrollTrigger);
          {% endif %}
          {% if plugins contains 'Flip' %}
            gsap.registerPlugin(Flip);
          {% endif %}
          if (typeof window['{{ callback }}'] === 'function') {
            window['{{ callback }}']();
          }
        }
      };
      document.body.appendChild(s);
    });
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        observer.disconnect();
        loadGSAP();
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(target);
})();
</script>
```

### Alternative: Dynamic Import Pattern (ES Modules)

If your Shopify theme supports ES modules (type="module"):

```liquid
<script type="module">
  const section = document.querySelector('{{ target_selector }}');
  if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* Show content without animation */
    section?.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          Promise.all([
            import('{{ "gsap.min.js" | asset_url }}'),
            import('{{ "ScrollTrigger.min.js" | asset_url }}')
          ]).then(() => {
            gsap.registerPlugin(ScrollTrigger);
            initAnimation();
          });
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(section);
  }

  function initAnimation() {
    /* Your GSAP code here */
  }
</script>
```

### CDN vs Self-Hosted

**Self-hosted (Recommended for Shopify):**
- Upload `gsap.min.js` and `ScrollTrigger.min.js` to `assets/` folder.
- Use Liquid `asset_url` filter: `{{ 'gsap.min.js' | asset_url }}`.
- Served from Shopify CDN — fast, same-origin, no extra DNS lookup.

**CDN (Fallback):**
```html
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```
- Extra DNS lookup. Requires `dns-prefetch` link in head.
- Use only if you cannot upload to assets.

### GSAP Registration Pattern

```javascript
/* ALWAYS register plugins before using them */
gsap.registerPlugin(ScrollTrigger);

/* NEVER register inside a loop or animation function */
/* NEVER register conditionally — do it once at load time */
```

---

## 6. GSAP ANIMATION PATTERNS

Every pattern below assumes GSAP is already lazy-loaded via the patterns in Section 5.

### Hero Section: Text Reveal + Image Parallax

```javascript
function initHeroAnimation() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Wait for LCP — do not block first paint */
  requestIdleCallback(function() {
    /* Text word-by-word reveal */
    const heading = hero.querySelector('.hero-heading');
    if (heading) {
      const text = heading.textContent;
      heading.innerHTML = text.split(' ').map(function(word) {
        return '<span class="word-wrap"><span class="word">' + word + '</span></span>';
      }).join(' ');

      tl.from(hero.querySelectorAll('.word'), {
        yPercent: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08
      });
    }

    /* Subtitle fade in */
    tl.from('.hero-subtitle', {
      opacity: 0,
      y: 20,
      duration: 0.6
    }, '-=0.4');

    /* CTA button */
    tl.from('.hero-cta', {
      opacity: 0,
      y: 15,
      duration: 0.5
    }, '-=0.3');

    /* Image parallax on scroll */
    gsap.to('.hero-image', {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}
```

```css
.word-wrap {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}
.word-wrap .word {
  display: inline-block;
}
```

### Product Card Grid: Stagger Fade-In on Scroll

```javascript
function initProductGridAnimation() {
  ScrollTrigger.batch('.product-card', {
    onEnter: function(batch) {
      gsap.from(batch, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    },
    start: 'top 85%',
    once: true
  });
}
```

### Collection Page: Cards Slide Up with Stagger

```javascript
function initCollectionAnimation() {
  gsap.from('.collection-card', {
    scrollTrigger: {
      trigger: '.collection-grid',
      start: 'top 80%',
      once: true
    },
    opacity: 0,
    y: 60,
    duration: 0.7,
    stagger: {
      each: 0.12,
      from: 'start'
    },
    ease: 'power2.out'
  });
}
```

### Image Banner: Parallax Scrolling Background

```javascript
function initBannerParallax() {
  document.querySelectorAll('.parallax-banner').forEach(function(banner) {
    var img = banner.querySelector('.parallax-banner__image');
    if (!img) return;

    gsap.fromTo(img, 
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: banner,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });
}
```

### Number Counter: Count Up on Scroll

```javascript
function initCounterAnimation() {
  document.querySelectorAll('[data-count-to]').forEach(function(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    var obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true
      },
      onUpdate: function() {
        el.textContent = Math.round(obj.val).toLocaleString();
      }
    });
  });
}
```

```liquid
<div class="stats-grid">
  <div class="stat">
    <span class="stat-number" data-count-to="{{ section.settings.stat_1_number }}">0</span>
    <span class="stat-label">{{ section.settings.stat_1_label }}</span>
  </div>
  <div class="stat">
    <span class="stat-number" data-count-to="{{ section.settings.stat_2_number }}">0</span>
    <span class="stat-label">{{ section.settings.stat_2_label }}</span>
  </div>
</div>
```

### Progress Bar: Width Tied to Scroll

```javascript
function initScrollProgress() {
  gsap.to('.scroll-progress-bar', {
    scaleX: 1,
    ease: 'none',
    transformOrigin: 'left center',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3
    }
  });
}
```

### Sticky Header: Shrink/Grow on Scroll

```javascript
function initStickyHeader() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top-=100',
    end: 99999,
    onUpdate: function(self) {
      if (self.direction === 1) {
        gsap.to(header, { 
          y: -100, 
          duration: 0.3, 
          ease: 'power2.in',
          overwrite: true 
        });
      } else {
        gsap.to(header, { 
          y: 0, 
          duration: 0.3, 
          ease: 'power2.out',
          overwrite: true 
        });
      }
    }
  });

  /* Compact header after scroll */
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top-=50',
    toggleClass: { targets: header, className: 'header--compact' }
  });
}
```

### Accordion / FAQ: Smooth Height Animation

```javascript
function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var content = this.nextElementSibling;
      var isOpen = content.classList.contains('is-open');

      if (isOpen) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: function() {
            content.classList.remove('is-open');
            content.style.display = 'none';
          }
        });
      } else {
        content.style.display = 'block';
        content.classList.add('is-open');
        var h = content.scrollHeight;
        gsap.fromTo(content,
          { height: 0, opacity: 0 },
          { height: h, opacity: 1, duration: 0.4, ease: 'power2.inOut',
            onComplete: function() { content.style.height = 'auto'; }
          }
        );
      }
    });
  });
}
```

### Marquee / Ticker with GSAP (Smooth, No CSS Jank)

```javascript
function initMarquee() {
  document.querySelectorAll('.gsap-marquee').forEach(function(wrapper) {
    var track = wrapper.querySelector('.marquee-track');
    if (!track) return;

    /* Duplicate content for seamless loop */
    track.innerHTML += track.innerHTML;

    var totalWidth = track.scrollWidth / 2;
    var speed = parseFloat(wrapper.getAttribute('data-speed') || '50');
    var duration = totalWidth / speed;

    gsap.to(track, {
      x: -totalWidth,
      duration: duration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(function(x) {
          return parseFloat(x) % totalWidth;
        })
      }
    });

    /* Pause on hover */
    wrapper.addEventListener('mouseenter', function() {
      gsap.to(track, { timeScale: 0, duration: 0.5 });
    });
    wrapper.addEventListener('mouseleave', function() {
      gsap.to(track, { timeScale: 1, duration: 0.5 });
    });
  });
}
```

### Magnetic Cursor Effect on Buttons

```javascript
function initMagneticButtons() {
  /* Skip on touch devices */
  if ('ontouchstart' in window) return;

  document.querySelectorAll('[data-magnetic]').forEach(function(btn) {
    var strength = parseFloat(btn.getAttribute('data-magnetic-strength') || '0.3');

    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', function() {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}
```

### Page Transitions: Smooth Fade Between Pages

```javascript
/* Include in theme.liquid — lightweight, no GSAP needed for this */
function initPageTransitions() {
  var overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href]').forEach(function(link) {
    /* Only internal links, skip anchors and special links */
    if (link.hostname !== window.location.hostname) return;
    if (link.getAttribute('href').startsWith('#')) return;
    if (link.hasAttribute('data-no-transition')) return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      var href = link.href;

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: function() {
          window.location.href = href;
        }
      });
    });
  });

  /* Fade in on page load */
  window.addEventListener('pageshow', function() {
    gsap.fromTo(overlay, 
      { opacity: 1 },
      { opacity: 0, duration: 0.3, ease: 'power2.out' }
    );
  });
}
```

```css
.page-transition-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-background, #fff);
  z-index: 99999;
  pointer-events: none;
  opacity: 0;
}
```

---

## 7. SCROLLTRIGGER PATTERNS

### Basic: Trigger Animation When Element Enters Viewport

```javascript
gsap.from('.reveal-element', {
  opacity: 0,
  y: 50,
  duration: 0.8,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.reveal-element',
    start: 'top 85%',
    once: true /* IMPORTANT: set once:true when you don't need reverse */
  }
});
```

### Pin: Pin Element While Scrolling Through Content

```javascript
/* Pin a hero while content scrolls over it */
ScrollTrigger.create({
  trigger: '.pin-section',
  start: 'top top',
  end: '+=500',
  pin: true,
  pinSpacing: true
});

/* IMPORTANT: Animate CHILDREN of the pinned element, not the pinned element itself */
gsap.timeline({
  scrollTrigger: {
    trigger: '.pin-section',
    start: 'top top',
    end: '+=500',
    pin: true,
    scrub: 1
  }
}).to('.pin-section__content', {
  opacity: 0,
  y: -50,
  duration: 1
});
```

### Scrub: Tie Animation Progress to Scroll Position

```javascript
gsap.to('.scrub-element', {
  x: 300,
  rotation: 360,
  ease: 'none', /* ALWAYS use ease: 'none' with scrub for linear mapping */
  scrollTrigger: {
    trigger: '.scrub-section',
    start: 'top center',
    end: 'bottom center',
    scrub: 1 /* Smooth scrub with 1 second catch-up */
  }
});
```

### Batch: Animate Multiple Elements with Stagger

```javascript
ScrollTrigger.batch('.batch-item', {
  onEnter: function(batch) {
    gsap.from(batch, {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true
    });
  },
  start: 'top 90%',
  once: true
});
```

### Snap: Snap Scroll to Sections

```javascript
ScrollTrigger.create({
  snap: {
    snapTo: 1 / (numSections - 1),
    duration: { min: 0.2, max: 0.6 },
    ease: 'power1.inOut'
  }
});
```

### Parallax Layers: Multiple Speed Layers

```javascript
function initParallaxLayers() {
  document.querySelectorAll('[data-parallax-speed]').forEach(function(el) {
    var speed = parseFloat(el.getAttribute('data-parallax-speed'));

    gsap.to(el, {
      yPercent: speed * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('.parallax-container'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}
```

```liquid
<div class="parallax-container">
  <div class="parallax-layer" data-parallax-speed="-0.5">Background</div>
  <div class="parallax-layer" data-parallax-speed="0">Midground</div>
  <div class="parallax-layer" data-parallax-speed="0.5">Foreground</div>
</div>
```

### Horizontal Scroll Section

```javascript
function initHorizontalScroll() {
  var container = document.querySelector('.horizontal-section');
  var track = container.querySelector('.horizontal-track');
  var panels = track.querySelectorAll('.horizontal-panel');

  var totalScroll = track.scrollWidth - container.offsetWidth;

  gsap.to(track, {
    x: -totalScroll,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: '+=' + totalScroll,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true
    }
  });
}
```

```css
.horizontal-section {
  overflow: hidden;
}
.horizontal-track {
  display: flex;
  width: max-content;
}
.horizontal-panel {
  width: 100vw;
  flex-shrink: 0;
}
```

### Mobile-Specific: Disable Heavy Animations on Mobile

```javascript
function initResponsiveAnimations() {
  var mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', function() {
    /* Desktop-only animations */
    gsap.from('.desktop-animation', {
      opacity: 0,
      y: 60,
      scrollTrigger: {
        trigger: '.desktop-animation',
        start: 'top 80%',
        once: true
      }
    });

    /* Parallax — desktop only */
    gsap.to('.parallax-image', {
      yPercent: -20,
      scrollTrigger: {
        trigger: '.parallax-section',
        scrub: true
      }
    });
  });

  mm.add('(max-width: 767px)', function() {
    /* Simpler mobile animations */
    gsap.from('.desktop-animation', {
      opacity: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: '.desktop-animation',
        start: 'top 90%',
        once: true
      }
    });
    /* No parallax on mobile — skip it entirely */
  });

  mm.add('(prefers-reduced-motion: reduce)', function() {
    /* No animations at all — just show everything */
    gsap.set('.desktop-animation, .parallax-image', { clearProps: 'all' });
  });
}
```

### ScrollTrigger.refresh() After Dynamic Content

```javascript
/* After AJAX content load, Shopify section reorder, or DOM change */
document.addEventListener('shopify:section:load', function() {
  ScrollTrigger.refresh();
});

/* After image lazy-loading completes (changes layout heights) */
document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
  img.addEventListener('load', function() {
    ScrollTrigger.refresh();
  });
});
```

### Cleanup: Kill ScrollTrigger Instances

```javascript
/* When removing a section or navigating away */
function cleanupAnimations(container) {
  /* Kill all ScrollTriggers scoped to this container */
  ScrollTrigger.getAll().forEach(function(st) {
    if (container.contains(st.trigger)) {
      st.kill();
    }
  });

  /* Kill all GSAP tweens on elements inside */
  gsap.killTweensOf(container.querySelectorAll('*'));
}

/* Shopify section unload */
document.addEventListener('shopify:section:unload', function(e) {
  cleanupAnimations(e.target);
});
```

---

## 8. SCREENSHOT / IMAGE ANIMATION ANALYSIS

When a user provides a screenshot or describes a desired animation, follow this decision process:

```
STEP 1: IDENTIFY ANIMATION TYPE
  +-- Is it scroll-triggered? (reveal on scroll, parallax, pinning)
  +-- Is it hover-triggered? (button, card, image)
  +-- Is it load-triggered? (hero entrance, page transition)
  +-- Is it interaction-triggered? (click, drag, cursor)
  +-- Is it continuous? (marquee, floating, pulsing)

STEP 2: CHOOSE APPROACH (fastest first — ALWAYS)
  +-- Can CSS-only handle it?                  --> Use CSS (0 JS cost)
  |   Examples: hover effects, simple fades, skeleton loaders,
  |   color transitions, marquees, gradient animations
  |
  +-- Can CSS scroll-driven do it?             --> Use native CSS (0 JS cost)
  |   Examples: progress bars, simple scroll reveals, parallax
  |   Requires: @supports check, IO fallback
  |
  +-- Can Intersection Observer + CSS do it?   --> Use IO (~500 bytes)
  |   Examples: fade-in on scroll, stagger reveals, slide-in
  |   This handles 80% of Shopify animation needs
  |
  +-- Does it need precise timeline control?   --> Use GSAP (lazy loaded)
  |   Examples: complex sequences, word-by-word reveals, counters
  |
  +-- Does it need scroll-linked scrubbing?    --> Use GSAP + ScrollTrigger
      Examples: parallax layers, horizontal scroll, pinning, scrub

STEP 3: DEFINE THE ANIMATION SPECIFICATION
  +-- Element(s) involved
  +-- Starting state (opacity, transform values)
  +-- Ending state (opacity, transform values)
  +-- Duration (ms) — micro: 150-250, reveal: 400-700, transition: 300-500
  +-- Easing — ease-out for entrances, ease-in for exits, ease-in-out for state changes
  +-- Delay (if staggered) — 60-120ms between items
  +-- Trigger point — viewport %, scroll position, hover, click
  +-- Mobile behavior — simpler animation or disabled entirely
  +-- prefers-reduced-motion alternative — instant or subtle fade
```

### Quick Reference: Animation to Approach Mapping

| Animation | Best Approach | JS Cost |
|-----------|--------------|---------|
| Fade in on scroll | IO + CSS | ~500B |
| Slide up reveal | IO + CSS | ~500B |
| Stagger grid items | IO + CSS vars | ~500B |
| Hover card lift | CSS only | 0 |
| Button press effect | CSS only | 0 |
| Loading skeleton | CSS only | 0 |
| Marquee/ticker | CSS only | 0 |
| Simple parallax | CSS scroll-driven | 0 |
| Scroll progress bar | CSS scroll-driven | 0 |
| Text gradient | CSS only | 0 |
| Image clip reveal | IO + CSS | ~500B |
| Complex hero sequence | GSAP lazy | ~24KB |
| Word-by-word reveal | GSAP lazy | ~24KB |
| Number counter | GSAP lazy | ~24KB |
| Scroll-linked parallax | GSAP + ST lazy | ~28KB |
| Horizontal scroll | GSAP + ST lazy | ~28KB |
| Pinned sections | GSAP + ST lazy | ~28KB |
| Magnetic cursor | GSAP lazy | ~24KB |
| Smooth accordion | GSAP lazy | ~24KB |

---

## 9. EASING REFERENCE

### GSAP Easing Functions

| GSAP Easing | CSS Equivalent | Best For |
|-------------|---------------|----------|
| `"power1.out"` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Subtle deceleration |
| `"power2.out"` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Standard entrances |
| `"power3.out"` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic entrances |
| `"power4.out"` | `cubic-bezier(0.08, 0.82, 0.17, 1)` | Very snappy entrances |
| `"power2.in"` | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` | Exits |
| `"power2.inOut"` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | State changes |
| `"back.out(1.7)"` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot |
| `"elastic.out(1, 0.3)"` | No CSS equivalent | Bouncy, fun |
| `"none"` (linear) | `linear` | Scrub animations |

### When to Use Each

- **Entrances** (elements appearing): `ease-out` / `power2.out` / `power3.out`
- **Exits** (elements leaving): `ease-in` / `power2.in`
- **State changes** (toggle, switch): `ease-in-out` / `power2.inOut`
- **Scroll-linked** (scrub): `"none"` / `linear` — ALWAYS linear for scrub
- **Playful interactions** (buttons, hover): `back.out` for overshoot
- **Elastic/bouncy** (attention-grabbing): `elastic.out` — use sparingly

### CSS Custom Easing

```css
:root {
  --ease-out-smooth: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-out-dramatic: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.element {
  transition: transform 0.5s var(--ease-out-smooth);
}
```

---

## 10. RESPONSIVE ANIMATION

### Disable Heavy Animations on Mobile

```javascript
/* GSAP matchMedia — the correct way */
var mm = gsap.matchMedia();

mm.add({
  isDesktop: '(min-width: 768px)',
  isMobile: '(max-width: 767px)',
  reduceMotion: '(prefers-reduced-motion: reduce)'
}, function(context) {
  var conditions = context.conditions;

  if (conditions.reduceMotion) {
    /* Show all content immediately, no animation */
    return;
  }

  if (conditions.isDesktop) {
    /* Full animations: parallax, stagger, complex timelines */
    gsap.from('.hero-content > *', {
      opacity: 0,
      y: 40,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  if (conditions.isMobile) {
    /* Simpler: just fade, no transform, shorter duration */
    gsap.from('.hero-content > *', {
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }
});
```

### CSS-Only Responsive Animation

```css
/* Full animation on desktop */
[data-animate="fade-up"] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Simplified on mobile — shorter distance, faster */
@media (max-width: 767px) {
  [data-animate="fade-up"] {
    transform: translateY(15px);
    transition-duration: 0.4s;
  }
}

/* No hover animations on touch devices */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: none;
  }
}
```

### prefers-reduced-motion Implementation (MANDATORY)

```css
/* CSS approach — override all animations */
@media (prefers-reduced-motion: reduce) {
  [data-animate],
  [data-animate-stagger] > * {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
    animation: none !important;
  }
}
```

```javascript
/* JS approach — check before initializing */
function shouldAnimate() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Use it */
if (shouldAnimate()) {
  initGSAPAnimations();
} else {
  /* Make all elements visible without animation */
  document.querySelectorAll('[data-animate]').forEach(function(el) {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}
```

### Performance Budgets Per Device

| Device Tier | Max Animation JS | Max Simultaneous Animations | Parallax |
|------------|-----------------|---------------------------|----------|
| Desktop (high-end) | 30KB gz | 20+ | Yes |
| Desktop (low-end) | 30KB gz | 10 | Simple only |
| Tablet | 30KB gz | 8 | No |
| Mobile (high-end) | 20KB gz | 5 | No |
| Mobile (low-end) | 0 (CSS only) | 3 | No |

---

## 11. SHOPIFY-SPECIFIC INTEGRATION

### Section-Scoped Animations with Cleanup

```javascript
/* Pattern: Initialize + Cleanup per Shopify section */
(function() {
  var sectionId = '{{ section.id }}';
  var container = document.getElementById('shopify-section-' + sectionId);
  if (!container) return;

  var animations = [];
  var scrollTriggers = [];

  function init() {
    if (!shouldAnimate()) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true
      }
    });
    
    tl.from(container.querySelectorAll('.animate-item'), {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6
    });

    animations.push(tl);
    scrollTriggers.push(tl.scrollTrigger);
  }

  function cleanup() {
    animations.forEach(function(a) { a.kill(); });
    scrollTriggers.forEach(function(st) { st.kill(); });
    animations = [];
    scrollTriggers = [];
  }

  init();

  /* Shopify Theme Editor events */
  document.addEventListener('shopify:section:unload', function(e) {
    if (e.detail.sectionId === sectionId) cleanup();
  });

  document.addEventListener('shopify:section:load', function(e) {
    if (e.detail.sectionId === sectionId) {
      cleanup();
      init();
    }
  });
})();
```

### Theme Editor Compatibility — Detect `Shopify.designMode`

```javascript
/* In Theme Editor, show everything immediately — no animation delays */
if (window.Shopify && window.Shopify.designMode) {
  document.querySelectorAll('[data-animate]').forEach(function(el) {
    el.classList.add('is-visible');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  /* Do NOT initialize GSAP or ScrollTrigger in design mode */
  return;
}
```

```liquid
{%- comment -%} Conditional animation loading {%- endcomment -%}
{%- unless request.design_mode -%}
  {% render 'animation-observer' %}
  {%- if section.settings.enable_advanced_animation -%}
    {% render 'gsap-loader',
      target_selector: '#shopify-section-{{ section.id }}',
      plugins: 'ScrollTrigger',
      callback: 'initSection_{{ section.id | replace: "-", "_" }}'
    %}
  {%- endif -%}
{%- endunless -%}
```

### Dynamic Section Loading — Refresh After Reorder

```javascript
/* Listen for all section events and refresh animations */
['shopify:section:load', 'shopify:section:reorder', 'shopify:section:select'].forEach(function(event) {
  document.addEventListener(event, function() {
    /* Re-observe new [data-animate] elements */
    if (window.__animObserver) {
      document.querySelectorAll('[data-animate]:not(.is-visible)').forEach(function(el) {
        window.__animObserver.observe(el);
      });
    }

    /* Refresh GSAP ScrollTrigger positions */
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(function() {
        ScrollTrigger.refresh();
      }, 300);
    }
  });
});
```

### Liquid + JS Data Passing for Animation Config

```liquid
{%- comment -%} Pass section settings to JS via data attributes {%- endcomment -%}
<section
  id="section-{{ section.id }}"
  class="animated-section"
  data-animate-type="{{ section.settings.animation_type }}"
  data-animate-duration="{{ section.settings.animation_duration }}"
  data-animate-delay="{{ section.settings.animation_delay }}"
  data-animate-stagger="{{ section.settings.animation_stagger }}"
  {% unless section.settings.enable_animation %}data-animate-disabled{% endunless %}
>
  {{ section_content }}
</section>
```

```javascript
/* Read settings from data attributes */
function initSectionAnimation(el) {
  if (el.hasAttribute('data-animate-disabled')) return;

  var type = el.getAttribute('data-animate-type') || 'fade-up';
  var duration = parseFloat(el.getAttribute('data-animate-duration') || '0.6');
  var delay = parseFloat(el.getAttribute('data-animate-delay') || '0');
  var stagger = parseFloat(el.getAttribute('data-animate-stagger') || '0.1');

  /* Build animation based on settings */
  var props = { opacity: 0, duration: duration, delay: delay, ease: 'power2.out' };

  if (type === 'fade-up') props.y = 30;
  else if (type === 'fade-down') props.y = -30;
  else if (type === 'slide-left') props.x = 40;
  else if (type === 'slide-right') props.x = -40;
  else if (type === 'scale') props.scale = 0.9;

  gsap.from(el.querySelectorAll('.animate-item'), Object.assign(props, {
    stagger: stagger,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true
    }
  }));
}
```

### Section Schema Settings for Animation Controls

```liquid
{%- comment -%} snippets/animation-settings.liquid — Reusable schema settings {%- endcomment -%}
{%- comment -%}
  Include these settings in any section schema.
  Usage: Add to your section's {% schema %} settings array.
{%- endcomment -%}
```

```json
{
  "name": "Animation",
  "settings": [
    {
      "type": "checkbox",
      "id": "enable_animation",
      "label": "Enable scroll animation",
      "default": true
    },
    {
      "type": "select",
      "id": "animation_type",
      "label": "Animation style",
      "options": [
        { "value": "fade-up", "label": "Fade up" },
        { "value": "fade-down", "label": "Fade down" },
        { "value": "slide-left", "label": "Slide from right" },
        { "value": "slide-right", "label": "Slide from left" },
        { "value": "scale", "label": "Scale up" },
        { "value": "fade", "label": "Fade only" }
      ],
      "default": "fade-up"
    },
    {
      "type": "range",
      "id": "animation_duration",
      "label": "Animation speed (seconds)",
      "min": 0.2,
      "max": 1.5,
      "step": 0.1,
      "default": 0.6,
      "unit": "s"
    },
    {
      "type": "range",
      "id": "animation_delay",
      "label": "Animation delay (seconds)",
      "min": 0,
      "max": 1,
      "step": 0.1,
      "default": 0,
      "unit": "s"
    },
    {
      "type": "range",
      "id": "animation_stagger",
      "label": "Stagger between items (seconds)",
      "min": 0,
      "max": 0.3,
      "step": 0.02,
      "default": 0.1,
      "unit": "s"
    }
  ]
}
```

---

## 12. ANIMATION QA CHECKLIST

Run through this checklist before shipping ANY animation work:

### Performance
- [ ] No CLS from animations — all animated elements have explicit dimensions or `aspect-ratio`
- [ ] No LCP delay — hero animations start AFTER LCP, not before (use `requestIdleCallback`)
- [ ] GSAP loaded lazily via Intersection Observer or dynamic import — NOT render-blocking
- [ ] Total animation JS < 30KB gzipped (GSAP + ScrollTrigger + custom code)
- [ ] Only `transform` and `opacity` are animated — no layout properties
- [ ] `will-change` is applied temporarily, not permanently
- [ ] No layout thrashing — check with Chrome DevTools Performance panel
- [ ] Mobile performance tested — no frame drops below 50fps

### Accessibility
- [ ] `prefers-reduced-motion: reduce` is respected — animations disabled or minimal
- [ ] Animated content is still accessible with animations off
- [ ] No flashing or strobing effects (WCAG 2.3.1)
- [ ] Focus states are visible and not hidden by animations

### Shopify Theme Editor
- [ ] Animations work correctly in Theme Editor preview
- [ ] `Shopify.designMode` is detected — show content immediately in editor
- [ ] Section load/unload events trigger proper init/cleanup
- [ ] Section reorder triggers `ScrollTrigger.refresh()`
- [ ] No console errors in Theme Editor

### Cross-Browser
- [ ] Tested in Chrome, Safari, Firefox, Edge
- [ ] CSS scroll-driven animations have `@supports` fallback
- [ ] Intersection Observer has fallback for very old browsers (if needed)
- [ ] iOS Safari: no jank from `position: fixed` parallax

### Memory & Cleanup
- [ ] GSAP instances are killed when sections are removed (`kill()`)
- [ ] ScrollTrigger instances are killed on section unload
- [ ] No lingering event listeners after section removal
- [ ] Observers are disconnected after triggering (`observer.disconnect()` or `observer.unobserve()`)

---

## 13. COMMON ANIMATION SNIPPETS

### Ready-to-Use Snippets Summary

**`snippets/animation-observer.liquid`** (Section 4)
- Reusable Intersection Observer that adds `.is-visible` class to `[data-animate]` elements
- Supports `data-animate-delay` for custom delays
- Handles Shopify `shopify:section:load` event
- Respects `prefers-reduced-motion`
- ~500 bytes of JS

**`snippets/gsap-loader.liquid`** (Section 5)
- Lazy-loads GSAP + optional plugins when a target element enters viewport
- Accepts `target_selector`, `plugins`, and `callback` parameters
- Loads scripts sequentially, registers plugins, then calls your init function
- Respects `prefers-reduced-motion` — skips loading entirely
- Uses 200px rootMargin for preloading

**`snippets/animation-settings.liquid`** (Section 11)
- Reusable section schema JSON for animation controls
- Includes: enable/disable toggle, animation type, duration, delay, stagger
- Copy into any section's `{% schema %}` settings array

### Quick Include Pattern

```liquid
{%- comment -%} In any section file: {%- endcomment -%}

{%- if section.settings.enable_animation -%}
  {%- unless request.design_mode -%}
    {% render 'animation-observer' %}
  {%- endunless -%}
{%- endif -%}

{%- comment -%} Elements get data attributes {%- endcomment -%}
<div
  {% if section.settings.enable_animation %}
    data-animate="{{ section.settings.animation_type | default: 'fade-up' }}"
  {% endif %}
>
  Content here
</div>
```

---

## 14. GOLDEN RULES

1. **CSS first, JS last.** If CSS can do it, NEVER use JavaScript. CSS transitions and animations are free.

2. **Only animate `transform` and `opacity`.** These are the only two properties that are GPU-composited and skip layout/paint. Everything else causes jank.

3. **NEVER load GSAP globally.** Load it lazily, per-section, only when the section enters the viewport. Use Intersection Observer to trigger the load.

4. **ALWAYS respect `prefers-reduced-motion`.** This is not optional. It is a legal accessibility requirement in many jurisdictions. Every animation you write MUST have a reduced-motion alternative.

5. **Hero animations start AFTER LCP.** Use `requestIdleCallback` or wait for `load` event. NEVER let animation JavaScript delay the Largest Contentful Paint.

6. **Animated elements MUST have explicit dimensions.** An element animating from `opacity: 0` still occupies space. Without explicit size, it can cause Cumulative Layout Shift.

7. **Disconnect observers after they fire.** Use `once: true` in ScrollTrigger and `observer.unobserve(el)` in Intersection Observer. Never leave observers running after their job is done.

8. **Kill GSAP instances on cleanup.** When a Shopify section is unloaded, kill all associated ScrollTrigger and GSAP instances. Memory leaks from orphaned animations are a real problem.

9. **Test on real mobile devices.** DevTools throttling is not enough. Real devices have different GPU capabilities, memory constraints, and touch behaviors. If it drops below 50fps on a mid-range phone, simplify it.

10. **Use `ease-out` for entrances, `ease-in` for exits.** This matches natural physics — objects decelerate as they arrive, accelerate as they leave. NEVER use `linear` for visual animations (only for scrub).

11. **Stagger delays should be 60-120ms.** Less than 60ms is imperceptible. More than 150ms feels sluggish. The sweet spot is 80-100ms between items.

12. **Animation duration should be 300-700ms.** Under 200ms feels instant/jarring. Over 1000ms feels sluggish. Micro-interactions: 150-250ms. Reveals: 400-700ms.

13. **Detect `Shopify.designMode` and skip animations.** Theme Editor becomes unusable when animations fire during editing. Show all content immediately in design mode.

14. **Use `@supports` for CSS scroll-driven animations.** They are powerful and zero-JS, but not universally supported yet. Always provide an Intersection Observer fallback.

15. **Measure, do not guess.** Use Chrome DevTools Performance panel, Lighthouse, and real CrUX data. If an animation causes CLS > 0, LCP delay, or INP > 200ms, fix it or remove it. Pretty animations that hurt conversions are not pretty.
