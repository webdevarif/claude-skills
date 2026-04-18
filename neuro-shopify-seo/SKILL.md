---
name: neuro-shopify-seo
description: Shopify SEO expert - structured data, schema markup, meta tags, Open Graph, canonical URLs, Core Web Vitals, page speed SEO, collection/product optimization, international SEO, and technical SEO auditing
trigger: auto
globs:
  - "**/*.liquid"
  - "**/sections/*.liquid"
  - "**/snippets/*.liquid"
  - "**/layout/theme.liquid"
  - "**/templates/*.json"
  - "**/config/settings_schema.json"
---

# Shopify SEO — Comprehensive Technical Reference

You are a Shopify SEO expert. When working on any Shopify theme file, you MUST follow every guideline in this skill. This document is your single source of truth for SEO implementation in Shopify themes.

---

## 1. Technical SEO Foundations

### Title Tags

You MUST use the global `page_title` Liquid object and append the shop name. NEVER hardcode titles.

**In `layout/theme.liquid` inside `<head>`:**

```liquid
<title>
  {{ page_title -}}
  {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
  {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
  {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
</title>
```

### Meta Descriptions

ALWAYS output a meta description when `page_description` exists. NEVER leave pages without meta descriptions.

```liquid
{%- if page_description -%}
  <meta name="description" content="{{ page_description | escape }}">
{%- endif -%}
```

### Canonical URLs

You MUST include a canonical URL on every page to prevent duplicate content. Shopify provides the `canonical_url` global object.

```liquid
<link rel="canonical" href="{{ canonical_url }}">
```

For custom canonical overrides using metafields:

```liquid
{%- if page.metafields.seo.canonical_url != blank -%}
  <link rel="canonical" href="{{ page.metafields.seo.canonical_url }}">
{%- else -%}
  <link rel="canonical" href="{{ canonical_url }}">
{%- endif -%}
```

### Robots Meta Tag

Control indexing per page type. NEVER accidentally noindex important pages.

```liquid
{%- if template.name == 'search' or template.name == '404' -%}
  <meta name="robots" content="noindex, nofollow">
{%- elsif current_tags -%}
  <meta name="robots" content="noindex, follow">
{%- else -%}
  <meta name="robots" content="index, follow">
{%- endif -%}
```

### Robots.txt

Shopify generates `robots.txt` automatically. You can customize it via the `robots.txt.liquid` template:

```liquid
# robots.txt.liquid
User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /*/orders
Disallow: /*/checkouts
Disallow: /carts
Disallow: /account
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /search
Allow: /search/
Allow: /search?q=*

Sitemap: {{ shop.url }}/sitemap.xml

{%- for locale in shop.published_locales -%}
  {%- unless locale.primary -%}
Sitemap: {{ shop.url }}/{{ locale.iso_code }}/sitemap.xml
  {%- endunless -%}
{%- endfor -%}
```

### Sitemap

Shopify auto-generates `sitemap.xml`. You MUST verify it includes:
- All product pages
- All collection pages
- All blog articles
- All custom pages
- Image sitemaps for products

NEVER rely on the default sitemap alone — check Google Search Console for coverage issues.

### Hreflang Tags

For stores using Shopify Markets with multiple languages/regions, hreflang tags are auto-generated. If you need manual control:

```liquid
{%- for locale in shop.published_locales -%}
  <link rel="alternate" hreflang="{{ locale.iso_code }}" href="{{ canonical_url | replace: request.host, request.host }}{{ locale.root_url }}{{ request.path }}">
{%- endfor -%}
<link rel="alternate" hreflang="x-default" href="{{ canonical_url }}">
```

### Pagination SEO

You MUST implement `rel="prev"` and `rel="next"` for paginated collections and blogs:

```liquid
{%- if paginate.previous -%}
  <link rel="prev" href="{{ paginate.previous.url }}">
{%- endif -%}
{%- if paginate.next -%}
  <link rel="next" href="{{ paginate.next.url }}">
{%- endif -%}
```

ALWAYS place these inside `{% paginate %}` blocks within `<head>` or use a `content_for_header` approach.

---

## 2. Structured Data / Schema Markup (JSON-LD)

You MUST use JSON-LD format for all structured data. Google explicitly prefers JSON-LD over Microdata or RDFa. NEVER mix multiple schema formats on the same page. ALWAYS validate with Google's Rich Results Test.

### Product Schema

Place this in `sections/main-product.liquid` or `snippets/product-schema.liquid`:

```liquid
{%- if template.name == 'product' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 5000 | json }},
  "url": "{{ shop.url }}{{ product.url }}",
  "image": [
    {%- for image in product.images -%}
      "{{ image | image_url: width: 1200 }}"{% unless forloop.last %},{% endunless %}
    {%- endfor -%}
  ],
  "brand": {
    "@type": "Brand",
    "name": {{ product.vendor | json }}
  },
  "sku": {{ product.selected_or_first_available_variant.sku | json }},
  {%- if product.selected_or_first_available_variant.barcode != blank -%}
  "gtin": {{ product.selected_or_first_available_variant.barcode | json }},
  {%- endif -%}
  "mpn": {{ product.selected_or_first_available_variant.sku | json }},
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": {{ cart.currency.iso_code | json }},
    "lowPrice": {{ product.price_min | money_without_currency | json }},
    "highPrice": {{ product.price_max | money_without_currency | json }},
    "offerCount": {{ product.variants.size }},
    "offers": [
      {%- for variant in product.variants -%}
      {
        "@type": "Offer",
        "url": "{{ shop.url }}{{ variant.url }}",
        "priceCurrency": {{ cart.currency.iso_code | json }},
        "price": {{ variant.price | money_without_currency | json }},
        "name": {{ variant.title | json }},
        "sku": {{ variant.sku | json }},
        {%- if variant.barcode != blank -%}
        "gtin": {{ variant.barcode | json }},
        {%- endif -%}
        "availability": "https://schema.org/{% if variant.available %}InStock{% else %}OutOfStock{% endif %}",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": {{ shop.name | json }}
        }
      }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
  {%- if product.metafields.reviews.rating.value != blank -%}
  ,"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{ product.metafields.reviews.rating.value }}",
    "reviewCount": "{{ product.metafields.reviews.rating_count.value }}",
    "bestRating": "5",
    "worstRating": "1"
  }
  {%- endif -%}
}
</script>
{%- endif -%}
```

### BreadcrumbList Schema

