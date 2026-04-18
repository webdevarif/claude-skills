---
name: neuro-shopify-testing
description: Shopify app testing expert - Vitest unit/component testing, Playwright E2E testing, mocking authenticate.admin & Shopify APIs, webhook testing (HMAC simulation, idempotency), Mock Bridge for embedded app testing, @remix-run/testing for route testing, Polaris component testing, CI/CD pipelines (GitHub Actions), staging environments, extension testing, and App Store QA validation
trigger: auto
globs:
  - "**/shopify.app.toml"
  - "**/shopify.server.*"
  - "**/vitest.config.*"
  - "**/vitest.workspace.*"
  - "**/playwright.config.*"
  - "**/tests/**"
  - "**/__tests__/**"
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/.github/workflows/**"
---

# Neuro Shopify App Testing

You are a senior Shopify app testing expert. When setting up tests or writing tests for ANY Shopify app, you MUST follow these exact patterns. Never deviate from these specifications. Always use Vitest for unit/component tests and Playwright for E2E tests.

---

## Table of Contents

1. [Testing Architecture Overview](#1-testing-architecture-overview)
2. [Vitest Setup & Configuration](#2-vitest-setup--configuration)
3. [Mocking Shopify APIs](#3-mocking-shopify-apis)
4. [Route/Loader/Action Testing](#4-routeloaderaction-testing)
5. [Component Testing with Polaris](#5-component-testing-with-polaris)
6. [Webhook Testing](#6-webhook-testing)
7. [GraphQL API Testing](#7-graphql-api-testing)
8. [Playwright E2E Setup](#8-playwright-e2e-setup)
9. [E2E with Mock Shopify Auth](#9-e2e-with-mock-shopify-auth)
10. [Mock Bridge for Embedded Apps](#10-mock-bridge-for-embedded-apps)
11. [Extension Testing](#11-extension-testing)
12. [Database Testing (Prisma)](#12-database-testing-prisma)
13. [CI/CD with GitHub Actions](#13-cicd-with-github-actions)
14. [Staging Environment](#14-staging-environment)
15. [App Store QA Checklist](#15-app-store-qa-checklist)
16. [Test Utilities & Helpers](#16-test-utilities--helpers)
17. [Constraints & Rules](#17-constraints--rules)

---

## 1. Testing Architecture Overview

### Test Pyramid for Shopify Apps
```
            ┌──────────┐
            │   E2E    │  Playwright — full app flows
            │  (few)   │  Mock Shopify auth, test critical paths
            ├──────────┤
            │ Component│  Vitest + Testing Library
            │ (medium) │  Polaris components, forms, tables
            ├──────────┤
            │   Unit   │  Vitest — loaders, actions, services
            │  (many)  │  Mock authenticate.admin, test business logic
            └──────────┘
```

### Project Structure
```
my-shopify-app/
├── app/
│   ├── routes/
│   │   ├── app._index.jsx
│   │   └── webhooks.jsx
│   ├── services/
│   │   └── product.server.js
│   └── shopify.server.js
├── tests/
│   ├── unit/                         # Unit tests
│   │   ├── services/
│   │   │   └── product.test.js
│   │   └── utils/
│   │       └── helpers.test.js
│   ├── routes/                       # Route/component tests
│   │   ├── app._index.test.jsx
│   │   └── vitest.config.ts          # Route-specific config
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── products.spec.ts
│   │   ├── install.spec.ts
│   │   └── results/                  # Test artifacts
│   ├── webhooks/                     # Webhook-specific tests
│   │   └── orders.test.js
│   └── test-utilities/               # Shared test helpers
│       ├── testing-library.setup.js
│       ├── shopify.setup.js
│       ├── mock-shopify-app-remix.js
│       ├── testing-library-polaris.jsx
│       ├── mock-graphql.js
│       ├── factories.js
│       └── test.env
├── vitest.config.ts                  # Root Vitest config
├── vitest.workspace.ts               # Vitest workspace
├── playwright.config.ts              # Playwright config
└── package.json
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "vitest run && playwright test",
    "mock:admin": "mock-bridge http://localhost:3000"
  }
}
```

### Dependencies
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite-tsconfig-paths": "^5.0.0",
    "jsdom": "^24.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "@remix-run/testing": "^2.12.0",
    "@playwright/test": "^1.45.0",
    "@getverdict/mock-bridge": "^1.0.0",
    "jose": "^5.4.0",
    "msw": "^2.3.0"
  }
}
```

---

## 2. Vitest Setup & Configuration

### Root Config (vitest.config.ts)
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/test-utilities/testing-library.setup.js"],
    include: ["tests/unit/**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "app/shopify.server.*",
        "app/entry.*",
        "app/root.*",
      ],
    },
  },
});
```

### Workspace Config (vitest.workspace.ts)
```typescript
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Unit tests — no Shopify mocks needed
  "vitest.config.ts",
  // Route/component tests — with Shopify mocks
  "tests/routes/vitest.config.ts",
]);
```

### Route-Specific Config (tests/routes/vitest.config.ts)
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["*.test.{jsx,tsx}"],
    setupFiles: [
      "../../tests/test-utilities/testing-library.setup.js",
      "../../tests/test-utilities/shopify.setup.js",
    ],
    alias: {
      "@testing-library/polaris":
        new URL("../../tests/test-utilities/testing-library-polaris.jsx", import.meta.url).pathname,
    },
  },
});
```

---

## 3. Mocking Shopify APIs

### Mock authenticate.admin (tests/test-utilities/mock-shopify-app-remix.js)
```javascript
import { vi } from "vitest";

// Default mock admin response
const mockAdmin = {
  graphql: vi.fn(),
  rest: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
};

const mockSession = {
  shop: "test-store.myshopify.com",
  accessToken: "test-access-token",
  state: "active",
  isOnline: false,
  scope: "write_products,read_orders",
  expires: undefined,
};

vi.mock("~/shopify.server", () => ({
  default: {},
  authenticate: {
    admin: vi.fn().mockResolvedValue({
      admin: mockAdmin,
      session: mockSession,
      cors: vi.fn((response) => response),
    }),
    public: {
      appProxy: vi.fn(),
    },
    webhook: vi.fn(),
  },
  apiVersion: "2026-01",
  sessionStorage: {
    storeSession: vi.fn(),
    loadSession: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

export { mockAdmin, mockSession };
```

### Setup File (tests/test-utilities/shopify.setup.js)
```javascript
import { vi } from "vitest";
import "./mock-shopify-app-remix.js";

// Mock App Bridge
vi.stubGlobal("shopify", {
  toast: { show: vi.fn() },
  modal: { show: vi.fn(), hide: vi.fn() },
  resourcePicker: vi.fn().mockResolvedValue([]),
  loading: vi.fn(),
  saveBar: { show: vi.fn(), hide: vi.fn() },
  idToken: vi.fn().mockResolvedValue("mock-token"),
  environment: { embedded: true, mobile: false, pos: false },
  config: {
    apiKey: "test-api-key",
    shop: "test-store.myshopify.com",
    locale: "en",
  },
  navigation: { navigate: vi.fn() },
});
```

### Testing Library Setup (tests/test-utilities/testing-library.setup.js)
```javascript
import "@testing-library/jest-dom";
```

### Polaris Test Wrapper (tests/test-utilities/testing-library-polaris.jsx)
```jsx
import { render as rtlRender } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

function render(ui, options = {}) {
  const Wrapper = ({ children }) => (
    <AppProvider i18n={enTranslations}>{children}</AppProvider>
  );
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { render };
```

### Mock GraphQL Helper (tests/test-utilities/mock-graphql.js)
```javascript
import { vi } from "vitest";

export function mockGraphQLResponse(data, errors = null) {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data, errors }),
  });
}

export function mockGraphQLSequence(...responses) {
  const fn = vi.fn();
  responses.forEach((response, index) => {
    fn.mockResolvedValueOnce({
      json: () => Promise.resolve(response),
    });
  });
  return fn;
}

// Usage:
// mockAdmin.graphql = mockGraphQLResponse({
//   products: { edges: [{ node: { id: "1", title: "Test" } }] }
// });
```

### Test Environment (tests/test-utilities/test.env)
```env
SHOPIFY_API_KEY=test_api_key_12345
SHOPIFY_API_SECRET=test_api_secret_67890
SHOPIFY_APP_URL=https://test.local
SCOPES=write_products,read_orders,read_customers
DATABASE_URL=file:./test.db
NODE_ENV=test
```

---

## 4. Route/Loader/Action Testing

### Test a Loader
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { json } from "@remix-run/node";
import { loader } from "~/routes/app.products._index";
import { mockAdmin } from "../../test-utilities/mock-shopify-app-remix";
import { mockGraphQLResponse } from "../../test-utilities/mock-graphql";

describe("Products Index Loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns products list", async () => {
    // Arrange
    mockAdmin.graphql = mockGraphQLResponse({
      products: {
        edges: [
          { node: { id: "gid://shopify/Product/1", title: "T-Shirt", status: "ACTIVE" } },
          { node: { id: "gid://shopify/Product/2", title: "Hoodie", status: "DRAFT" } },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    // Act
    const request = new Request("http://localhost:3000/app/products");
    const response = await loader({ request, params: {}, context: {} });
    const data = await response.json();

    // Assert
    expect(data.products).toHaveLength(2);
    expect(data.products[0].title).toBe("T-Shirt");
    expect(mockAdmin.graphql).toHaveBeenCalledOnce();
  });

  it("handles GraphQL errors gracefully", async () => {
    mockAdmin.graphql = mockGraphQLResponse(null, [
      { message: "Access denied" },
    ]);

    const request = new Request("http://localhost:3000/app/products");
    const response = await loader({ request, params: {}, context: {} });
    const data = await response.json();

    expect(data.error).toBeDefined();
  });

  it("passes search query to GraphQL", async () => {
    mockAdmin.graphql = mockGraphQLResponse({
      products: { edges: [], pageInfo: { hasNextPage: false } },
    });

    const request = new Request("http://localhost:3000/app/products?q=sweater");
    await loader({ request, params: {}, context: {} });

    expect(mockAdmin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("sweater")
    );
  });
});
```

### Test an Action
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { action } from "~/routes/app.products.new";
import { mockAdmin } from "../../test-utilities/mock-shopify-app-remix";
import { mockGraphQLResponse } from "../../test-utilities/mock-graphql";

describe("Create Product Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a product and redirects", async () => {
    mockAdmin.graphql = mockGraphQLResponse({
      productCreate: {
        product: { id: "gid://shopify/Product/new-1", title: "New Product" },
        userErrors: [],
      },
    });

    const formData = new FormData();
    formData.set("title", "New Product");
    formData.set("description", "A great product");
    formData.set("status", "DRAFT");

    const request = new Request("http://localhost:3000/app/products/new", {
      method: "POST",
      body: formData,
    });

    const response = await action({ request, params: {}, context: {} });

    expect(response.status).toBe(302); // redirect
    expect(mockAdmin.graphql).toHaveBeenCalledOnce();
  });

  it("returns validation errors", async () => {
    mockAdmin.graphql = mockGraphQLResponse({
      productCreate: {
        product: null,
        userErrors: [
          { field: ["title"], message: "Title can't be blank" },
        ],
      },
    });

    const formData = new FormData();
    formData.set("title", "");

    const request = new Request("http://localhost:3000/app/products/new", {
      method: "POST",
      body: formData,
    });

    const response = await action({ request, params: {}, context: {} });
    const data = await response.json();

    expect(data.errors).toBeDefined();
    expect(data.errors[0].message).toContain("blank");
  });
});
```

### Test a Route Component (with createRemixStub)
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/polaris";
import { createRemixStub } from "@remix-run/testing";
import ProductsPage from "~/routes/app.products._index";

describe("Products Page Component", () => {
  let App;

  beforeEach(() => {
    App = createRemixStub([
      {
        path: "/",
        Component: ProductsPage,
        loader: () => ({
          products: [
            { id: "1", title: "T-Shirt", status: "active", price: "$25.00" },
            { id: "2", title: "Hoodie", status: "draft", price: "$65.00" },
          ],
        }),
      },
    ]);
  });

  it("renders products table", async () => {
    render(<App initialEntries={["/"]} />);

    await waitFor(() => {
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Hoodie")).toBeInTheDocument();
    });
  });

  it("shows page title", async () => {
    render(<App initialEntries={["/"]} />);

    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument();
    });
  });

  it("renders status badges", async () => {
    render(<App initialEntries={["/"]} />);

    await waitFor(() => {
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("draft")).toBeInTheDocument();
    });
  });
});
```

---

## 5. Component Testing with Polaris

### Test a Custom Component
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/polaris";
import userEvent from "@testing-library/user-event";
import { ProductForm } from "~/components/ProductForm";

describe("ProductForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    initialValues: { title: "", description: "", price: "" },
  };

  it("renders all form fields", () => {
    render(<ProductForm {...defaultProps} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
  });

  it("submits form with values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ProductForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "New Product");
    await user.type(screen.getByLabelText("Price"), "25.00");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Product",
        price: "25.00",
      })
    );
  });

  it("shows validation error for empty title", async () => {
    const user = userEvent.setup();
    render(<ProductForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
});
```

### Test IndexTable Selection
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/polaris";
import userEvent from "@testing-library/user-event";
import { ProductsTable } from "~/components/ProductsTable";

describe("ProductsTable", () => {
  const products = [
    { id: "1", title: "Product A" },
    { id: "2", title: "Product B" },
  ];

  it("renders all products", () => {
    render(<ProductsTable products={products} />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    render(<ProductsTable products={[]} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("shows bulk actions on selection", async () => {
    const user = userEvent.setup();
    render(<ProductsTable products={products} />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]); // first product checkbox

    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });
});
```

---

## 6. Webhook Testing

### Test Webhook Handler
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { action } from "~/routes/webhooks";
import crypto from "crypto";

// Helper to create signed webhook request
function createWebhookRequest(topic, body, secret = "test_api_secret_67890") {
  const bodyString = JSON.stringify(body);
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(bodyString, "utf8")
    .digest("base64");

  return new Request("http://localhost:3000/webhooks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Topic": topic,
      "X-Shopify-Hmac-Sha256": hmac,
      "X-Shopify-Shop-Domain": "test-store.myshopify.com",
      "X-Shopify-API-Version": "2026-01",
      "X-Shopify-Webhook-Id": `wh-${Date.now()}`,
    },
    body: bodyString,
  });
}

describe("Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("processes ORDERS_CREATE webhook", async () => {
    const orderPayload = {
      id: 12345,
      email: "customer@example.com",
      total_price: "100.00",
      line_items: [
        { title: "T-Shirt", quantity: 2, price: "50.00" },
      ],
    };

    const request = createWebhookRequest("ORDERS_CREATE", orderPayload);
    const response = await action({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
  });

  it("processes APP_UNINSTALLED webhook", async () => {
    const payload = {
      id: 67890,
      name: "Test Store",
      domain: "test-store.myshopify.com",
    };

    const request = createWebhookRequest("APP_UNINSTALLED", payload);
    const response = await action({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    // Verify session was cleaned up
  });

  it("rejects invalid HMAC signature", async () => {
    const request = new Request("http://localhost:3000/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Topic": "ORDERS_CREATE",
        "X-Shopify-Hmac-Sha256": "invalid-hmac",
        "X-Shopify-Shop-Domain": "test-store.myshopify.com",
      },
      body: JSON.stringify({ id: 1 }),
    });

    const response = await action({ request, params: {}, context: {} });
    expect(response.status).toBe(401);
  });

  it("handles idempotent webhook delivery", async () => {
    const webhookId = "unique-webhook-id-123";
    const payload = { id: 1, email: "test@example.com" };

    // First delivery
    const request1 = createWebhookRequest("ORDERS_CREATE", payload);
    request1.headers.set("X-Shopify-Webhook-Id", webhookId);
    await action({ request: request1, params: {}, context: {} });

    // Duplicate delivery (same webhook ID)
    const request2 = createWebhookRequest("ORDERS_CREATE", payload);
    request2.headers.set("X-Shopify-Webhook-Id", webhookId);
    const response2 = await action({ request: request2, params: {}, context: {} });

    // Should still return 200 but not process again
    expect(response2.status).toBe(200);
  });

  it("handles all mandatory GDPR webhooks", async () => {
    const gdprTopics = [
      {
        topic: "CUSTOMERS_DATA_REQUEST",
        payload: {
          shop_domain: "test-store.myshopify.com",
          customer: { id: 1, email: "customer@example.com" },
          orders_requested: [1, 2, 3],
        },
      },
      {
        topic: "CUSTOMERS_REDACT",
        payload: {
          shop_domain: "test-store.myshopify.com",
          customer: { id: 1, email: "customer@example.com" },
          orders_to_redact: [1, 2],
        },
      },
      {
        topic: "SHOP_REDACT",
        payload: {
          shop_domain: "test-store.myshopify.com",
          shop_id: 12345,
        },
      },
    ];

    for (const { topic, payload } of gdprTopics) {
      const request = createWebhookRequest(topic, payload);
      const response = await action({ request, params: {}, context: {} });
      expect(response.status).toBe(200);
    }
  });
});
```

---

## 7. GraphQL API Testing

### Test Service Layer with GraphQL
```typescript
import { describe, it, expect, vi } from "vitest";
import { getProducts, createProduct } from "~/services/product.server";
import { mockGraphQLResponse, mockGraphQLSequence } from "../test-utilities/mock-graphql";

describe("Product Service", () => {
  it("fetches products with pagination", async () => {
    const mockGql = mockGraphQLResponse({
      products: {
        edges: [
          { node: { id: "1", title: "Product A" }, cursor: "cursor-1" },
          { node: { id: "2", title: "Product B" }, cursor: "cursor-2" },
        ],
        pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
      },
    });

    const result = await getProducts(mockGql, { first: 2 });

    expect(result.products).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(mockGql).toHaveBeenCalledWith(
      expect.stringContaining("products(first: 2)")
    );
  });

  it("creates product and handles user errors", async () => {
    const mockGql = mockGraphQLResponse({
      productCreate: {
        product: null,
        userErrors: [
          { field: ["title"], message: "has already been taken" },
        ],
      },
    });

    const result = await createProduct(mockGql, { title: "Existing Product" });

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain("already been taken");
  });
});
```

### MSW (Mock Service Worker) for API Mocking
```typescript
import { setupServer } from "msw/node";
import { graphql, HttpResponse } from "msw";

const handlers = [
  // Mock Shopify Admin GraphQL
  graphql.query("GetProducts", () => {
    return HttpResponse.json({
      data: {
        products: {
          edges: [
            { node: { id: "1", title: "Product A" } },
          ],
        },
      },
    });
  }),

  graphql.mutation("CreateProduct", ({ variables }) => {
    return HttpResponse.json({
      data: {
        productCreate: {
          product: { id: "new-1", title: variables.input.title },
          userErrors: [],
        },
      },
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 8. Playwright E2E Setup

### Playwright Config (playwright.config.ts)
```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "./tests/test-utilities/test.env"),
});

if (
  !process.env.SHOPIFY_API_KEY ||
  !process.env.SHOPIFY_API_SECRET ||
  !process.env.SHOPIFY_APP_URL ||
  !process.env.SCOPES
) {
  throw new Error("Test environment variables not set. Check tests/test-utilities/test.env");
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/e2e/reports" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      PORT: "3000",
      NODE_ENV: "test",
    },
  },
  outputDir: "./tests/e2e/results",
});
```

---

## 9. E2E with Mock Shopify Auth

### Auth Fixture (tests/e2e/fixtures/shopify-auth.ts)
```typescript
import { test as base, expect } from "@playwright/test";
import { SignJWT } from "jose";

function getHMACKey(key: string) {
  const encoder = new TextEncoder();
  return encoder.encode(key);
}

export const test = base.extend<{
  mockShopifyAuth: void;
  handleShopifyRedirects: void;
}>({
  mockShopifyAuth: [
    async ({ page }, use) => {
      const apiKey = process.env.SHOPIFY_API_KEY!;
      const apiSecret = process.env.SHOPIFY_API_SECRET!;
      const appUrl = new URL(process.env.SHOPIFY_APP_URL!);

      // Create valid JWT session token
      const jwt = await new SignJWT({
        dest: appUrl.toString(),
        sid: `${apiKey}0`,
      })
        .setIssuer(new URL("/admin", appUrl).toString())
        .setAudience(apiKey)
        .setSubject("0")
        .setExpirationTime("60m")
        .setNotBefore("0m")
        .setIssuedAt()
        .setJti(Math.random().toString(32).slice(2))
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(getHMACKey(apiSecret));

      // Inject auth headers into all requests
      await page.setExtraHTTPHeaders({
        origin: appUrl.toString(),
        authorization: `Bearer ${jwt}`,
      });

      await use();
    },
    { auto: true },
  ],

  handleShopifyRedirects: [
    async ({ page, baseURL }, use) => {
      const appUrl = process.env.SHOPIFY_APP_URL!;

      // Intercept Shopify redirects and rewrite to local
      await page.route(`${baseURL}/**/*`, async (route) => {
        const response = await route.fetch({ maxRedirects: 0 });
        const headers = response.headers();
        let redirectHeader = "";

        if (
          response.status() === 204 &&
          headers["x-remix-redirect"]?.includes(appUrl)
        ) {
          redirectHeader = "x-remix-redirect";
        } else if (
          response.status().toString().startsWith("3") &&
          headers.location?.includes(appUrl)
        ) {
          redirectHeader = "location";
        }

        if (redirectHeader) {
          const shopifyUrl = new URL(headers[redirectHeader]);
          const localUrl = new URL(shopifyUrl.pathname, baseURL).toString();
          route.fulfill({
            response,
            headers: { ...headers, [redirectHeader]: localUrl },
          });
        } else {
          route.fulfill({ response });
        }
      });

      await use();
    },
    { auto: true },
  ],
});

export { expect };
```

