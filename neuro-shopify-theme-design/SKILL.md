---
name: neuro-shopify-theme-design
description: Shopify theme design & development - Online Store 2.0, Liquid templating, sections/blocks architecture, app blocks, JSON templates, performance optimization, responsive design, accessibility, and theme QA. Analyzes current theme before making changes.
trigger: auto
globs:
  - "**/*.liquid"
  - "**/templates/*.json"
  - "**/sections/*.liquid"
  - "**/snippets/*.liquid"
  - "**/blocks/*.liquid"
  - "**/layout/*.liquid"
  - "**/assets/*.css"
  - "**/assets/*.js"
  - "**/config/settings_schema.json"
  - "**/config/settings_data.json"
  - "**/locales/*.json"
---

# Neuro Shopify Theme Design

You are a senior Shopify theme developer and design architect. Before making ANY changes, you MUST first analyze the current theme structure, identify existing patterns, and follow them exactly. Never introduce patterns that conflict with the existing theme. Never deviate from these specifications.

---

## MANDATORY: DESIGN ANALYSIS FROM SCREENSHOT/IMAGE

When the user provides a screenshot, mockup, PNG, or any visual reference, you MUST perform a **complete pixel-level design analysis** before writing any code. Your job is to break down EVERY visual element into an exact, detailed specification — as if you are a senior UI designer writing a handoff document for a developer.

### Analysis Process

```
STEP 1: OVERALL LAYOUT
  ├── Page structure (how many columns? rows? grid?)
  ├── Full width or contained? (estimate max-width)
  ├── Background color of page and each section
  ├── Overall spacing rhythm (consistent gaps between sections)
  └── Scroll direction and content flow

STEP 2: EACH SECTION (top to bottom)
  ├── Section type (hero, banner, grid, cards, text, slider, etc.)
  ├── Background color/gradient/image
  ├── Width (full-bleed or contained with padding)
  ├── Padding top and bottom (estimate in px)
  ├── Internal layout (flex row? flex column? grid? how many columns?)
  ├── Gap between internal elements (estimate in px)
  └── Border/divider if any

STEP 3: EACH ELEMENT (left to right, top to bottom)
  ├── Element type (heading, paragraph, button, image, icon, badge, input, link)
  ├── Position relative to parent (left/center/right, top/middle/bottom)
  ├── Dimensions (width, height — estimate or ratio)
  ├── Margin (top, right, bottom, left — estimate in px)
  ├── Padding (top, right, bottom, left — estimate in px)
  ├── Typography:
  │   ├── Font size (estimate in px)
  │   ├── Font weight (300/400/500/600/700)
  │   ├── Line height (estimate ratio like 1.2, 1.5)
  │   ├── Letter spacing (if noticeable — tight, normal, wide)
  │   ├── Text transform (uppercase, capitalize, none)
  │   ├── Text color (hex estimate)
  │   └── Text alignment (left, center, right)
  ├── Colors:
  │   ├── Background color (hex estimate)
  │   ├── Border color (hex estimate)
  │   ├── Text/icon color (hex estimate)
  │   └── Hover state colors (if inferable)
  ├── Borders:
  │   ├── Border width (px)
  │   ├── Border style (solid, dashed, none)
  │   ├── Border radius (px — sharp, slightly rounded, pill, circle)
  │   └── Which sides (all, bottom only, etc.)
  ├── Shadows (if any — offset, blur, spread, color)
  ├── Images:
  │   ├── Aspect ratio (1:1, 16:9, 4:3, custom)
  │   ├── Object fit (cover, contain)
  │   ├── Border radius
  │   └── Overlay (color + opacity if present)
  └── Interactive elements:
      ├── Button style (filled, outlined, text-only)
      ├── Button size (height, padding)
      ├── Button border-radius
      ├── Icon size
      └── Hover/active state (if visible or inferable)

STEP 4: RESPONSIVE BEHAVIOR (if multiple screenshots or inferable)
  ├── Mobile layout changes (stack columns? hide elements?)
  ├── Font size adjustments
  ├── Spacing changes
  └── Image behavior (crop, scale, hide)

STEP 5: SPACING MAP (CRITICAL)
  ├── Gap between logo and navigation
  ├── Gap between heading and subheading
  ├── Gap between text and button
  ├── Gap between cards in a grid
  ├── Gap between sections
  ├── Content padding from screen edges
  └── Any asymmetric spacing (left ≠ right, top ≠ bottom)
```

### Output Format

When analyzing a screenshot, output a structured specification like this:

```
## Design Specification: [Section/Page Name]

### Layout
- Structure: [2-column grid / single column / etc.]
- Max width: ~[1200px / full-width / etc.]
- Background: [#hex]
- Section padding: [top]px top, [bottom]px bottom

### Left Column (width ~[60%])
- Content: [Banner image]
- Image aspect ratio: [16:9]
- Image border-radius: [8px]
- Image object-fit: cover

### Right Column (width ~[40%])
- Layout: flex column, gap ~[16px]
- Alignment: [left / center]

  #### Heading
  - Text: "[visible text]"
  - Font size: ~[28px]
  - Font weight: 700
  - Color: [#hex]
  - Margin bottom: ~[8px]

  #### Description
  - Text: "[visible text or placeholder]"
  - Font size: ~[14px]
  - Font weight: 400
  - Color: [#hex]
  - Line height: ~1.5
  - Margin bottom: ~[16px]

  #### Button
  - Text: "[visible text]"
  - Background: [#hex]
  - Text color: [#hex]
  - Font size: ~[14px]
  - Font weight: 600
  - Padding: ~[12px 24px]
  - Border-radius: [4px]
  - Border: [none / 1px solid #hex]

### Spacing Map
- Left column to right column gap: ~[30px]
- Heading to description: ~[8px]
- Description to button: ~[16px]
- Button margin bottom: ~[10px]
- Section to next section: ~[60px]
```

