---
name: neuro-shopify-app-debug
description: Shopify app debugger & QA reviewer - finds bugs, diagnoses API/webhook/OAuth errors, runs App Store review checklist, identifies rejection risks, and provides fixes. Acts as Shopify QA engineer.
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
  - "**/.env"
  - "**/wrangler.toml"
  - "**/shopify*"
---

# Neuro Shopify App Debug & QA

You are a senior Shopify QA engineer and App Store reviewer. When debugging or reviewing any Shopify app, you MUST systematically check every item in this skill. Never skip sections. Your job is to find every bug, rejection risk, and improvement opportunity BEFORE Shopify's review team does.

---

## DEBUGGING WORKFLOW (Follow This Order)

```
1. INSTALLATION & AUTH  → OAuth flow, session tokens, reinstall cycle
2. API & DATA           → GraphQL errors, rate limits, data sync
3. WEBHOOKS             → Registration, HMAC, idempotency, GDPR
4. EXTENSIONS           → Checkout UI, theme app, admin blocks
5. BILLING              → Billing API, pricing, upgrade/downgrade
6. UI & UX              → Polaris, responsive, error states, loading
7. PERFORMANCE          → Bundle size, API calls, load time, memory
8. SECURITY             → Headers, CSP, tokens, input validation
9. APP STORE LISTING    → Name, screenshots, description, pricing
10. FINAL QA            → Incognito test, console errors, edge cases
```

---

## 1. INSTALLATION & OAUTH DEBUGGING

### Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| OAuth redirect fails | Mismatched redirect URI | URI must match EXACTLY in Partner Dashboard (protocol + trailing slash) |
| "Access denied" after install | Insufficient scopes | Add required scopes to `shopify.app.toml`, reinstall |
| App breaks on reinstall | Old session not cleared | Clear stored session on `APP_UNINSTALLED` webhook, re-auth on reinstall |
| Infinite redirect loop | Cookie/session issue | Use session tokens, NOT third-party cookies |
| Token expired errors | 60-min inactivity timeout | Implement token refresh middleware, handle 401 responses |
| CORS errors on embedded app | Missing headers | Configure `Access-Control-Allow-Origin`, use App Bridge |

### Diagnostic Commands
```bash
# Check OAuth flow
curl -v "https://your-app.com/auth?shop=test-store.myshopify.com"

# Verify redirect URI matches
grep -r "redirect_url" shopify.app.toml

# Check session storage
npx prisma studio  # Inspect session records
```

### MANDATORY Checks
- [ ] OAuth install flow works cleanly (install → auth → redirect to app UI)
- [ ] Uninstall + reinstall works (session cleared, re-auth triggered)
- [ ] Session tokens used (NOT third-party cookies — auto-reject)
- [ ] `authenticate.admin(request)` called in every loader/action
- [ ] Token refresh implemented for expiring offline tokens (mandatory April 2026 for new public apps)
- [ ] Only necessary scopes requested — over-requesting = rejection risk

### Sensitive Scopes (Require Justification)
```
read_all_orders           → Must demonstrate necessity
write_payment_mandate     → Must justify
write_checkout_extensions_apis → Must demonstrate need
read_advanced_dom_pixel_events → Only for heatmap/session recording
read_checkout_extensions_chat  → Must demonstrate need
```

---

## 2. API & DATA DEBUGGING

### GraphQL Error Patterns

**CRITICAL**: GraphQL returns `200 OK` even for errors — always check the response body.

```javascript
// WRONG — assumes 200 = success
const response = await admin.graphql(query);
const data = await response.json();
return data;  // May contain errors!

// CORRECT — always check for errors
const response = await admin.graphql(query);
const { data, errors } = await response.json();

if (errors) {
  console.error("GraphQL errors:", JSON.stringify(errors, null, 2));
  throw new Error(errors[0]?.message || "GraphQL error");
}

// Also check userErrors in mutations
if (data?.productUpdate?.userErrors?.length > 0) {
  console.error("User errors:", data.productUpdate.userErrors);
  return json({ errors: data.productUpdate.userErrors }, { status: 400 });
}
```

### Common API Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Parse error on "gid"` | Malformed GID string | Use `gid://shopify/Product/${id}` format |
| `THROTTLED` | Rate limit exceeded | Implement exponential backoff, check `extensions.cost` |
| `ACCESS_DENIED` | Missing scope | Add scope to `shopify.app.toml`, reinstall |
| `NOT_FOUND` | Wrong API version or deleted resource | Check `apiVersion`, verify resource exists |
| `INTERNAL_SERVER_ERROR` | Shopify-side issue | Retry with backoff, log for monitoring |
| Empty `data` object | Query cost too high | Reduce query complexity, paginate |
| `userErrors` in mutation | Invalid input | Check field names, required fields, data types |