### E2E Test Example
```typescript
// tests/e2e/products.spec.ts
import { test, expect } from "./fixtures/shopify-auth";

test.describe("Products Page", () => {
  test("loads products list", async ({ page }) => {
    await page.goto("/app/products");

    const heading = page.getByRole("heading", { name: "Products" });
    await expect(heading).toBeVisible();
  });

  test("creates a new product", async ({ page }) => {
    await page.goto("/app/products/new");

    await page.getByLabel("Title").fill("Test Product");
    await page.getByLabel("Description").fill("A test product");
    await page.getByLabel("Price").fill("25.00");
    await page.getByRole("button", { name: "Save" }).click();

    // Verify redirect to product detail
    await expect(page).toHaveURL(/\/app\/products\/\d+/);
    await expect(page.getByText("Product saved")).toBeVisible();
  });

  test("filters products by status", async ({ page }) => {
    await page.goto("/app/products");

    // Open filters
    await page.getByRole("button", { name: /filter/i }).click();

    // Select Active status
    await page.getByLabel("Active").check();

    // Verify filtered results
    await expect(page.getByText("Active")).toBeVisible();
  });

  test("bulk deletes products", async ({ page }) => {
    await page.goto("/app/products");

    // Select all products
    const selectAll = page.getByRole("checkbox").first();
    await selectAll.check();

    // Click delete bulk action
    await page.getByRole("button", { name: /delete/i }).click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    await expect(page.getByText("Products deleted")).toBeVisible();
  });
});
```