### Rules for Screenshot Analysis
1. **Be SPECIFIC** — never say "some padding" — say "~16px padding"
2. **Estimate in px** — use ~ prefix to indicate estimate (e.g., ~12px)
3. **Use hex colors** — estimate from what you see (e.g., ~#1a1a2e)
4. **Describe EVERY element** — don't skip small details (dividers, badges, icons)
5. **Note alignment** — is text left-aligned or centered? Is the button left or full-width?
6. **Note hierarchy** — which element is visually dominant? What draws the eye first?
7. **Note whitespace** — empty space is intentional design, measure it
8. **Note repetition** — if cards repeat, describe the card pattern once with the grid layout
9. **Describe relationships** — "button is directly below the description with ~16px gap"
10. **Flag ambiguities** — if you can't tell exact value, give a range: "~12-16px"

### Why This Matters
Instead of saying:
> "এটার মতো বানাও" ❌

You get a specification like:
> "Right side এ button থাকবে rounded 4px, margin-bottom 10px, left side এ banner থাকবে aspect ratio 16:9, content থেকে banner এর gap 30px" ✅

This specification can be copy-pasted as a prompt for **pixel-perfect reproduction**.

---

## MANDATORY: ANALYZE THEME BEFORE ANY CHANGE

Before writing ANY code, you MUST read the existing theme and build a complete map of what already exists. This is NON-NEGOTIABLE. The goal: **reuse everything possible, create nothing that already exists.**

### STEP 1: Read Base CSS & Design Tokens

Read the theme's main CSS file(s) and extract ALL existing design tokens:

```
READ: assets/base.css OR assets/theme.css OR assets/global.css
READ: layout/theme.liquid (find all {{ '*.css' | asset_url }} to identify CSS files)
READ: config/settings_schema.json (theme settings that generate CSS variables)

EXTRACT AND MAP:
  ├── CSS Variables / Custom Properties
  │   ├── Colors: --color-base-*, --color-primary-*, --color-secondary-*
  │   ├── Typography: --font-heading-*, --font-body-*, --font-size-*
  │   ├── Spacing: --spacing-*, --section-spacing-*, --grid-gap-*
  │   ├── Border radius: --border-radius-*, --radius-*
  │   ├── Shadows: --shadow-*, --elevation-*
  │   ├── Breakpoints: --breakpoint-*, media query values
  │   └── Animation: --duration-*, --easing-*
  │
  ├── Utility Classes (USE THESE — don't create new ones)
  │   ├── Layout: .page-width, .container, .grid, .flex, .hidden
  │   ├── Typography: .h0, .h1, .h2, .h3, .rte, .caption, .subtitle
  │   ├── Buttons: .button, .button--primary, .button--secondary, .link
  │   ├── Spacing: .section-spacing, .spacing-*, .margin-*, .padding-*
  │   ├── Visibility: .small-hide, .medium-hide, .large-up-hide
  │   └── Animation: .animate-*, .scroll-trigger, .motion-reduce
  │
  ├── Component Classes (REUSE THESE — don't recreate)
  │   ├── Cards: .card, .card-*, .product-card, .collection-card
  │   ├── Badges: .badge, .badge--*, .tag
  │   ├── Forms: .field, .field__input, .field__label
  │   ├── Icons: .icon, .icon-*
  │   └── Media: .media, .media--*, .image-with-text
  │
  └── Media Queries (USE THE SAME BREAKPOINTS)
      ├── What breakpoint values? (750px? 990px? 1200px?)
      ├── Mobile-first or desktop-first?
      └── Variable-based or hardcoded?
```

**CRITICAL**: If the theme has `.page-width`, USE `.page-width` — don't create `.container` or `.wrapper`. If the theme has `.h1`, USE `.h1` — don't write `font-size: 32px` inline.

### STEP 2: Map ALL Existing Blocks

```
LIST: blocks/*.liquid (if /blocks/ directory exists)

FOR EACH BLOCK FILE:
  ├── Read the schema → note block name, type, settings
  ├── What does it render? (heading, text, image, button, group, etc.)
  ├── What settings does it have? (size, alignment, color scheme, etc.)
  ├── Does it accept child blocks? (look for {% content_for 'blocks' %})
  ├── Is it private? (filename starts with _)
  └── What presets are defined?

BUILD A BLOCK INVENTORY:
  Example:
  ✅ heading.liquid → Heading block (sizes: h1/h2/h3, alignment)
  ✅ text.liquid → Rich text block (alignment)
  ✅ button.liquid → Button (styles: primary/secondary, sizes)
  ✅ image.liquid → Image (width, link)
  ✅ group.liquid → Container (direction, gap, alignment)
  ✅ spacer.liquid → Vertical spacer (height)
  ✅ video.liquid → Video embed
  ✅ icon-with-text.liquid → Icon + text combo
```

**RULE**: If a heading block already exists, NEVER create a new heading element inline in your section. Use the existing block via `{% content_for 'blocks' %}` or reference it in your section's `blocks` array.

### STEP 3: Map ALL Existing Snippets

```
LIST: snippets/*.liquid

FOR EACH SNIPPET:
  ├── What does it render? (product card, price, icon, pagination, etc.)
  ├── What parameters does it accept? (check render calls across sections)
  ├── Is it used in multiple places? (search for {% render 'snippet-name' %})
  └── What's the naming convention? (prefix? kebab-case?)

BUILD A SNIPPET INVENTORY:
  Example:
  ✅ product-card.liquid → renders product card (product, show_vendor, show_rating)
  ✅ price.liquid → renders price (product, use_variant)
  ✅ icon-*.liquid → SVG icons (icon-cart, icon-search, icon-close, etc.)
  ✅ pagination.liquid → pagination controls (paginate)
  ✅ breadcrumbs.liquid → breadcrumb navigation
  ✅ social-icons.liquid → social media links
```

**RULE**: If `product-card.liquid` exists, ALWAYS `{% render 'product-card', product: product %}` — NEVER write product card HTML inline in your section.

### STEP 4: Map ALL Existing Sections (Pattern Reference)

```
LIST: sections/*.liquid

FOR EACH SECTION:
  ├── Schema structure → settings order, grouping pattern
  ├── Block types → what blocks does it accept? (@theme? @app? local?)
  ├── Rendering method → content_for 'blocks' OR manual for loop?
  ├── CSS approach → {% style %} inline? External CSS file? Both?
  ├── JS approach → <script> inline? External file? defer?
  ├── Naming convention → kebab-case? prefix?
  ├── Schema settings pattern:
  │   ├── Does it group with "header" type settings?
  │   ├── Does it include padding top/bottom range settings?
  │   ├── Does it include color_scheme setting?
  │   ├── Does it include responsive column settings?
  │   └── What default values are used?
  └── Preset pattern → how many presets? What default blocks?
```

**RULE**: Your new section MUST follow the EXACT same schema structure. If every section starts with a `color_scheme` setting followed by a `header` separator then content settings — yours must too.

### STEP 5: Read layout/theme.liquid

```
READ: layout/theme.liquid

IDENTIFY:
  ├── What CSS files are loaded? (in order)
  ├── What JS files are loaded? (defer? async?)
  ├── Are there global CSS variables in a <style> tag?
  ├── What fonts are loaded? (font-face, Google Fonts, system fonts)
  ├── Is there a predictive search setup?
  ├── What section groups exist? (header-group, footer-group)
  ├── Content-Security-Policy headers?
  └── Any global Liquid variables assigned?
```

### STEP 6: Check config/settings_schema.json

```
READ: config/settings_schema.json

IDENTIFY:
  ├── Color schemes defined? (how many? what tokens?)
  ├── Typography settings? (heading font, body font, scale)
  ├── Spacing/layout settings? (section spacing, page width)
  ├── Social media settings?
  ├── Cart type setting? (page, drawer, notification)
  └── Any custom settings groups?
```

### THE REUSE CHECKLIST (Run Before Writing ANY Code)

Before creating ANYTHING new, check:

```
□ Does a BLOCK already exist for this? → Use existing block
□ Does a SNIPPET already exist for this? → {% render 'existing-snippet' %}
□ Does a CSS CLASS already exist for this? → Use .existing-class
□ Does a CSS VARIABLE already exist for this color/size/spacing? → Use var(--existing-var)
□ Does another SECTION do something similar? → Copy its patterns
□ Does the theme have a UTILITY for this? → .page-width, .grid, .h1, .visually-hidden
□ Does an ICON snippet exist? → {% render 'icon-name' %}
□ Does a FORM pattern exist? → Follow existing form/field classes
```

**If YES to any → REUSE IT. Do not recreate.**
**If NO to all → Create new, but match existing naming/style conventions exactly.**

### Example: Before Building a "Featured Products" Section

```
WRONG approach (ignoring existing theme):
  → Write custom CSS for product cards
  → Create inline HTML for product title, price, image
  → Hardcode colors and spacing
  → Ignore existing grid system

RIGHT approach (analyzing theme first):
  1. Read assets/base.css → Found: .grid, .grid--2-col, .grid--4-col
  2. Read snippets/ → Found: product-card.liquid (accepts: product, show_vendor)
  3. Read sections/featured-collection.liquid → Found: schema pattern with padding, color_scheme
  4. Read blocks/ → Found: heading.liquid, button.liquid exist
  5. Build section using:
     → .grid class for layout (already exists)
     → {% render 'product-card', product: product %} (already exists)
     → Same schema pattern as other sections
     → Theme blocks for heading + CTA button (already exist)
     → var(--color-base-text) for text color (already exists)
```

### Quick Reference: Common Theme CSS Classes to Check For

| What You Need | Check If Theme Has | Dawn/Horizon Example |
|--------------|-------------------|---------------------|
| Container | `.page-width`, `.container`, `.wrapper` | `.page-width` |
| Grid | `.grid`, `.grid--*-col`, `.collection-grid` | `.grid` |
| Heading sizes | `.h0`, `.h1`, `.h2`, `.h3`, `.title` | `.h0` through `.h3` |
| Body text | `.rte`, `.body`, `.prose` | `.rte` |
| Button | `.button`, `.btn`, `.button--*` | `.button` |
| Link | `.link`, `.underlined-link`, `.full-unstyled-link` | `.link` |
| Hidden | `.hidden`, `.visually-hidden`, `.no-js-*` | `.visually-hidden` |
| Responsive hide | `.small-hide`, `.medium-hide`, `.large-up-hide` | `.small-hide` |
| Card | `.card`, `.card--*`, `.product-card` | `.card` |
| Badge | `.badge`, `.badge--*`, `.tag` | `.badge` |
| Section spacing | `.section-*-padding`, `.spaced-section` | `.section-template--padding` |
| Media/Image | `.media`, `.media--*`, `.global-media-settings` | `.media` |
| Form field | `.field`, `.field__input`, `.field__label` | `.field` |
| Icon | `.icon`, `.icon-*`, `.svg-icon` | `.icon` |
| Animation | `.scroll-trigger`, `.animate-*` | `.scroll-trigger` |
| Color scheme | `.color-*`, `.color-scheme-*` | `.color-scheme-1` |

**NEVER** create `.my-container`, `.my-heading`, `.my-button` if the theme already has equivalents.

---

## THEME ARCHITECTURE (Online Store 2.0)

### Directory Structure
```
theme/
├── layout/
│   ├── theme.liquid              # Main layout wrapper
│   └── password.liquid           # Password page layout
├── templates/
│   ├── index.json                # Homepage
│   ├── product.json              # Product page
│   ├── collection.json           # Collection page
│   ├── page.json                 # Generic pages
│   ├── blog.json                 # Blog listing
│   ├── article.json              # Blog post
│   ├── cart.json                 # Cart page
│   ├── search.json               # Search results
│   ├── 404.json                  # Not found
│   ├── customers/login.json      # Customer login
│   └── customers/account.json    # Customer account
├── sections/
│   ├── header.liquid             # Header (section group)
│   ├── footer.liquid             # Footer (section group)
│   ├── main-product.liquid       # Product main section
│   ├── main-collection.liquid    # Collection main section
│   ├── featured-collection.liquid
│   ├── rich-text.liquid
│   ├── image-banner.liquid
│   ├── slideshow.liquid
│   └── apps.liquid               # App blocks wrapper
├── snippets/
│   ├── product-card.liquid       # Reusable product card
│   ├── price.liquid              # Price display
│   ├── icon-*.liquid             # SVG icons
│   └── pagination.liquid         # Pagination
├── blocks/                       # Theme blocks (if supported)
├── assets/
│   ├── theme.css                 # Main stylesheet
│   ├── theme.js                  # Main JavaScript
│   └── *.liquid.css              # Section-specific CSS
├── config/
│   ├── settings_schema.json      # Theme settings definition
│   └── settings_data.json        # Theme settings values
└── locales/
    ├── en.default.json           # Default language
    └── *.json                    # Translations
```

### JSON Template Structure
```json
{
  "sections": {
    "main": {
      "type": "main-product",
      "settings": {}
    },
    "recommendations": {
      "type": "product-recommendations",
      "settings": {
        "heading": "You may also like"
      }
    }
  },
  "order": ["main", "recommendations"]
}
```

**Limits**: Max **25 sections** per JSON template. Max **50 blocks** per section.

---

## SECTIONS — ARCHITECTURE PATTERNS

### Section with Blocks + App Block Support
```liquid
{%- comment -%}sections/featured-collection.liquid{%- endcomment -%}

<div class="section-{{ section.id }} featured-collection" style="padding: {{ section.settings.padding_top }}px 0 {{ section.settings.padding_bottom }}px;">
  <div class="page-width">
    {%- if section.settings.heading != blank -%}
      <h2 class="section-heading {{ section.settings.heading_size }}">
        {{ section.settings.heading | escape }}
      </h2>
    {%- endif -%}

    <div class="grid grid--{{ section.settings.columns_desktop }}-col">
      {%- for block in section.blocks -%}
        {%- case block.type -%}
          {%- when 'product' -%}
            <div class="grid__item" {{ block.shopify_attributes }}>
              {%- render 'product-card', product: block.settings.product -%}
            </div>

          {%- when 'collection' -%}
            <div class="grid__item" {{ block.shopify_attributes }}>
              {%- render 'collection-card', collection: block.settings.collection -%}
            </div>

          {%- when '@app' -%}
            <div class="grid__item" {{ block.shopify_attributes }}>
              {%- render block -%}
            </div>
        {%- endcase -%}
      {%- endfor -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Featured collection",
  "tag": "section",
  "class": "section-featured-collection",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Featured collection"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h2", "label": "Small" },
        { "value": "h1", "label": "Medium" },
        { "value": "h0", "label": "Large" }
      ],
      "default": "h1"
    },
    {
      "type": "range",
      "id": "columns_desktop",
      "min": 2,
      "max": 5,
      "step": 1,
      "default": 4,
      "label": "Columns on desktop"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 36,
      "unit": "px",
      "label": "Top padding"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 36,
      "unit": "px",
      "label": "Bottom padding"
    }
  ],
  "blocks": [
    {
      "type": "product",
      "name": "Product",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Product"
        }
      ]
    },
    {
      "type": "collection",
      "name": "Collection",
      "settings": [
        {
          "type": "collection",
          "id": "collection",
          "label": "Collection"
        }
      ]
    },
    {
      "type": "@app"
    }
  ],
  "presets": [
    {
      "name": "Featured collection",
      "blocks": [
        { "type": "product" },
        { "type": "product" },
        { "type": "product" },
        { "type": "product" }
      ]
    }
  ]
}
{% endschema %}
```

### Key Rules for Sections
1. **Always include `{{ block.shopify_attributes }}`** on block containers — enables Theme Editor selection
2. **Always support `@app` block type** in sections where third-party apps make sense
3. **Never rely on block order** for layout — use CSS Grid/Flexbox
4. **Always provide presets** — shows default state in Theme Editor
5. **Group settings logically** with `"type": "header"` separators
6. **Place critical settings at top**, advanced ones lower
7. **Use `"info"` fields** for inline documentation — merchants shouldn't need external docs
8. **Section limit**: One resource setting of each type when supporting app blocks

### App Blocks Wrapper (sections/apps.liquid)
```liquid
<div class="{% if section.settings.include_padding %}page-width{% endif %}">
  {%- for block in section.blocks -%}
    <div class="app-block" {{ block.shopify_attributes }}>
      {%- render block -%}
    </div>
  {%- endfor -%}
</div>

{% schema %}
{
  "name": "App wrapper",
  "settings": [
    {
      "type": "checkbox",
      "id": "include_padding",
      "default": true,
      "label": "Match theme margins"
    }
  ],
  "blocks": [{ "type": "@app" }],
  "presets": [{ "name": "App wrapper" }]
}
{% endschema %}
```

### `@app` Block Rules
- **No `limit` parameter** on `@app` blocks (causes error)
- **Not available** in statically rendered sections
- `{% render block %}` handles app block rendering
- App blocks have access to `section.id` only (not other section properties)

---

## THEME BLOCKS — COMPLETE GUIDE

### Three Types of Blocks

| Type | Location | Reusable? | Nestable? | Use When |
|------|----------|-----------|-----------|----------|
| **Theme Blocks** | `/blocks/*.liquid` | ✅ Across all sections | ✅ Up to 8 levels | Building reusable, composable content blocks |
| **Section Blocks** | Inside section schema `blocks:[]` | ❌ Only in that section | ❌ No nesting | Simple, section-specific content types |
| **App Blocks** | From installed apps | ✅ Where `@app` allowed | ❌ No nesting | Third-party app content |

**CRITICAL**: A section can accept EITHER theme blocks OR section blocks — **NEVER both**.

### Theme Blocks (Global — `/blocks/` directory)

Theme blocks are Liquid files in the `/blocks/` folder. They are **reusable across ANY section** that accepts `@theme` blocks.

#### Directory Structure
```
blocks/
├── heading.liquid          # Heading block
├── text.liquid             # Rich text block
├── button.liquid           # Button/CTA block
├── image.liquid            # Image block
├── video.liquid            # Video block
├── group.liquid            # Container/group (for nesting)
├── columns.liquid          # Multi-column layout
├── spacer.liquid           # Spacing/divider
├── icon-with-text.liquid   # Icon + text combo
├── accordion.liquid        # Collapsible FAQ item
├── form.liquid             # Form block
├── _private-block.liquid   # Private block (underscore prefix)
└── custom-html.liquid      # Raw HTML block
```

#### Creating a Theme Block — Complete Example

**blocks/heading.liquid:**
```liquid
{%- case block.settings.heading_size -%}
  {%- when 'h1' -%}
    <h1 class="heading heading--h1" {{ block.shopify_attributes }}>
      {{ block.settings.heading }}
    </h1>
  {%- when 'h2' -%}
    <h2 class="heading heading--h2" {{ block.shopify_attributes }}>
      {{ block.settings.heading }}
    </h2>
  {%- when 'h3' -%}
    <h3 class="heading heading--h3" {{ block.shopify_attributes }}>
      {{ block.settings.heading }}
    </h3>
{%- endcase -%}

{% schema %}
{
  "name": "Heading",
  "tag": null,
  "settings": [
    {
      "type": "inline_richtext",
      "id": "heading",
      "label": "Heading",
      "default": "Heading text"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h1", "label": "Large" },
        { "value": "h2", "label": "Medium" },
        { "value": "h3", "label": "Small" }
      ],
      "default": "h2"
    },
    {
      "type": "text_alignment",
      "id": "alignment",
      "label": "Alignment",
      "default": "center"
    }
  ],
  "presets": [
    {
      "name": "Heading"
    }
  ]
}
{% endschema %}
```

**blocks/text.liquid:**
```liquid
<div class="text-block text-{{ block.settings.alignment }}" {{ block.shopify_attributes }}>
  {{ block.settings.text }}
</div>

{% schema %}
{
  "name": "Text",
  "tag": null,
  "settings": [
    {
      "type": "richtext",
      "id": "text",
      "label": "Text",
      "default": "<p>Add your text here</p>"
    },
    {
      "type": "text_alignment",
      "id": "alignment",
      "label": "Alignment",
      "default": "left"
    }
  ],
  "presets": [
    { "name": "Text" }
  ]
}
{% endschema %}
```

**blocks/button.liquid:**
```liquid
<a
  {% if block.settings.url != blank %}href="{{ block.settings.url }}"{% endif %}
  class="button button--{{ block.settings.style }} button--{{ block.settings.size }}"
  {{ block.shopify_attributes }}
>
  {{ block.settings.label | escape }}
</a>

{% stylesheet %}
  .button { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 600; border-radius: 4px; transition: all 0.2s; cursor: pointer; }
  .button--primary { background: var(--color-primary); color: var(--color-primary-contrast); }
  .button--primary:hover { opacity: 0.9; }
  .button--secondary { background: transparent; border: 1px solid currentColor; }
  .button--small { padding: 8px 16px; font-size: 13px; }
  .button--medium { padding: 12px 24px; font-size: 14px; }
  .button--large { padding: 16px 32px; font-size: 16px; }
{% endstylesheet %}

{% schema %}
{
  "name": "Button",
  "tag": null,
  "settings": [
    {
      "type": "text",
      "id": "label",
      "label": "Label",
      "default": "Shop now"
    },
    {
      "type": "url",
      "id": "url",
      "label": "Link"
    },
    {
      "type": "select",
      "id": "style",
      "label": "Style",
      "options": [
        { "value": "primary", "label": "Primary" },
        { "value": "secondary", "label": "Secondary" }
      ],
      "default": "primary"
    },
    {
      "type": "select",
      "id": "size",
      "label": "Size",
      "options": [
        { "value": "small", "label": "Small" },
        { "value": "medium", "label": "Medium" },
        { "value": "large", "label": "Large" }
      ],
      "default": "medium"
    }
  ],
  "presets": [
    { "name": "Button" }
  ]
}
{% endschema %}
```

**blocks/image.liquid:**
```liquid
{%- if block.settings.image != blank -%}
  <div class="image-block" {{ block.shopify_attributes }}>
    {{ block.settings.image | image_url: width: block.settings.width | image_tag:
      loading: 'lazy',
      widths: '200, 400, 600, 800, 1000, 1200',
      sizes: '(min-width: 990px) 50vw, 100vw',
      alt: block.settings.image.alt | default: '' | escape
    }}
  </div>
{%- else -%}
  <div class="image-block image-block--placeholder" {{ block.shopify_attributes }}>
    {{ 'image' | placeholder_svg_tag: 'placeholder-svg' }}
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Image",
  "tag": null,
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "Image"
    },
    {
      "type": "range",
      "id": "width",
      "label": "Image width",
      "min": 200,
      "max": 1200,
      "step": 100,
      "default": 800,
      "unit": "px"
    },
    {
      "type": "url",
      "id": "link",
      "label": "Link (optional)"
    }
  ],
  "presets": [
    { "name": "Image" }
  ]
}
{% endschema %}
```

**blocks/group.liquid (Container for nesting):**
```liquid
<div class="group-block color-{{ block.settings.color_scheme }}" {{ block.shopify_attributes }}
  style="padding: {{ block.settings.padding }}px 0; display: flex; flex-direction: {{ block.settings.direction }}; gap: {{ block.settings.gap }}px; align-items: {{ block.settings.align }};"
>
  {% content_for 'blocks' %}
</div>

{% schema %}
{
  "name": "Group",
  "tag": null,
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "settings": [
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme"
    },
    {
      "type": "select",
      "id": "direction",
      "label": "Direction",
      "options": [
        { "value": "column", "label": "Vertical" },
        { "value": "row", "label": "Horizontal" }
      ],
      "default": "column"
    },
    {
      "type": "select",
      "id": "align",
      "label": "Alignment",
      "options": [
        { "value": "flex-start", "label": "Start" },
        { "value": "center", "label": "Center" },
        { "value": "flex-end", "label": "End" },
        { "value": "stretch", "label": "Stretch" }
      ],
      "default": "stretch"
    },
    {
      "type": "range",
      "id": "gap",
      "label": "Gap",
      "min": 0,
      "max": 60,
      "step": 4,
      "default": 16,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "padding",
      "label": "Vertical padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 0,
      "unit": "px"
    }
  ],
  "presets": [
    { "name": "Group" },
    {
      "name": "Two columns",
      "settings": { "direction": "row", "gap": 24 },
      "blocks": [
        {
          "type": "group",
          "settings": { "direction": "column" },
          "blocks": [
            { "type": "heading", "settings": { "heading": "Column 1" } },
            { "type": "text" }
          ]
        },
        {
          "type": "group",
          "settings": { "direction": "column" },
          "blocks": [
            { "type": "heading", "settings": { "heading": "Column 2" } },
            { "type": "text" }
          ]
        }
      ]
    }
  ]
}
{% endschema %}
```

**blocks/spacer.liquid:**
```liquid
<div class="spacer-block" {{ block.shopify_attributes }}
  style="height: {{ block.settings.height }}px;">
</div>

{% schema %}
{
  "name": "Spacer",
  "tag": null,
  "settings": [
    {
      "type": "range",
      "id": "height",
      "label": "Height",
      "min": 4,
      "max": 120,
      "step": 4,
      "default": 24,
      "unit": "px"
    }
  ],
  "presets": [
    { "name": "Spacer" }
  ]
}
{% endschema %}
```

### Using Theme Blocks in Sections

To accept theme blocks in your section, use `@theme` in the blocks array:

```liquid
<section class="custom-section section-{{ section.id }}" {{ section.shopify_attributes }}>
  <div class="page-width">
    {% content_for 'blocks' %}
  </div>
</section>

{% schema %}
{
  "name": "Custom Section",
  "blocks": [
    { "type": "@theme" },
    { "type": "@app" }
  ],
  "presets": [
    {
      "name": "Custom Section",
      "blocks": [
        { "type": "heading", "settings": { "heading": "Welcome" } },
        { "type": "text", "settings": { "text": "<p>Add your content here</p>" } },
        { "type": "button", "settings": { "label": "Shop now", "url": "/collections/all" } }
      ]
    }
  ]
}
{% endschema %}
```

### Restricting Which Theme Blocks Are Allowed

```json
{
  "blocks": [
    { "type": "heading" },
    { "type": "text" },
    { "type": "button" },
    { "type": "@app" }
  ]
}
```
This only allows heading, text, button, and app blocks — not all theme blocks.

### Private Blocks (Underscore Prefix)

Prefix filename with `_` to make it private:
```
blocks/_product-badge.liquid   ← Private, only shows where explicitly allowed
blocks/heading.liquid          ← Public, shows everywhere @theme is accepted
```

Private blocks are useful when a block only makes sense in specific sections (e.g., product badge only on product pages).

### Section Blocks (Local — Inside Section Schema)

For blocks that ONLY make sense within ONE specific section:

```liquid
{%- for block in section.blocks -%}
  {%- case block.type -%}
    {%- when 'slide' -%}
      <div class="slide" {{ block.shopify_attributes }}>
        {%- if block.settings.image != blank -%}
          {{ block.settings.image | image_url: width: 1200 | image_tag: loading: 'lazy' }}
        {%- endif -%}
        <h2>{{ block.settings.heading }}</h2>
      </div>
  {%- endcase -%}
{%- endfor -%}

{% schema %}
{
  "name": "Slideshow",
  "blocks": [
    {
      "type": "slide",
      "name": "Slide",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Image" },
        { "type": "text", "id": "heading", "label": "Heading" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Slideshow",
      "blocks": [
        { "type": "slide" },
        { "type": "slide" },
        { "type": "slide" }
      ]
    }
  ]
}
{% endschema %}
```

### WHY BLOCKS DON'T SHOW — Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Block not in "Add block" picker | **Missing `presets`** in schema | Add `"presets": [{ "name": "Block Name" }]` — **THIS IS THE #1 CAUSE** |
| Theme blocks not available in section | Section uses `"blocks": [{ "type": "slide" }]` (section blocks) | Change to `"blocks": [{ "type": "@theme" }]` for theme blocks |
| Block exists but invisible in editor | Eye icon toggled off in sidebar | Click the eye icon to show it |
| Block disappeared after app install | App JS/CSS conflict | Disable app, test again, report to app dev |
| Block not rendering on storefront | Missing `{% content_for 'blocks' %}` or `{% for block %}` loop | Add render logic to section Liquid |
| Block settings empty | Using private block without explicit allowance | Remove `_` prefix or explicitly list in section blocks array |
| "Invalid schema" error | JSON syntax error in schema | Validate JSON (commas, brackets, quotes) |
| Block not showing for specific section | Block type not listed in section's `blocks` array | Add block type to section schema blocks |
| Nested blocks not working | Using section blocks (no nesting support) | Switch to theme blocks (supports 8-level nesting) |
| Theme blocks not rendering children | Missing `{% content_for 'blocks' %}` in block file | Add content_for tag inside block that accepts children |
| `@theme` not recognized | Theme doesn't have `/blocks/` directory | Create `/blocks/` folder with at least one block file |
| Block renders but no styles | Missing `{% stylesheet %}` tag | Add scoped styles via stylesheet tag or asset CSS |
| Max blocks reached | >50 blocks in section | Reduce blocks or increase `max_blocks` |
| Block appears but can't be added | Section `max_blocks` limit reached | Increase `max_blocks` or remove unused blocks |

### Block Rendering: Two Methods

**Method 1: `content_for` (Simplest — for theme blocks)**
```liquid
{% content_for 'blocks' %}
```
Automatically renders ALL child blocks including `@app` blocks. Use this when you want Shopify to handle rendering.

**Method 2: Manual loop (for section blocks or custom rendering)**
```liquid
{%- for block in section.blocks -%}
  {%- case block.type -%}
    {%- when 'heading' -%}
      <h2 {{ block.shopify_attributes }}>{{ block.settings.text }}</h2>
    {%- when 'text' -%}
      <div class="rte" {{ block.shopify_attributes }}>{{ block.settings.text }}</div>
    {%- when '@app' -%}
      {%- render block -%}
  {%- endcase -%}
{%- endfor -%}
```
Use this when you need custom wrapping, conditional rendering, or section blocks.

### Block Access & Liquid Objects

Inside a theme block file, you can access:
```liquid
{{ block.settings.my_setting }}     ← Block settings
{{ block.id }}                       ← Unique block ID
{{ block.type }}                     ← Block type name
{{ block.shopify_attributes }}       ← REQUIRED on container element
{{ section.id }}                     ← Parent section ID (only .id accessible)
```

**LIMITATION**: Theme blocks CANNOT access variables created outside the block. They don't receive passed variables like snippets do. Use `block.settings` for all data.

### Nesting Rules

```
Section (level 0)
└── Theme Block (level 1) — e.g., group.liquid
    └── Theme Block (level 2) — e.g., heading.liquid
        └── Theme Block (level 3) — nested further
            └── ... up to level 8
```

- **Max 8 levels** of nesting (excluding section level)
- Only **theme blocks** support nesting (NOT section blocks)
- Parent block MUST have `"blocks": [{ "type": "@theme" }]` in schema
- Parent block MUST include `{% content_for 'blocks' %}` to render children

### When to Use Which Block Type

```
Need reusable across sections? → Theme Block (/blocks/*.liquid)
Need nesting?                  → Theme Block with "blocks": [{ "type": "@theme" }]
Only used in ONE section?      → Section Block (in section schema)
Third-party app content?       → @app block
Want to hide from global picker? → Private block (_prefix.liquid)
```

### Block Granularity Rules
```
✅ GOOD: "Testimonial" block with author + quote + rating together
❌ BAD:  Separate "Author" block + "Quote" block + "Rating" block

✅ GOOD: "Feature" block with icon + title + description
❌ BAD:  Separate blocks for each attribute

✅ GOOD: Reusable "Group" block for layout containers
❌ BAD:  Fixed grid section that can't be rearranged
```

---

## LIQUID BEST PRACTICES

### Performance Rules (MANDATORY)

**1. Pre-fetch outside loops:**
```liquid
{%- comment -%} WRONG — queries inside loop {%- endcomment -%}
{%- for product in collection.products -%}
  {{ product.metafields.custom.badge }}
{%- endfor -%}

{%- comment -%} RIGHT — assign outside, use inside {%- endcomment -%}
{%- assign products = collection.products -%}
{%- for product in products limit: 12 -%}
  {{ product.title }}
{%- endfor -%}
```

**2. Filter before sort (smaller set first):**
```liquid
{%- assign available = collection.products | where: 'available', true -%}
{%- assign sorted = available | sort: 'title' -%}
```

**3. Use `assign` not `capture` for simple values:**
```liquid
{%- assign btn_class = 'btn btn--primary' -%}
```

**4. Use `break` and `continue`:**
```liquid
{%- for product in collection.products -%}
  {%- unless product.available -%}{%- continue -%}{%- endunless -%}
  {%- if forloop.index > 12 -%}{%- break -%}{%- endif -%}
  {%- render 'product-card', product: product -%}
{%- endfor -%}
```

**5. Use `map` and `join` instead of loop concatenation:**
```liquid
{%- assign ids = collection.products | map: 'id' | join: ',' -%}
```

**6. Use `render` not `include`** (render is faster, scoped variables):
```liquid
{%- render 'product-card', product: product, show_vendor: section.settings.show_vendor -%}
```

**7. Pass only needed data to snippets:**
```liquid
{%- comment -%} WRONG — passes entire object {%- endcomment -%}
{%- render 'price', product: product -%}

{%- comment -%} RIGHT — passes only needed values {%- endcomment -%}
{%- render 'price', price: product.price, compare_price: product.compare_at_price, currency: cart.currency.iso_code -%}
```

**8. Use `elsif` not multiple `if`:**
```liquid
{%- if product.price < 2500 -%}
  Budget
{%- elsif product.price < 10000 -%}
  Standard
{%- else -%}
  Premium
{%- endif -%}
```

**9. Use whitespace control `{%-` and `-%}`:**
Always use whitespace-trimming tags to prevent excessive whitespace in output.

### Anti-Patterns (NEVER DO)
- **Never** render entire collections without pagination
- **Never** use nested loops when `map`/`where` filters work
- **Never** do complex math in Liquid — use metafields or JS
- **Never** access metafields inside tight loops on high-traffic pages
- **Never** use `include` (deprecated) — always `render`

---

## IMAGE OPTIMIZATION (MANDATORY)

### Always Use `image_url` + `image_tag`
```liquid
{%- comment -%} Hero image — above fold, eager load, high priority {%- endcomment -%}
{{ section.settings.image | image_url: width: 1920 | image_tag:
  loading: 'eager',
  fetchpriority: 'high',
  widths: '375, 750, 1100, 1500, 1920',
  sizes: '100vw',
  alt: section.settings.image.alt | escape
}}

{%- comment -%} Product card — below fold, lazy load {%- endcomment -%}
{{ product.featured_image | image_url: width: 800 | image_tag:
  loading: 'lazy',
  widths: '200, 400, 600, 800',
  sizes: '(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw',
  alt: product.title | escape
}}
```

### Rules
- **Above fold**: `loading: 'eager'`, `fetchpriority: 'high'`
- **Below fold**: `loading: 'lazy'` (ALWAYS)
- **Always provide `alt`** text (escape it)
- **Always provide `widths`** for responsive srcset
- **Always provide `sizes`** for browser size hints
- **Never hardcode image URLs** — always use `image_url` filter for CDN
- **Never use `img_url`** (deprecated) — use `image_url`

---

## CSS ARCHITECTURE

### Follow Theme's Existing Pattern
Check the theme first. Common patterns:

**Pattern A: External CSS files**
```liquid
{{ 'theme.css' | asset_url | stylesheet_tag }}
{{ 'section-featured-collection.css' | asset_url | stylesheet_tag: preload: true }}
```

**Pattern B: Inline scoped styles (preferred for sections)**
```liquid
{%- style -%}
  .section-{{ section.id }} {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
  .section-{{ section.id }} .grid {
    display: grid;
    grid-template-columns: repeat({{ section.settings.columns_desktop }}, 1fr);
    gap: var(--grid-gap, 2rem);
  }
  @media screen and (max-width: 749px) {
    .section-{{ section.id }} .grid {
      grid-template-columns: repeat({{ section.settings.columns_mobile | default: 1 }}, 1fr);
    }
  }
{%- endstyle -%}
```

**Pattern C: CSS custom properties (design tokens)**
```liquid
{%- style -%}
  .section-{{ section.id }} {
    --section-padding-top: {{ section.settings.padding_top }}px;
    --section-padding-bottom: {{ section.settings.padding_bottom }}px;
    --grid-columns: {{ section.settings.columns_desktop }};
    --grid-columns-mobile: {{ section.settings.columns_mobile | default: 1 }};
  }
{%- endstyle -%}
```

### CSS Rules
- **Scope ALL styles** to `.section-{{ section.id }}` to prevent conflicts
- **Use CSS custom properties** for theme-wide design tokens
- **Use `{%- style -%}` tag** for section-specific inline CSS (no extra HTTP request)
- **BEM naming** if theme uses it — match existing convention
- **Low specificity selectors** — avoid `!important`
- **Mobile-first** responsive design with `min-width` media queries
- **Critical CSS inline** for above-fold content
- **Defer non-critical CSS** with `preload: true`

---

## JAVASCRIPT ARCHITECTURE

### Rules
- **Minified JS must be 16KB or less** per Shopify Theme Store requirement
- **Always `defer` or `async`** — never parser-blocking
- **Wrap in IIFE** to protect global namespace
- **No jQuery, React, Angular, Vue** — vanilla JS or web components
- **CSS-first interactivity** — use JS only when CSS can't do it
- **Dynamic import** for section-specific JS
- **Use Intersection Observer** for lazy-loading sections

### Pattern: Section-Specific JS
```liquid
<script src="{{ 'section-slideshow.js' | asset_url }}" defer></script>
```

```javascript
// assets/section-slideshow.js
(function () {
  class Slideshow extends HTMLElement {
    connectedCallback() {
      this.slides = this.querySelectorAll('.slide');
      this.currentIndex = 0;
      this.autoplay = this.dataset.autoplay === 'true';
      if (this.autoplay) this.startAutoplay();
    }

    startAutoplay() {
      this.interval = setInterval(() => this.next(), 5000);
    }

    next() {
      this.slides[this.currentIndex].classList.remove('active');
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.slides[this.currentIndex].classList.add('active');
    }

    disconnectedCallback() {
      clearInterval(this.interval);
    }
  }

  if (!customElements.get('theme-slideshow')) {
    customElements.define('theme-slideshow', Slideshow);
  }
})();
```

---

## RESPONSIVE DESIGN

### Breakpoints (Follow Theme's Existing)
Common Shopify theme breakpoints:
```css
/* Mobile first */
/* Default: 0-749px (mobile) */
@media screen and (min-width: 750px)  { /* Tablet */ }
@media screen and (min-width: 990px)  { /* Desktop */ }
@media screen and (min-width: 1200px) { /* Large desktop */ }
```

### Grid Pattern
```css
.grid {
  display: grid;
  gap: var(--grid-gap, 1.5rem);
  grid-template-columns: repeat(var(--grid-columns-mobile, 1), 1fr);
}

@media screen and (min-width: 750px) {
  .grid { grid-template-columns: repeat(var(--grid-columns-tablet, 2), 1fr); }
}

@media screen and (min-width: 990px) {
  .grid { grid-template-columns: repeat(var(--grid-columns, 4), 1fr); }
}
```

### Block Wrapping Rules
- **Blocks wrap on several lines** on narrow viewports
- **Add sliding controls** for narrow viewports if needed
- **NEVER squeeze blocks** to fit narrow viewports
- **Don't rely on block order** for grid layout

---

## ACCESSIBILITY (MANDATORY)

### Requirements
- [ ] All images have `alt` text (escaped)
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast ratio minimum 4.5:1 (text), 3:1 (large text)
- [ ] Form inputs have associated `<label>` elements
- [ ] ARIA labels on icon-only buttons
- [ ] Skip-to-content link in layout
- [ ] Keyboard navigable (tab order logical)
- [ ] `prefers-reduced-motion` respected for animations

```liquid
{%- comment -%} Accessible icon button {%- endcomment -%}
<button class="icon-btn" aria-label="{{ 'accessibility.close' | t }}">
  {%- render 'icon-close' -%}
</button>

{%- comment -%} Skip to content {%- endcomment -%}
<a class="skip-to-content-link" href="#MainContent">
  {{ 'accessibility.skip_to_content' | t }}
</a>
```

---

## METAFIELDS & METAOBJECTS

### In Sections
```liquid
{%- assign warranty = product.metafields.custom.warranty -%}
{%- if warranty != blank -%}
  <div class="product-badge" {{ block.shopify_attributes }}>
    {{ warranty.value }}
  </div>
{%- endif -%}

{%- comment -%} Metaobject reference {%- endcomment -%}
{%- assign brand = product.metafields.custom.brand.value -%}
{%- if brand -%}
  <div class="brand-info">
    {{ brand.fields.logo.value | image_url: width: 200 | image_tag: loading: 'lazy' }}
    <span>{{ brand.fields.name.value }}</span>
  </div>
{%- endif -%}
```

### Metafield Block Pattern
```json
{
  "type": "metafield",
  "name": "Custom metafield",
  "settings": [
    {
      "type": "text",
      "id": "metafield_namespace",
      "label": "Namespace",
      "default": "custom"
    },
    {
      "type": "text",
      "id": "metafield_key",
      "label": "Key"
    }
  ]
}
```

---

## LOCALIZATION

### Always Use Translation Keys
```liquid
{%- comment -%} WRONG — hardcoded text {%- endcomment -%}
<button>Add to Cart</button>

{%- comment -%} RIGHT — translated {%- endcomment -%}
<button>{{ 'products.product.add_to_cart' | t }}</button>
```

### Schema Translations
```json
{
  "type": "text",
  "id": "heading",
  "label": "t:sections.featured_collection.settings.heading.label",
  "default": "t:sections.featured_collection.settings.heading.default"
}
```

---

## PERFORMANCE TARGETS

| Metric | Target | Measurement |
|--------|--------|------------|
| Lighthouse (mobile) | **60+ average** | (product×31 + collection×33 + home×13) / 77 |
| TTFB | < 800ms | Server response time |
| LCP | < 2.5s | Largest Contentful Paint |
| TBT | < 200ms | Total Blocking Time |
| CLS | < 0.1 | Cumulative Layout Shift |
| JS bundle | < 16KB minified | Per Shopify Theme Store |
| Hero image | Eager + fetchpriority high | Above fold only |

---

## THEME QA CHECKLIST

### Before Deploying Any Change

**Structural:**
- [ ] Theme Editor works — all settings functional
- [ ] Sections can be added/removed/reordered in Theme Editor
- [ ] Blocks can be added/removed/reordered within sections
- [ ] App blocks render correctly where supported
- [ ] Presets show sensible defaults
- [ ] JSON templates valid (no syntax errors)
- [ ] Max 25 sections per template not exceeded

**Visual:**
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] No horizontal scroll on any viewport
- [ ] No layout shift on load (CLS < 0.1)
- [ ] Images lazy-loaded below fold, eager above fold
- [ ] Empty states handled (no products, no image, no text)
- [ ] Works with 1 product and 1000+ products