ALWAYS include breadcrumbs on product and collection pages. Place in `snippets/breadcrumb-schema.liquid`:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ shop.url }}"
    }
    {%- if template.name == 'collection' or template.name == 'product' -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ collection.title | default: product.collections.first.title | json }},
      "item": "{{ shop.url }}{{ collection.url | default: product.collections.first.url }}"
    }
    {%- endif -%}
    {%- if template.name == 'product' -%}
    ,{
      "@type": "ListItem",
      "position": 3,
      "name": {{ product.title | json }},
      "item": "{{ shop.url }}{{ product.url }}"
    }
    {%- endif -%}
    {%- if template.name == 'article' -%}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ blog.title | json }},
      "item": "{{ shop.url }}{{ blog.url }}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": {{ article.title | json }},
      "item": "{{ shop.url }}{{ article.url }}"
    }
    {%- endif -%}
  ]
}
</script>
```

### Organization Schema

Place in `layout/theme.liquid` — output on EVERY page:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": {{ shop.name | json }},
  "url": "{{ shop.url }}",
  "logo": {
    "@type": "ImageObject",
    "url": "{{ settings.logo | image_url: width: 600 }}"
  },
  "description": {{ shop.description | json }},
  {%- if settings.social_facebook_link != blank or settings.social_twitter_link != blank -%}
  "sameAs": [
    {%- if settings.social_facebook_link != blank -%}"{{ settings.social_facebook_link }}"{%- endif -%}
    {%- if settings.social_twitter_link != blank -%}{% if settings.social_facebook_link != blank %},{% endif %}"{{ settings.social_twitter_link }}"{%- endif -%}
    {%- if settings.social_instagram_link != blank -%}{% if settings.social_facebook_link != blank or settings.social_twitter_link != blank %},{% endif %}"{{ settings.social_instagram_link }}"{%- endif -%}
    {%- if settings.social_youtube_link != blank -%},{{ settings.social_youtube_link | json }}{%- endif -%}
    {%- if settings.social_pinterest_link != blank -%},{{ settings.social_pinterest_link | json }}{%- endif -%}
    {%- if settings.social_tiktok_link != blank -%},{{ settings.social_tiktok_link | json }}{%- endif -%}
  ],
  {%- endif -%}
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": {{ settings.contact_phone | json }},
    "contactType": "customer service",
    "email": {{ settings.contact_email | default: shop.email | json }}
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": {{ shop.address.street | json }},
    "addressLocality": {{ shop.address.city | json }},
    "addressRegion": {{ shop.address.province | json }},
    "postalCode": {{ shop.address.zip | json }},
    "addressCountry": {{ shop.address.country_code | json }}
  }
}
</script>
```

### WebSite with SearchAction Schema

Place in `layout/theme.liquid` — enables the Google sitelinks searchbox:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": {{ shop.name | json }},
  "url": "{{ shop.url }}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "{{ shop.url }}/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### Article / BlogPosting Schema

Place in `sections/main-article.liquid` or `snippets/article-schema.liquid`:

```liquid
{%- if template.name == 'article' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": {{ article.title | json }},
  "description": {{ article.excerpt_or_content | strip_html | truncate: 300 | json }},
  "url": "{{ shop.url }}{{ article.url }}",
  "datePublished": "{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "dateModified": "{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "author": {
    "@type": "Person",
    "name": {{ article.author | json }}
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ shop.name | json }},
    "logo": {
      "@type": "ImageObject",
      "url": "{{ settings.logo | image_url: width: 600 }}"
    }
  },
  {%- if article.image -%}
  "image": {
    "@type": "ImageObject",
    "url": "{{ article.image | image_url: width: 1200 }}",
    "width": 1200,
    "height": {{ 1200 | divided_by: article.image.aspect_ratio | round }}
  },
  {%- endif -%}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ shop.url }}{{ article.url }}"
  },
  "wordCount": "{{ article.content | strip_html | split: ' ' | size }}",
  "articleSection": {{ blog.title | json }}
}
</script>
{%- endif -%}
```

### FAQPage Schema

Use on product pages, collection pages, or any page with FAQ sections. Place in `snippets/faq-schema.liquid`:

```liquid
{%- comment -%}
  Usage: {% render 'faq-schema', faqs: section.blocks %}
  Each block must have settings: question, answer
{%- endcomment -%}

{%- if faqs.size > 0 -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {%- for faq in faqs -%}
      {%- if faq.type == 'faq_item' -%}
      {
        "@type": "Question",
        "name": {{ faq.settings.question | json }},
        "acceptedAnswer": {
          "@type": "Answer",
          "text": {{ faq.settings.answer | json }}
        }
      }{% unless forloop.last %},{% endunless %}
      {%- endif -%}
    {%- endfor -%}
  ]
}
</script>
{%- endif -%}
```

### CollectionPage Schema

Place in `sections/main-collection.liquid` or `snippets/collection-schema.liquid`:

```liquid
{%- if template.name == 'collection' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": {{ collection.title | json }},
  "description": {{ collection.description | strip_html | truncate: 5000 | json }},
  "url": "{{ shop.url }}{{ collection.url }}",
  {%- if collection.image -%}
  "image": "{{ collection.image | image_url: width: 1200 }}",
  {%- endif -%}
  "numberOfItems": {{ collection.products_count }},
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": {{ collection.products_count }},
    "itemListElement": [
      {%- for product in collection.products limit: 50 -%}
      {
        "@type": "ListItem",
        "position": {{ forloop.index }},
        "url": "{{ shop.url }}{{ product.url }}",
        "name": {{ product.title | json }},
        "image": "{{ product.featured_image | image_url: width: 600 }}"
      }{% unless forloop.last %},{% endunless %}
      {%- endfor -%}
    ]
  }
}
</script>
{%- endif -%}
```

### Review / AggregateRating Schema

When using Shopify's native reviews or a third-party app, ALWAYS verify the review schema is valid:

```liquid
{%- if product.metafields.reviews.rating.value != blank -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{ product.metafields.reviews.rating.value }}",
    "reviewCount": "{{ product.metafields.reviews.rating_count.value }}",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {%- for review in product.metafields.reviews.list.value limit: 5 -%}
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": {{ review.author | json }}
      },
      "datePublished": "{{ review.created_at | date: '%Y-%m-%d' }}",
      "reviewBody": {{ review.body | json }},
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "{{ review.rating }}",
        "bestRating": "5",
        "worstRating": "1"
      }
    }{% unless forloop.last %},{% endunless %}
    {%- endfor -%}
  ]
}
</script>
{%- endif -%}
```

**IMPORTANT**: NEVER output AggregateRating without real review data. Google will penalize fabricated ratings.

### HowTo Schema

For product pages with usage instructions or tutorial content:

```liquid
{%- comment -%}
  Usage: {% render 'howto-schema', steps: section.blocks, title: section.settings.title %}
{%- endcomment -%}

{%- if steps.size > 0 -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": {{ title | json }},
  "step": [
    {%- for step in steps -%}
      {%- if step.type == 'howto_step' -%}
      {
        "@type": "HowToStep",
        "position": {{ forloop.index }},
        "name": {{ step.settings.step_title | json }},
        "text": {{ step.settings.step_description | json }}
        {%- if step.settings.step_image != blank -%}
        ,"image": "{{ step.settings.step_image | image_url: width: 800 }}"
        {%- endif -%}
      }{% unless forloop.last %},{% endunless %}
      {%- endif -%}
    {%- endfor -%}
  ]
}
</script>
{%- endif -%}
```