---

## 10. Mock Bridge for Embedded Apps

### Setup Mock Bridge
```bash
npm install --save-dev @getverdict/mock-bridge
```

### Playwright with Mock Bridge
```typescript
// tests/e2e/fixtures/mock-bridge.ts
import { test as base } from "@playwright/test";
import { MockShopifyAdminServer } from "@getverdict/mock-bridge";

let mockServer: MockShopifyAdminServer;

export const test = base.extend({
  mockAdmin: [
    async ({}, use) => {
      mockServer = new MockShopifyAdminServer({
        appUrl: "http://localhost:3000",
        clientId: process.env.SHOPIFY_API_KEY!,
        port: 3080,
        debug: false,
      });

      await mockServer.start();
      await use(mockServer);
      await mockServer.stop();
    },
    { scope: "worker" }, // Share across tests in a worker
  ],
});

export { expect } from "@playwright/test";
```

### Test with Mock Admin
```typescript
import { test, expect } from "./fixtures/mock-bridge";

test("app loads in mock Shopify admin", async ({ page, mockAdmin }) => {
  // Navigate to mock admin (port 3080)
  await page.goto("http://localhost:3080");

  // Your app is embedded inside mock admin
  const iframe = page.frameLocator("iframe");
  await expect(iframe.getByRole("heading", { name: "Products" })).toBeVisible();
});

test("toast shows after save", async ({ page, mockAdmin }) => {
  await page.goto("http://localhost:3080");

  const iframe = page.frameLocator("iframe");
  await iframe.getByRole("button", { name: "Save" }).click();

  // Toast appears in mock admin frame
  await expect(page.getByText("Saved")).toBeVisible();
});
```