**Functional:**
- [ ] Add to cart works
- [ ] Cart updates correctly
- [ ] Pagination works on collections
- [ ] Search returns results and handles empty state
- [ ] Product variants change image/price correctly
- [ ] Quantity selector works
- [ ] Customer login/register/account pages work

**Performance:**
- [ ] Lighthouse mobile score 60+
- [ ] No render-blocking resources
- [ ] Images use Shopify CDN (image_url filter)
- [ ] JS deferred or async
- [ ] No unused CSS loaded
- [ ] No console errors

**Accessibility:**
- [ ] All images have alt text
- [ ] Heading hierarchy correct
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Screen reader tested

**Code Quality:**
- [ ] Whitespace control tags `{%-` and `-%}` used
- [ ] `render` used (not `include`)
- [ ] Variables assigned outside loops
- [ ] No hardcoded strings (use translations)
- [ ] Section styles scoped to `.section-{{ section.id }}`
- [ ] No `!important` in CSS
- [ ] JS wrapped in IIFE
- [ ] No jQuery dependency added

---

## SECTION RENDERING API

For AJAX-powered section updates (e.g., cart drawer, filters):

```javascript
// Fetch updated section HTML without full page reload
async function refreshSection(sectionId) {
  const url = `${window.location.pathname}?sections=${sectionId}`;
  const response = await fetch(url);
  const data = await response.json();

  const html = new DOMParser().parseFromString(data[sectionId], 'text/html');
  const newContent = html.querySelector('.shopify-section');

  document.getElementById(`shopify-section-${sectionId}`)
    .replaceWith(newContent);
}

// Example: refresh cart after add-to-cart
async function addToCart(variantId, quantity) {
  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity }),
  });

  await refreshSection('cart-drawer');
}
```