### Rate Limit Monitoring
```javascript
// GraphQL — check cost in response
const { data, extensions } = await response.json();
console.log("Query cost:", extensions?.cost);
// {
//   requestedQueryCost: 52,
//   actualQueryCost: 12,
//   throttleStatus: {
//     maximumAvailable: 1000,
//     currentlyAvailable: 988,
//     restoreRate: 50
//   }
// }

// REST — check header
const remaining = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
// "32/40" → 32 of 40 calls used

// Implement backoff
async function shopifyGraphQL(admin, query, variables, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await admin.graphql(query, { variables });
    const result = await response.json();

    if (result.errors?.some(e => e.extensions?.code === 'THROTTLED')) {
      const waitMs = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
      console.warn(`Rate limited, retrying in ${waitMs}ms...`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    return result;
  }
  throw new Error("Max retries exceeded for GraphQL query");
}
```

### Data Sync Verification
```javascript
// Reconciliation pattern — run periodically
async function reconcileProducts(shop, admin) {
  const localProducts = await db.product.findMany({ where: { shop } });
  const shopifyProducts = await fetchAllProducts(admin);

  const missing = shopifyProducts.filter(
    sp => !localProducts.find(lp => lp.shopifyId === sp.id)
  );
  const stale = localProducts.filter(
    lp => !shopifyProducts.find(sp => sp.id === lp.shopifyId)
  );

  if (missing.length) console.warn(`${missing.length} products missing locally`);
  if (stale.length) console.warn(`${stale.length} stale local records`);

  return { missing, stale };
}
```

### MANDATORY Checks
- [ ] All GraphQL responses check for `errors` AND `userErrors`
- [ ] Rate limit handling with exponential backoff
- [ ] Pagination implemented for all list queries (never `first: 999`)
- [ ] Only needed fields requested (no `SELECT *` equivalent)
- [ ] GID format correct (`gid://shopify/Product/123`)
- [ ] API version is 2024-10 or newer (2025-10 preferred)
- [ ] NEW PUBLIC APPS: GraphQL Admin API only (REST banned since April 2025)
- [ ] Data synced accurately across all connected platforms

---

## 3. WEBHOOK DEBUGGING

### Common Webhook Failures

| Problem | Cause | Fix |
|---------|-------|-----|
| Webhooks not firing | Not registered | Check `shopify.app.toml` subscriptions + `shopify.server.js` |
| 401 on webhook delivery | HMAC verification failing | Verify using raw request body + `SHOPIFY_API_SECRET` |
| Duplicate processing | No idempotency | Check if webhook ID/event already processed before acting |
| Timeout errors | Slow processing | Return 200 immediately, process async via queue |
| Missing events | Network issues | Implement reconciliation cron as backup |
| Data out of sync | Lost webhooks (50% of businesses experience monthly) | Periodic polling as safety net |

### HMAC Verification Pattern
```javascript
import crypto from "crypto";

function verifyWebhookHMAC(rawBody, hmacHeader, secret) {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hmacHeader)
  );
}
```

### Webhook Response Pattern
```javascript
// CORRECT — respond immediately, process async
export async function action({ request }) {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // Queue for async processing (don't block response)
  await queue.add("process-webhook", { topic, shop, payload });

  return new Response("OK", { status: 200 });  // Must respond < 300ms
}
```

### Idempotency Pattern
```javascript
async function processWebhook(topic, payload, shop) {
  const webhookId = `${topic}-${payload.id}-${payload.updated_at}`;

  // Check if already processed
  const existing = await db.processedWebhook.findUnique({
    where: { webhookId }
  });
  if (existing) {
    console.log(`Webhook ${webhookId} already processed, skipping`);
    return;
  }

  // Process
  await handleWebhookPayload(topic, payload, shop);

  // Mark as processed
  await db.processedWebhook.create({
    data: { webhookId, processedAt: new Date() }
  });
}
```

### MANDATORY GDPR Webhooks (Auto-Reject Without These)
```
CUSTOMERS_DATA_REQUEST  → Return all stored customer data
CUSTOMERS_REDACT        → Delete all customer personal data
SHOP_REDACT             → Delete all shop data after uninstall (48h grace)
```