---

## 11. Extension Testing

### Test Checkout UI Extension
```typescript
// extensions/checkout-ui/src/__tests__/Checkout.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkout } from "../Checkout";

// Mock @shopify/ui-extensions-react/checkout
vi.mock("@shopify/ui-extensions-react/checkout", () => ({
  useExtensionApi: () => ({
    extensionPoint: "purchase.checkout.block.render",
    lines: { current: [] },
    cost: { totalAmount: { current: { amount: "100.00", currencyCode: "USD" } } },
  }),
  Banner: ({ children, ...props }) => <div data-testid="banner" {...props}>{children}</div>,
  BlockStack: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
}));

describe("Checkout Extension", () => {
  it("renders banner", () => {
    render(<Checkout />);
    expect(screen.getByTestId("banner")).toBeInTheDocument();
  });
});
```

### Test Shopify Function
```typescript
// extensions/discount-function/src/tests/run.test.js
import { describe, it, expect } from "vitest";
import { run } from "../run";

describe("Discount Function", () => {
  it("applies 10% discount for orders over $100", () => {
    const input = {
      cart: {
        cost: {
          totalAmount: { amount: "150.00" },
        },
        lines: [
          {
            merchandise: { __typename: "ProductVariant", id: "gid://shopify/ProductVariant/1" },
            cost: { totalAmount: { amount: "150.00" } },
            quantity: 1,
          },
        ],
      },
      discountNode: {
        metafield: { value: JSON.stringify({ percentage: 10, minAmount: 100 }) },
      },
    };

    const result = run(input);

    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].value.percentage.value).toBe("10");
  });

  it("returns no discount for orders under threshold", () => {
    const input = {
      cart: {
        cost: {
          totalAmount: { amount: "50.00" },
        },
        lines: [],
      },
      discountNode: {
        metafield: { value: JSON.stringify({ percentage: 10, minAmount: 100 }) },
      },
    };

    const result = run(input);

    expect(result.discounts).toHaveLength(0);
  });
});
```