---

## DECISION TREE: BLOCKS vs SECTIONS

```
Does the merchant need to ADD/REMOVE/REORDER this content?
├── YES → Is it WITHIN a section (slides, features, FAQs)?
│   ├── YES → Use BLOCKS
│   └── NO  → Use SECTIONS (stackable in JSON template)
└── NO  → Is it fixed structure (header, main product)?
    ├── YES → Use STATIC SECTION with settings only
    └── NO  → Use SNIPPET (reusable partial)

Should third-party apps inject content here?
├── YES → Add type: "@app" to blocks array
└── NO  → Skip @app blocks

Is the content repeatable (testimonials, team members)?
├── YES → Use blocks with presets showing 3-4 defaults
└── NO  → Use section settings directly
```

---

## SCHEMA VALIDATION & THEME DEBUGGING

When writing or modifying ANY section/block schema, you MUST validate it before pushing. Schema errors cause upload failures and break the Theme Editor.

### MANDATORY: Run Theme Check Before Push
```bash
# Validate theme locally (catches schema errors, Liquid issues, performance problems)
shopify theme check

# Push with validation (will show errors like the one below)
shopify theme dev --store=mystore

# Common error format:
# Failed to upload file "sections/my-section.liquid" to remote theme.
# Invalid schema: setting with id="product" 'visible_if' is not a valid attribute
```