### VideoObject Schema

For product pages or articles with embedded video content:

```liquid
{%- comment -%}
  Usage: {% render 'video-schema',
    video_title: 'Product Demo',
    video_description: 'How to use our product',
    video_url: 'https://www.youtube.com/watch?v=...',
    thumbnail_url: product.featured_image | image_url: width: 1280,
    upload_date: product.published_at
  %}
{%- endcomment -%}

{%- if video_url != blank -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": {{ video_title | json }},
  "description": {{ video_description | json }},
  "thumbnailUrl": "{{ thumbnail_url }}",
  "uploadDate": "{{ upload_date | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "contentUrl": {{ video_url | json }},
  "embedUrl": {{ video_url | replace: 'watch?v=', 'embed/' | json }},
  "publisher": {
    "@type": "Organization",
    "name": {{ shop.name | json }},
    "logo": {
      "@type": "ImageObject",
      "url": "{{ settings.logo | image_url: width: 600 }}"
    }
  }
}
</script>
{%- endif -%}
```

---

## 3. Meta Tags — Open Graph & Twitter Cards

### Snippet: `snippets/social-meta-tags.liquid`

ALWAYS include this snippet in `layout/theme.liquid` before `</head>`. NEVER omit Open Graph tags — they control how your pages appear when shared on social media, which drives referral traffic and indirectly affects SEO.

```liquid
{%- comment -%} Open Graph Meta Tags {%- endcomment -%}

{%- liquid
  assign og_title = page_title
  assign og_url = canonical_url
  assign og_type = 'website'
  assign og_description = page_description | default: shop.description | escape

  if template.name == 'product'
    assign og_type = 'product'
    assign og_title = product.title
    assign og_description = product.description | strip_html | truncate: 200 | escape
  elsif template.name == 'article'
    assign og_type = 'article'
    assign og_title = article.title
    assign og_description = article.excerpt_or_content | strip_html | truncate: 200 | escape
  elsif template.name == 'collection'
    assign og_type = 'product.group'
    assign og_title = collection.title
    assign og_description = collection.description | strip_html | truncate: 200 | escape
  elsif template.name == 'blog'
    assign og_type = 'blog'
    assign og_title = blog.title
  endif
-%}

<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ og_url }}">
<meta property="og:title" content="{{ og_title }}">
<meta property="og:type" content="{{ og_type }}">
<meta property="og:description" content="{{ og_description }}">

{%- comment -%} Open Graph Images {%- endcomment -%}
{%- if template.name == 'product' -%}
  {%- for image in product.images limit: 3 -%}
    <meta property="og:image" content="https:{{ image | image_url: width: 1200 }}">
    <meta property="og:image:secure_url" content="https:{{ image | image_url: width: 1200 }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="{{ 1200 | divided_by: image.aspect_ratio | round }}">
    <meta property="og:image:alt" content="{{ image.alt | escape }}">
  {%- endfor -%}
{%- elsif template.name == 'article' and article.image -%}
  <meta property="og:image" content="https:{{ article.image | image_url: width: 1200 }}">
  <meta property="og:image:secure_url" content="https:{{ article.image | image_url: width: 1200 }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="{{ 1200 | divided_by: article.image.aspect_ratio | round }}">
{%- elsif template.name == 'collection' and collection.image -%}
  <meta property="og:image" content="https:{{ collection.image | image_url: width: 1200 }}">
  <meta property="og:image:secure_url" content="https:{{ collection.image | image_url: width: 1200 }}">
{%- elsif settings.share_image -%}
  <meta property="og:image" content="https:{{ settings.share_image | image_url: width: 1200 }}">
  <meta property="og:image:secure_url" content="https:{{ settings.share_image | image_url: width: 1200 }}">
{%- endif -%}

{%- comment -%} Product-specific OG tags {%- endcomment -%}
{%- if template.name == 'product' -%}
  <meta property="og:price:amount" content="{{ product.selected_or_first_available_variant.price | money_without_currency }}">
  <meta property="og:price:currency" content="{{ cart.currency.iso_code }}">
  <meta property="product:availability" content="{% if product.available %}instock{% else %}oos{% endif %}">
  <meta property="product:condition" content="new">
  <meta property="product:brand" content="{{ product.vendor | escape }}">
{%- endif -%}

{%- comment -%} Article-specific OG tags {%- endcomment -%}
{%- if template.name == 'article' -%}
  <meta property="article:published_time" content="{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}">
  <meta property="article:modified_time" content="{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%z' }}">
  <meta property="article:author" content="{{ article.author }}">
  {%- for tag in article.tags -%}
    <meta property="article:tag" content="{{ tag }}">
  {%- endfor -%}
{%- endif -%}

{%- comment -%} Twitter Card Tags {%- endcomment -%}
<meta name="twitter:card" content="summary_large_image">
{%- if settings.social_twitter_link != blank -%}
  <meta name="twitter:site" content="{{ settings.social_twitter_link | split: 'twitter.com/' | last | split: 'x.com/' | last | prepend: '@' }}">
{%- endif -%}
<meta name="twitter:title" content="{{ og_title }}">
<meta name="twitter:description" content="{{ og_description }}">
{%- if template.name == 'product' and product.featured_image -%}
  <meta name="twitter:image" content="https:{{ product.featured_image | image_url: width: 1200 }}">
  <meta name="twitter:image:alt" content="{{ product.featured_image.alt | escape }}">
{%- elsif template.name == 'article' and article.image -%}
  <meta name="twitter:image" content="https:{{ article.image | image_url: width: 1200 }}">
{%- elsif settings.share_image -%}
  <meta name="twitter:image" content="https:{{ settings.share_image | image_url: width: 1200 }}">
{%- endif -%}
```

### Title Tag Patterns by Page Type

You MUST follow these patterns for optimal SEO:

| Page Type | Title Pattern | Example |
|-----------|--------------|---------|
| Homepage | `Brand Name \| Tagline` | `Acme Co \| Premium Outdoor Gear` |
| Product | `Product Name - Key Feature \| Brand` | `Alpine Pro Jacket - Waterproof \| Acme Co` |
| Collection | `Category Name \| Brand - Shop N+ Products` | `Winter Jackets \| Acme Co - Shop 50+ Products` |
| Blog Index | `Blog Name \| Brand` | `The Outdoor Journal \| Acme Co` |
| Article | `Article Title \| Blog Name \| Brand` | `How to Layer for Winter \| The Outdoor Journal \| Acme Co` |
| Page | `Page Title \| Brand` | `About Us \| Acme Co` |
| Search | `Search Results for "query" \| Brand` | `Search Results for "jacket" \| Acme Co` |

### Meta Description Patterns