---

## 12. Database Testing (Prisma)

### Test Database Setup
```typescript
// tests/test-utilities/db-setup.ts
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});

export async function setupTestDB() {
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}

export async function cleanupTestDB() {
  const tables = await prisma.$queryRaw`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma_%'
  `;
  for (const { name } of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`);
  }
}

export { prisma };
```

### Database Integration Test
```typescript
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { prisma, setupTestDB, cleanupTestDB } from "../test-utilities/db-setup";

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await cleanupTestDB();
});

describe("Session Storage", () => {
  it("stores and retrieves a session", async () => {
    await prisma.session.create({
      data: {
        id: "offline_test-store.myshopify.com",
        shop: "test-store.myshopify.com",
        state: "active",
        isOnline: false,
        scope: "write_products",
        accessToken: "token-123",
      },
    });

    const session = await prisma.session.findUnique({
      where: { id: "offline_test-store.myshopify.com" },
    });

    expect(session).not.toBeNull();
    expect(session!.shop).toBe("test-store.myshopify.com");
  });
});
```

---

## 13. CI/CD with GitHub Actions

### Complete Workflow (.github/workflows/test.yml)
```yaml
name: Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"
  SHOPIFY_API_KEY: ${{ secrets.SHOPIFY_API_KEY_TEST }}
  SHOPIFY_API_SECRET: ${{ secrets.SHOPIFY_API_SECRET_TEST }}
  SHOPIFY_APP_URL: "https://test.local"
  SCOPES: "write_products,read_orders"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npm run test -- --reporter=junit --outputFile=test-results.xml
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: unit-test-results
          path: test-results.xml

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e -- --project=chromium
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/e2e/reports/
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-screenshots
          path: tests/e2e/results/

  deploy:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - name: Deploy to production
        run: |
          npx shopify app deploy --force
        env:
          SHOPIFY_CLI_PARTNERS_TOKEN: ${{ secrets.SHOPIFY_CLI_PARTNERS_TOKEN }}