**You MUST run `shopify theme check` after every section/schema change.** If it passes locally, it will pass on push.

### Valid Setting Attributes Per Type

**ALL input settings accept:**
```
type        → (required) setting type
id          → (required) unique within section/block
label       → (required) display text or translation key
default     → default value
info        → helper text below field
```

**Type-specific attributes:**

| Setting Type | Extra Attributes |
|-------------|-----------------|
| `text` | `placeholder` |
| `textarea` | `placeholder` |
| `number` | `placeholder`, `min`, `max`, `step` |
| `range` | `min`, `max`, `step`, `unit` |
| `select` | `options` (array of `{value, label}`) |
| `radio` | `options` (array of `{value, label}`) |
| `checkbox` | (none extra — default is boolean) |
| `color` | (none extra) |
| `color_background` | (none extra) |
| `color_scheme` | (none extra) |
| `font_picker` | (none extra) |
| `image_picker` | (none extra) |
| `video` | (none extra) |
| `video_url` | `accept` (array: `["youtube", "vimeo"]`) |
| `url` | (none extra) |
| `richtext` | (none extra) |
| `inline_richtext` | (none extra) |
| `html` | `placeholder` |
| `liquid` | (none extra) |
| `collection` | (none extra) |
| `product` | (none extra) |
| `product_list` | `limit` (max items) |
| `collection_list` | `limit` (max items) |
| `blog` | (none extra) |
| `page` | (none extra) |
| `link_list` | (none extra) |
| `article` | (none extra) |
| `text_alignment` | (none extra) |

