---
name: neuro-shopify-graphql
description: Shopify GraphQL API expert - Admin API, Storefront API, bulk operations, mutations, query cost optimization, pagination, metafields, metaobjects, rate limiting, and advanced query patterns
trigger: auto
globs:
  - "**/shopify.server.*"
  - "**/routes/app.*"
  - "**/graphql/**"
  - "**/*.graphql"
  - "**/api/**"
  - "**/shopify*"
---

# Neuro Shopify GraphQL API Expert

You are a senior Shopify GraphQL API expert. When writing ANY Shopify GraphQL query or mutation, you MUST follow these exact patterns, cost optimization strategies, and error handling conventions. NEVER deviate from these specifications. ALWAYS use the latest stable API version (2026-01) unless the project specifies otherwise.

---

## Table of Contents

1. [Query Cost & Rate Limiting](#1-query-cost--rate-limiting)
2. [Pagination Patterns](#2-pagination-patterns)
3. [Product Operations](#3-product-operations)
4. [Order Operations](#4-order-operations)
5. [Customer Operations](#5-customer-operations)
6. [Collection Operations](#6-collection-operations)
7. [Inventory Management](#7-inventory-management)
8. [Metafields & Metaobjects](#8-metafields--metaobjects)
9. [Bulk Operations](#9-bulk-operations)
10. [Image & Media Upload](#10-image--media-upload)
11. [Storefront API](#11-storefront-api)
12. [Discount Operations](#12-discount-operations)
13. [Webhook Subscriptions](#13-webhook-subscriptions)
14. [Advanced Patterns](#14-advanced-patterns)
15. [Error Handling](#15-error-handling)
16. [API Version Strategy](#16-api-version-strategy)

---

## 1. Query Cost & Rate Limiting

### Rate Limits by Plan

| Plan | Points/Second | Max Bucket |
|------|--------------|------------|
| Standard (Basic/Shopify) | 100 | 1,000 |
| Advanced | 200 | 2,000 |
| Shopify Plus | 1,000 | 10,000 |
| Enterprise | 2,000 | 20,000 |
| **Storefront API** | Flat 100 pts/query limit | No bucket |

**CRITICAL**: A single query MUST NOT exceed 1,000 points regardless of plan tier. If your query costs more, you MUST split it into multiple queries.

### Cost Calculation Rules

| Field Type | Cost |
|-----------|------|
| Scalar / Enum | 0 |
| Object field | 1 |
| Connection | 2 + (first/last argument value) |
| Mutation | 10 (base) |
| Interface / Union | Maximum cost of all possible selections |

**Example**: Querying `products(first: 10) { edges { node { title variants(first: 5) { edges { node { price } } } } } }` costs:
- products connection: 2 + 10 = 12
- Each product node: 1 (title = 0)
- variants connection per product: (2 + 5) * 10 = 70
- Each variant node: 1 * 5 * 10 = 50
- **Total requested cost**: ~132 points

### Reading the Cost Extension

ALWAYS check `extensions.cost` in every response:

```graphql
# The response includes:
{
  "data": { ... },
  "extensions": {
    "cost": {
      "requestedQueryCost": 132,
      "actualQueryCost": 46,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 954,
        "restoreRate": 50
      }
    }
  }
}
```

- `requestedQueryCost`: Pre-execution estimate (bucket is charged this first)
- `actualQueryCost`: Real cost after execution (difference is refunded)
- `currentlyAvailable`: Points remaining in bucket RIGHT NOW
- `restoreRate`: Points restored per second (leaked bucket refill rate)

### Debug Header

ALWAYS use this header during development to get field-by-field cost breakdown:

```
X-Shopify-Access-Token: {token}
Shopify-GraphQL-Cost-Debug: 1
```

### Exponential Backoff Pattern

You MUST implement exponential backoff for THROTTLED responses:

```typescript
async function shopifyGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  maxRetries = 5
): Promise<T> {
  const endpoint = `https://${SHOP}.myshopify.com/admin/api/2026-01/graphql.json`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();

    // Check for throttling
    const errors = json.errors ?? [];
    const isThrottled = errors.some(
      (e: any) => e.extensions?.code === "THROTTLED"
    );

    if (isThrottled) {
      const retryAfter = Math.min(1000 * Math.pow(2, attempt), 30000);
      const cost = json.extensions?.cost;
      console.warn(
        `THROTTLED. Available: ${cost?.throttleStatus?.currentlyAvailable}. ` +
        `Retrying in ${retryAfter}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((r) => setTimeout(r, retryAfter));
      continue;
    }

    // Check for other GraphQL errors
    if (errors.length > 0 && !json.data) {
      throw new ShopifyGraphQLError(errors);
    }

    return json as T;
  }

  throw new Error("Max retries exceeded due to throttling");
}
```

### Cost Optimization Rules

1. NEVER request fields you do not use -- every object field costs 1 point
2. ALWAYS use the smallest `first`/`last` value that meets your needs
3. PREFER `nodes` over `edges { node }` when you do not need edge-level cursor data
4. Use `@include(if: $needDetails)` to conditionally fetch expensive nested connections
5. NEVER nest more than 2 levels of connections in a single query (split into separate queries)
6. ALWAYS batch metafield reads using `metafields(keys: [...])` instead of separate queries

---

## 2. Pagination Patterns

### Forward Pagination (Most Common)

```graphql
query Products($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      id
      title
      handle
      status
    }
  }
}
```

Variables for first page: `{ "first": 50 }`
Variables for next page: `{ "first": 50, "after": "eyJsYXN0X2lkIjo..." }`

### Backward Pagination

```graphql
query Products($last: Int!, $before: String) {
  products(last: $last, before: $before) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      id
      title
    }
  }
}
```

### Fetch ALL Pages Pattern

You MUST use this pattern when you need every record. NEVER use offset-based thinking.

```typescript
async function fetchAllProducts(): Promise<Product[]> {
  const ALL_PRODUCTS_QUERY = `
    query AllProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          handle
          status
          variants(first: 10) {
            nodes {
              id
              sku
              price
            }
          }
        }
      }
    }
  `;

  const allProducts: Product[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await shopifyGraphQL<ProductsResponse>(
      ALL_PRODUCTS_QUERY,
      { first: 250, after: cursor }
    );

    const { products } = response.data;
    allProducts.push(...products.nodes);
    hasNextPage = products.pageInfo.hasNextPage;
    cursor = products.pageInfo.endCursor;
  }

  return allProducts;
}
```

**CRITICAL**: Maximum `first`/`last` value is **250**. NEVER pass a higher value. For datasets larger than a few thousand records, use Bulk Operations instead.

### Relay-Style Edges Pattern

Use edges only when you need per-edge cursor or metadata:

```graphql
query ProductsWithCursors($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

PREFER `nodes` over `edges { node }` in all other cases -- it is simpler and has the same cost.

---

## 3. Product Operations

### Create a Product

```graphql
mutation ProductCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
  productCreate(product: $product, media: $media) {
    product {
      id
      title
      handle
      status
      variants(first: 5) {
        nodes {
          id
          sku
          price
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "product": {
    "title": "Premium T-Shirt",
    "descriptionHtml": "<p>Soft cotton premium t-shirt.</p>",
    "vendor": "MyBrand",
    "productType": "Apparel",
    "status": "DRAFT",
    "tags": ["cotton", "premium", "summer"],
    "seo": {
      "title": "Premium Cotton T-Shirt",
      "description": "Ultra-soft premium cotton t-shirt for summer."
    },
    "productOptions": [
      {
        "name": "Size",
        "values": [{ "name": "S" }, { "name": "M" }, { "name": "L" }, { "name": "XL" }]
      },
      {
        "name": "Color",
        "values": [{ "name": "Black" }, { "name": "White" }]
      }
    ]
  }
}
```

**IMPORTANT**: Products are created UNPUBLISHED by default. You MUST call `publishablePublish` separately to make them visible on sales channels.

### Update a Product

```graphql
mutation ProductUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      title
      status
      updatedAt
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "id": "gid://shopify/Product/1234567890",
    "title": "Updated Premium T-Shirt",
    "status": "ACTIVE",
    "tags": ["cotton", "premium", "summer", "bestseller"]
  }
}
```

### Delete a Product

```graphql
mutation ProductDelete($input: ProductDeleteInput!) {
  productDelete(input: $input) {
    deletedProductId
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "id": "gid://shopify/Product/1234567890"
  }
}
```

### Bulk Create Variants

```graphql
mutation ProductVariantsBulkCreate(
  $productId: ID!
  $variants: [ProductVariantsBulkInput!]!
) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    product {
      id
      title
    }
    productVariants {
      id
      title
      sku
      price
      inventoryQuantity
      selectedOptions {
        name
        value
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "productId": "gid://shopify/Product/1234567890",
  "variants": [
    {
      "optionValues": [
        { "optionName": "Size", "name": "XXL" },
        { "optionName": "Color", "name": "Black" }
      ],
      "price": "39.99",
      "sku": "PREM-BLK-XXL",
      "inventoryQuantities": [
        {
          "locationId": "gid://shopify/Location/1234",
          "name": "available",
          "quantity": 100
        }
      ]
    },
    {
      "optionValues": [
        { "optionName": "Size", "name": "XXL" },
        { "optionName": "Color", "name": "White" }
      ],
      "price": "39.99",
      "sku": "PREM-WHT-XXL",
      "inventoryQuantities": [
        {
          "locationId": "gid://shopify/Location/1234",
          "name": "available",
          "quantity": 75
        }
      ]
    }
  ]
}
```

### Bulk Update Variants

```graphql
mutation ProductVariantsBulkUpdate(
  $productId: ID!
  $variants: [ProductVariantsBulkInput!]!
) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    product {
      id
    }
    productVariants {
      id
      sku
      price
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "productId": "gid://shopify/Product/1234567890",
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/111111",
      "price": "44.99",
      "sku": "PREM-BLK-XXL-V2"
    },
    {
      "id": "gid://shopify/ProductVariant/222222",
      "price": "44.99",
      "compareAtPrice": "49.99"
    }
  ]
}
```

### Publish a Product

```graphql
mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable {
      availablePublicationsCount {
        count
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "id": "gid://shopify/Product/1234567890",
  "input": [
    { "publicationId": "gid://shopify/Publication/9876543" }
  ]
}
```

---

## 4. Order Operations

### Query Orders with Filters

```graphql
query Orders($first: Int!, $after: String, $query: String) {
  orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      name
      displayFinancialStatus
      displayFulfillmentStatus
      createdAt
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      customer {
        id
        displayName
        email
      }
      lineItems(first: 50) {
        nodes {
          id
          title
          quantity
          variant {
            id
            sku
          }
          originalTotalSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
      shippingAddress {
        address1
        city
        province
        country
        zip
      }
    }
  }
}
```

Common query filters:
```json
{ "query": "financial_status:paid fulfillment_status:unfulfilled" }
{ "query": "created_at:>2026-01-01 tag:wholesale" }
{ "query": "name:#1234" }
{ "query": "email:customer@example.com" }
```

### Create a Fulfillment

```graphql
mutation FulfillmentCreate($fulfillment: FulfillmentInput!) {
  fulfillmentCreate(fulfillment: $fulfillment) {
    fulfillment {
      id
      status
      trackingInfo {
        number
        url
        company
      }
      fulfillmentLineItems(first: 50) {
        nodes {
          id
          quantity
          lineItem {
            title
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "fulfillment": {
    "lineItemsByFulfillmentOrder": [
      {
        "fulfillmentOrderId": "gid://shopify/FulfillmentOrder/9876543",
        "fulfillmentOrderLineItems": [
          {
            "id": "gid://shopify/FulfillmentOrderLineItem/111",
            "quantity": 1
          }
        ]
      }
    ],
    "trackingInfo": {
      "number": "1Z999AA10123456784",
      "url": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
      "company": "UPS"
    },
    "notifyCustomer": true
  }
}
```

### Create a Refund

```graphql
mutation RefundCreate($input: RefundInput!) {
  refundCreate(input: $input) {
    refund {
      id
      totalRefundedSet {
        shopMoney {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "orderId": "gid://shopify/Order/1234567890",
    "refundLineItems": [
      {
        "lineItemId": "gid://shopify/LineItem/111",
        "quantity": 1,
        "restockType": "RETURN"
      }
    ],
    "shipping": {
      "fullRefund": true
    },
    "note": "Customer returned item - damaged in transit"
  }
}
```

### Order Editing (Begin, Add Line Item, Commit)

```graphql
# Step 1: Begin edit
mutation OrderEditBegin($id: ID!) {
  orderEditBegin(id: $id) {
    calculatedOrder {
      id
    }
    userErrors {
      field
      message
    }
  }
}

# Step 2: Add discount / line item
mutation OrderEditAddLineItemDiscount(
  $id: ID!
  $lineItemId: ID!
  $discount: OrderEditAppliedDiscountInput!
) {
  orderEditAddLineItemDiscount(
    id: $id
    lineItemId: $lineItemId
    discount: $discount
  ) {
    calculatedOrder {
      id
      subtotalPriceSet {
        shopMoney { amount currencyCode }
      }
    }
    userErrors {
      field
      message
    }
  }
}

# Step 3: Commit the edit
mutation OrderEditCommit($id: ID!) {
  orderEditCommit(id: $id) {
    order {
      id
      name
      totalPriceSet {
        shopMoney { amount currencyCode }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## 5. Customer Operations

### Query Customers

```graphql
query Customers($first: Int!, $after: String, $query: String) {
  customers(first: $first, after: $after, query: $query) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      displayName
      firstName
      lastName
      email
      phone
      numberOfOrders
      amountSpent {
        amount
        currencyCode
      }
      tags
      createdAt
      addresses {
        address1
        city
        province
        country
        zip
      }
      metafields(first: 10) {
        nodes {
          namespace
          key
          value
          type
        }
      }
    }
  }
}
```

### Create a Customer

```graphql
mutation CustomerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      displayName
      email
      phone
      tags
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+14155552671",
    "tags": ["VIP", "wholesale"],
    "addresses": [
      {
        "address1": "123 Main St",
        "city": "Portland",
        "province": "OR",
        "country": "US",
        "zip": "97201"
      }
    ],
    "metafields": [
      {
        "namespace": "custom",
        "key": "loyalty_tier",
        "value": "gold",
        "type": "single_line_text_field"
      }
    ]
  }
}
```

### Update a Customer

```graphql
mutation CustomerUpdate($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer {
      id
      displayName
      tags
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "id": "gid://shopify/Customer/1234567890",
    "tags": ["VIP", "wholesale", "returning"]
  }
}
```

### Tags Management

NEVER replace tags wholesale. ALWAYS read existing tags, merge, then update:

```typescript
async function addCustomerTags(customerId: string, newTags: string[]): Promise<void> {
  // Step 1: Read current tags
  const { data } = await shopifyGraphQL<CustomerResponse>(
    `query CustomerTags($id: ID!) {
      customer(id: $id) {
        tags
      }
    }`,
    { id: customerId }
  );

  // Step 2: Merge tags (deduplicate)
  const existingTags = data.customer.tags;
  const mergedTags = [...new Set([...existingTags, ...newTags])];

  // Step 3: Update
  await shopifyGraphQL(
    `mutation CustomerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer { id tags }
        userErrors { field message }
      }
    }`,
    { input: { id: customerId, tags: mergedTags } }
  );
}
```

---

## 6. Collection Operations

### Create a Manual Collection

```graphql
mutation CollectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
      title
      handle
      productsCount {
        count
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "title": "Summer Sale 2026",
    "descriptionHtml": "<p>Hot deals for summer.</p>",
    "handle": "summer-sale-2026",
    "templateSuffix": "sale",
    "seo": {
      "title": "Summer Sale 2026 - Up to 50% Off",
      "description": "Shop our biggest summer sale."
    },
    "image": {
      "src": "https://cdn.example.com/summer-banner.jpg",
      "altText": "Summer Sale Banner"
    }
  }
}
```

### Create a Smart Collection

```graphql
mutation CollectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
      title
      handle
      ruleSet {
        appliedDisjunctively
        rules {
          column
          condition
          relation
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "title": "All Cotton Products",
    "ruleSet": {
      "appliedDisjunctively": false,
      "rules": [
        {
          "column": "TAG",
          "relation": "EQUALS",
          "condition": "cotton"
        },
        {
          "column": "PRODUCT_TYPE",
          "relation": "EQUALS",
          "condition": "Apparel"
        }
      ]
    }
  }
}
```

### Add Products to a Collection

```graphql
mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
  collectionAddProducts(id: $id, productIds: $productIds) {
    collection {
      id
      title
      productsCount {
        count
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "id": "gid://shopify/Collection/9876543",
  "productIds": [
    "gid://shopify/Product/111",
    "gid://shopify/Product/222",
    "gid://shopify/Product/333"
  ]
}
```

**IMPORTANT**: `collectionAddProducts` accepts a maximum of 250 product IDs per call. For larger sets, batch into multiple calls.

---

## 7. Inventory Management

### Set Inventory Quantities (Absolute)

```graphql
mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup {
      createdAt
      reason
      changes {
        name
        delta
        quantityAfterChange
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "input": {
    "name": "available",
    "reason": "correction",
    "ignoreCompareQuantity": true,
    "quantities": [
      {
        "inventoryItemId": "gid://shopify/InventoryItem/111",
        "locationId": "gid://shopify/Location/222",
        "quantity": 50
      },
      {
        "inventoryItemId": "gid://shopify/InventoryItem/333",
        "locationId": "gid://shopify/Location/222",
        "quantity": 100
      }
    ]
  }
}
```

### Safe Concurrent Update (Compare-and-Set)

ALWAYS use `compareQuantity` in multi-writer environments to prevent race conditions:

```json
{
  "input": {
    "name": "available",
    "reason": "correction",
    "quantities": [
      {
        "inventoryItemId": "gid://shopify/InventoryItem/111",
        "locationId": "gid://shopify/Location/222",
        "quantity": 50,
        "compareQuantity": 45
      }
    ]
  }
}
```

If the current quantity does not match `compareQuantity`, the mutation returns a userError -- preventing lost updates.

### Adjust Inventory Quantities (Relative/Delta)

```graphql
mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
  inventoryAdjustQuantities(input: $input) {
    inventoryAdjustmentGroup {
      createdAt
      reason
      changes {
        name
        delta
        quantityAfterChange
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "input": {
    "name": "available",
    "reason": "received",
    "referenceDocumentUri": "logistics://po/PO-2026-001",
    "changes": [
      {
        "inventoryItemId": "gid://shopify/InventoryItem/111",
        "locationId": "gid://shopify/Location/222",
        "delta": 25
      }
    ]
  }
}
```

### Query Locations

```graphql
query Locations {
  locations(first: 50) {
    nodes {
      id
      name
      isActive
      fulfillsOnlineOrders
      address {
        address1
        city
        province
        country
        zip
      }
    }
  }
}
```

### Query Inventory Levels

```graphql
query InventoryLevels($inventoryItemId: ID!) {
  inventoryItem(id: $inventoryItemId) {
    id
    sku
    tracked
    inventoryLevels(first: 50) {
      nodes {
        id
        location {
          id
          name
        }
        quantities(names: ["available", "incoming", "committed", "reserved"]) {
          name
          quantity
        }
      }
    }
  }
}
```

---

## 8. Metafields & Metaobjects

### Set Metafields (Create or Update)

The `metafieldsSet` mutation is the ONLY way you should create or update metafields. It is idempotent -- if the metafield exists it updates, otherwise it creates.

```graphql
mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
      type
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables -- Product metafield:
```json
{
  "metafields": [
    {
      "ownerId": "gid://shopify/Product/1234567890",
      "namespace": "custom",
      "key": "care_instructions",
      "type": "multi_line_text_field",
      "value": "Machine wash cold.\nTumble dry low.\nDo not bleach."
    }
  ]
}
```

Variables -- Order metafield:
```json
{
  "metafields": [
    {
      "ownerId": "gid://shopify/Order/9876543",
      "namespace": "logistics",
      "key": "warehouse_notes",
      "type": "single_line_text_field",
      "value": "Fragile - handle with care"
    }
  ]
}
```

Variables -- Customer metafield (JSON):
```json
{
  "metafields": [
    {
      "ownerId": "gid://shopify/Customer/5555555",
      "namespace": "preferences",
      "key": "settings",
      "type": "json",
      "value": "{\"newsletter\":true,\"sms_opt_in\":false,\"preferred_size\":\"M\"}"
    }
  ]
}
```

**CRITICAL**: Maximum **25 metafields** per `metafieldsSet` call. For larger batches, split into multiple calls.

### Read Metafields on a Resource

ALWAYS use the `metafields` connection with `keys` filter for efficiency:

```graphql
query ProductMetafields($id: ID!, $keys: [String!]!) {
  product(id: $id) {
    id
    title
    metafields(keys: $keys, first: 10) {
      nodes {
        namespace
        key
        value
        type
        jsonValue
      }
    }
  }
}
```

Variables:
```json
{
  "id": "gid://shopify/Product/1234567890",
  "keys": ["custom.care_instructions", "custom.material_composition", "custom.size_guide"]
}
```

### Query Products by Metafield Value

```graphql
query ProductsByMetafield($query: String!, $first: Int!) {
  products(first: $first, query: $query) {
    nodes {
      id
      title
      metafields(keys: ["custom.material"], first: 1) {
        nodes {
          value
        }
      }
    }
  }
}
```

Variables:
```json
{
  "first": 50,
  "query": "metafields.custom.material:cotton"
}
```

### Create a Metaobject Definition

```graphql
mutation MetaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition {
      id
      name
      type
      fieldDefinitions {
        name
        key
        type {
          name
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "definition": {
    "name": "Designer Profile",
    "type": "$app:designer_profile",
    "access": {
      "storefront": "PUBLIC_READ"
    },
    "fieldDefinitions": [
      {
        "name": "Name",
        "key": "name",
        "type": "single_line_text_field",
        "required": true
      },
      {
        "name": "Bio",
        "key": "bio",
        "type": "multi_line_text_field"
      },
      {
        "name": "Avatar",
        "key": "avatar",
        "type": "file_reference"
      },
      {
        "name": "Featured Products",
        "key": "featured_products",
        "type": "list.product_reference"
      }
    ]
  }
}
```

### Create a Metaobject

```graphql
mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject {
      id
      handle
      type
      fields {
        key
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "metaobject": {
    "type": "$app:designer_profile",
    "handle": "jane-designer",
    "fields": [
      { "key": "name", "value": "Jane Smith" },
      { "key": "bio", "value": "Award-winning fashion designer with 15 years of experience." },
      { "key": "featured_products", "value": "[\"gid://shopify/Product/111\",\"gid://shopify/Product/222\"]" }
    ]
  }
}
```

### Query Metaobjects by Type

```graphql
query MetaobjectsByType($type: String!, $first: Int!) {
  metaobjects(type: $type, first: $first) {
    nodes {
      id
      handle
      type
      updatedAt
      fields {
        key
        value
        type
        reference {
          ... on Product {
            id
            title
          }
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
}
```

### Query Metaobject by Handle

```graphql
query MetaobjectByHandle($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) {
    id
    handle
    type
    fields {
      key
      value
    }
  }
}
```

Variables:
```json
{
  "handle": {
    "type": "$app:designer_profile",
    "handle": "jane-designer"
  }
}
```

---

## 9. Bulk Operations

### Bulk Query -- Export All Products

```graphql
mutation BulkExportProducts {
  bulkOperationRunQuery(
    query: """
    {
      products {
        edges {
          node {
            id
            title
            handle
            status
            vendor
            productType
            tags
            variants {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  inventoryQuantity
                  barcode
                }
              }
            }
            metafields {
              edges {
                node {
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
      }
    }
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

**CRITICAL RULES for bulk queries**:
- MUST have exactly ONE top-level field (e.g., `products`)
- Do NOT include `first`/`last` pagination arguments -- they are ignored
- ALWAYS use `edges { node }` syntax (NOT `nodes`) inside bulk queries
- Nested connections are automatically flattened in the JSONL output

### Poll for Completion (API 2026-01+)

```graphql
query BulkOperationStatus($id: ID!) {
  node(id: $id) {
    ... on BulkOperation {
      id
      status
      errorCode
      objectCount
      fileSize
      url
      partialDataUrl
      createdAt
      completedAt
    }
  }
}
```

For older API versions, use the deprecated pattern:
```graphql
query {
  currentBulkOperation {
    id
    status
    errorCode
    objectCount
    fileSize
    url
    createdAt
    completedAt
  }
}
```

### Polling Implementation

```typescript
async function pollBulkOperation(operationId: string): Promise<string> {
  const POLL_QUERY = `
    query BulkOperationStatus($id: ID!) {
      node(id: $id) {
        ... on BulkOperation {
          id
          status
          errorCode
          objectCount
          fileSize
          url
          partialDataUrl
        }
      }
    }
  `;

  while (true) {
    const { data } = await shopifyGraphQL<BulkOpResponse>(
      POLL_QUERY,
      { id: operationId }
    );

    const op = data.node;

    switch (op.status) {
      case "COMPLETED":
        return op.url; // JSONL download URL
      case "FAILED":
        throw new Error(`Bulk operation failed: ${op.errorCode}`);
      case "CANCELED":
        throw new Error("Bulk operation was canceled");
      case "RUNNING":
      case "CREATED":
        console.log(`Progress: ${op.objectCount} objects processed...`);
        await new Promise((r) => setTimeout(r, 3000));
        break;
      default:
        await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
```

### Process JSONL Results

JSONL output contains one JSON object per line. Nested connections are flattened with a `__parentId` field:

```typescript
async function processJSONL(url: string): Promise<Map<string, any>> {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.trim().split("\n");

  const products = new Map<string, any>();

  for (const line of lines) {
    const obj = JSON.parse(line);

    if (obj.id?.startsWith("gid://shopify/Product/")) {
      products.set(obj.id, { ...obj, variants: [], metafields: [] });
    } else if (obj.id?.startsWith("gid://shopify/ProductVariant/") && obj.__parentId) {
      const parent = products.get(obj.__parentId);
      if (parent) parent.variants.push(obj);
    } else if (obj.__parentId && obj.namespace) {
      // Metafield -- attach to parent
      const parent = products.get(obj.__parentId);
      if (parent) parent.metafields.push(obj);
    }
  }

  return products;
}
```

### Bulk Mutation -- Step 1: Stage Upload

```graphql
mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": [
    {
      "resource": "BULK_MUTATION_VARIABLES",
      "filename": "bulk-update.jsonl",
      "mimeType": "text/jsonl",
      "httpMethod": "POST"
    }
  ]
}
```

### Bulk Mutation -- Step 2: Upload JSONL and Execute

First, upload your JSONL file to the staged URL. Each line contains the variables for one mutation execution:

```jsonl
{"input":{"id":"gid://shopify/Product/111","tags":["sale","summer"]}}
{"input":{"id":"gid://shopify/Product/222","tags":["sale","winter"]}}
{"input":{"id":"gid://shopify/Product/333","tags":["clearance"]}}
```

Then run the bulk mutation:

```graphql
mutation BulkUpdateProductTags($stagedUploadPath: String!) {
  bulkOperationRunMutation(
    mutation: "mutation ProductUpdate($input: ProductInput!) { productUpdate(input: $input) { product { id tags } userErrors { field message } } }",
    stagedUploadPath: $stagedUploadPath
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

### Webhook for Bulk Operation Completion

ALWAYS subscribe to the webhook instead of relying solely on polling:

```graphql
mutation {
  webhookSubscriptionCreate(
    topic: BULK_OPERATIONS_FINISH
    webhookSubscription: {
      format: JSON
      callbackUrl: "https://your-app.example.com/webhooks/bulk-operations"
    }
  ) {
    webhookSubscription {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

**Concurrency limits (API 2026-01+)**: Up to 5 concurrent bulk QUERY operations per shop. Only 1 bulk MUTATION operation at a time per shop.

---

## 10. Image & Media Upload

### Two-Step Upload Pattern

ALWAYS follow this two-step process. NEVER try to upload media directly.

**Step 1: Create a staged upload target**

```graphql
mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": [
    {
      "resource": "PRODUCT_IMAGE",
      "filename": "product-front.jpg",
      "mimeType": "image/jpeg",
      "fileSize": "1048576",
      "httpMethod": "POST"
    }
  ]
}
```

**Step 2: Upload file to staged URL, then attach to product**

```typescript
// Upload to staged URL (multipart form)
const formData = new FormData();
for (const param of stagedTarget.parameters) {
  formData.append(param.name, param.value);
}
formData.append("file", fileBuffer);
await fetch(stagedTarget.url, { method: "POST", body: formData });
```

Then create product media:

```graphql
mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
  productCreateMedia(productId: $productId, media: $media) {
    media {
      ... on MediaImage {
        id
        status
        image {
          url
          altText
        }
      }
    }
    mediaUserErrors {
      field
      message
      code
    }
    product {
      id
      title
    }
  }
}
```

Variables:
```json
{
  "productId": "gid://shopify/Product/1234567890",
  "media": [
    {
      "originalSource": "https://storage.googleapis.com/...(resourceUrl from staged upload)",
      "alt": "Premium T-Shirt front view",
      "mediaContentType": "IMAGE"
    }
  ]
}
```

**IMPORTANT**: Media processing is asynchronous. The `status` field will be `PROCESSING` initially. Poll or use webhooks to confirm `READY` status.

---

## 11. Storefront API

The Storefront API uses a DIFFERENT endpoint and authentication:
- Endpoint: `https://{store}.myshopify.com/api/2026-01/graphql.json`
- Header: `X-Shopify-Storefront-Access-Token: {storefront_token}`

### Query Products

```graphql
query Products($first: Int!, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      title
      handle
      description
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
}
```

### Query Collections

```graphql
query Collections($first: Int!) {
  collections(first: $first) {
    nodes {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      products(first: 20) {
        nodes {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            nodes {
              url
              altText
            }
          }
        }
      }
    }
  }
}
```

### Cart Operations

**Create Cart:**

```graphql
mutation CartCreate($input: CartInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "input": {
    "lines": [
      {
        "merchandiseId": "gid://shopify/ProductVariant/111",
        "quantity": 2
      }
    ],
    "buyerIdentity": {
      "email": "customer@example.com",
      "countryCode": "US"
    }
  },
  "country": "US",
  "language": "EN"
}
```

**Add Lines to Cart:**

```graphql
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
            }
          }
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "cartId": "gid://shopify/Cart/abc123",
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/222",
      "quantity": 1
    }
  ]
}
```

**Update Cart Lines:**

```graphql
mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "cartId": "gid://shopify/Cart/abc123",
  "lines": [
    {
      "id": "gid://shopify/CartLine/line1",
      "quantity": 3
    }
  ]
}
```

**Remove Cart Lines:**

```graphql
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      totalQuantity
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

### Customer Access Token (Storefront API)

```graphql
mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      field
      message
      code
    }
  }
}
```

Variables:
```json
{
  "input": {
    "email": "customer@example.com",
    "password": "securePassword123"
  }
}
```

### Predictive Search

```graphql
query PredictiveSearch($query: String!, $limit: Int!, $types: [PredictiveSearchType!]) {
  predictiveSearch(query: $query, limit: $limit, types: $types) {
    products {
      id
      title
      handle
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        nodes {
          url
          altText
        }
      }
    }
    collections {
      id
      title
      handle
    }
    queries {
      text
      styledText
    }
  }
}
```

Variables:
```json
{
  "query": "cotton shirt",
  "limit": 5,
  "types": ["PRODUCT", "COLLECTION", "QUERY"]
}
```

---

## 12. Discount Operations

### Create a Basic Discount Code (Amount Off)

```graphql
mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          status
          codes(first: 1) {
            nodes {
              code
            }
          }
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
              ... on DiscountAmount {
                amount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables (percentage off):
```json
{
  "basicCodeDiscount": {
    "title": "20% Off Summer Sale",
    "code": "SUMMER20",
    "startsAt": "2026-06-01T00:00:00Z",
    "endsAt": "2026-08-31T23:59:59Z",
    "usageLimit": 1000,
    "appliesOncePerCustomer": true,
    "customerSelection": {
      "all": true
    },
    "customerGets": {
      "items": {
        "all": true
      },
      "value": {
        "percentage": 0.20
      }
    },
    "minimumRequirement": {
      "subtotal": {
        "greaterThanOrEqualToSubtotal": "50.00"
      }
    }
  }
}
```

### Create an Automatic Discount

```graphql
mutation DiscountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode {
      id
      automaticDiscount {
        ... on DiscountAutomaticBasic {
          title
          status
          startsAt
          endsAt
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables (fixed amount off):
```json
{
  "automaticBasicDiscount": {
    "title": "Free Shipping on $75+",
    "startsAt": "2026-04-01T00:00:00Z",
    "customerGets": {
      "items": {
        "all": true
      },
      "value": {
        "discountAmount": {
          "amount": "10.00",
          "appliesOnEachItem": false
        }
      }
    },
    "minimumRequirement": {
      "subtotal": {
        "greaterThanOrEqualToSubtotal": "75.00"
      }
    }
  }
}
```

### Query Discount Nodes

```graphql
query DiscountNodes($first: Int!, $query: String) {
  discountNodes(first: $first, query: $query) {
    nodes {
      id
      discount {
        ... on DiscountCodeBasic {
          title
          status
          codes(first: 5) {
            nodes { code }
          }
          usageLimit
          asyncUsageCount
        }
        ... on DiscountAutomaticBasic {
          title
          status
          startsAt
          endsAt
          asyncUsageCount
        }
        ... on DiscountCodeFreeShipping {
          title
          status
          codes(first: 5) {
            nodes { code }
          }
        }
      }
    }
  }
}
```

---

## 13. Webhook Subscriptions

### Create a Webhook Subscription

```graphql
mutation WebhookSubscriptionCreate(
  $topic: WebhookSubscriptionTopic!
  $webhookSubscription: WebhookSubscriptionInput!
) {
  webhookSubscriptionCreate(
    topic: $topic
    webhookSubscription: $webhookSubscription
  ) {
    webhookSubscription {
      id
      topic
      format
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
        ... on WebhookEventBridgeEndpoint {
          arn
        }
        ... on WebhookPubSubEndpoint {
          pubSubProject
          pubSubTopic
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**HTTP Endpoint:**
```json
{
  "topic": "ORDERS_CREATE",
  "webhookSubscription": {
    "callbackUrl": "https://your-app.example.com/webhooks/orders-create",
    "format": "JSON"
  }
}
```

**Amazon EventBridge:**
```json
{
  "topic": "ORDERS_CREATE",
  "webhookSubscription": {
    "arn": "arn:aws:events:us-east-1:123456789:event-bus/shopify-events",
    "format": "JSON"
  }
}
```

**Google Cloud Pub/Sub:**
```json
{
  "topic": "ORDERS_CREATE",
  "webhookSubscription": {
    "pubSubProject": "my-gcp-project",
    "pubSubTopic": "shopify-orders",
    "format": "JSON"
  }
}
```

### Filtered Webhooks

Use filters to receive only relevant events and reduce noise:

```json
{
  "topic": "PRODUCTS_UPDATE",
  "webhookSubscription": {
    "callbackUrl": "https://your-app.example.com/webhooks/products",
    "format": "JSON",
    "filter": "title:*Premium* OR tags:vip"
  }
}
```

### List Webhook Subscriptions

```graphql
query WebhookSubscriptions($first: Int!) {
  webhookSubscriptions(first: $first) {
    nodes {
      id
      topic
      format
      createdAt
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
      filter
    }
  }
}
```

### Common Webhook Topics

- `ORDERS_CREATE`, `ORDERS_UPDATED`, `ORDERS_PAID`, `ORDERS_FULFILLED`, `ORDERS_CANCELLED`
- `PRODUCTS_CREATE`, `PRODUCTS_UPDATE`, `PRODUCTS_DELETE`
- `CUSTOMERS_CREATE`, `CUSTOMERS_UPDATE`, `CUSTOMERS_DELETE`
- `INVENTORY_LEVELS_UPDATE`, `INVENTORY_ITEMS_UPDATE`
- `FULFILLMENTS_CREATE`, `FULFILLMENTS_UPDATE`
- `APP_UNINSTALLED`, `APP_SUBSCRIPTIONS_UPDATE`
- `BULK_OPERATIONS_FINISH`
- `CARTS_CREATE`, `CARTS_UPDATE`
- `COLLECTIONS_CREATE`, `COLLECTIONS_UPDATE`, `COLLECTIONS_DELETE`

---

## 14. Advanced Patterns

### Query Fragments

ALWAYS use fragments to keep queries DRY and maintainable:

```graphql
fragment MoneyFields on MoneyV2 {
  amount
  currencyCode
}

fragment ProductCard on Product {
  id
  title
  handle
  status
  priceRangeV2 {
    minVariantPrice {
      ...MoneyFields
    }
    maxVariantPrice {
      ...MoneyFields
    }
  }
  featuredImage {
    url
    altText
    width
    height
  }
}

query ProductList($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ...ProductCard
    }
  }
}
```

### Inline Fragments for Polymorphic Types

Shopify uses union and interface types extensively. You MUST use inline fragments to access type-specific fields:

```graphql
query DiscountDetails($id: ID!) {
  discountNode(id: $id) {
    id
    discount {
      __typename
      ... on DiscountCodeBasic {
        title
        status
        codes(first: 5) { nodes { code } }
        customerGets {
          value {
            ... on DiscountPercentage { percentage }
            ... on DiscountAmount {
              amount { amount currencyCode }
            }
          }
        }
      }
      ... on DiscountCodeFreeShipping {
        title
        status
        codes(first: 5) { nodes { code } }
      }
      ... on DiscountAutomaticBasic {
        title
        status
        startsAt
        endsAt
      }
      ... on DiscountAutomaticBxgy {
        title
        status
        startsAt
        endsAt
      }
    }
  }
}
```

### Aliases

Use aliases when you need the same field with different arguments in a single query:

```graphql
query DashboardData {
  activeProducts: products(first: 5, query: "status:active", sortKey: UPDATED_AT, reverse: true) {
    nodes {
      id
      title
      updatedAt
    }
  }
  draftProducts: products(first: 5, query: "status:draft") {
    nodes {
      id
      title
      createdAt
    }
  }
  recentOrders: orders(first: 10, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id
      name
      displayFinancialStatus
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
    }
  }
}
```

### Conditional Fields with @include / @skip

```graphql
query ProductDetail(
  $id: ID!
  $includeVariants: Boolean!
  $includeMetafields: Boolean!
  $skipImages: Boolean!
) {
  product(id: $id) {
    id
    title
    descriptionHtml
    status
    variants(first: 100) @include(if: $includeVariants) {
      nodes {
        id
        title
        sku
        price
        inventoryQuantity
      }
    }
    metafields(first: 20) @include(if: $includeMetafields) {
      nodes {
        namespace
        key
        value
        type
      }
    }
    images(first: 10) @skip(if: $skipImages) {
      nodes {
        url
        altText
      }
    }
  }
}
```

### Multiple Mutations in One Request

You CAN send multiple mutations in a single request using aliases:

```graphql
mutation BatchMetafields {
  product1: metafieldsSet(metafields: [
    {
      ownerId: "gid://shopify/Product/111",
      namespace: "custom",
      key: "badge",
      type: "single_line_text_field",
      value: "Best Seller"
    }
  ]) {
    metafields { id key value }
    userErrors { field message }
  }
  product2: metafieldsSet(metafields: [
    {
      ownerId: "gid://shopify/Product/222",
      namespace: "custom",
      key: "badge",
      type: "single_line_text_field",
      value: "New Arrival"
    }
  ]) {
    metafields { id key value }
    userErrors { field message }
  }
}
```

**WARNING**: Each aliased mutation still counts toward the 1,000-point query cost limit. The total cost is the sum of all mutations in the request.

---

## 15. Error Handling

### GraphQL Errors vs userErrors

There are TWO distinct error categories. You MUST handle both:

**1. GraphQL-level errors** (in `errors` array): Infrastructure problems -- authentication, throttling, syntax errors. The request itself failed.

**2. Business-logic errors** (in `userErrors` / `mediaUserErrors`): The mutation executed but the operation was rejected -- validation failures, not found, access denied. You ALWAYS get a `data` field alongside these.

```typescript
interface ShopifyResponse<T> {
  data: T | null;
  errors?: GraphQLError[];
  extensions?: {
    cost: CostInfo;
  };
}

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: {
    code: string; // "THROTTLED", "ACCESS_DENIED", "INTERNAL_SERVER_ERROR"
    documentation?: string;
  };
}

function handleShopifyResponse<T>(response: ShopifyResponse<T>): T {
  // 1. Check GraphQL-level errors
  if (response.errors?.length) {
    const throttled = response.errors.find(
      (e) => e.extensions?.code === "THROTTLED"
    );
    if (throttled) {
      throw new ThrottledError(response.extensions?.cost);
    }

    const accessDenied = response.errors.find(
      (e) => e.extensions?.code === "ACCESS_DENIED"
    );
    if (accessDenied) {
      throw new AccessDeniedError(accessDenied.message);
    }

    // If there is partial data, still process it
    if (response.data) {
      console.warn("Partial data returned with errors:", response.errors);
      return response.data;
    }

    throw new ShopifyGraphQLError(response.errors);
  }

  if (!response.data) {
    throw new Error("No data returned from Shopify");
  }

  return response.data;
}
```

### Handling userErrors in Mutations

ALWAYS check `userErrors` after every mutation. NEVER assume success just because `data` is not null:

```typescript
function handleMutationResult<T extends { userErrors: UserError[] }>(
  result: T,
  operationName: string
): T {
  if (result.userErrors.length > 0) {
    const messages = result.userErrors
      .map((e) => `[${e.field?.join(".")}] ${e.message}`)
      .join("; ");
    throw new ShopifyUserError(
      `${operationName} failed: ${messages}`,
      result.userErrors
    );
  }
  return result;
}

// Usage:
const { data } = await shopifyGraphQL<ProductCreateResponse>(PRODUCT_CREATE, variables);
const result = handleMutationResult(data.productCreate, "productCreate");
// Safe to use result.product here
```

### Common Error Codes

| Error Code | Meaning | Action |
|-----------|---------|--------|
| `THROTTLED` | Rate limit exceeded | Exponential backoff, check `extensions.cost.throttleStatus` |
| `ACCESS_DENIED` | Missing access scope | Check app scopes, re-authenticate if needed |
| `NOT_FOUND` | Resource does not exist | Verify GID, check if deleted |
| `INTERNAL_SERVER_ERROR` | Shopify server error | Retry with backoff (max 3 retries) |
| `MAX_COST_EXCEEDED` | Query cost > 1000 points | Simplify query, reduce connections |
| `TAKEN` | Unique field conflict | Handle/SKU already exists, use different value |
| `INVALID` | Validation failure | Check input format, required fields |
| `BLANK` | Required field is empty | Provide required field value |
| `TOO_LONG` | Field exceeds max length | Truncate input value |

### Partial Data Responses

Shopify MAY return partial data alongside errors. You MUST handle this gracefully:

```typescript
// A query for 10 products might return 8 products + errors for 2
// The response has BOTH data and errors
if (response.data && response.errors) {
  console.warn("Partial response. Processing available data.");
  // Process response.data as normal
  // Log response.errors for debugging
}
```

---

## 16. API Version Strategy

### Version Lifecycle

Shopify releases a new API version quarterly:
- **January** (e.g., 2026-01)
- **April** (e.g., 2026-04)
- **July** (e.g., 2026-07)
- **October** (e.g., 2026-10)

Each version is **supported for 12 months** after release. After that, requests to deprecated versions are automatically forwarded to the oldest supported version.

### Current Versions (as of April 2026)

| Version | Status |
|---------|--------|
| 2026-07 | Release Candidate |
| 2026-04 | Latest Stable |
| 2026-01 | Supported |
| 2025-10 | Supported |
| 2025-07 | Supported |
| 2025-04 | Deprecated |
| unstable | Unstable (never use in production) |

### Migration Best Practices

1. ALWAYS pin your API version explicitly in the endpoint URL: `/admin/api/2026-01/graphql.json`
2. NEVER use `unstable` in production -- it changes without notice
3. Subscribe to the [Shopify changelog](https://shopify.dev/changelog) for breaking changes
4. Test against the Release Candidate version before it becomes stable
5. Update within 3 months of a new stable release to maintain buffer time

### Breaking Changes Handling

```typescript
// Define API version as a constant, not hardcoded in URLs
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

function getGraphQLEndpoint(shop: string): string {
  return `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

// Check version header in responses
function checkApiVersion(headers: Headers): void {
  const apiVersion = headers.get("X-Shopify-API-Version");
  if (apiVersion && apiVersion !== SHOPIFY_API_VERSION) {
    console.warn(
      `Shopify responded with API version ${apiVersion} instead of requested ${SHOPIFY_API_VERSION}. ` +
      `Your requested version may be deprecated.`
    );
  }
}
```

### Key 2026 Changes

- **2026-01**: Concurrent bulk query operations (up to 5). Idempotency keys on refund and inventory mutations. Advanced metafield query filters (greater than, less than, prefix, boolean).
- **2026-04**: `productCreate` / `productUpdate` use `ProductCreateInput` / `ProductInput` (the legacy `input` argument is deprecated). Cart deliveryGroups now include estimated delivery dates.

---

## Constraints & Rules

1. ALWAYS use `nodes` over `edges { node }` unless you need per-edge cursors
2. NEVER exceed `first: 250` -- use bulk operations for large datasets
3. ALWAYS handle both `errors` and `userErrors` in every response
4. ALWAYS implement exponential backoff for THROTTLED responses
5. NEVER nest more than 2 connection levels in a single query
6. ALWAYS use `metafieldsSet` for metafield create/update (it is idempotent)
7. ALWAYS use `compareQuantity` in inventory mutations for multi-writer safety
8. NEVER use `unstable` API version in production code
9. ALWAYS pin your API version in the endpoint URL
10. ALWAYS subscribe to `BULK_OPERATIONS_FINISH` webhook when using bulk operations
11. ALWAYS use staged uploads for media -- never upload directly
12. ALWAYS check `extensions.cost.throttleStatus.currentlyAvailable` before high-cost queries
13. NEVER store Shopify access tokens in client-side code or version control
14. ALWAYS use offline access tokens for bulk operations and background jobs
15. ALWAYS validate GIDs before passing to mutations (format: `gid://shopify/{Type}/{id}`)
16. NEVER assume a mutation succeeded just because `data` is not null -- ALWAYS check `userErrors`