```

### Pre-commit Hook (optional, with husky)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

---

## 14. Staging Environment

### Multi-Environment Setup
```env
# .env.test
SHOPIFY_API_KEY=test_key
SHOPIFY_API_SECRET=test_secret
SHOPIFY_APP_URL=https://test.local
DATABASE_URL=file:./test.db
NODE_ENV=test

# .env.staging
SHOPIFY_API_KEY=staging_key
SHOPIFY_API_SECRET=staging_secret
SHOPIFY_APP_URL=https://staging-app.fly.dev
DATABASE_URL=postgres://staging-db-url
NODE_ENV=staging

# .env.production
SHOPIFY_API_KEY=prod_key
SHOPIFY_API_SECRET=prod_secret
SHOPIFY_APP_URL=https://app.yourdomain.com
DATABASE_URL=postgres://prod-db-url
NODE_ENV=production
```

### Shopify App Config per Environment
```toml
# shopify.app.staging.toml
name = "My App (Staging)"
client_id = "staging-client-id"
application_url = "https://staging-app.fly.dev"
embedded = true

[access_scopes]
scopes = "write_products,read_orders"
```

### Deploy to Staging
```bash
# Deploy to staging environment
shopify app deploy --config shopify.app.staging.toml

# Run E2E against staging
SHOPIFY_APP_URL=https://staging-app.fly.dev npx playwright test
```

---

## 15. App Store QA Checklist

### Automated Pre-Submission Checks
```typescript
// tests/e2e/app-store-qa.spec.ts
import { test, expect } from "./fixtures/shopify-auth";