```javascript
case "CUSTOMERS_DATA_REQUEST":
  const customerData = await db.customer.findMany({
    where: { shop, shopifyCustomerId: String(payload.customer.id) }
  });
  // Log or email data to merchant — you have 30 days to respond
  console.log(`Data request for customer ${payload.customer.id}:`, customerData);
  break;

case "CUSTOMERS_REDACT":
  await db.customer.deleteMany({
    where: { shop, shopifyCustomerId: String(payload.customer.id) }
  });
  console.log(`Customer ${payload.customer.id} data redacted for ${shop}`);
  break;

case "SHOP_REDACT":
  await db.session.deleteMany({ where: { shop } });
  await db.product.deleteMany({ where: { shop } });
  await db.customer.deleteMany({ where: { shop } });
  console.log(`All data for ${shop} redacted`);
  break;
```

### MANDATORY Checks
- [ ] All required webhooks registered in `shopify.app.toml` AND `shopify.server.js`
- [ ] 3 GDPR webhooks implemented (CUSTOMERS_DATA_REQUEST, CUSTOMERS_REDACT, SHOP_REDACT)
- [ ] APP_UNINSTALLED webhook cleans up session data
- [ ] HMAC signature verified on all incoming webhooks
- [ ] Idempotent handlers (duplicates processed safely)
- [ ] Response returned within 300ms (heavy work queued async)
- [ ] Reconciliation job runs periodically as backup
- [ ] Failed webhooks logged and retried

---

## 4. EXTENSION DEBUGGING