| Page Type | Pattern | Character Limit |
|-----------|---------|-----------------|
| Product | `Buy [Product Name] with [key features]. $[Price]. [Availability]. Free shipping over $[X].` | 150-160 |
| Collection | `Shop [category] [products]. [Unique value prop]. [CTA].` | 150-160 |
| Article | `[Summary of article topic]. Read our guide on [topic] at [Brand].` | 150-160 |
| Homepage | `[Brand] offers [main product category]. [USP]. [CTA].` | 150-160 |

---

## 4. Product Page SEO

### Product Title Optimization

- ALWAYS place the primary keyword at the beginning of the product title
- Include key differentiating attributes (size, color, material) only when they are the primary variant
- Keep titles under 70 characters for full display in SERPs
- NEVER stuff keywords — write for humans first

### Product Description SEO

- ALWAYS write unique descriptions of 300+ words minimum
- Use a single `<h1>` for the product title (rendered by the theme)
- Use `<h2>` and `<h3>` for subheadings within descriptions
- Include the primary keyword naturally within the first 100 words
- Add bullet points for scannable features
- NEVER duplicate manufacturer descriptions verbatim

### Image Alt Text

You MUST include descriptive alt text on every product image:

```liquid
{%- for image in product.images -%}
  <img
    src="{{ image | image_url: width: 800 }}"
    alt="{{ image.alt | default: product.title | escape }}"
    width="{{ image.width }}"
    height="{{ image.height }}"
    loading="{% if forloop.first %}eager{% else %}lazy{% endif %}"
  >
{%- endfor -%}
```

**Alt text rules:**
- ALWAYS describe what is visible in the image
- Include the product name and key attributes
- NEVER start with "Image of..." or "Photo of..."
- Keep under 125 characters
- NEVER leave alt text blank — use `product.title` as fallback

### Variant URLs

Shopify appends `?variant=ID` to product URLs. You MUST ensure:

```liquid
{%- comment -%} Canonical should point to the base product URL, not variant URLs {%- endcomment -%}
<link rel="canonical" href="{{ shop.url }}{{ product.url }}">
```

NEVER let variant URLs get indexed separately — they create duplicate content.

### SKU / GTIN / MPN in Schema

ALWAYS include identifiers when available — Google uses them for Merchant Center matching:

```liquid
"sku": {{ variant.sku | json }},
{%- if variant.barcode != blank -%}
  {%- if variant.barcode.size == 12 -%}
    "gtin12": {{ variant.barcode | json }},
  {%- elsif variant.barcode.size == 13 -%}
    "gtin13": {{ variant.barcode | json }},
  {%- elsif variant.barcode.size == 14 -%}
    "gtin14": {{ variant.barcode | json }},
  {%- else -%}
    "gtin": {{ variant.barcode | json }},
  {%- endif -%}
{%- endif -%}
"mpn": {{ variant.sku | json }},
```

---

## 5. Collection Page SEO

### Collection Title & Description

- ALWAYS write unique collection descriptions of 150-300 words
- Include the primary keyword in the collection title
- Place descriptive content above AND below the product grid when possible
- Use `<h1>` for the collection title, `<h2>` for subcategories

```liquid
{%- if collection.description != blank -%}
  <div class="collection-description rte">
    {{ collection.description }}
  </div>
{%- endif -%}
```

### Filtering Without Duplicate Content

Shopify filter URLs create parameter-heavy URLs that can cause duplicate content issues. You MUST control indexing:

```liquid
{%- comment -%} In theme.liquid <head> {%- endcomment -%}
{%- if request.path contains '/collections/' -%}
  {%- if current_tags or request.params.filter -%}
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="{{ collection.url }}">
  {%- endif -%}
{%- endif -%}
```

### Pagination SEO

ALWAYS implement pagination correctly for collections:

```liquid
{%- paginate collection.products by 24 -%}
  {%- comment -%} Output rel prev/next in head {%- endcomment -%}
  {%- if paginate.previous -%}
    <link rel="prev" href="{{ paginate.previous.url }}">
  {%- endif -%}
  {%- if paginate.next -%}
    <link rel="next" href="{{ paginate.next.url }}">
  {%- endif -%}

  {%- comment -%} Product grid {%- endcomment -%}
  {%- for product in collection.products -%}
    {% render 'product-card', product: product %}
  {%- endfor -%}

  {%- comment -%} Pagination navigation {%- endcomment -%}
  {%- if paginate.pages > 1 -%}
    <nav aria-label="Pagination">
      {{ paginate | default_pagination: next: 'Next', previous: 'Previous' }}
    </nav>
  {%- endif -%}
{%- endpaginate -%}
```

### Collection Image

ALWAYS set a collection image — it appears in OG tags and can appear in Google image results:

```liquid
{%- if collection.image -%}
  <img
    src="{{ collection.image | image_url: width: 1200 }}"
    alt="{{ collection.image.alt | default: collection.title | escape }}"
    width="{{ collection.image.width }}"
    height="{{ collection.image.height }}"
    loading="eager"
    fetchpriority="high"
  >
{%- endif -%}
```

### Sort Order Impact

NEVER let sort parameters create indexable duplicate pages:

```liquid
{%- if request.params.sort_by -%}
  <link rel="canonical" href="{{ collection.url }}">
  <meta name="robots" content="noindex, follow">
{%- endif -%}
```

---

## 6. Image SEO

### Alt Text Best Practices

- ALWAYS include `alt` attributes — accessibility AND SEO requirement
- Describe the image content specifically: "Red leather crossbody bag with gold buckle" not "bag"
- Include product name in alt text for product images
- Use unique alt text for each image — NEVER repeat the same alt across all images

### Image Filename Conventions

Shopify renames uploaded files, but you MUST name them descriptively before upload:
- Use hyphens: `red-leather-crossbody-bag.jpg`
- Include keywords: `alpine-pro-waterproof-jacket-blue.webp`
- NEVER use generic names: `IMG_0001.jpg`, `photo1.png`

### Lazy Loading Impact on SEO

ALWAYS eager-load above-the-fold images. NEVER lazy-load the LCP element:

```liquid
<img
  src="{{ image | image_url: width: 800 }}"
  alt="{{ image.alt | escape }}"
  width="{{ image.width }}"
  height="{{ image.height }}"
  {%- if forloop.first and section.index == 1 -%}
    loading="eager"
    fetchpriority="high"
  {%- else -%}
    loading="lazy"
  {%- endif -%}
>
```

### WebP/AVIF Format

Shopify's CDN automatically serves WebP when the browser supports it. You MUST use the `image_url` filter (not the deprecated `img_url`) to leverage this:

```liquid
{%- comment -%} Modern approach — uses Shopify CDN with automatic format negotiation {%- endcomment -%}
{{ product.featured_image | image_url: width: 800 }}

{%- comment -%} With srcset for responsive images {%- endcomment -%}
<img
  src="{{ image | image_url: width: 800 }}"
  srcset="
    {{ image | image_url: width: 400 }} 400w,
    {{ image | image_url: width: 600 }} 600w,
    {{ image | image_url: width: 800 }} 800w,
    {{ image | image_url: width: 1200 }} 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 900px) 600px, 800px"
  alt="{{ image.alt | escape }}"
  width="{{ image.width }}"
  height="{{ image.height }}"
  loading="lazy"
>
```