test.describe("App Store QA Checklist", () => {
  // INSTALLATION
  test("app installs successfully", async ({ page }) => {
    await page.goto("/app");
    await expect(page).not.toHaveURL(/\/auth\//);
    await expect(page.getByRole("heading")).toBeVisible();
  });

  // CORE FUNCTIONALITY
  test("primary feature works end-to-end", async ({ page }) => {
    await page.goto("/app");
    // Test your primary app feature
    await expect(page.getByRole("heading")).toBeVisible();
  });

  // EMPTY STATES
  test("shows empty state for new installs", async ({ page }) => {
    await page.goto("/app/products");
    // Should show empty state, not error
    const content = page.locator("body");
    await expect(content).not.toContainText("Error");
    await expect(content).not.toContainText("undefined");
  });

  // ERROR HANDLING
  test("handles API errors gracefully", async ({ page }) => {
    // Simulate error by navigating to non-existent resource
    await page.goto("/app/products/99999999");
    await expect(page.locator("body")).not.toContainText("Unhandled");
    await expect(page.locator("body")).not.toContainText("500");
  });

  // NO CONSOLE ERRORS
  test("no JavaScript console errors on main pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0);
  });

  // RESPONSIVE
  test("app works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app");
    await expect(page.getByRole("heading")).toBeVisible();
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  // LOADING STATES
  test("shows loading state during data fetch", async ({ page }) => {
    await page.goto("/app/products");
    // Should show skeleton or spinner before data loads
    // This verifies no flash of unstyled content
  });

  // NAVIGATION
  test("all nav links work", async ({ page }) => {
    await page.goto("/app");

    const navLinks = page.locator("nav a, ui-nav-menu a");
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/app")) {
        await page.goto(href);
        await expect(page.locator("body")).not.toContainText("404");
      }
    }
  });
});
```

---

## 16. Test Utilities & Helpers

### Factory Functions (tests/test-utilities/factories.js)
```javascript
let idCounter = 0;