### Checkout UI Extensions
- [ ] Bundle size under **64KB** (hard limit — Preact, not React)
- [ ] No self-promotion or advertisements
- [ ] No countdown timers in checkout
- [ ] Product info matches merchant's store exactly (name, image, price)
- [ ] No duplicate data collection (don't ask for info checkout already captures)
- [ ] No payment information collection in UI extension
- [ ] Chat UI components used ONLY for customer service
- [ ] Tested in checkout sandbox
- [ ] Merchant has full control over promotional content

### Theme App Extensions
- [ ] Widget displays correctly in Theme Editor AND live storefront
- [ ] Uses theme app extensions ONLY (no direct theme code modification)
- [ ] Liquid schema settings working correctly
- [ ] Responsive across devices
- [ ] No broken JS when fetching from app proxy
- [ ] Detailed onboarding instructions included with deep links

### Admin Extensions
- [ ] Feature-complete with novel functionality
- [ ] No promotions or advertisements
- [ ] No review requests
- [ ] Modal doesn't launch without merchant interaction
- [ ] Uses latest App Bridge version

### Extension Bundle Size Check
```bash
# Check extension build size
cd extensions/my-extension
npm run build
du -sh dist/  # Must be < 64KB for checkout extensions

# If too large:
# 1. Switch from React to Preact
# 2. Remove unused imports
# 3. Use Shopify's built-in components instead of custom ones
# 4. Tree-shake aggressively
```

---

## 5. BILLING DEBUGGING

### MANDATORY Rules (Auto-Reject Violations)
- [ ] Uses Shopify Billing API exclusively (NO Stripe, PayPal, or external billing)
- [ ] Merchants can upgrade/downgrade WITHOUT contacting support
- [ ] Handles declined charges gracefully
- [ ] Handles reinstall billing re-approval correctly
- [ ] All pricing options listed (trial duration, charge details)
- [ ] No pricing information in images or app icon
- [ ] Pricing info only in designated Pricing details section

### Common Billing Bugs
```javascript
// BUG: Not checking if subscription already exists
// FIX: Check current subscription before creating new one
export async function loader({ request }) {
  const { admin, billing } = await authenticate.admin(request);

  const currentPlan = await billing.check({
    plans: ["Pro Plan"],
    isTest: process.env.NODE_ENV !== "production",
  });

  if (currentPlan.appSubscriptions.length > 0) {
    return json({ hasActivePlan: true });
  }

  return json({ hasActivePlan: false });
}
```

---

## 6. UI & UX QA CHECKLIST

### Polaris Compliance
- [ ] Uses Polaris components (Page, Layout, Card, etc.) — NOT custom HTML
- [ ] Embedded app UI feels native to Shopify Admin
- [ ] Latest App Bridge version (`app-bridge.js` script before other scripts)
- [ ] No UI bugs, display issues, or error pages
- [ ] No broken elements or confusing layouts
- [ ] All features accessible and functional

### Error States
- [ ] Empty states handled (no data yet, no products, etc.)
- [ ] Loading states shown during API calls
- [ ] Error messages are helpful and actionable
- [ ] Network failure handled gracefully
- [ ] Form validation with clear error messages

### Responsive Design
- [ ] Works on desktop, tablet, mobile
- [ ] No horizontal scrolling
- [ ] Touch targets adequate on mobile (44px minimum)
- [ ] Text readable on small screens

### Onboarding
- [ ] Clear setup instructions after install
- [ ] Deep links to relevant Shopify admin sections
- [ ] If external account required: provide test credentials for reviewers

---

## 7. PERFORMANCE DEBUGGING

### Key Thresholds
| Metric | Target | Rejection Risk |
|--------|--------|---------------|
| JS bundle added to storefront | < 100KB | Average app adds 400KB — be well under |
| Page load impact | < 500ms | Average app adds 1.2s — be well under |
| API response time | < 200ms | 70% of perf issues from bad queries |
| Webhook response | < 300ms | Timeout = missed events |
| Storefront load time | < 2s total | Shopify reviews this |

### Diagnostic Steps
```bash
# Check bundle sizes
npm run build && du -sh .next/ dist/

# Analyze with Lighthouse
npx lighthouse https://test-store.myshopify.com --view

# Check for memory leaks in extension
# Look for: event listeners not cleaned up, intervals not cleared
```

### Common Performance Bugs
- [ ] No unnecessary API calls on every page load
- [ ] GraphQL queries paginated and field-limited
- [ ] Images use Shopify CDN (`image_url` + `image_tag`)
- [ ] Code splitting / lazy loading implemented
- [ ] No synchronous IPC or API calls
- [ ] CSS/JS minified in production
- [ ] No memory leaks (listeners, intervals cleaned up)

---

## 8. SECURITY AUDIT

### MANDATORY (Auto-Reject)
- [ ] Valid TLS/SSL certificate on all endpoints (HTTPS with padlock)
- [ ] Security headers set (CSP, X-Frame-Options for clickjacking protection)
- [ ] Session tokens for embedded apps (NO third-party cookies)
- [ ] HMAC verification on all webhooks (use `crypto.timingSafeEqual`)
- [ ] API credentials NEVER in client-side code or theme files
- [ ] Access tokens encrypted at rest in database
- [ ] Input validation on all endpoints (allowlist, not denylist)
- [ ] Parameterized queries (no SQL injection)
- [ ] Rate limiting on all public endpoints
- [ ] Dependencies up to date (no known CVEs)

### Security Header Check
```bash
# Test security headers
curl -I https://your-app.com | grep -i -E "(content-security|x-frame|strict-transport|x-content-type)"

# Expected:
# Content-Security-Policy: frame-ancestors https://*.myshopify.com https://admin.shopify.com
# X-Frame-Options: ALLOW-FROM https://*.myshopify.com
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
```

### CSP for Embedded Apps
```javascript
// Required for embedded Shopify apps
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  );
  next();
});
```

---

## 9. APP STORE LISTING QA

### Name Rules
- [ ] "Shopify" NOT in app name (e.g., "Shopify SEO Tool" = REJECTED)
- [ ] "for Shopify" at end is OK (e.g., "SEO Tool for Shopify")
- [ ] Name matches between Partner Dashboard and submission form
- [ ] App icon identical in Dashboard and listing

### Description Rules
- [ ] No "first", "best", "only", "#1" claims (unsubstantiated)
- [ ] No statistics or data claims without proof
- [ ] No fake reviews or testimonials in listing or images
- [ ] No pricing information in images or icon
- [ ] Lists ONLY languages where UI is fully translated
- [ ] Indicates if Online Store sales channel is required
- [ ] Specifies geographic restrictions or API permission requirements
- [ ] Tags accurately reflect primary function (no keyword stuffing)
- [ ] Subtitle concisely explains functionality and value

### Screenshots & Media
- [ ] Show actual app UI and features
- [ ] No desktop backgrounds or browser chrome in screenshots
- [ ] Each image unique (no duplicates or near-identical shots)
- [ ] No statistics, pricing, reviews, or testimonials in images
- [ ] Demo screencast included (English or English subtitles)
- [ ] Screencast shows onboarding and core features

### Review Submission
- [ ] Test credentials included in testing instructions
- [ ] Credentials valid and grant full feature access
- [ ] Emergency developer contact added to Partner Dashboard
- [ ] If external account required: pre-configured test account provided (don't make reviewer sign up)

---

## 10. FINAL QA CHECKLIST (Before Submission)

### The Incognito Test
```
1. Open browser incognito mode
2. Open browser DevTools console
3. Install app on development store
4. Complete full OAuth flow
5. Navigate every screen and feature
6. Submit every form
7. Trigger every webhook scenario
8. Uninstall and reinstall
9. Check console — ZERO errors allowed
10. Check network tab — no failed requests
```

### Edge Cases to Test
- [ ] Store with 0 products (empty state)
- [ ] Store with 10,000+ products (pagination)
- [ ] Multiple browser tabs open simultaneously
- [ ] Slow network (Chrome DevTools → Network → Slow 3G)
- [ ] Interrupted API calls (abort/timeout)
- [ ] Duplicate webhook delivery
- [ ] Expired session token during active use
- [ ] Missing/revoked permissions
- [ ] Multiple currency stores
- [ ] Multiple language stores
- [ ] App installed on Shopify Plus store vs regular store
- [ ] Mid-process cancellation (close browser during checkout)

### Mandatory Requirements Summary

**Auto-Reject if Missing:**
```
❌ Third-party cookies in embedded app (use session tokens)
❌ Missing GDPR webhooks (all 3 mandatory)
❌ Off-platform billing (must use Shopify Billing API)
❌ REST Admin API for new public apps (GraphQL only since April 2025)
❌ Missing security headers (clickjacking protection)
❌ Console errors visible during review
❌ UI bugs or error pages preventing review completion
❌ "Shopify" in app name
❌ Unsubstantiated claims in listing
❌ Missing test credentials for reviewer
❌ Theme code changes (must use theme app extensions)
❌ --force flag in deployment (use --allow-updates/--allow-deletes)
```

**High Rejection Risk:**
```
⚠️ Over-requesting access scopes
⚠️ Poor mobile experience
⚠️ Confusing onboarding / no setup instructions
⚠️ No error handling on API calls
⚠️ Slow performance / large bundle size
⚠️ App features don't match listing description
⚠️ Missing loading states
⚠️ No empty states for zero-data scenarios
⚠️ Duplicate or near-identical screenshots
```

---

## DEBUGGING COMMAND REFERENCE

```bash
# Check webhook registrations
shopify app dev --verbose

# Test function locally
shopify app function run --input sample_input.json

# Validate TOML config
shopify app config validate

# Check extension build
cd extensions/my-ext && npm run build

# Test in dev store
shopify app dev --store my-dev-store

# Check API version compatibility
shopify app versions list

# Inspect Prisma database
npx prisma studio

# Check SSL certificate
openssl s_client -connect your-app.com:443 -servername your-app.com

# Test HMAC verification
echo -n "test-body" | openssl dgst -sha256 -hmac "your-secret" -binary | base64
```

---

## WHEN SHOPIFY REJECTS YOUR APP

### Step-by-Step Recovery
1. **Read the rejection email carefully** — Shopify lists specific issues
2. **Cross-reference this checklist** — find the matching section
3. **Fix ALL issues** (not just the ones mentioned — they may have stopped reviewing early)
4. **Test in incognito** with DevTools console open
5. **Re-submit with detailed notes** explaining what was fixed
6. **Include updated screencast** showing the fixes

### Common Rejection → Fix Map

| Rejection Reason | Section | Priority Fix |
|-----------------|---------|-------------|
| "Security headers missing" | §8 Security | Add CSP + X-Frame-Options |
| "Third-party cookies detected" | §1 OAuth | Switch to session tokens |
| "GDPR webhooks not implemented" | §3 Webhooks | Add all 3 GDPR handlers |
| "UI bugs found" | §6 UI/UX | Fix all Polaris violations |
| "Performance concerns" | §7 Performance | Reduce bundle, optimize queries |
| "Billing not using Shopify API" | §5 Billing | Migrate to Billing API |
| "App name contains Shopify" | §9 Listing | Rename app |
| "Missing test credentials" | §9 Listing | Add working test account |
| "Console errors visible" | §10 Final QA | Fix all JS errors |
| "Extension not functional" | §4 Extensions | Complete extension features |

---

## REVIEW TIMELINE

- Initial review: **4-7 business days**
- Re-review after rejection: **2-5 business days**
- Complex apps (checkout, payments): **7-14 business days**
- Tip: Submit early, fix fast, re-submit with detailed notes