### Image Sitemap

Shopify auto-includes product images in the sitemap. You MUST ensure:
- Every product has at least one image
- All images have alt text (used as image caption in sitemap)
- Images are high quality (minimum 800px wide)

### Image CDN Optimization with `image_url` Filter

ALWAYS use the `image_url` filter for CDN-optimized delivery:

```liquid
{%- comment -%} Resize to specific width {%- endcomment -%}
{{ image | image_url: width: 600 }}

{%- comment -%} Resize with crop {%- endcomment -%}
{{ image | image_url: width: 600, height: 600, crop: 'center' }}

{%- comment -%} Preload hero/LCP image {%- endcomment -%}
<link rel="preload" as="image" href="{{ section.settings.hero_image | image_url: width: 1200 }}" fetchpriority="high">
```

---

## 7. URL Structure

### Shopify URL Limitations

Shopify enforces these URL structures — you CANNOT change them:
- Products: `/products/[handle]`
- Collections: `/collections/[handle]`
- Pages: `/pages/[handle]`
- Blogs: `/blogs/[blog-handle]/[article-handle]`
- Product in collection: `/collections/[collection]/products/[product]` (canonicalizes to `/products/[handle]`)

### Handle Optimization

- ALWAYS include the primary keyword in the handle
- Keep handles short: 3-5 words maximum
- Use hyphens as separators
- NEVER change a handle on a live page without creating a 301 redirect
- Avoid stop words (the, a, an, of) in handles

### Redirect Management

ALWAYS create 301 redirects when changing URLs. In Shopify Admin or via API:

```liquid
{%- comment -%}
  Shopify manages redirects via Admin > Online Store > Navigation > URL Redirects
  Or via the Redirect API:
  POST /admin/api/2024-10/redirects.json
  { "redirect": { "path": "/old-url", "target": "/new-url" } }
{%- endcomment -%}
```

**Rules:**
- NEVER create redirect chains (A -> B -> C). ALWAYS redirect directly to the final URL.
- NEVER create redirect loops.
- Audit redirects quarterly — remove redirects to pages that no longer exist.
- When deleting a product, redirect its URL to the parent collection.

### Avoiding Duplicate Content with Canonical Tags

Shopify creates multiple URL paths to the same product:
- `/products/widget` (canonical)
- `/collections/gadgets/products/widget` (duplicate)

Shopify handles this automatically with canonical tags, but you MUST verify by checking:

```liquid
{%- comment -%} This should ALWAYS output /products/handle, never /collections/.../products/handle {%- endcomment -%}
{{ canonical_url }}
```

---

## 8. International SEO

### Hreflang Implementation for Shopify Markets

Shopify Markets automatically manages hreflang when configured. You MUST verify the output:

```liquid
{%- comment -%}
  Shopify Markets auto-generates hreflang tags like:
  <link rel="alternate" hreflang="en" href="https://store.com/products/widget">
  <link rel="alternate" hreflang="fr" href="https://store.com/fr/products/widget">
  <link rel="alternate" hreflang="de" href="https://store.com/de/products/widget">
  <link rel="alternate" hreflang="x-default" href="https://store.com/products/widget">
{%- endcomment -%}

{%- comment -%} Manual hreflang if needed (e.g., custom domains per market) {%- endcomment -%}
{%- for locale in shop.published_locales -%}
  <link rel="alternate" hreflang="{{ locale.iso_code }}"
    href="{{ shop.url }}{{ locale.root_url }}{{ request.path }}">
{%- endfor -%}
<link rel="alternate" hreflang="x-default" href="{{ shop.url }}{{ request.path }}">
```

### Multi-Language Store Setup

- ALWAYS use Shopify Markets subfolders (`/fr/`, `/de/`) — NOT separate stores
- ALWAYS translate meta titles, meta descriptions, and alt text — not just page content
- NEVER use auto-translation alone for SEO content — human review is required
- ALWAYS include translated keywords in the localized meta tags

```liquid
{%- comment -%} Localized meta description {%- endcomment -%}
{%- if page_description -%}
  <meta name="description" content="{{ page_description | escape }}">
{%- endif -%}

{%- comment -%}
  The page_description object automatically returns the translated version
  when the customer is viewing a translated locale, provided translations exist.
{%- endcomment -%}
```

### Multi-Currency SEO

- Price in structured data MUST reflect the customer's local currency:

```liquid
"priceCurrency": {{ cart.currency.iso_code | json }},
"price": {{ product.selected_or_first_available_variant.price | money_without_currency | json }},
```

- ALWAYS include the currency in OG tags for proper social sharing:

```liquid
<meta property="og:price:amount" content="{{ product.selected_or_first_available_variant.price | money_without_currency }}">
<meta property="og:price:currency" content="{{ cart.currency.iso_code }}">
```

### Geotargeting

- Use Shopify Markets to assign countries to specific markets
- Each market gets its own subdirectory and hreflang annotations
- ALWAYS submit localized sitemaps to Google Search Console for each target country
- Consider separate Google Search Console properties for each market

### Localized Content

- ALWAYS translate collection descriptions, not just product titles
- Translate image alt text for each locale
- Use locale-specific keywords — direct translations often miss search intent
- ALWAYS localize structured data (schema) descriptions

---

## 9. Core Web Vitals for SEO

Core Web Vitals are confirmed Google ranking factors. As of 2026, the thresholds are:
- **LCP** (Largest Contentful Paint): under 2.5 seconds
- **CLS** (Cumulative Layout Shift): under 0.1
- **INP** (Interaction to Next Paint): under 200ms

### LCP Optimization

LCP is where most Shopify stores fail. The LCP element is typically the hero image or main product image.

**You MUST:**

```liquid
{%- comment -%} 1. Preload the LCP image {%- endcomment -%}
<link rel="preload" as="image"
  href="{{ section.settings.hero_image | image_url: width: 1200 }}"
  fetchpriority="high"
  type="image/webp">

{%- comment -%} 2. NEVER lazy-load the LCP element {%- endcomment -%}
<img
  src="{{ section.settings.hero_image | image_url: width: 1200 }}"
  alt="{{ section.settings.hero_image.alt | escape }}"
  width="{{ section.settings.hero_image.width }}"
  height="{{ section.settings.hero_image.height }}"
  loading="eager"
  fetchpriority="high"
>

{%- comment -%} 3. Inline critical CSS for above-the-fold content {%- endcomment -%}
<style>
  .hero-section { /* critical layout styles */ }
</style>

{%- comment -%} 4. Defer non-critical scripts {%- endcomment -%}
<script src="{{ 'non-critical.js' | asset_url }}" defer></script>
```