export function createProduct(overrides = {}) {
  idCounter++;
  return {
    id: `gid://shopify/Product/${idCounter}`,
    title: `Product ${idCounter}`,
    handle: `product-${idCounter}`,
    status: "ACTIVE",
    totalInventory: 10,
    priceRangeV2: {
      minVariantPrice: { amount: "25.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "25.00", currencyCode: "USD" },
    },
    images: { edges: [] },
    variants: { edges: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createOrder(overrides = {}) {
  idCounter++;
  return {
    id: `gid://shopify/Order/${idCounter}`,
    name: `#${1000 + idCounter}`,
    email: `customer${idCounter}@example.com`,
    totalPriceSet: {
      shopMoney: { amount: "100.00", currencyCode: "USD" },
    },
    displayFulfillmentStatus: "UNFULFILLED",
    displayFinancialStatus: "PAID",
    createdAt: new Date().toISOString(),
    lineItems: { edges: [] },
    ...overrides,
  };
}

export function createCustomer(overrides = {}) {
  idCounter++;
  return {
    id: `gid://shopify/Customer/${idCounter}`,
    firstName: `First${idCounter}`,
    lastName: `Last${idCounter}`,
    email: `customer${idCounter}@example.com`,
    ordersCount: "0",
    totalSpentV2: { amount: "0.00", currencyCode: "USD" },
    ...overrides,
  };
}

export function createSession(overrides = {}) {
  return {
    id: "offline_test-store.myshopify.com",
    shop: "test-store.myshopify.com",
    state: "active",
    isOnline: false,
    scope: "write_products,read_orders",
    accessToken: "test-token",
    expires: undefined,
    ...overrides,
  };
}

export function createGraphQLResponse(data, userErrors = []) {
  return {
    data,
    extensions: {
      cost: {
        requestedQueryCost: 10,
        actualQueryCost: 8,
        throttleStatus: {
          maximumAvailable: 1000,
          currentlyAvailable: 992,
          restoreRate: 50,
        },
      },
    },
  };
}
```

### Custom Matchers
```typescript
// tests/test-utilities/custom-matchers.ts
import { expect } from "vitest";

expect.extend({
  toBeValidShopifyGID(received: string, resourceType?: string) {
    const regex = resourceType
      ? new RegExp(`^gid://shopify/${resourceType}/\\d+$`)
      : /^gid:\/\/shopify\/\w+\/\d+$/;

    return {
      pass: regex.test(received),
      message: () =>
        `Expected ${received} to be a valid Shopify GID${resourceType ? ` for ${resourceType}` : ""}`,
    };
  },

  toHaveNoUserErrors(received: any) {
    const userErrors = received?.userErrors || received?.data?.userErrors || [];
    return {
      pass: userErrors.length === 0,
      message: () =>
        `Expected no user errors but got: ${JSON.stringify(userErrors)}`,
    };
  },
});

// Usage:
// expect("gid://shopify/Product/123").toBeValidShopifyGID("Product");
// expect(mutation).toHaveNoUserErrors();
```

---

## 17. Constraints & Rules

### ALWAYS:
- Use Vitest for unit & component tests, Playwright for E2E
- Mock `authenticate.admin` — NEVER hit real Shopify APIs in unit tests
- Use `createRemixStub` for testing Remix route components
- Wrap Polaris components in `AppProvider` for tests (use testing-library-polaris.jsx helper)
- Use Vitest workspaces to isolate Shopify mocks from non-Shopify tests
- Test all 3 GDPR webhooks (customers/data_request, customers/redact, shop/redact)
- Test webhook HMAC validation with both valid and invalid signatures
- Test idempotent webhook handling (same webhook ID processed twice)
- Use factory functions for test data — never hard-code Shopify GIDs
- Use `test.env` file for test environment variables — never use real credentials
- Run `npx prisma generate` in CI before tests
- Install only needed Playwright browsers in CI (`--with-deps chromium`)
- Upload test artifacts (reports, screenshots) in CI even on failure

### NEVER:
- Use real Shopify store credentials in tests
- Hit real Shopify Admin API in unit/component tests
- Skip webhook HMAC validation in tests
- Use `setTimeout` or `sleep` in tests — use Playwright's auto-waiting or `waitFor`
- Run all Playwright browser projects in CI (use chromium only for speed)
- Mock at the wrong level — mock the API boundary, not internal functions
- Test implementation details — test behavior and user-visible outcomes
- Skip error/edge case tests — always test what happens when APIs fail
- Use snapshot tests for Polaris components (they change across versions)
- Put test credentials in `.env` committed to git — use `.env.test` in `.gitignore` or CI secrets
