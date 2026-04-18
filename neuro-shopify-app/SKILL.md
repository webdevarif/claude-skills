---
name: neuro-shopify-app
description: Comprehensive Shopify app development - CLI, Remix/React Router v7, OAuth, extensions, checkout UI, Shopify Functions, Polaris, Hydrogen, webhooks, GraphQL APIs, Liquid, billing, deployment, performance & security best practices
trigger: auto
globs:
  - "**/shopify.app.toml"
  - "**/shopify.server.*"
  - "**/extensions/**"
  - "**/*.liquid"
  - "**/routes/app.*"
  - "**/routes/webhooks.*"
  - "**/routes/api.proxy.*"
  - "**/prisma/schema.prisma"
  - "**/hydrogen.config.*"
  - "**/remix.config.*"
  - "**/.env"
  - "**/wrangler.toml"
  - "**/polaris*"
  - "**/shopify*"
---

# Neuro Shopify App Development

You are a senior Shopify developer and architecture expert. When working on any Shopify app, theme, extension, or headless storefront, you MUST follow these exact patterns and conventions. Never deviate from these specifications.

---

## Table of Contents

1. [Shopify CLI & Project Setup](#1-shopify-cli--project-setup)
2. [App Architecture (Remix / React Router v7)](#2-app-architecture-remix--react-router-v7)
3. [Authentication & Session Management](#3-authentication--session-management)
4. [Admin GraphQL API](#4-admin-graphql-api)
5. [Storefront API & Headless Commerce](#5-storefront-api--headless-commerce)
6. [Webhooks](#6-webhooks)
7. [App Extensions](#7-app-extensions)
8. [Checkout UI Extensions](#8-checkout-ui-extensions)
9. [Shopify Functions](#9-shopify-functions)
10. [Theme Development & Liquid](#10-theme-development--liquid)
11. [Product Management](#11-product-management)
12. [Polaris UI Components](#12-polaris-ui-components)
13. [App Proxy](#13-app-proxy)
14. [Billing & Subscriptions](#14-billing--subscriptions)
15. [Hydrogen & Oxygen (Headless)](#15-hydrogen--oxygen-headless)
16. [Deployment & CI/CD](#16-deployment--cicd)
17. [Performance Optimization](#17-performance-optimization)
18. [Security Best Practices](#18-security-best-practices)
19. [Testing Strategy](#19-testing-strategy)
20. [Breaking Changes & Migration (2026)](#20-breaking-changes--migration-2026)
21. [Constraints & Rules](#21-constraints--rules)
22. [Quick Reference](#22-quick-reference)

---

## 1. Shopify CLI & Project Setup

### Install Shopify CLI
```bash
# Using npm (recommended)
npm install -g @shopify/cli @shopify/app

# Using Homebrew (macOS)
brew tap shopify/shopify
brew install shopify-cli

# Verify
shopify version
```

### Create New App
```bash
shopify app init
# Templates: Remix (recommended), Node.js + React, PHP, Ruby

# Generated structure:
my-app/
├── app/                    # App routes (Remix/React Router v7)
│   ├── routes/
│   │   ├── app._index.jsx  # Home page
│   │   ├── app.*.jsx       # App routes
│   │   └── webhooks.jsx    # Webhook handler
│   ├── shopify.server.js   # Shopify config & auth
│   └── db.server.js        # Database connection
├── extensions/             # App extensions
├── prisma/                 # Database schema
│   └── schema.prisma
├── shopify.app.toml        # App configuration
├── package.json
└── .env
```

### App Configuration (shopify.app.toml)
```toml
name = "my-app"
client_id = "your-client-id"
application_url = "https://your-app.com"
embedded = true

[access_scopes]
scopes = "write_products,read_orders,read_customers,write_discounts"

[auth]
redirect_urls = [
  "https://your-app.com/auth/callback",
  "https://your-app.com/auth/shopify/callback"
]

[webhooks]
api_version = "2025-10"

[[webhooks.subscriptions]]
topics = ["products/create", "products/update", "orders/create"]
uri = "/webhooks"

[pos]
embedded = false
```

### Environment Variables (.env)
```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_orders,read_customers
SHOPIFY_APP_URL=https://your-app.com
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Development Workflow
```bash
# Start dev server with tunnel
shopify app dev

# Generate extension
shopify app generate extension

# Deploy to production
shopify app deploy

# Important: --force flag is deprecated (removed May 2026)
# Use instead:
shopify app deploy --allow-updates    # safe operations
shopify app deploy --allow-deletes    # destructive operations
```

---

## 2. App Architecture (Remix / React Router v7)

> **Note**: New Shopify CLI apps now use React Router v7 (the merger of Remix + React Router).

### Home Page (app/routes/app._index.jsx)
```javascript
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Page, Layout, Card, DataTable, Button } from "@shopify/polaris";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
          }
        }
      }
    }
  `);

  const { data } = await response.json();

  return {
    products: data.products.edges.map(e => e.node),
    shop: session.shop,
  };
}

export default function Index() {
  const { products, shop } = useLoaderData();

  const rows = products.map((product) => [
    product.title,
    product.handle,
    product.status,
  ]);

  return (
    <Page title="Products">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["Title", "Handle", "Status"]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### Detail Page with Form (app/routes/app.product.$id.jsx)
```javascript
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Page, Layout, Card, FormLayout, TextField, Button } from "@shopify/polaris";
import { useState } from "react";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        status
        vendor
      }
    }
  `, { variables: { id: `gid://shopify/Product/${params.id}` } });

  const { data } = await response.json();
  return json({ product: data.product });
}

export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const response = await admin.graphql(`
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id title }
        userErrors { field message }
      }
    }
  `, {
    variables: {
      input: {
        id: `gid://shopify/Product/${params.id}`,
        title: formData.get("title"),
        description: formData.get("description"),
      },
    },
  });

  const { data } = await response.json();

  if (data.productUpdate.userErrors.length > 0) {
    return json({ errors: data.productUpdate.userErrors }, { status: 400 });
  }
  return json({ success: true });
}

export default function ProductDetail() {
  const { product } = useLoaderData();
  const submit = useSubmit();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    submit(formData, { method: "post" });
  };

  return (
    <Page title="Edit Product" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField label="Title" value={title} onChange={setTitle} autoComplete="off" />
              <TextField label="Description" value={description} onChange={setDescription} multiline={4} autoComplete="off" />
              <Button primary onClick={handleSubmit}>Save</Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 3. Authentication & Session Management

### Shopify Server Config (app/shopify.server.js)
```javascript
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  apiVersion: ApiVersion.October25,

  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const apiVersion = ApiVersion.October25;
```

### Expiring Offline Access Tokens (Mandatory for new public apps April 2026)
```javascript
// Token refresh middleware — handle 401 responses
async function handleTokenRefresh(session) {
  if (session.isExpired()) {
    const newSession = await shopify.auth.tokenExchange({
      shop: session.shop,
      sessionToken: session.accessToken,
      requestedTokenType: "offline",
    });
    // Store both access and refresh tokens encrypted
    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: encrypt(newSession.accessToken),
        refreshToken: encrypt(newSession.refreshToken),
        expires: newSession.expires,
      },
    });
    return newSession;
  }
  return session;
}
```

### Authentication in Loaders/Actions
```javascript
export async function loader({ request }) {
  // For admin pages — verifies session, redirects to OAuth if needed
  const { admin, session } = await authenticate.admin(request);

  // For webhooks — verifies HMAC signature
  const { topic, shop, payload } = await authenticate.webhook(request);

  // For app proxy — verifies proxy signature
  const { session } = await authenticate.public.appProxy(request);
}
```

---

## 4. Admin GraphQL API

### Query Products
```graphql
query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node {
        id
        title
        handle
        status
        totalInventory
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              sku
              inventoryQuantity
            }
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Create Product
```graphql
mutation ProductCreate($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
      handle
      variants(first: 10) {
        edges {
          node { id title price sku }
        }
      }
    }
    userErrors { field message }
  }
}
```

```javascript
// Variables
{
  input: {
    title: "New Product",
    descriptionHtml: "<p>Product description</p>",
    vendor: "My Store",
    productType: "Accessories",
    tags: ["new", "featured"],
    status: "DRAFT",  // Always DRAFT first, confirm before ACTIVE
    variants: [{
      price: "29.95",  // Must be string
      sku: "PROD-001",
      inventoryManagement: "SHOPIFY",
      inventoryPolicy: "DENY",
    }],
  }
}
```

### Bulk Variant Operations
```graphql
mutation ProductVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants { id title price sku }
    userErrors { field message }
  }
}
```

### Orders
```graphql
query GetOrders($first: Int!) {
  orders(first: $first, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        name
        email
        totalPriceSet { shopMoney { amount currencyCode } }
        displayFinancialStatus
        displayFulfillmentStatus
        lineItems(first: 50) {
          edges {
            node { title quantity variant { sku } }
          }
        }
      }
    }
  }
}
```

### Inventory Management
```graphql
mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup { reason }
    userErrors { field message }
  }
}
```

```javascript
// Variables
{
  input: {
    reason: "correction",
    name: "available",
    quantities: [{
      inventoryItemId: "gid://shopify/InventoryItem/123",
      locationId: "gid://shopify/Location/456",
      quantity: 100,
    }],
  }
}
```

### Rate Limiting
- Admin API: **1,000 cost points per second** (leaked bucket)
- Calculate query cost before execution
- Implement exponential backoff on 429 responses

---

## 5. Storefront API & Headless Commerce

### Storefront API Query (Unauthenticated)
```graphql
query GetProductByHandle($handle: String!) {
  product(handle: $handle) {
    id
    title
    description
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
}
```

### Cart Operations
```graphql
mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise { ... on ProductVariant { id title } }
          }
        }
      }
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
      }
    }
    userErrors { field message }
  }
}
```

### Rate Limits
- Storefront API: **2,000 points per second**
- Use `X-Shopify-Storefront-Access-Token` header

---

## 6. Webhooks

### Webhook Handler (app/routes/webhooks.jsx)
```javascript
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }) {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  console.log(`Webhook: ${topic} from ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED":
      await db.session.deleteMany({ where: { shop } });
      break;

    case "PRODUCTS_CREATE":
      await db.product.create({
        data: {
          shopifyId: String(payload.id),
          title: payload.title,
          handle: payload.handle,
          shop,
        },
      });
      break;

    case "PRODUCTS_UPDATE":
      await db.product.updateMany({
        where: { shopifyId: String(payload.id), shop },
        data: { title: payload.title, handle: payload.handle },
      });
      break;

    case "ORDERS_CREATE":
      await handleNewOrder(payload, shop);
      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // GDPR mandatory webhooks — must implement
      await handleGDPR(topic, payload, shop);
      break;

    default:
      console.log("Unhandled topic:", topic);
  }

  return new Response("OK", { status: 200 });
}
```

### Register Webhooks in shopify.server.js
```javascript
webhooks: {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  PRODUCTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  // GDPR mandatory
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
  },
},
```

### Webhook Best Practices
- **Idempotent handlers**: Process duplicates safely (check if already processed)
- **Respond 200 quickly**: Do heavy work async (queue-based processing)
- **Circuit breakers**: Prevent cascading failures
- **Dead letter queue**: Route failed webhooks for retry
- **Priority queues**: Critical webhooks (orders) processed before non-critical

---

## 7. App Extensions

### Extension Types

| Type | Use Case | Rendering |
|------|----------|-----------|
| **Theme App Extension** | Storefront blocks (reviews, badges) | Liquid + JS |
| **Admin Action** | Buttons in admin pages | Native UI |
| **Admin Block** | Embedded blocks in admin | Native UI |
| **Post-Purchase** | Upsells after checkout | Preact (64KB cap) |
| **Checkout UI** | Custom checkout steps | Preact (64KB cap) |
| **Function** | Server-side logic (discounts, shipping) | WASM (Rust) |

### Generate Extension
```bash
shopify app generate extension
# Select type, name, and language
```

### Theme App Extension (extensions/product-reviews/blocks/reviews.liquid)
```liquid
{% schema %}
{
  "name": "Product Reviews",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Customer Reviews"
    },
    {
      "type": "range",
      "id": "reviews_to_show",
      "label": "Reviews to Show",
      "min": 1,
      "max": 10,
      "default": 5
    }
  ]
}
{% endschema %}

<div class="product-reviews">
  <h2>{{ block.settings.heading }}</h2>
  <div id="reviews-container" data-product-id="{{ product.id }}"></div>
</div>

<script>
  fetch(`/apps/reviews/api/reviews?product_id={{ product.id }}&limit={{ block.settings.reviews_to_show }}`)
    .then(r => r.json())
    .then(reviews => {
      const container = document.getElementById('reviews-container');
      container.innerHTML = reviews.map(review => `
        <div class="review">
          <div class="rating">${'⭐'.repeat(review.rating)}</div>
          <h3>${review.title}</h3>
          <p>${review.content}</p>
          <span class="author">— ${review.author}</span>
        </div>
      `).join('');
    });
</script>

{% stylesheet %}
  .product-reviews { padding: 2rem; }
  .review { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #eee; }
  .rating { color: #ffa500; margin-bottom: 0.5rem; }
{% endstylesheet %}
```

### Admin Action Extension (extensions/export-product/src/index.jsx)
```javascript
import { extend, AdminAction } from "@shopify/admin-ui-extensions";

extend("Admin::Product::SubscriptionAction", (root, { data }) => {
  const { id, title } = data.selected[0];

  const button = root.createComponent(AdminAction, {
    title: "Export Product",
    onPress: async () => {
      const response = await fetch("/api/export", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        root.toast.show("Product exported successfully!");
      } else {
        root.toast.show("Export failed", { isError: true });
      }
    },
  });

  root.append(button);
});
```

---

## 8. Checkout UI Extensions

> **API 2025-10+**: Extensions use Preact with a hard **64KB bundle cap**.

### Checkout Extension Example
```javascript
import { extension, Banner, BlockStack, Text } from "@shopify/ui-extensions/checkout";

export default extension("purchase.checkout.block.render", (root, { lines, cost }) => {
  const totalAmount = parseFloat(cost.totalAmount.current.amount);

  if (totalAmount > 100) {
    root.appendChild(
      root.createComponent(Banner, { status: "info" },
        root.createComponent(BlockStack, {},
          root.createComponent(Text, {}, "Free shipping on orders over $100!"),
        ),
      ),
    );
  }
});
```

### Checkout Metafields Migration
- **Deprecated**: Checkout metafields
- **Use instead**: Cart metafields (for checkout UI extensions) or Order metafields (for customer account extensions)

---

## 9. Shopify Functions

Server-side logic running in WASM (Rust). Used for discounts, shipping, payment, validation.

### Discount Function Example (src/run.rs)
```rust
use shopify_function::prelude::*;
use shopify_function::Result;

#[shopify_function_target(query_path = "src/run.graphql", schema_path = "schema.graphql")]
fn run(input: input::ResponseData) -> Result<output::FunctionRunResult> {
    let mut targets = vec![];

    for line in &input.cart.lines {
        if let Some(product) = &line.merchandise.product {
            if product.has_tag("sale") {
                targets.push(output::Target {
                    product_variant: Some(output::ProductVariantTarget {
                        id: line.merchandise.id.clone(),
                        quantity: None,
                    }),
                    ..Default::default()
                });
            }
        }
    }

    Ok(output::FunctionRunResult {
        discount_application_strategy: output::DiscountApplicationStrategy::FIRST,
        discounts: vec![output::Discount {
            value: output::Value::Percentage(output::Percentage { value: "10.0".to_string() }),
            targets,
            message: Some("10% off sale items".to_string()),
            ..Default::default()
        }],
    })
}
```

### Functions Can Now Query Metaobjects (2026-04)
```graphql
# run.graphql — input query
query RunInput {
  cart {
    lines {
      merchandise {
        ... on ProductVariant {
          id
          product { hasTag(tag: "sale") }
        }
      }
    }
  }
  metaobject(handle: { handle: "tier-config", type: "pricing_tier" }) {
    fields { key value }
  }
}
```

---

## 10. Theme Development & Liquid

### Liquid 2.0 Syntax
```liquid
{%- comment -%} Product card snippet {%- endcomment -%}

<article class="product-card" data-product-id="{{ product.id }}">
  {%- if product.featured_image -%}
    {{ product.featured_image | image_url: width: 400 | image_tag:
      loading: 'lazy',
      widths: '200, 300, 400, 600',
      sizes: '(min-width: 768px) 400px, 100vw',
      alt: product.featured_image.alt | escape
    }}
  {%- endif -%}

  <h3>{{ product.title | escape }}</h3>

  {%- if product.compare_at_price > product.price -%}
    <s>{{ product.compare_at_price | money }}</s>
    <span class="sale-price">{{ product.price | money }}</span>
  {%- else -%}
    <span>{{ product.price | money }}</span>
  {%- endif -%}

  {%- if product.available -%}
    <form method="post" action="/cart/add">
      <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
      <button type="submit">Add to Cart</button>
    </form>
  {%- else -%}
    <button disabled>Sold Out</button>
  {%- endif -%}
</article>
```

### Image Optimization with CDN Filters
```liquid
{%- comment -%} Always use image_url + image_tag for CDN optimization {%- endcomment -%}
{{ product.featured_image | image_url: width: 800 | image_tag:
  loading: 'lazy',
  widths: '200, 400, 600, 800',
  sizes: '(min-width: 1200px) 800px, (min-width: 768px) 50vw, 100vw'
}}
```

### Metafields in Liquid
```liquid
{%- assign warranty = product.metafields.custom.warranty -%}
{%- if warranty -%}
  <div class="warranty-badge">{{ warranty.value }} warranty</div>
{%- endif -%}

{%- comment -%} Metaobject reference {%- endcomment -%}
{%- assign brand = product.metafields.custom.brand.value -%}
{%- if brand -%}
  <a href="{{ brand.url.value }}">{{ brand.name.value }}</a>
{%- endif -%}
```

### Section Schema
```liquid
{% schema %}
{
  "name": "Featured Collection",
  "tag": "section",
  "class": "featured-collection",
  "settings": [
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
    {
      "type": "range",
      "id": "products_to_show",
      "min": 2,
      "max": 12,
      "step": 2,
      "default": 4,
      "label": "Products to show"
    }
  ],
  "presets": [
    {
      "name": "Featured Collection"
    }
  ]
}
{% endschema %}
```

---

## 11. Product Management

### Method Selection by Volume
| Volume | Method |
|--------|--------|
| 1–5 products | GraphQL `productCreate` mutations |
| 6–20 products | GraphQL with batching |
| 20+ products | CSV import via admin |
| Updates | GraphQL `productUpdate` mutations |
| Inventory | `inventorySetQuantities` mutation |

### Image Upload (Two-Step)
```graphql
# Step 1: Stage upload
mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters { name value }
    }
    userErrors { field message }
  }
}

# Step 2: Attach to product
mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
  productCreateMedia(productId: $productId, media: $media) {
    media { ... on MediaImage { id image { url } } }
    mediaUserErrors { field message }
  }
}
```

### Assign to Collection
```graphql
mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
  collectionAddProducts(id: $id, productIds: $productIds) {
    collection { id title productsCount }
    userErrors { field message }
  }
}
```

### Constraints
- **100 variants** max per product, **3 options** max
- Prices must be **strings**: `"price": "29.95"`
- New products default to **DRAFT** — confirm before publishing
- HTML supported in `descriptionHtml`
- CSV bulk import: UTF-8 encoding, max 50MB

---

## 12. Polaris UI Components

> **2025-10**: Polaris web components are stabilized. New CLI apps use them by default.
> Polaris React is in **maintenance mode**.

### Web Components Setup (root.tsx)
```html
<script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```
```bash
npm install @shopify/polaris-types
```

### Common Polaris Patterns
```javascript
import {
  Page, Layout, Card, Button, TextField, Select, Checkbox,
  Badge, Banner, DataTable, Modal, Toast, Frame, ResourceList,
  ResourceItem, Thumbnail, Pagination, EmptyState
} from "@shopify/polaris";

export default function SettingsPage() {
  return (
    <Page
      title="Settings"
      primaryAction={{ content: "Save", onAction: handleSave }}
      secondaryActions={[{ content: "Cancel", onAction: handleCancel }]}
    >
      <Layout>
        <Layout.Section>
          <Card title="General" sectioned>
            <TextField label="App Name" value={name} onChange={setName} />
            <Select
              label="Status"
              options={[
                { label: "Active", value: "active" },
                { label: "Draft", value: "draft" },
              ]}
              value={status}
              onChange={setStatus}
            />
            <Checkbox label="Enable notifications" checked={notifications} onChange={setNotifications} />
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card title="Status" sectioned>
            <Badge status="success">Active</Badge>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 13. App Proxy

### Setup in Partner Dashboard
```
Subpath prefix: apps
Subpath: my-feature
Proxy URL: https://your-app.com/api/proxy
→ https://store.com/apps/my-feature → your-app.com/api/proxy
```

### Handler (app/routes/api.proxy.jsx)
```javascript
import { json } from "@remix-run/node";
import crypto from "crypto";

export async function loader({ request }) {
  const url = new URL(request.url);
  const signature = url.searchParams.get("signature");
  const shop = url.searchParams.get("shop");

  if (!verifyProxySignature(url.searchParams, process.env.SHOPIFY_API_SECRET)) {
    return json({ error: "Invalid signature" }, { status: 401 });
  }

  const productId = url.searchParams.get("product_id");
  const reviews = await getProductReviews(productId);
  return json({ reviews });
}

function verifyProxySignature(params, secret) {
  const signature = params.get("signature");
  const sortedParams = [...params.entries()]
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("");
  const computed = crypto.createHmac("sha256", secret).update(sortedParams).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}
```

---

## 14. Billing & Subscriptions

### Create Recurring Charge
```javascript
export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(`
    mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
        appSubscription { id }
        confirmationUrl
        userErrors { field message }
      }
    }
  `, {
    variables: {
      name: "Pro Plan",
      returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing/confirm`,
      lineItems: [{
        plan: {
          appRecurringPricingDetails: {
            price: { amount: 9.99, currencyCode: "USD" },
            interval: "EVERY_30_DAYS",
          },
        },
      }],
    },
  });

  const { data } = await response.json();
  return redirect(data.appSubscriptionCreate.confirmationUrl);
}
```

---

## 15. Hydrogen & Oxygen (Headless)

### Hydrogen 2026.1 Stack
- **Hydrogen**: Shopify's headless commerce React framework
- **React Router v7**: Routing/runtime foundation (merged from Remix)
- **Oxygen**: Shopify's edge deployment platform
- **Vercel Fluid Compute**: Eliminates cold starts, sub-30ms AI latency

### Hydrogen Product Route
```javascript
import { useLoaderData } from "@remix-run/react";
import { Image, Money, AddToCartButton } from "@shopify/hydrogen";

export async function loader({ params, context }) {
  const { storefront } = context;

  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: { handle: params.handle },
  });

  if (!product) throw new Response("Not Found", { status: 404 });
  return { product };
}

export default function Product() {
  const { product } = useLoaderData();
  const selectedVariant = product.variants.nodes[0];

  return (
    <div className="product-page">
      <Image data={product.featuredImage} sizes="(min-width: 768px) 50vw, 100vw" />
      <h1>{product.title}</h1>
      <Money data={selectedVariant.price} />
      <AddToCartButton
        lines={[{ merchandiseId: selectedVariant.id, quantity: 1 }]}
      >
        Add to Cart
      </AddToCartButton>
      <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id title descriptionHtml
      featuredImage { url altText width height }
      variants(first: 50) {
        nodes {
          id title availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
`;
```

---

## 16. Deployment & CI/CD

### Deploy to Shopify (Oxygen)
```bash
shopify app deploy
```

### Deploy to Cloudflare Workers
```toml
# wrangler.toml
name = "shopify-app"
compatibility_date = "2025-11-10"
main = "build/index.js"

[vars]
SHOPIFY_API_KEY = "your_api_key"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your_kv_namespace_id"
```

```bash
npm run build
wrangler deploy
wrangler secret put SHOPIFY_API_SECRET
wrangler secret put DATABASE_URL
```

### CI/CD Pipeline Notes
- Replace `--force` with `--allow-updates` / `--allow-deletes` (mandatory May 2026)
- Use progressive rollouts: gradually expose new versions to merchants
- Database migrations: multi-phase (add new schema → deploy dual-support code → migrate data → remove old)

---

## 17. Performance Optimization

### Key Metrics
- Average Shopify app adds **1.2s to page load** and **400KB JS** — aim to be well under
- Target sub-2s page load for storefronts

### Strategies
- **Code splitting**: Route-based, lazy load below-fold components
- **GraphQL batching**: Combine related queries
- **Request deduplication**: Across components
- **Caching**: Based on data volatility (products = medium, orders = low)
- **Image optimization**: Always use Shopify CDN `image_url` + `image_tag` filters
- **64KB extension cap**: Keep UI extensions under 64KB (Preact, not React)

### Database
- Index frequently queried fields + foreign keys
- Composite indexes for multi-field queries
- Connection pooling
- Partition large tables by merchant ID or date
- Read replicas for query distribution

---

## 18. Security Best Practices

### MUST DO
- Verify session tokens server-side on every request
- Store access tokens **encrypted at rest**
- Validate all inputs rigorously (allowlist, not denylist)
- Use prepared statements / parameterized queries
- Implement rate limiting on all endpoints
- Keep dependencies updated
- Implement GDPR mandatory webhooks (CUSTOMERS_DATA_REQUEST, CUSTOMERS_REDACT, SHOP_REDACT)
- Use `crypto.timingSafeEqual` for HMAC verification

### MUST NOT
- Hardcode API credentials in theme code or client-side JS
- Store unencrypted sensitive data in metafields
- Skip GDPR compliance for customer data
- Exceed API rate limits (Admin: 1000 pts/s, Storefront: 2000 pts/s)
- Deploy untested checkout extensions
- Use deprecated REST Admin API endpoints
- Use synchronous API calls in Liquid (deprecated)
- Ignore CSP headers for embedded apps

---

## 19. Testing Strategy

### Test Pyramid
1. **Unit Tests** (80%+ coverage): Core business logic, discount calculations, data transforms
2. **Integration Tests**: API interactions, database operations, webhook handlers
3. **E2E Tests**: Critical merchant flows (install → configure → checkout)
4. **Performance Tests**: Load testing with production-scale data

### Development Testing
```bash
# Always test in a development store first
shopify app dev

# Test checkout extensions in sandbox
# Test Functions with sample input data
shopify app function run --input sample_input.json
```

---

## 20. Breaking Changes & Migration (2026)

### April 2026 — Active Now
- **Expiring offline access tokens**: Mandatory for new public apps (implement refresh flow)
- **RBAC for Partner Orgs**: Review auto-migrated roles
- **Metaobjects in Functions**: Now queryable by handle/ID
- **BXGY discount prerequisites**: Native support reduces custom logic

### May 2026
- **`--force` flag removed**: Use `--allow-updates` / `--allow-deletes`

### API 2025-10 (Current Stable)
- **Polaris web components stabilized**: Framework-agnostic, CDN-delivered
- **Extensions use Preact** with 64KB cap (React deprecated for extensions)
- **React Router v7** replaces Remix in new CLI apps
- **Checkout metafields deprecated**: Migrate to cart/order metafields
- **Metafield translations via GraphQL Admin API**

---

## 21. Constraints & Rules

### MUST DO
- Use Liquid 2.0 syntax for themes
- Implement proper metafield handling
- Use Storefront API 2024-10 or newer (prefer 2025-10)
- Optimize images with Shopify CDN filters (`image_url` + `image_tag`)
- Follow Shopify CLI workflows
- Use App Bridge for embedded apps
- Implement proper error handling for all API calls
- Follow Shopify theme architecture patterns
- Use TypeScript for app development
- Test checkout extensions in sandbox
- Implement all 3 GDPR mandatory webhooks
- Handle `userErrors` in all mutation responses
- Use `DRAFT` status for new products, confirm before `ACTIVE`

### MUST NOT DO
- Hardcode API credentials in theme or client code
- Exceed Storefront API rate limits (2000 points/sec)
- Use deprecated REST Admin API endpoints when GraphQL alternative exists
- Skip GDPR compliance for customer data
- Deploy untested checkout extensions
- Use synchronous API calls in Liquid (deprecated)
- Ignore theme performance metrics
- Store sensitive data in metafields without encryption
- Use `--force` flag in CLI (deprecated, use `--allow-updates`/`--allow-deletes`)
- Use React for new UI extensions (use Preact, 64KB cap)

---

## 22. Quick Reference

```bash
# Create app
shopify app init

# Start development
shopify app dev

# Generate extension
shopify app generate extension

# Deploy app
shopify app deploy --allow-updates

# Test function
shopify app function run --input sample_input.json

# Check version
shopify version
```

### Key API Versions
| Version | Status | Notes |
|---------|--------|-------|
| 2025-10 | **Current stable** | Web components, Preact extensions |
| 2025-07 | Supported | Last React extensions version |
| 2025-04 | Supported | — |
| 2024-10 | Minimum recommended | — |

### GID Format
```
gid://shopify/Product/123456789
gid://shopify/ProductVariant/987654321
gid://shopify/Order/111222333
gid://shopify/Collection/444555666
gid://shopify/InventoryItem/777888999
gid://shopify/Location/000111222
```
