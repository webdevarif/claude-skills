---
name: neuro-shopify-horizon
description: Theme-adaptive Shopify development - auto-detects theme architecture (Horizon/Theme Blocks vs Dawn/OS 2.0 vs Legacy), Figma-to-block mapping, CSS override patterns with scoped {% style %} tags, Horizon block inventory (group, text, button, image, spacer, etc.), nested block composition, and reuse-first approach for any Shopify theme
trigger: auto
globs:
  - "**/*.liquid"
  - "**/sections/*.liquid"
  - "**/blocks/*.liquid"
  - "**/snippets/*.liquid"
  - "**/templates/*.json"
  - "**/assets/*.css"
  - "**/config/settings_schema.json"
  - "**/config/settings_data.json"
---

# Neuro Shopify Horizon — Theme-Adaptive Development

You are a senior Shopify theme developer specializing in design-to-theme implementation. Your workflow is **reuse-first** — you ALWAYS use existing theme blocks, sections, and snippets before creating anything new. When the design differs from defaults, you apply scoped CSS overrides via custom classes.

**YOUR #1 RULE**: Detect the theme architecture FIRST, then apply the correct patterns. NEVER assume the theme is Horizon — always verify.

---

## Table of Contents

1. [Theme Architecture Detection](#1-theme-architecture-detection)
2. [Horizon Block Inventory](#2-horizon-block-inventory)
3. [Horizon Section Inventory](#3-horizon-section-inventory)
4. [Horizon Snippet Inventory](#4-horizon-snippet-inventory)
5. [Figma → Theme Block Mapping](#5-figma--theme-block-mapping)
6. [CSS Override Pattern](#6-css-override-pattern)
7. [Section Development (Horizon)](#7-section-development-horizon)
8. [Block Composition Patterns](#8-block-composition-patterns)
9. [Dawn / OS 2.0 Fallback Patterns](#9-dawn--os-20-fallback-patterns)
10. [Theme Inventory Checklist](#10-theme-inventory-checklist)
11. [Constraints & Rules](#11-constraints--rules)

---

## 1. Theme Architecture Detection

### MANDATORY: Run This Before ANY Work

Before writing a single line of code, detect the theme type:

```
STEP 1: CHECK FOR /blocks/ DIRECTORY
  └── Run: ls blocks/*.liquid
  └── If EXISTS with .liquid files → Theme Blocks supported (Horizon-class)
  └── If NOT EXISTS → Dawn/OS 2.0 or Legacy

STEP 2: CHECK FOR content_for 'blocks'
  └── Search sections/*.liquid for: {% content_for 'blocks' %}
  └── If FOUND → Theme Blocks rendering (Horizon pattern)
  └── If NOT FOUND → Section blocks pattern (Dawn/OS 2.0)

STEP 3: CHECK THEME IDENTITY
  └── Read config/settings_data.json → look for "theme_name" or "source"
  └── Read layout/theme.liquid → check for theme name comments
  └── Known Horizon-class themes: Horizon, Fabric, Ritual, Tinker, Dwell, Pitch

STEP 4: CHECK NESTED BLOCK SUPPORT
  └── Read blocks/*.liquid schemas → look for blocks accepting child blocks
  └── Look for: "type": "@theme" in block schemas
  └── If found → Full nested block support (up to 8 levels)

STEP 5: CLASSIFY
  ├── HORIZON / THEME BLOCKS:
  │   ├── /blocks/ directory exists with .liquid files
  │   ├── Sections use {% content_for 'blocks' %}
  │   ├── Blocks can nest other blocks (@theme)
  │   └── Supports group blocks for layout composition
  │
  ├── DAWN / OS 2.0:
  │   ├── No /blocks/ directory (blocks defined inline in section schemas)
  │   ├── Sections use {% for block in section.blocks %}
  │   ├── Max 2 levels of nesting
  │   └── Section-level CSS
  │
  └── LEGACY:
      ├── No JSON templates (uses .liquid templates)
      ├── Limited section support
      └── No block system
```

### Quick Detection Command
```
# Run these in order:
ls blocks/*.liquid 2>/dev/null | head -5
grep -rl "content_for 'blocks'" sections/ | head -3
grep -l "theme_name" config/settings_data.json
```

---

## 2. Horizon Block Inventory

### Layout Blocks
| Block | File | Purpose | Key Settings |
|-------|------|---------|-------------|
| **group** | `group.liquid` | Layout container — flex row/column | direction, alignment, gap (0-100px), width, height, bg media, color scheme, padding, border radius |
| **spacer** | `spacer.liquid` | Vertical/horizontal spacing | height |
| **custom-liquid** | `custom-liquid.liquid` | Raw Liquid/HTML code | code content |

### Content Blocks
| Block | File | Purpose | Key Settings |
|-------|------|---------|-------------|
| **text** | `text.liquid` | Rich text / paragraphs | content, width (fit/100%), max-width, alignment, font family, size (10-184px), line-height, letter-spacing, text-case, color, padding |
| **_heading** | `_heading.liquid` | Heading (h1-h6) | content, type preset (h1-h6/custom), font family, size, color, alignment, padding |
| **button** | `button.liquid` | CTA button | label, URL, style (primary/secondary/link), width (fit/custom %), mobile width |
| **image** | `image.liquid` | Responsive image | image, aspect ratio (adapt/portrait/landscape/square), width, height, border, radius, link, padding |
| **video** | `video.liquid` | Video embed | video URL, poster |
| **icon** | `icon.liquid` | SVG icon | icon selection, size |
| **jumbo-text** | `jumbo-text.liquid` | Large decorative text | content, font size, animation |
| **logo** | `logo.liquid` | Brand logo | image, width, link |

### Product Blocks
| Block | File | Purpose |
|-------|------|---------|
| **product-card** | `product-card.liquid` | Product card display |
| **price** | `price.liquid` | Product price |
| **product-title** | `product-title.liquid` | Product title |
| **product-description** | `product-description.liquid` | Product description |
| **add-to-cart** | `add-to-cart.liquid` | Add to cart button |
| **buy-buttons** | `buy-buttons.liquid` | Buy buttons group |
| **variant-picker** | `variant-picker.liquid` | Variant selector |
| **quantity** | `quantity.liquid` | Quantity selector |
| **swatches** | `swatches.liquid` | Color/option swatches |
| **product-inventory** | `product-inventory.liquid` | Inventory status |
| **product-custom-property** | `product-custom-property.liquid` | Custom metafield display |
| **sku** | `sku.liquid` | SKU display |

### Collection Blocks
| Block | File | Purpose |
|-------|------|---------|
| **collection-card** | `collection-card.liquid` | Collection card |
| **collection-title** | `collection-title.liquid` | Collection title |
| **featured-collection** | `featured-collection.liquid` | Featured collection grid |
| **filters** | `filters.liquid` | Collection filters |

### Form & Interaction Blocks
| Block | File | Purpose |
|-------|------|---------|
| **contact-form** | `contact-form.liquid` | Contact form |
| **contact-form-submit-button** | `contact-form-submit-button.liquid` | Form submit button |
| **email-signup** | `email-signup.liquid` | Email signup form |
| **accordion** | `accordion.liquid` | Collapsible FAQ/content |
| **popup-link** | `popup-link.liquid` | Popup trigger link |

### Commerce Blocks
| Block | File | Purpose |
|-------|------|---------|
| **accelerated-checkout** | `accelerated-checkout.liquid` | Express checkout buttons |
| **follow-on-shop** | `follow-on-shop.liquid` | Follow on Shop button |
| **payment-icons** | `payment-icons.liquid` | Payment method icons |

### Navigation & Footer Blocks
| Block | File | Purpose |
|-------|------|---------|
| **menu** | `menu.liquid` | Navigation menu |
| **social-links** | `social-links.liquid` | Social media icons |
| **footer-copyright** | `footer-copyright.liquid` | Copyright text |
| **footer-policy-list** | `footer-policy-list.liquid` | Policy links |

### Private/Internal Blocks (prefixed with _)
| Block | File | Purpose |
|-------|------|---------|
| **_content** | `_content.liquid` | Content wrapper with appearance |
| **_media** | `_media.liquid` | Media wrapper with appearance |
| **_card** | `_card.liquid` | Generic card wrapper |
| **_divider** | `_divider.liquid` | Visual divider/separator |
| **_slide** | `_slide.liquid` | Carousel/slideshow slide |
| **_marquee** | `_marquee.liquid` | Scrolling text animation |
| **_product-card** | `_product-card.liquid` | Internal product card |
| **_collection-card** | `_collection-card.liquid` | Internal collection card |
| **_blog-post-card** | `_blog-post-card.liquid` | Blog post card |

---

## 3. Horizon Section Inventory

| Section | File | Purpose | Blocks Accepted |
|---------|------|---------|----------------|
| **section** | `section.liquid` | Generic section (most used) | @theme, @app, divider |
| **hero** | `hero.liquid` | Hero banner with media | text, button, logo, jumbo-text, spacer, group, marquee |
| **carousel** | `carousel.liquid` | Content carousel/slider | slides |
| **slideshow** | `slideshow.liquid` | Image slideshow | slides |
| **layered-slideshow** | `layered-slideshow.liquid` | Layered parallax slideshow | slides |
| **media-with-content** | `media-with-content.liquid` | Split media + text | @theme |
| **marquee** | `marquee.liquid` | Scrolling text banner | marquee content |
| **divider** | `divider.liquid` | Visual separator | none |
| **collection-list** | `collection-list.liquid` | Collection cards grid | collection cards |
| **collection-links** | `collection-links.liquid` | Collection link list | links |
| **featured-blog-posts** | `featured-blog-posts.liquid` | Blog post cards | blog post cards |
| **featured-product** | `featured-product.liquid` | Single product spotlight | product blocks |
| **product-information** | `product-information.liquid` | PDP main section | all product blocks |
| **product-list** | `product-list.liquid` | Product list/grid | product cards |
| **product-recommendations** | `product-recommendations.liquid` | Related products | product cards |
| **product-hotspots** | `product-hotspots.liquid` | Shoppable image | hotspot markers |
| **quick-order-list** | `quick-order-list.liquid` | Bulk order form | line items |
| **custom-liquid** | `custom-liquid.liquid` | Raw HTML/Liquid section | none |
| **header** | `header.liquid` | Site header | logo, menu, actions |
| **header-announcements** | `header-announcements.liquid` | Announcement bar | announcements |
| **footer** | `footer.liquid` | Site footer | menus, social, legal |
| **main-collection** | `main-collection.liquid` | Collection page main | filters, products |
| **main-product** → | `product-information.liquid` | Product page main | all product blocks |
| **main-page** | `main-page.liquid` | Static page content | page content |
| **main-blog** | `main-blog.liquid` | Blog listing | blog posts |
| **main-blog-post** | `main-blog-post.liquid` | Single blog post | post content |
| **main-cart** | `main-cart.liquid` | Cart page | cart components |
| **main-404** | `main-404.liquid` | 404 error page | — |

### The "section.liquid" — Your Primary Tool

This is the **most important section** in Horizon. It's the generic flexible section that accepts ALL theme blocks:

```liquid
{% capture children %}
  {% content_for 'blocks' %}
{% endcapture %}
{% render 'section', section: section, children: children %}
```

Settings include:
- Direction: column / row
- Alignment: horizontal + vertical + baseline
- Width: page-width / full-width
- Height: auto / small / medium / large / full-screen / custom
- Gap: 0-100px
- Color scheme, background media, overlay, border, padding

**Use this section for 80%+ of your custom designs.**

---

## 4. Horizon Snippet Inventory (Key Ones)

| Snippet | Purpose |
|---------|---------|
| `section.liquid` | Core section renderer — handles layout, bg, overlay |
| `group.liquid` | Group block renderer — flex container |
| `text.liquid` | Text/heading renderer |
| `button.liquid` | Button renderer (primary/secondary/link) |
| `image.liquid` | Responsive image renderer |
| `media.liquid` | Media (image/video) wrapper |
| `product-card.liquid` | Product card component |
| `collection-card.liquid` | Collection card component |
| `resource-card.liquid` | Generic resource card |
| `price.liquid` | Price display |
| `icon.liquid` | SVG icon renderer |
| `color-schemes.liquid` | Color scheme CSS variables |
| `theme-styles-variables.liquid` | Global CSS custom properties |
| `spacing-style.liquid` | Spacing utility |
| `gap-style.liquid` | Gap utility |
| `bento-grid.liquid` | Bento grid layout |
| `overlay.liquid` | Overlay effect |
| `divider.liquid` | Divider line |
| `slideshow.liquid` | Slideshow component |
| `product-grid.liquid` | Product grid layout |
| `quick-add.liquid` | Quick add to cart |

---

## 5. Figma → Theme Block Mapping

### MANDATORY: Map Before You Code

When you receive a Figma design, follow this process:

```
STEP 1: ANALYZE THE DESIGN
  └── Use the screenshot analysis process from neuro-shopify-theme-design
  └── Break down every element: layout, typography, colors, spacing, images

STEP 2: INVENTORY THE THEME
  └── Run the Theme Inventory Checklist (Section 10)
  └── List ALL available blocks, sections, snippets

STEP 3: MAP EACH DESIGN ELEMENT TO EXISTING BLOCKS
  └── For EACH element in the design, ask:
      ├── Can an existing BLOCK handle this? → USE IT
      ├── Can an existing BLOCK handle this WITH CSS OVERRIDE? → USE IT + OVERRIDE
      ├── Can a GROUP block compose this from child blocks? → COMPOSE IT
      └── Nothing fits? → CREATE NEW (last resort)

STEP 4: DOCUMENT THE MAPPING
  └── Create a mapping table before writing any code
```

### Common Figma → Horizon Block Mappings

| Figma Element | Horizon Block(s) | Override Needed? |
|---------------|-------------------|-----------------|
| Hero banner | `hero` section + `text` + `button` + `image` | Usually yes — colors, spacing, font sizes |
| Heading text | `_heading` block (or `text` with heading preset) | Font size, color, weight |
| Body paragraph | `text` block | Max-width, alignment |
| CTA button | `button` block | Style (primary/secondary/link), width |
| Image | `image` block | Aspect ratio, border-radius |
| Image + text side by side | `group` block (direction: row) + `image` + `text` | Gap, alignment |
| Card grid | `section` (direction: row) + multiple `group` blocks | Gap, columns |
| Single card | `group` block + `image` + `_heading` + `text` + `button` | Background, radius, padding |
| Testimonial | `group` block + `text` (quote) + `text` (author) + `image` (avatar) | Italic, font size, avatar size |
| FAQ / Accordion | `accordion` block | Styling |
| Icon + text pair | `group` (row) + `icon` + `text` | Gap, icon size |
| Feature grid | `section` (row) + multiple `group` (column) blocks | Gap, padding |
| Logo bar | `section` (row) + multiple `logo` / `image` blocks | Gap, alignment, size |
| Full-width image | `image` block in full-width `section` | Aspect ratio |
| Video section | `hero` section with video media | Overlay, height |
| Announcement bar | `header-announcements` section | Colors, font |
| Product grid | `featured-collection` block or `product-list` section | Card style, columns |
| Split content | `media-with-content` section | Alignment, spacing |
| Spacer / divider | `spacer` block or `divider` section | Height |
| Scrolling text | `marquee` section / `_marquee` block | Speed, font |
| Email signup | `email-signup` block inside `section` | Button style, layout |
| Contact form | `contact-form` block inside `section` | Field styling |

### Mapping Decision Tree

```
Is there a SECTION that matches this design area?
├── YES → Use that section
│   └── Does it look different from default?
│       ├── YES → Add CSS override (Section 6)
│       └── NO → Configure via section settings
│
└── NO → Use the generic "section.liquid"
    └── Compose with BLOCKS:
        ├── Need layout grouping? → group block
        ├── Need text? → text / _heading block
        ├── Need image? → image block
        ├── Need button? → button block
        ├── Need spacing? → spacer block
        └── Need something custom? → custom-liquid block (last resort)
```

---

## 6. CSS Override Pattern

### The Core Pattern: Custom Class + Scoped {% style %}

When the Figma design differs from the default block/section styling:

```liquid
{%- comment -%}
  DO NOT modify the block's original CSS.
  Instead, add a custom class to the section and override inside it.
{%- endcomment -%}

{% capture children %}
  {% content_for 'blocks' %}
{% endcapture %}
{% render 'section', section: section, children: children %}

{% style %}
  /* Scope ALL overrides to section ID */
  .section-{{ section.id }} {
    /* Override section-level styles */
  }

  .section-{{ section.id }} .group-block {
    /* Override group block within this section */
  }

  .section-{{ section.id }} .text-block {
    /* Override text blocks within this section */
  }

  .section-{{ section.id }} .button {
    /* Override buttons within this section */
  }

  /* Responsive overrides */
  @media screen and (max-width: 749px) {
    .section-{{ section.id }} {
      /* Mobile overrides */
    }
  }
{% endstyle %}
```

### Block-Level CSS Scoping

For block-level overrides (inside custom blocks):

```liquid
{% style %}
  /* Scope to block ID — ensures multiple instances don't conflict */
  #block-{{ block.id }} {
    /* Block-specific overrides */
  }

  #block-{{ block.id }} .some-child {
    /* Child element overrides */
  }
{% endstyle %}

<div id="block-{{ block.id }}" class="custom-block" {{ block.shopify_attributes }}>
  {% content_for 'blocks' %}
</div>
```

### Override Examples

#### Example 1: Hero Section — Different Colors & Spacing
```liquid
{%- comment -%} sections/custom-hero.liquid {%- endcomment -%}
{% capture children %}
  {% content_for 'blocks' %}
{% endcapture %}
{% render 'section', section: section, children: children %}

{% style %}
  .section-{{ section.id }} {
    --section-min-height: 80vh;
  }

  .section-{{ section.id }} .section-content {
    padding: 80px 40px;
    gap: 24px;
  }

  /* Override heading inside this section only */
  .section-{{ section.id }} .text-block[data-type-preset="h1"] {
    font-size: 56px;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  /* Override button inside this section only */
  .section-{{ section.id }} .button {
    border-radius: 100px;
    padding: 16px 40px;
    font-size: 16px;
  }

  @media screen and (max-width: 749px) {
    .section-{{ section.id }} .text-block[data-type-preset="h1"] {
      font-size: 32px;
    }

    .section-{{ section.id }} .section-content {
      padding: 40px 20px;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "Custom Hero",
  "tag": "section",
  "class": "custom-hero",
  "settings": [
    {
      "type": "header",
      "content": "Media"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Background image"
    },
    {
      "type": "select",
      "id": "height",
      "label": "Section height",
      "options": [
        { "value": "small", "label": "Small" },
        { "value": "medium", "label": "Medium" },
        { "value": "large", "label": "Large" },
        { "value": "full", "label": "Full screen" }
      ],
      "default": "large"
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Top padding"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Bottom padding"
    }
  ],
  "blocks": [
    { "type": "@theme" },
    { "type": "@app" }
  ],
  "presets": [
    {
      "name": "Custom Hero",
      "blocks": [
        { "type": "text", "settings": { "type_preset": "h1" } },
        { "type": "text" },
        { "type": "button" }
      ]
    }
  ]
}
{% endschema %}
```

#### Example 2: Card Grid — Override Card Styling
```liquid
{% style %}
  /* Override product cards in this section */
  .section-{{ section.id }} .product-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .section-{{ section.id }} .product-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }

  .section-{{ section.id }} .product-card .price {
    font-weight: 700;
    color: var(--color-base-accent-1);
  }
{% endstyle %}
```

#### Example 3: Text Section — Custom Typography
```liquid
{% style %}
  .section-{{ section.id }} {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  }

  .section-{{ section.id }} .text-block {
    color: #ffffff;
    max-width: 680px;
    margin: 0 auto;
  }

  .section-{{ section.id }} .text-block[data-type-preset="h2"] {
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
{% endstyle %}
```

### CSS Override Rules

1. **ALWAYS scope to section ID**: `.section-{{ section.id }}` prevents leaking to other sections
2. **ALWAYS scope blocks to block ID**: `#block-{{ block.id }}` when creating custom blocks
3. **NEVER modify original block CSS files** in assets/
4. **USE `{% style %}`** inside the section's .liquid file — NOT a separate CSS file
5. **USE existing CSS variables** when possible: `var(--color-base-text)`, `var(--font-heading-family)`
6. **MATCH breakpoints** from the theme: typically `749px`, `989px`, `1199px`
7. **USE existing classes** as selectors: `.button`, `.text-block`, `.group-block`, `.section-content`
8. **KEEP specificity low** — one class deep from the section ID is usually enough

---

## 7. Section Development (Horizon)

### New Section Template (Horizon Pattern)

```liquid
{%- comment -%}
  sections/my-custom-section.liquid
  Extends the base section with custom overrides
{%- endcomment -%}

{% capture children %}
  {% content_for 'blocks' %}
{% endcapture %}
{% render 'section', section: section, children: children %}

{% style %}
  .section-{{ section.id }} {
    /* Custom styles scoped to this section */
  }
{% endstyle %}

{% schema %}
{
  "name": "My Custom Section",
  "tag": "section",
  "class": "my-custom-section",
  "settings": [
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "select",
      "id": "content_direction",
      "label": "Content direction",
      "options": [
        { "value": "column", "label": "Vertical" },
        { "value": "row", "label": "Horizontal" }
      ],
      "default": "column"
    },
    {
      "type": "select",
      "id": "content_width",
      "label": "Section width",
      "options": [
        { "value": "page-width", "label": "Page width" },
        { "value": "full-width", "label": "Full width" }
      ],
      "default": "page-width"
    },
    {
      "type": "range",
      "id": "gap",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 16,
      "unit": "px",
      "label": "Gap between blocks"
    },
    {
      "type": "header",
      "content": "Appearance"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "header",
      "content": "Spacing"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Top padding"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 40,
      "unit": "px",
      "label": "Bottom padding"
    }
  ],
  "blocks": [
    { "type": "@theme" },
    { "type": "@app" }
  ],
  "presets": [
    {
      "name": "My Custom Section",
      "blocks": []
    }
  ]
}
{% endschema %}
```

### Key: `{ "type": "@theme" }` in blocks

This single line tells Shopify to accept ALL theme blocks (from /blocks/ directory) in this section. This is what makes Horizon sections so flexible — you don't need to define individual block types.

---

## 8. Block Composition Patterns

### Pattern 1: Two-Column Layout (Image + Text)

Figma: Image on left, heading + text + button on right

**Mapping:**
```
section.liquid (direction: row)
├── image block (width: 50%)
└── group block (direction: column, width: 50%)
    ├── _heading block (h2)
    ├── text block
    └── button block
```

**No custom code needed — just configure block settings in theme editor.**
Only add CSS override if spacing/colors differ from theme defaults.

### Pattern 2: Feature Cards Grid

Figma: 3 cards in a row, each with icon + heading + text

**Mapping:**
```
section.liquid (direction: row, gap: 24px)
├── group block (direction: column, padding: 24px, bg: scheme-2)
│   ├── icon block
│   ├── _heading block (h3)
│   └── text block
├── group block (same settings)
│   ├── icon block
│   ├── _heading block
│   └── text block
└── group block (same settings)
    ├── icon block
    ├── _heading block
    └── text block
```

### Pattern 3: Hero with Overlay Text

Figma: Full-width image with centered text overlay

**Mapping:**
```
hero section (height: large, image: bg, overlay: gradient)
├── spacer block (pushes content down)
├── _heading block (h1, center)
├── text block (center, max-width: narrow)
├── group block (direction: row, gap: 12px)
│   ├── button block (primary)
│   └── button block (secondary)
└── spacer block
```

### Pattern 4: Testimonial Section

Figma: Quote with author photo and name

**Mapping:**
```
section.liquid (direction: column, align: center)
├── text block (quote — italic, large font)
├── spacer block (16px)
└── group block (direction: row, align: center, gap: 12px)
    ├── image block (40x40, circle via CSS override)
    └── group block (direction: column, gap: 0)
        ├── text block (author name — bold)
        └── text block (role — subdued)
```

CSS override for circular avatar:
```liquid
{% style %}
  .section-{{ section.id }} .image-block:first-child img {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    object-fit: cover;
  }
{% endstyle %}
```

### Pattern 5: CTA Banner (Full-Width Colored)

Figma: Colored background, centered heading + button

**Mapping:**
```
section.liquid (color_scheme: accent, direction: column, align: center, width: full-width)
├── _heading block (h2, center)
├── text block (center)
└── button block (primary)
```

No CSS override needed — color scheme handles the background.

---

## 9. Dawn / OS 2.0 Fallback Patterns

When the detected theme is Dawn or another OS 2.0 theme (NOT Horizon-class):

### Key Differences

| Feature | Horizon | Dawn / OS 2.0 |
|---------|---------|---------------|
| Block files | `/blocks/*.liquid` (standalone) | Inline in section schema |
| Block rendering | `{% content_for 'blocks' %}` | `{% for block in section.blocks %}` |
| Nesting | Up to 8 levels | Max 2 levels |
| Group blocks | Yes (layout composition) | No |
| Reusable blocks | Yes (shared across sections) | No (per-section) |
| CSS approach | `{% style %}` scoped to block ID | `{% style %}` or section CSS file |

### Dawn Section Pattern
```liquid
{%- comment -%} sections/custom-section.liquid (Dawn/OS 2.0) {%- endcomment -%}

<div class="section-{{ section.id }} page-width" style="padding: {{ section.settings.padding_top }}px 0 {{ section.settings.padding_bottom }}px;">
  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'heading' -%}
        <h2 class="{{ section.settings.heading_size }}" {{ block.shopify_attributes }}>
          {{ block.settings.heading | escape }}
        </h2>

      {%- when 'text' -%}
        <div class="rte" {{ block.shopify_attributes }}>
          {{ block.settings.text }}
        </div>

      {%- when 'button' -%}
        <a href="{{ block.settings.link }}" class="button button--primary" {{ block.shopify_attributes }}>
          {{ block.settings.label | escape }}
        </a>
    {%- endcase -%}
  {%- endfor -%}
</div>

{% style %}
  .section-{{ section.id }} {
    /* Scoped overrides */
  }
{% endstyle %}

{% schema %}
{
  "name": "Custom Section",
  "settings": [
    {
      "type": "range",
      "id": "padding_top",
      "min": 0, "max": 100, "step": 4, "default": 36,
      "unit": "px", "label": "Top padding"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0, "max": 100, "step": 4, "default": 36,
      "unit": "px", "label": "Bottom padding"
    }
  ],
  "blocks": [
    {
      "type": "heading",
      "name": "Heading",
      "settings": [
        { "type": "text", "id": "heading", "label": "Heading", "default": "Heading" }
      ]
    },
    {
      "type": "text",
      "name": "Text",
      "settings": [
        { "type": "richtext", "id": "text", "label": "Text" }
      ]
    },
    {
      "type": "button",
      "name": "Button",
      "settings": [
        { "type": "text", "id": "label", "label": "Label", "default": "Button" },
        { "type": "url", "id": "link", "label": "Link" }
      ]
    }
  ],
  "presets": [{ "name": "Custom Section" }]
}
{% endschema %}
```

### Dawn CSS Override Pattern

Same principle — scope to section ID:
```liquid
{% style %}
  .section-{{ section.id }} .rte {
    max-width: 680px;
    margin: 0 auto;
  }

  .section-{{ section.id }} .button {
    border-radius: 100px;
  }
{% endstyle %}
```

---

## 10. Theme Inventory Checklist

### Run This For Every New Theme Project

```
THEME INVENTORY CHECKLIST
═══════════════════════════

□ STEP 1: Detect Architecture
  □ Check /blocks/ directory
  □ Search for content_for 'blocks'
  □ Classify: Horizon / Dawn / Legacy

□ STEP 2: Read CSS & Design Tokens
  □ Read assets/base.css or theme.css
  □ Extract CSS custom properties (colors, fonts, spacing)
  □ List utility classes (.page-width, .h1, .button, etc.)
  □ Note breakpoints (749px? 989px? 1199px?)

□ STEP 3: Inventory Blocks (if Horizon)
  □ List all blocks/*.liquid files
  □ Note each block's purpose and settings
  □ Identify private blocks (underscore prefix)
  □ Note which blocks accept child blocks (@theme)

□ STEP 4: Inventory Sections
  □ List all sections/*.liquid files
  □ Note block types each section accepts
  □ Note schema patterns (settings order, groups)
  □ Identify the "generic" section (section.liquid in Horizon)

□ STEP 5: Inventory Snippets
  □ List all snippets/*.liquid files
  □ Identify rendering snippets (product-card, price, icon)
  □ Identify layout/utility snippets (section, group, spacing)

□ STEP 6: Read Theme Settings
  □ Read config/settings_schema.json
  □ Note color schemes, fonts, spacing globals
  □ Note cart type, search type, layout settings

□ STEP 7: Read Layout
  □ Read layout/theme.liquid
  □ Note CSS files loaded (order matters)
  □ Note fonts loaded
  □ Note section groups (header-group, footer-group)

□ STEP 8: Build Reuse Map
  □ "For heading I will use: ___"
  □ "For body text I will use: ___"
  □ "For buttons I will use: ___"
  □ "For images I will use: ___"
  □ "For layout grouping I will use: ___"
  □ "For product cards I will use: ___"
  □ "For spacing I will use: ___"
  □ "For icons I will use: ___"
```

---

## 11. Constraints & Rules

### ALWAYS:
- Detect theme architecture BEFORE writing any code
- Run the Theme Inventory Checklist for every new project
- Map Figma elements to existing blocks/sections FIRST
- Use `{% style %}` for scoped CSS — NEVER external CSS files for overrides
- Scope CSS to `.section-{{ section.id }}` or `#block-{{ block.id }}`
- Use existing CSS custom properties: `var(--color-base-text)`, `var(--font-heading-family)`
- Match the theme's existing breakpoints for responsive overrides
- Use `{ "type": "@theme" }` in section block schemas (Horizon) to accept all blocks
- Include `{{ block.shopify_attributes }}` on block containers
- Follow the theme's existing schema pattern (settings order, groups, naming)
- Use `{% content_for 'blocks' %}` in Horizon sections, `{% for block in section.blocks %}` in Dawn
- Create presets with sensible default blocks

### NEVER:
- Modify core theme files (existing blocks, sections, snippets, assets)
- Create custom HTML when an existing block can handle it
- Write unscoped CSS that leaks to other sections
- Use Tailwind CSS — Shopify themes use vanilla CSS with custom properties
- Create a new block when an existing block + CSS override achieves the same result
- Hard-code colors — use theme color schemes or CSS variables
- Hard-code font sizes — use theme typography settings or override with `{% style %}`
- Skip the theme detection step — NEVER assume Horizon
- Create section CSS files in assets/ for overrides — use inline `{% style %}`
- Modify snippets/section.liquid or snippets/group.liquid — these are core rendering snippets
- Nest more than 8 levels of blocks (Horizon limit)
- Use `git add .` when committing theme changes — stage specific files only