**Shopify-specific LCP killers:**
- Third-party app scripts loading synchronously — audit in Chrome DevTools
- Unoptimized hero images — ALWAYS use `image_url` with explicit width
- Render-blocking CSS — inline critical CSS, defer the rest
- Font loading — preload critical fonts, use `font-display: swap`

### CLS Prevention

**You MUST:**

```liquid
{%- comment -%} 1. ALWAYS set explicit dimensions on images {%- endcomment -%}
<img
  src="{{ image | image_url: width: 600 }}"
  width="{{ image.width }}"
  height="{{ image.height }}"
  alt="{{ image.alt | escape }}"
  style="aspect-ratio: {{ image.width }} / {{ image.height }};"
  loading="lazy"
>

{%- comment -%} 2. Reserve space for dynamic elements {%- endcomment -%}
<div class="review-widget-placeholder" style="min-height: 200px;">
  {%- comment -%} Review widget loads here — space is reserved {%- endcomment -%}
</div>

{%- comment -%} 3. Use CSS containment for sections {%- endcomment -%}
<style>
  .product-recommendations { contain: layout; min-height: 400px; }
  .announcement-bar { contain: layout; min-height: 40px; }
</style>
```

**Common CLS culprits on Shopify:**
- Images without `width`/`height` attributes
- Announcement bars that inject after page load
- Review widgets loading asynchronously
- Web fonts causing FOUT (flash of unstyled text)
- Dynamic cart drawer opening and pushing content

### INP Improvement

**You MUST:**

```liquid
{%- comment -%} 1. Defer non-essential third-party scripts {%- endcomment -%}
<script>
  // Load chat widget only on user interaction
  document.addEventListener('click', function loadChat() {
    const script = document.createElement('script');
    script.src = 'https://chat-widget.example.com/widget.js';
    document.body.appendChild(script);
    document.removeEventListener('click', loadChat);
  }, { once: true });
</script>

{%- comment -%} 2. Use requestIdleCallback for non-critical work {%- endcomment -%}
<script>
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Initialize analytics, tracking, etc.
    });
  }
</script>

{%- comment -%} 3. Debounce scroll handlers {%- endcomment -%}
<script>
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Handle scroll
    }, 100);
  }, { passive: true });
</script>
```

**INP best practices:**
- Audit installed Shopify apps — each adds 150-300ms to interaction time
- Remove unused apps immediately
- Use `passive: true` on scroll/touch event listeners
- Break long JavaScript tasks with `scheduler.yield()` where supported
- NEVER run synchronous heavy computation on the main thread

### Shopify-Specific CWV Issues

1. **App scripts**: The #1 performance killer. Audit with `document.querySelectorAll('script[src*="apps"]')` in console.
2. **Shopify analytics**: Loads automatically — you cannot remove it, but you can defer your own analytics.
3. **Theme editor scripts**: Only load in the editor — NEVER worry about these for CWV.
4. **Liquid rendering**: Server-side — does not affect CWV directly, but complex Liquid can slow TTFB.

---

## 10. Internal Linking

### Breadcrumb Implementation

ALWAYS implement visible breadcrumbs with schema markup:

```liquid
{%- comment -%} snippets/breadcrumbs.liquid {%- endcomment -%}
<nav aria-label="Breadcrumb" class="breadcrumbs">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1">
    </li>

    {%- if template.name == 'collection' or template.name == 'product' -%}
      {%- assign current_collection = collection | default: product.collections.first -%}
      {%- if current_collection -%}
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="{{ current_collection.url }}">
            <span itemprop="name">{{ current_collection.title }}</span>
          </a>
          <meta itemprop="position" content="2">
        </li>
      {%- endif -%}
    {%- endif -%}

    {%- if template.name == 'product' -%}
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">{{ product.title }}</span>
        <meta itemprop="item" content="{{ shop.url }}{{ product.url }}">
        <meta itemprop="position" content="3">
      </li>
    {%- endif -%}

    {%- if template.name == 'article' -%}
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="{{ blog.url }}">
          <span itemprop="name">{{ blog.title }}</span>
        </a>
        <meta itemprop="position" content="2">
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">{{ article.title }}</span>
        <meta itemprop="item" content="{{ shop.url }}{{ article.url }}">
        <meta itemprop="position" content="3">
      </li>
    {%- endif -%}
  </ol>
</nav>

{%- comment -%} Also output JSON-LD breadcrumb schema {%- endcomment -%}
{% render 'breadcrumb-schema' %}
```

### Related Products

ALWAYS include related products for internal linking value:

```liquid
{%- comment -%} sections/related-products.liquid {%- endcomment -%}
<section class="related-products" aria-label="Related products">
  <h2>You may also like</h2>
  <div class="product-grid">
    {%- for recommendation in recommendations.products limit: 4 -%}
      <a href="{{ recommendation.url }}" class="product-card">
        <img
          src="{{ recommendation.featured_image | image_url: width: 400 }}"
          alt="{{ recommendation.featured_image.alt | default: recommendation.title | escape }}"
          width="400"
          height="{{ 400 | divided_by: recommendation.featured_image.aspect_ratio | round }}"
          loading="lazy"
        >
        <h3>{{ recommendation.title }}</h3>
        <span>{{ recommendation.price | money }}</span>
      </a>
    {%- endfor -%}
  </div>
</section>
```

### Cross-Selling Links

Add "Complete the look" or "Frequently bought together" sections:

```liquid
{%- if product.metafields.custom.cross_sell_products.value != blank -%}
  <section class="cross-sell" aria-label="Frequently bought together">
    <h2>Frequently bought together</h2>
    {%- for cross_product in product.metafields.custom.cross_sell_products.value -%}
      <a href="{{ cross_product.url }}">{{ cross_product.title }}</a>
    {%- endfor -%}
  </section>
{%- endif -%}
```

### Collection Hierarchy

Use menu/navigation to establish collection hierarchy for crawling:

```liquid
{%- comment -%} Mega menu with SEO-friendly links {%- endcomment -%}
<nav aria-label="Main navigation">
  {%- for link in linklists.main-menu.links -%}
    <div class="nav-item">
      <a href="{{ link.url }}">{{ link.title }}</a>
      {%- if link.links.size > 0 -%}
        <ul class="submenu">
          {%- for child_link in link.links -%}
            <li><a href="{{ child_link.url }}">{{ child_link.title }}</a></li>
          {%- endfor -%}
        </ul>
      {%- endif -%}
    </div>
  {%- endfor -%}
</nav>
```

NEVER hide navigation links behind JavaScript-only interactions — search engines MUST be able to follow them via `<a href>`.

---

## 11. Content SEO

### Blog Strategy

- ALWAYS create a content calendar targeting long-tail keywords
- Write 1,500+ word guides for pillar content
- Link from blog articles to relevant product and collection pages
- Use articles to target informational queries that products cannot rank for
- Add FAQ sections to articles for featured snippet eligibility