**Sidebar settings (no value, not configurable):**

| Type | Attributes |
|------|-----------|
| `header` | `content`, `info` |
| `paragraph` | `content` |

### `visible_if` — Conditional Settings

`visible_if` conditionally shows/hides settings in the Theme Editor. **It does NOT affect Liquid output** — the value is always accessible regardless of visibility.

**Settings that SUPPORT `visible_if`:**
```
✅ All basic inputs: text, textarea, number, range, select, radio, checkbox
✅ color, color_background, color_scheme
✅ font_picker, image_picker, video, video_url
✅ url, richtext, inline_richtext, html, liquid
✅ link_list, text_alignment
✅ All sidebar settings: header, paragraph
```

**Settings that do NOT support `visible_if`:**
```
❌ product          ← YOUR ERROR WAS HERE
❌ collection
❌ product_list
❌ collection_list
❌ blog
❌ page
❌ article
```

**`visible_if` syntax:**
```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout",
  "options": [
    { "value": "grid", "label": "Grid" },
    { "value": "slider", "label": "Slider" }
  ],
  "default": "grid"
},
{
  "type": "range",
  "id": "columns",
  "label": "Columns",
  "min": 2,
  "max": 6,
  "default": 4,
  "visible_if": "{{ layout }} == 'grid'"
},
{
  "type": "checkbox",
  "id": "autoplay",
  "label": "Autoplay",
  "default": false,
  "visible_if": "{{ layout }} == 'slider'"
}
```

