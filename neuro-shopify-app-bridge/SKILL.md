---
name: neuro-shopify-app-bridge
description: Shopify App Bridge 4 expert - embedded app architecture, shopify global APIs (Modal, Toast, ResourcePicker, SaveBar, Navigation, Scanner, Loading), web components (ui-modal, ui-nav-menu, ui-title-bar, ui-save-bar), React hooks (useAppBridge), session tokens, direct API access, inter-frame communication, and App Bridge migration patterns
trigger: auto
globs:
  - "**/shopify.app.toml"
  - "**/shopify.server.*"
  - "**/routes/app.*"
  - "**/app-bridge*"
  - "**/*.jsx"
  - "**/*.tsx"
  - "**/shopify*"
---

# Neuro Shopify App Bridge 4

You are a senior Shopify App Bridge expert. When building ANY embedded Shopify app, you MUST follow these exact patterns for App Bridge integration. Never deviate from these specifications. Always use App Bridge 4 (the latest) unless explicitly told otherwise.

---

## Table of Contents

1. [App Bridge Setup & Configuration](#1-app-bridge-setup--configuration)
2. [The shopify Global Object](#2-the-shopify-global-object)
3. [Authentication & Session Tokens](#3-authentication--session-tokens)
4. [Direct API Access (Fetch)](#4-direct-api-access-fetch)
5. [Navigation API](#5-navigation-api)
6. [Modal API & Component](#6-modal-api--component)
7. [Toast API](#7-toast-api)
8. [Resource Picker API](#8-resource-picker-api)
9. [Save Bar API & Component](#9-save-bar-api--component)
10. [Loading API](#10-loading-api)
11. [Scanner API](#11-scanner-api)
12. [Picker API](#12-picker-api)
13. [Intents API](#13-intents-api)
14. [Environment & Config APIs](#14-environment--config-apis)
15. [User & Scopes APIs](#15-user--scopes-apis)
16. [Web Components](#16-web-components)
17. [React Integration](#17-react-integration)
18. [Inter-Frame Communication](#18-inter-frame-communication)
19. [POS Integration](#19-pos-integration)
20. [TypeScript Support](#20-typescript-support)
21. [Migration from App Bridge 3](#21-migration-from-app-bridge-3)
22. [Testing with Mock Bridge](#22-testing-with-mock-bridge)
23. [Constraints & Rules](#23-constraints--rules)

---

## 1. App Bridge Setup & Configuration

### CDN Loading (Recommended for Embedded Apps)
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
</head>
<body>
  <!-- App content -->
</body>
</html>
```

### Remix / React Router v7 Setup
```jsx
// app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="shopify-api-key" content={process.env.SHOPIFY_API_KEY} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### shopify.app.toml Configuration
```toml
name = "my-app"
client_id = "your-client-id"
application_url = "https://your-app.com"
embedded = true

[access_scopes]
scopes = "write_products,read_orders"

[auth]
redirect_urls = ["https://your-app.com/auth/callback"]

[pos]
embedded = false

[access]
direct_api_mode = "online"  # "online" | "offline"
```

### CRITICAL: App Bridge 4 auto-initializes
- NO manual `createApp()` call needed
- The `shopify` global object is available automatically
- The `<meta name="shopify-api-key">` tag is REQUIRED
- The CDN script MUST be loaded BEFORE your app scripts

---

## 2. The shopify Global Object

All App Bridge APIs are available through the `shopify` global object:

```javascript
// Available everywhere in your embedded app
window.shopify.toast.show("Message");
window.shopify.modal.show("modal-id");
window.shopify.resourcePicker({ type: "product" });
window.shopify.loading(true);

// In React, use the hook:
import { useAppBridge } from "@shopify/app-bridge-react";
const shopify = useAppBridge();
shopify.toast.show("Saved!");
```

### Complete API Surface
```typescript
interface ShopifyGlobal {
  // Authentication
  idToken(): Promise<string>;

  // UI APIs
  toast: ToastAPI;
  modal: ModalAPI;
  saveBar: SaveBarAPI;
  loading(show: boolean): void;

  // Data APIs
  resourcePicker(options: ResourcePickerOptions): Promise<SelectPayload[]>;
  picker(options: PickerOptions): Promise<PickerResult>;
  intents: IntentsAPI;

  // Information APIs
  config: ConfigAPI;
  environment: EnvironmentAPI;
  user: UserAPI;
  app: AppAPI;
  scopes: ScopesAPI;

  // Device APIs
  scanner: ScannerAPI;
  pos: POSAPI;
  print: PrintAPI;
  share: ShareAPI;

  // Performance
  webVitals: WebVitalsAPI;

  // Support
  support: SupportAPI;
  reviews: ReviewsAPI;
}
```

---

## 3. Authentication & Session Tokens

### Generate Session Token
```javascript
// Get a session token for server-side authentication
const token = await shopify.idToken();

// Send to your server
const response = await fetch("/api/my-endpoint", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Verify Token on Server (Node.js)
```javascript
import { shopifyApp } from "@shopify/shopify-app-remix/server";

// In your loader/action:
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  // session.shop, session.accessToken available
  return json({ shop: session.shop });
}
```

### Token Structure (JWT)
```javascript
// Decoded token payload:
{
  iss: "https://store-name.myshopify.com/admin",
  dest: "https://store-name.myshopify.com",
  aud: "client-id",
  sub: "user-id",
  exp: 1234567890,
  nbf: 1234567890,
  iat: 1234567890,
  jti: "unique-token-id",
  sid: "session-id"
}
```

### CRITICAL Rules:
- NEVER use cookies for auth in embedded apps — Shopify blocks third-party cookies
- ALWAYS use `authenticate.admin(request)` in Remix loaders/actions
- Session tokens expire after 1 minute — re-fetch with `shopify.idToken()` as needed
- Token refresh is handled automatically by App Bridge for authenticated fetch

---

## 4. Direct API Access (Fetch)

### Authenticated Admin API Calls
```javascript
// App Bridge automatically adds authentication headers
const response = await fetch("shopify:admin/api/2026-01/graphql.json", {
  method: "POST",
  body: JSON.stringify({
    query: `{
      products(first: 10) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`,
  }),
});
const data = await response.json();
```

### CRITICAL: Direct API Access Configuration
```toml
# shopify.app.toml — MUST enable direct API access
[access]
direct_api_mode = "online"
```

```javascript
// Use the shopify: protocol — NOT regular https:// URLs
// CORRECT:
fetch("shopify:admin/api/2026-01/graphql.json", { method: "POST", body });

// WRONG:
fetch("https://store.myshopify.com/admin/api/2026-01/graphql.json", { method: "POST", body });
```

### REST API via Direct Access
```javascript
const response = await fetch("shopify:admin/api/2026-01/products.json");
const { products } = await response.json();
```

---

## 5. Navigation API

### Navigate Within App
```javascript
// Navigate to an app page
shopify.navigation.navigate("/app/products");

// Navigate to a specific Shopify admin page
shopify.navigation.navigate("shopify:admin/products");
shopify.navigation.navigate("shopify:admin/orders/12345");
shopify.navigation.navigate("shopify:admin/customers");

// Navigate with URL replacement (no history entry)
shopify.navigation.navigate("/app/settings", { replace: true });
```

### App Navigation Menu (Web Component)
```jsx
// In your root layout — defines sidebar navigation
<ui-nav-menu>
  <a href="/app" rel="home">Home</a>
  <a href="/app/products">Products</a>
  <a href="/app/orders">Orders</a>
  <a href="/app/settings">Settings</a>
</ui-nav-menu>
```

### Remix Navigation Menu
```jsx
// app/routes/app.jsx
import { NavMenu } from "@shopify/app-bridge-react";

export default function App() {
  return (
    <>
      <NavMenu>
        <a href="/app" rel="home">Home</a>
        <a href="/app/products">Products</a>
        <a href="/app/orders">Orders</a>
        <a href="/app/settings">Settings</a>
      </NavMenu>
      <Outlet />
    </>
  );
}
```

### CRITICAL Navigation Rules:
- Use `shopify:admin/` prefix to navigate to Shopify admin pages
- Use `/app/` prefix for in-app routes
- Navigation menu MUST be in the root layout (app.jsx), NOT in child routes
- `rel="home"` on the first link marks it as the home/default route
- Maximum 2 levels of navigation depth

---

## 6. Modal API & Component

### Basic Modal (React)
```jsx
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { Text } from "@shopify/polaris";

function DeleteConfirmation() {
  return (
    <Modal id="delete-modal">
      <div style={{ padding: "16px" }}>
        <Text as="p">Are you sure you want to delete this resource?</Text>
      </div>
      <TitleBar title="Delete resource">
        <button variant="primary" tone="critical">Delete</button>
        <button>Cancel</button>
      </TitleBar>
    </Modal>
  );
}

// Open the modal:
shopify.modal.show("delete-modal");
```

### Modal with Form & SaveBar
```jsx
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { TextField, FormLayout } from "@shopify/polaris";
import { useState, useCallback } from "react";

function EditModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <Modal id="edit-modal">
      <div style={{ padding: "16px" }}>
        <form data-save-bar>
          <FormLayout>
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              autoComplete="name"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
          </FormLayout>
        </form>
      </div>
      <TitleBar title="Edit customer">
        <button variant="primary" type="submit">Save</button>
        <button>Cancel</button>
      </TitleBar>
    </Modal>
  );
}
```

### Modal with Separate Route (src)
```jsx
// Main app — for complex modals that need their own route
function App() {
  return (
    <Modal id="complex-modal" src="/app/modal/product-editor">
      <TitleBar title="Product Editor" />
    </Modal>
  );
}

// Open it:
shopify.modal.show("complex-modal");
```

### Modal with Polaris Portal Components
```jsx
// Components like Popover, Tooltip, Combobox need AppProvider in modals
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { AppProvider, Popover, ActionList, Button } from "@shopify/polaris";

function ModalWithPopover() {
  const [active, setActive] = useState(false);

  return (
    <Modal id="popover-modal">
      <AppProvider i18n={{}}>
        <div style={{ padding: "16px" }}>
          <Popover
            active={active}
            activator={<Button onClick={() => setActive(!active)}>Actions</Button>}
            onClose={() => setActive(false)}
          >
            <ActionList items={[
              { content: "Edit" },
              { content: "Delete", destructive: true },
            ]} />
          </Popover>
        </div>
      </AppProvider>
      <TitleBar title="Actions" />
    </Modal>
  );
}
```

### Modal Variants (Size)
```jsx
// Available variants: "small" | "base" | "large" | "max" | "full-screen"
<Modal id="large-modal" variant="large">
  {/* content */}
</Modal>

<Modal id="fullscreen-modal" variant="full-screen">
  {/* content */}
</Modal>
```

### Modal Event Handling
```jsx
// Listen for modal show/hide events
document.getElementById("my-modal").addEventListener("show", () => {
  console.log("Modal opened");
});

document.getElementById("my-modal").addEventListener("hide", () => {
  console.log("Modal closed");
});

// Close modal programmatically
shopify.modal.hide("my-modal");
```

### CRITICAL Modal Rules:
- Toast and other App Bridge APIs are NOT directly available inside `src` modals
- Use `window.postMessage()` to communicate between modal and main app
- Modals with `src` load in a separate iframe — CSS/JS must be re-included
- Always wrap portal-based Polaris components in `<AppProvider>` inside modals
- Modal IDs must be unique across your entire app

---

## 7. Toast API

### Show Toast
```javascript
// Basic toast
shopify.toast.show("Product saved");

// Toast with options
shopify.toast.show("Product saved", {
  duration: 5000,           // ms, default 5000
});

// Error toast
shopify.toast.show("Failed to save", {
  isError: true,
});
```

### React Usage
```jsx
import { useAppBridge } from "@shopify/app-bridge-react";

function SaveButton() {
  const shopify = useAppBridge();

  const handleSave = async () => {
    try {
      await saveData();
      shopify.toast.show("Saved successfully");
    } catch (error) {
      shopify.toast.show("Save failed", { isError: true });
    }
  };

  return <Button onClick={handleSave} primary>Save</Button>;
}
```

### CRITICAL Toast Rules:
- Toast is NOT available inside `src` modals — use `window.postMessage()` to trigger from main app
- Toast auto-dismisses — no manual dismiss needed
- Keep messages short (under 40 characters recommended)
- Use `isError: true` for error states — never use toast for success AND error with same styling

---

## 8. Resource Picker API

### Pick Products
```javascript
const selected = await shopify.resourcePicker({
  type: "product",
});
// Returns array of selected products or empty array if cancelled

// With filters
const selected = await shopify.resourcePicker({
  type: "product",
  filter: {
    query: "Sweater",
    variants: false,   // hide variants
    draft: false,      // hide drafts
    archived: false,   // hide archived
  },
  multiple: true,       // allow multi-select (default: true)
  action: "select",     // "select" | "add"
  selectionIds: [       // pre-select items
    { id: "gid://shopify/Product/123" },
  ],
});
```

### Pick Collections
```javascript
const selected = await shopify.resourcePicker({
  type: "collection",
  multiple: true,
});
```

### Pick Variants
```javascript
const selected = await shopify.resourcePicker({
  type: "variant",
  filter: {
    query: "Large",
  },
});
```

### Handle Selection
```javascript
const selected = await shopify.resourcePicker({ type: "product" });

if (selected && selected.length > 0) {
  selected.forEach((product) => {
    console.log(product.id);       // "gid://shopify/Product/123"
    console.log(product.title);
    console.log(product.handle);
    console.log(product.images);
    console.log(product.variants); // if variants included
  });
}
```

### React Pattern
```jsx
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import { useState } from "react";

function ProductSelector() {
  const shopify = useAppBridge();
  const [products, setProducts] = useState([]);

  const handlePick = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      selectionIds: products.map((p) => ({ id: p.id })),
    });
    if (selected) {
      setProducts(selected);
    }
  };

  return (
    <Button onClick={handlePick}>
      {products.length > 0 ? `${products.length} selected` : "Select products"}
    </Button>
  );
}
```

### CRITICAL ResourcePicker Rules:
- Returns `undefined` or empty array if user cancels
- Always check for empty/undefined result before processing
- Use `selectionIds` to maintain previously selected items
- `type` supports: "product", "variant", "collection"
- The picker UI is controlled by Shopify — you cannot customize its appearance

---

## 9. Save Bar API & Component

### Web Component (Recommended)
```html
<form id="settings-form" data-save-bar>
  <input type="text" name="title" />
  <input type="email" name="email" />
</form>
```

### React Component
```jsx
import { SaveBar } from "@shopify/app-bridge-react";
import { useCallback, useState } from "react";

function SettingsForm() {
  const [formDirty, setFormDirty] = useState(false);

  return (
    <>
      <form
        data-save-bar
        data-discard-confirmation
        onInput={() => setFormDirty(true)}
        onReset={() => setFormDirty(false)}
      >
        {/* form fields */}
      </form>

      {/* SaveBar auto-shows when form with data-save-bar is dirty */}
    </>
  );
}
```

### Programmatic SaveBar
```javascript
// Show save bar manually
shopify.saveBar.show("my-save-bar");

// Hide save bar
shopify.saveBar.hide("my-save-bar");

// Listen for save/discard
document.getElementById("my-save-bar").addEventListener("save", () => {
  // Save logic
});

document.getElementById("my-save-bar").addEventListener("discard", () => {
  // Discard/reset logic
});
```

### SaveBar with Confirmation
```jsx
// Add data-discard-confirmation to show confirmation when discarding
<form data-save-bar data-discard-confirmation>
  {/* fields */}
</form>

// Or with the web component:
<ui-save-bar id="my-save-bar">
  <button variant="primary" id="save-button">Save</button>
  <button id="discard-button">Discard</button>
</ui-save-bar>
```

### SaveBar Inside Modal
```jsx
<Modal id="edit-modal">
  <div style={{ padding: "16px" }}>
    <form data-save-bar>
      <TextField label="Title" value={title} onChange={setTitle} autoComplete="off" />
    </form>
  </div>
  <TitleBar title="Edit">
    <button variant="primary">Save</button>
    <button>Cancel</button>
  </TitleBar>
</Modal>
```

### CRITICAL SaveBar Rules:
- `data-save-bar` attribute auto-detects form dirty state
- `data-discard-confirmation` shows "Are you sure?" on discard
- SaveBar appears at the TOP of the Shopify admin — not inside your app iframe
- Only ONE save bar can be visible at a time
- SaveBar buttons in modal DO NOT support loading/disabled state in `max` variant modals

---

## 10. Loading API

```javascript
// Show loading bar (top of admin)
shopify.loading(true);

// Hide loading bar
shopify.loading(false);

// Common pattern with async operations
async function fetchData() {
  shopify.loading(true);
  try {
    const data = await fetch("/api/data");
    return data.json();
  } finally {
    shopify.loading(false);
  }
}
```

---

## 11. Scanner API

```javascript
// Open camera/barcode scanner
const result = await shopify.scanner.capture({
  type: "barcode",  // "barcode" | "qr"
});

if (result) {
  console.log(result.data);   // scanned value
  console.log(result.type);   // barcode type
}
```

### CRITICAL: Scanner is only available on mobile (Shopify Mobile app, Shopify POS)

---

## 12. Picker API

```javascript
// Generic picker for dates, files, etc.
const result = await shopify.picker({
  type: "date",
  // options vary by picker type
});
```

---

## 13. Intents API

### Launch Shopify Admin Workflows
```javascript
// Create a new product
shopify.intents.navigate("create", {
  type: "product",
});

// Create a new customer
shopify.intents.navigate("create", {
  type: "customer",
});

// Create a new order
shopify.intents.navigate("create", {
  type: "order",
});
```

---

## 14. Environment & Config APIs

### Environment API
```javascript
const env = shopify.environment;
console.log(env.embedded);    // true if embedded in admin
console.log(env.mobile);      // true if on mobile
console.log(env.pos);         // true if on Shopify POS
```

### Config API
```javascript
const config = shopify.config;
console.log(config.apiKey);   // your app's API key
console.log(config.shop);     // current shop domain
console.log(config.locale);   // merchant's locale
console.log(config.host);     // encoded host parameter
```

---

## 15. User & Scopes APIs

### User API
```javascript
const user = shopify.user;
console.log(user.id);         // staff member ID
console.log(user.email);
console.log(user.name);
console.log(user.locale);     // user's preferred locale
```

### Scopes API
```javascript
// Get current scopes
const currentScopes = await shopify.scopes.query();
console.log(currentScopes.granted);    // ["read_products", "write_orders"]

// Request optional scopes at runtime
const result = await shopify.scopes.request([
  "write_customers",
  "read_inventory",
]);
// result.granted — newly granted scopes
// result.denied — scopes the merchant denied

// Revoke optional scopes
await shopify.scopes.revoke(["write_customers"]);
```

### CRITICAL: Optional scopes are different from required scopes in shopify.app.toml

---

## 16. Web Components

### Title Bar
```html
<ui-title-bar title="Products">
  <button variant="primary">Create product</button>
  <button>Import</button>
  <button>Export</button>
</ui-title-bar>
```

### Navigation Menu
```html
<ui-nav-menu>
  <a href="/app" rel="home">Home</a>
  <a href="/app/products">Products</a>
  <a href="/app/settings">Settings</a>
</ui-nav-menu>
```

### Modal
```html
<ui-modal id="my-modal" variant="base">
  <p>Modal content here</p>
  <ui-title-bar title="My Modal">
    <button variant="primary">Save</button>
    <button>Cancel</button>
  </ui-title-bar>
</ui-modal>

<script>
  document.querySelector("#open-btn").addEventListener("click", () => {
    document.querySelector("#my-modal").show();
  });
</script>
```

### Save Bar
```html
<ui-save-bar id="my-save-bar">
  <button variant="primary" id="save-btn">Save</button>
  <button id="discard-btn">Discard</button>
</ui-save-bar>

<script>
  document.querySelector("#save-btn").addEventListener("click", () => {
    // save logic
    document.querySelector("#my-save-bar").hide();
  });
  document.querySelector("#discard-btn").addEventListener("click", () => {
    // discard logic
    document.querySelector("#my-save-bar").hide();
  });
</script>
```

---

## 17. React Integration

### useAppBridge Hook
```jsx
import { useAppBridge } from "@shopify/app-bridge-react";

function MyComponent() {
  const shopify = useAppBridge();

  // Now use any API:
  const showToast = () => shopify.toast.show("Hello!");
  const pickProduct = async () => {
    const result = await shopify.resourcePicker({ type: "product" });
    return result;
  };

  return <Button onClick={showToast}>Show Toast</Button>;
}
```

### React Components
```jsx
import { Modal, TitleBar, NavMenu, SaveBar } from "@shopify/app-bridge-react";

// All App Bridge web components have React equivalents
<NavMenu>
  <a href="/app" rel="home">Home</a>
  <a href="/app/products">Products</a>
</NavMenu>

<TitleBar title="Products">
  <button variant="primary">Create</button>
</TitleBar>

<Modal id="my-modal">
  <p>Content</p>
  <TitleBar title="Modal Title">
    <button variant="primary">Save</button>
  </TitleBar>
</Modal>
```

### CRITICAL: React components vs shopify global
- Use React components (`<Modal>`, `<TitleBar>`, `<NavMenu>`) for declarative UI
- Use `shopify.*` APIs (via `useAppBridge()`) for imperative actions (show toast, open picker, navigate)
- NEVER mix `createApp()` from old App Bridge with the new `shopify` global

---

## 18. Inter-Frame Communication

### Main App <-> Modal Communication
```jsx
// MAIN APP: Send message to modal
function sendToModal() {
  const modalEl = document.getElementById("my-modal");
  modalEl.contentWindow.postMessage(
    { type: "UPDATE_DATA", payload: { name: "New Name" } },
    location.origin
  );
}

// MAIN APP: Receive messages from modal
useEffect(() => {
  function handleMessage(event) {
    if (event.origin !== location.origin) return;
    if (event.data.type === "MODAL_RESULT") {
      console.log("Result from modal:", event.data.payload);
    }
  }
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);
```

```jsx
// MODAL ROUTE: Send message to main app
function sendToMainApp() {
  window.opener.postMessage(
    { type: "MODAL_RESULT", payload: { success: true } },
    location.origin
  );
}

// MODAL ROUTE: Receive messages from main app
useEffect(() => {
  function handleMessage(event) {
    if (event.origin !== location.origin) return;
    if (event.data.type === "UPDATE_DATA") {
      setData(event.data.payload);
    }
  }
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);
```

### CRITICAL: Always validate `event.origin` before processing messages

---

## 19. POS Integration

```javascript
// Detect POS environment
if (shopify.environment.pos) {
  // POS-specific logic
}

// POS Cart API
const cart = shopify.pos.cart;
await cart.addLineItem({
  variantId: "gid://shopify/ProductVariant/123",
  quantity: 1,
});

// POS Scanner
const scan = await shopify.scanner.capture({ type: "barcode" });
```

### POS Configuration
```toml
# shopify.app.toml
[pos]
embedded = true
```

---

## 20. TypeScript Support

### Install Type Definitions
```bash
npm install --save-dev @shopify/app-bridge-types
```

### Global Type Declaration
```typescript
// env.d.ts or global.d.ts
/// <reference types="@shopify/app-bridge-types" />
```

### Typed shopify Object
```typescript
// The shopify global is now fully typed
const token: string = await shopify.idToken();
const products: SelectPayload[] = await shopify.resourcePicker({
  type: "product",
  multiple: true,
});
```

---

## 21. Migration from App Bridge 3

### Key Changes
| App Bridge 3 | App Bridge 4 |
|--------------|--------------|
| `import { createApp } from "@shopify/app-bridge"` | Auto-initialized `shopify` global |
| `app.dispatch(Toast.show(...))` | `shopify.toast.show(...)` |
| `app.dispatch(ResourcePicker.open(...))` | `shopify.resourcePicker(...)` |
| `app.dispatch(Modal.open(...))` | `shopify.modal.show("id")` |
| `app.dispatch(TitleBar.update(...))` | `<ui-title-bar>` web component |
| `@shopify/app-bridge-react` Provider | No provider needed |
| Action-based API | Direct method calls |
| `NavigationMenu` React component | `<ui-nav-menu>` web component |

### Migration Steps
1. Remove `createApp()` calls and `<Provider>` wrapper
2. Add `<meta name="shopify-api-key">` and CDN script to HTML head
3. Replace action dispatches with `shopify.*` method calls
4. Replace React components with web components or new React equivalents
5. Update `@shopify/app-bridge-react` to latest version
6. Remove `@shopify/app-bridge` package (CDN is used instead)

---

## 22. Testing with Mock Bridge

### Install Mock Bridge
```bash
npm install --save-dev @getverdict/mock-bridge
```

### Quick Setup
```bash
# Start mock Shopify admin
npx @getverdict/mock-bridge http://localhost:3000

# Your app is now at http://localhost:3080 in mock admin
```

### Programmatic Setup (for CI/Testing)
```javascript
const { MockShopifyAdminServer } = require("@getverdict/mock-bridge");

const server = new MockShopifyAdminServer({
  appUrl: "http://localhost:3000",
  clientId: process.env.SHOPIFY_API_KEY,
  port: 3080,
  debug: true,
});

await server.start();
// Run tests...
await server.stop();
```

### Package Scripts
```json
{
  "scripts": {
    "dev": "remix vite:dev",
    "mock:admin": "mock-bridge http://localhost:3000",
    "dev:mock": "concurrently \"npm run dev\" \"npm run mock:admin\""
  }
}
```

### Mock Bridge API Coverage
| API | Status |
|-----|--------|
| `shopify.modal` | Fully supported |
| `shopify.saveBar` | Fully supported |
| `shopify.loading` | Fully supported |
| `shopify.toast` | Fully supported |
| `shopify.idToken()` | Fully supported (returns valid JWT) |
| `shopify.config` | Fully supported |
| `shopify.environment` | Fully supported |
| `shopify.user` | Fully supported |
| `shopify.resourcePicker` | Stub (returns empty array) |
| `shopify.scanner` | Stub (returns mock data) |
| Navigation | Not implemented |

---

## 23. Constraints & Rules

### ALWAYS:
- Use CDN-loaded App Bridge 4 (not npm package for the core library)
- Include `<meta name="shopify-api-key">` in HTML head
- Use `shopify.*` global for all App Bridge API calls
- Use `useAppBridge()` hook in React components
- Validate `event.origin` in postMessage handlers
- Handle ResourcePicker cancellation (returns undefined/empty)
- Use `data-save-bar` attribute for automatic dirty state detection
- Use `shopify:admin/api/` protocol for direct API access
- Check `shopify.environment` before using device-specific APIs (scanner, POS)

### NEVER:
- Import `createApp` from `@shopify/app-bridge` (that's v3)
- Use cookies for authentication in embedded apps
- Access `document` directly in HTML content modals
- Use `shopify.toast` inside `src`-based modals (use postMessage instead)
- Create multiple save bars simultaneously
- Skip the CDN script tag and try to self-host App Bridge
- Use `https://` URLs for Admin API calls (use `shopify:admin/` protocol)
- Call `shopify.loading(true)` without a corresponding `false` in finally block