### Product Description Writing

**You MUST follow this structure:**

```liquid
{%- comment -%} Product description template {%- endcomment -%}
<div class="product-description rte">
  {%- comment -%} Opening paragraph with primary keyword (50-100 words) {%- endcomment -%}
  <p>{{ product.metafields.custom.seo_intro | default: product.description }}</p>

  {%- comment -%} Features list (scannable) {%- endcomment -%}
  {%- if product.metafields.custom.features != blank -%}
    <h2>Key Features</h2>
    <ul>
      {%- for feature in product.metafields.custom.features.value -%}
        <li>{{ feature }}</li>
      {%- endfor -%}
    </ul>
  {%- endif -%}

  {%- comment -%} Detailed description (200+ words) {%- endcomment -%}
  {%- if product.metafields.custom.detailed_description != blank -%}
    <h2>Details</h2>
    {{ product.metafields.custom.detailed_description }}
  {%- endif -%}

  {%- comment -%} Specifications table {%- endcomment -%}
  {%- if product.metafields.custom.specifications != blank -%}
    <h2>Specifications</h2>
    <table>
      {%- for spec in product.metafields.custom.specifications.value -%}
        <tr>
          <th>{{ spec.label }}</th>
          <td>{{ spec.value }}</td>
        </tr>
      {%- endfor -%}
    </table>
  {%- endif -%}
</div>
```

### Collection Description Optimization

- Write 150-300 words of original content per collection
- Include the primary keyword in the first sentence
- Explain what the collection includes, who it is for, and why to buy
- Add internal links to related collections
- Place content above the product grid for crawl priority

### FAQ Sections for Featured Snippets

ALWAYS add FAQ sections to high-traffic product and collection pages:

```liquid
{%- comment -%} sections/faq-section.liquid {%- endcomment -%}
{%- if section.blocks.size > 0 -%}
  <section class="faq-section">
    <h2>{{ section.settings.heading | default: 'Frequently Asked Questions' }}</h2>
    {%- for block in section.blocks -%}
      {%- if block.type == 'faq_item' -%}
        <details {{ block.shopify_attributes }}>
          <summary>
            <h3>{{ block.settings.question }}</h3>
          </summary>
          <div class="faq-answer">
            {{ block.settings.answer }}
          </div>
        </details>
      {%- endif -%}
    {%- endfor -%}
  </section>

  {%- comment -%} Output FAQPage schema {%- endcomment -%}
  {% render 'faq-schema', faqs: section.blocks %}
{%- endif -%}

{% schema %}
{
  "name": "FAQ Section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Frequently Asked Questions"
    }
  ],
  "blocks": [
    {
      "type": "faq_item",
      "name": "FAQ Item",
      "settings": [
        {
          "type": "text",
          "id": "question",
          "label": "Question"
        },
        {
          "type": "richtext",
          "id": "answer",
          "label": "Answer"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

## 12. SEO Audit Checklist

Run this checklist on every Shopify store. NEVER skip items.

### Technical Foundation (10 checkpoints)

- [ ] SSL certificate active — all pages load over HTTPS
- [ ] `robots.txt` is accessible and correctly configured
- [ ] `sitemap.xml` is submitted to Google Search Console
- [ ] All pages return 200 status codes (no soft 404s)
- [ ] 301 redirects are in place for all changed URLs
- [ ] No redirect chains or loops exist
- [ ] Canonical tags are present and correct on every page
- [ ] Mobile-responsive design passes Google's Mobile-Friendly Test
- [ ] Page load time under 3 seconds on mobile
- [ ] No mixed content warnings (HTTP resources on HTTPS pages)

### Indexing & Crawlability (8 checkpoints)

- [ ] Important pages are NOT blocked by robots.txt
- [ ] No accidental `noindex` tags on product/collection pages
- [ ] Filtered/sorted collection URLs are noindexed
- [ ] Paginated pages have `rel="prev"` and `rel="next"`
- [ ] Search results pages are noindexed
- [ ] Tag pages (`/collections/*/tag`) are noindexed or canonicalized
- [ ] Duplicate product URLs (via collections) canonicalize correctly
- [ ] JavaScript-rendered content is accessible to Googlebot

### On-Page SEO (10 checkpoints)

- [ ] Every page has a unique `<title>` tag (50-60 characters)
- [ ] Every page has a unique `<meta name="description">` (150-160 characters)
- [ ] Every page has exactly one `<h1>` tag
- [ ] Heading hierarchy is logical (H1 > H2 > H3, no skipping)
- [ ] Product descriptions are unique (no manufacturer copy-paste)
- [ ] Product descriptions are 300+ words
- [ ] Collection descriptions are 150-300 words
- [ ] URLs contain target keywords (handles are optimized)
- [ ] Internal links use descriptive anchor text (not "click here")
- [ ] No orphan pages (every page has at least one internal link)

### Structured Data (8 checkpoints)

- [ ] Product schema is valid on all product pages (test with Rich Results Test)
- [ ] Product schema includes price, availability, SKU, and brand
- [ ] AggregateRating schema only appears when reviews exist
- [ ] BreadcrumbList schema matches visible breadcrumbs
- [ ] Organization schema is present on the homepage
- [ ] WebSite schema with SearchAction is on the homepage
- [ ] Article schema is on all blog post pages
- [ ] No duplicate/conflicting schema from multiple apps

### Image SEO (6 checkpoints)

- [ ] All images have descriptive `alt` text
- [ ] No images have empty `alt=""` (except decorative images)
- [ ] Product images use `image_url` filter for CDN optimization
- [ ] Above-the-fold images use `loading="eager"` and `fetchpriority="high"`
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] Images have explicit `width` and `height` attributes

### Core Web Vitals (5 checkpoints)

- [ ] LCP is under 2.5 seconds on mobile
- [ ] CLS is under 0.1
- [ ] INP is under 200ms
- [ ] Hero/LCP image is preloaded
- [ ] Third-party scripts are deferred or loaded on interaction

### International SEO (5 checkpoints)

- [ ] Hreflang tags are present and valid for all locale variants
- [ ] `x-default` hreflang is set
- [ ] Translated content has localized meta titles and descriptions
- [ ] Currency in structured data matches the customer's locale
- [ ] Localized sitemaps are submitted to Search Console

### Content & Links (5 checkpoints)

- [ ] Blog is active with regular publishing schedule
- [ ] Blog articles link to relevant products and collections
- [ ] Related products section exists on product pages
- [ ] Breadcrumb navigation is visible and schema-marked
- [ ] No broken internal links (404s)

---

## 13. Common SEO Mistakes

### Duplicate Content

- **Mistake**: Multiple URLs for the same product via collection paths (`/collections/x/products/y` vs `/products/y`).
- **Fix**: Shopify handles this with canonical tags — ALWAYS verify `{{ canonical_url }}` outputs the base product URL.

- **Mistake**: Tag pages creating thin, duplicate filtered views.
- **Fix**: Add `noindex` to tag/filter pages.

### Missing Alt Text

- **Mistake**: Leaving `alt` attributes empty or using the same alt for every image.
- **Fix**: Use `{{ image.alt | default: product.title | escape }}` as a minimum fallback. ALWAYS write unique alt text per image.

### Thin Content

- **Mistake**: Product pages with only a title and price — no description.
- **Fix**: Write 300+ word unique descriptions. Use metafields for structured content blocks.

- **Mistake**: Collection pages with no description at all.
- **Fix**: Write 150-300 words per collection. Explain what is in the collection and who it is for.

### Broken Links

- **Mistake**: Deleting products or collections without redirects.
- **Fix**: ALWAYS create a 301 redirect before deleting any page. Redirect to the most relevant remaining page.

### Redirect Chains

- **Mistake**: Old URL -> Intermediate URL -> Final URL (each hop loses link equity).
- **Fix**: Audit redirects quarterly. Update all redirects to point directly to the final destination.

### Non-Indexable Pages

- **Mistake**: Important pages accidentally set to `noindex` via theme code or apps.
- **Fix**: Audit `<meta name="robots">` tags across all page types. Use Google Search Console's Coverage report.

### JavaScript Rendering Issues

- **Mistake**: Critical content (product descriptions, prices, reviews) loaded only via JavaScript.
- **Fix**: Render critical content server-side with Liquid. Use JavaScript only for enhancements (cart drawer, quick-view).

- **Mistake**: Navigation links only work via JavaScript (`onclick` instead of `href`).
- **Fix**: ALWAYS use `<a href="...">` for navigation. Add JavaScript behavior on top.

### Missing Schema or Conflicting Schema

- **Mistake**: Theme outputs basic Product schema, then a review app adds its own conflicting Product schema.
- **Fix**: Audit all schema on every page type. Remove duplicates. Only ONE Product schema per product page.

### Ignoring Core Web Vitals

- **Mistake**: Installing 10+ Shopify apps without checking performance impact.
- **Fix**: Audit each app's script impact. Remove apps that add more than 200ms to page load. Consider alternatives.

### Poor URL Handles

- **Mistake**: Auto-generated handles like `product-1` or `copy-of-blue-widget`.
- **Fix**: Manually set keyword-rich handles before publishing. NEVER leave default handles.

---

## 14. Monitoring & Tools

### Google Search Console Integration

ALWAYS verify the store in Google Search Console. Add verification via:

```liquid
{%- comment -%} In layout/theme.liquid <head> {%- endcomment -%}
<meta name="google-site-verification" content="{{ settings.google_site_verification }}">
```

Add to `config/settings_schema.json`:

```json
{
  "name": "SEO Settings",
  "settings": [
    {
      "type": "text",
      "id": "google_site_verification",
      "label": "Google Site Verification Code",
      "info": "The content value from your Google Search Console verification meta tag."
    },
    {
      "type": "text",
      "id": "bing_site_verification",
      "label": "Bing Site Verification Code"
    }
  ]
}
```

**Monitor these GSC reports weekly:**
- **Performance**: Track clicks, impressions, CTR, and average position
- **Coverage**: Check for indexing errors, excluded pages, and valid pages
- **Enhancements**: Monitor Rich Results, Breadcrumbs, and Product structured data
- **Core Web Vitals**: Track LCP, CLS, INP across mobile and desktop
- **Sitemaps**: Ensure all sitemaps are submitted and processed

### Shopify Analytics

- Use Shopify Analytics > Reports > Sessions by landing page to find top organic pages
- Monitor "Sessions by referrer" to track organic search traffic trends
- Track conversion rates per landing page to identify high-value SEO pages

### Performance Monitoring

**Automated CWV monitoring setup:**

```liquid
{%- comment -%} Add web-vitals library for real user monitoring {%- endcomment -%}
<script type="module">
  import { onLCP, onCLS, onINP } from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';

  function sendToAnalytics(metric) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      page: window.location.pathname,
      navigationType: metric.navigationType
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/apps/analytics/cwv', body);
    }
  }

  onLCP(sendToAnalytics);
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
</script>
```

### Recommended SEO Audit Tools

- **Google Search Console** — Free, essential. Submit sitemaps, monitor indexing, track rankings.
- **Google Rich Results Test** — Validate structured data on every page type.
- **Google PageSpeed Insights** — Test Core Web Vitals with real user data (CrUX) and lab data.
- **Screaming Frog** — Crawl the entire store to find broken links, missing meta tags, duplicate content.
- **Ahrefs / Semrush** — Track keyword rankings, backlinks, and competitor analysis.
- **Schema.org Validator** — Validate all JSON-LD output against the schema.org specification.

### Regular SEO Maintenance Schedule

| Frequency | Task |
|-----------|------|
| Weekly | Check GSC for new crawl errors and indexing issues |
| Weekly | Monitor Core Web Vitals in GSC |
| Bi-weekly | Review top-performing pages and optimize further |
| Monthly | Audit new/changed pages for SEO completeness |
| Monthly | Check for broken links and redirect chains |
| Quarterly | Full technical SEO audit (use checklist above) |
| Quarterly | Review and update product/collection descriptions |
| Quarterly | Audit installed apps for performance impact |
| Annually | Comprehensive keyword research refresh |
| Annually | Competitor SEO audit and gap analysis |

---

## Quick Reference: Essential Liquid SEO Objects

| Object | Purpose | Example |
|--------|---------|---------|
| `page_title` | Current page title | `{{ page_title }}` |
| `page_description` | Current page meta description | `{{ page_description }}` |
| `canonical_url` | Canonical URL for current page | `{{ canonical_url }}` |
| `shop.name` | Store name | `{{ shop.name }}` |
| `shop.url` | Store root URL | `{{ shop.url }}` |
| `shop.description` | Store description | `{{ shop.description }}` |
| `shop.published_locales` | All published languages | `{% for locale in shop.published_locales %}` |
| `request.path` | Current URL path | `{{ request.path }}` |
| `request.host` | Current hostname | `{{ request.host }}` |
| `template.name` | Current template name | `{{ template.name }}` |
| `cart.currency.iso_code` | Active currency code | `{{ cart.currency.iso_code }}` |
| `product.url` | Product URL path | `{{ product.url }}` |
| `collection.url` | Collection URL path | `{{ collection.url }}` |
| `image_url` | CDN-optimized image URL | `{{ image \| image_url: width: 800 }}` |

---

## Schema Validation Checklist

Before deploying ANY structured data changes, you MUST:

1. Copy the rendered HTML (not Liquid) from the page source
2. Paste into [Google Rich Results Test](https://search.google.com/test/rich-results)
3. Verify ZERO errors and ZERO warnings
4. Test on all page types: homepage, product, collection, article, page
5. Check Google Search Console > Enhancements after deployment for any new issues
6. NEVER deploy schema that produces validation errors — fix them first