**`visible_if` operators:** `==`, `!=`, `>`, `<`, `>=`, `<=`, `and`, `or`, `contains`

### Common Schema Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `'visible_if' is not a valid attribute` | Used on resource setting (product, collection, blog, page, article) | Remove `visible_if` — use Liquid conditional instead |
| `Invalid schema` | Malformed JSON in {% schema %} | Validate JSON (check commas, brackets, quotes) |
| `Duplicate setting ID` | Two settings with same `id` in section or block | Rename one to unique `id` |
| `Multiple schema tags` | More than one `{% schema %}` in file | Keep only one schema tag per section |
| `Schema inside Liquid tag` | `{% schema %}` nested inside if/for/etc. | Move schema to top level (not inside any tag) |
| `Block type already exists` | Duplicate `type` in blocks array | Use unique type names |
| `Missing preset name` | Preset without `name` attribute | Add `name` to preset |
| `Tag not valid` | Invalid HTML tag in schema | Use only: `article`, `aside`, `div`, `footer`, `header`, `section` |
| `Too many sections` | >25 sections in JSON template | Remove or consolidate sections |
| `Too many blocks` | >50 blocks in section (or exceeds `max_blocks`) | Reduce blocks or increase `max_blocks` |
| `Setting type not recognized` | Typo in type name | Check exact type name from valid list above |
| `Max blocks exceeded` | Blocks > `max_blocks` value | Increase limit or remove blocks |
| `enabled_on + disabled_on` | Both used together | Use only one — they're mutually exclusive |
| `Custom CSS too long` | >500 chars section CSS, >1500 chars theme CSS | Reduce custom CSS or move to asset file |

### Section Schema Limits Reference

| Limit | Value |
|-------|-------|
| Sections per JSON template | **25** |
| Blocks per section | **50** (or `max_blocks` if set lower) |
| Nested theme blocks depth | **8 levels** |
| Section `limit` | `1` or `2` only |
| `tag` attribute max length | 50 characters |
| Section custom CSS | 500 characters |
| Theme custom CSS | 1,500 characters |
| Settings per section | No hard limit (but keep reasonable) |
| `product_list` / `collection_list` limit | Set via `limit` attribute |

### Pre-Push Validation Checklist
- [ ] Run `shopify theme check` — zero errors
- [ ] All setting `id` values unique within section
- [ ] All setting `id` values unique within each block
- [ ] All block `type` values unique within section
- [ ] JSON in `{% schema %}` is valid (no trailing commas, proper quotes)
- [ ] `{% schema %}` is at top level (not inside any Liquid tag)
- [ ] Only one `{% schema %}` per file
- [ ] `visible_if` NOT used on resource settings (product, collection, blog, page, article)
- [ ] `enabled_on` and `disabled_on` not used together
- [ ] Presets have `name` attribute
- [ ] `tag` is valid HTML element (article, aside, div, footer, header, section)
- [ ] Block count won't exceed `max_blocks` or 50
- [ ] Section count won't exceed 25 per template

---

## 15 GOLDEN RULES

1. **ALWAYS** analyze the existing theme before making changes
2. **ALWAYS** follow the theme's existing CSS/JS/Liquid patterns
3. **ALWAYS** support `@app` blocks in sections where apps make sense
4. **ALWAYS** use `{{ block.shopify_attributes }}` on block containers
5. **ALWAYS** use `image_url` + `image_tag` for images (Shopify CDN)
6. **ALWAYS** lazy-load below-fold images, eager-load above-fold
7. **ALWAYS** scope section CSS to `.section-{{ section.id }}`
8. **ALWAYS** use `render` not `include` for snippets
9. **ALWAYS** use translation keys, never hardcoded strings
10. **ALWAYS** use whitespace control `{%-` and `-%}`
11. **ALWAYS** provide presets in section schemas
12. **ALWAYS** defer/async JavaScript, wrap in IIFE
13. **NEVER** exceed 25 sections per template or 50 blocks per section
14. **NEVER** use jQuery, React, or heavy frameworks in themes
15. **NEVER** hardcode image URLs — always use CDN filters
