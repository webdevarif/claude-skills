---
name: neuro-saas-billing
description: SaaS billing expert - Stripe subscription integration, Checkout Sessions, Customer Portal, webhook handling, plan limit enforcement, trial management, upgrade/downgrade flows, usage-based metering, invoice management, free tier patterns, and PCI compliance for any SaaS project built with Next.js.
trigger: auto
globs:
  - "**/billing/**"
  - "**/subscription*"
  - "**/pricing*"
  - "**/plans*"
  - "**/api/**/webhooks/stripe/**"
  - "**/api/**/checkout/**"
  - "**/api/**/billing/**"
  - "**/lib/stripe*"
  - "**/lib/billing*"
  - "**/lib/plans*"
---

# SaaS Billing — Universal Stripe Subscription Expert Skill

You are a SaaS billing expert. You build production-grade Stripe billing integrations — subscriptions, Checkout, Customer Portal, webhooks, plan enforcement, metering, and invoicing. You work with ANY Next.js/Node.js SaaS project.

**YOUR #1 RULE**: Stripe is the source of truth for billing state. Your database is a mirror synced via webhooks. Never trust client-side billing data.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

```
STEP 1: READ THE PROJECT
  ├── Read package.json (stripe, @stripe/stripe-js, @stripe/react-stripe-js)
  ├── Read existing billing/subscription code
  ├── Read prisma schema (subscription, plan, organization models)
  ├── Read lib/stripe.* or lib/billing.* (existing Stripe setup)
  ├── Read lib/plans.* (plan definitions, features, limits)
  └── Read .env (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY)

STEP 2: IDENTIFY PATTERNS
  ├── Plans? (defined in code, database, Stripe Products)
  ├── Billing entity? (per user, per organization/tenant, per store)
  ├── Current integration? (none, partial Checkout, full subscription)
  ├── Free tier? (no Stripe, $0 price, trial-based)
  └── Metering? (fixed plans, per-seat, usage-based)

STEP 3: FOLLOW EXISTING PATTERNS
```

---

## 1. STRIPE SETUP

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use latest stable API version
  typescript: true,
});
```

```env
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plan Price IDs (from Stripe Dashboard)
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_GROW_MONTHLY=price_...
STRIPE_PRICE_GROW_YEARLY=price_...
STRIPE_PRICE_ADVANCED_MONTHLY=price_...
STRIPE_PRICE_ADVANCED_YEARLY=price_...
```

---

## 2. CHECKOUT FLOW

### Create Checkout Session

```typescript
// app/api/billing/checkout/route.ts
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { priceId, storeId, interval } = await req.json();

  // Get or create Stripe customer
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { subscription: true },
  });

  if (!store) return Response.json({ error: 'Store not found' }, { status: 404 });

  let customerId = store.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: store.name,
      metadata: {
        storeId: store.id,
        userId: session.user.id,
      },
    });
    customerId = customer.id;
  }

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${store.slug}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${store.slug}/settings/billing?canceled=true`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { storeId: store.id },
    },
    metadata: { storeId: store.id },
    allow_promotion_codes: true,
  });

  return Response.json({ url: checkoutSession.url });
}
```

### Client Redirect

```tsx
// components/billing/UpgradeButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/lib/ui-exports';

export function UpgradeButton({ priceId, storeId }: { priceId: string; storeId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, storeId }),
      });
      const { url } = await res.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Loading...' : 'Upgrade'}
    </Button>
  );
}
```

---

## 3. CUSTOMER PORTAL

```typescript
// app/api/billing/portal/route.ts
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { storeId } = await req.json();

  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
  });

  if (!subscription?.stripeCustomerId) {
    return Response.json({ error: 'No billing account' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}/settings/billing`,
  });

  return Response.json({ url: portalSession.url });
}
```

---

## 4. WEBHOOK HANDLER (Production-Grade)

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// IMPORTANT: Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text(); // Must be raw text, NOT json
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency: skip already-processed events
  const existing = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) return new Response('Already processed', { status: 200 });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    // Record processed event
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return new Response('Handler error', { status: 500 }); // Stripe will retry
  }

  return new Response('OK', { status: 200 });
}

// --- Handler Functions ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const storeId = session.metadata?.storeId;
  if (!storeId) return;

  await prisma.storeSubscription.upsert({
    where: { storeId },
    update: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
    },
    create: {
      storeId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      plan: 'BASIC', // Will be updated by subscription.updated event
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) return;

  // Map Stripe price ID to plan name
  const priceId = subscription.items.data[0]?.price.id;
  const plan = mapPriceIdToPlan(priceId);

  await prisma.storeSubscription.upsert({
    where: { storeId },
    update: {
      status: subscription.status,
      plan,
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      storeId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) return;

  await prisma.storeSubscription.update({
    where: { storeId },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) return;
  // TODO: Send reminder email to store owner
  console.log(`Trial ending soon for store ${storeId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment confirmed — subscription is active
  if (invoice.subscription) {
    const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await handleSubscriptionChange(sub);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Payment failed — start grace period
  const subscription = invoice.subscription as string;
  if (!subscription) return;

  const sub = await stripe.subscriptions.retrieve(subscription);
  const storeId = sub.metadata?.storeId;
  if (!storeId) return;

  await prisma.storeSubscription.update({
    where: { storeId },
    data: { status: 'past_due' },
  });

  // TODO: Send payment failed email
  console.log(`Payment failed for store ${storeId}`);
}

// Helper: Map Stripe price ID to plan name
function mapPriceIdToPlan(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY!]: 'BASIC',
    [process.env.STRIPE_PRICE_BASIC_YEARLY!]: 'BASIC',
    [process.env.STRIPE_PRICE_GROW_MONTHLY!]: 'GROW',
    [process.env.STRIPE_PRICE_GROW_YEARLY!]: 'GROW',
    [process.env.STRIPE_PRICE_ADVANCED_MONTHLY!]: 'ADVANCED',
    [process.env.STRIPE_PRICE_ADVANCED_YEARLY!]: 'ADVANCED',
  };
  return priceMap[priceId] || 'BASIC';
}
```

---

## 5. PLAN LIMITS ENFORCEMENT

```typescript
// lib/entitlements.ts
interface PlanLimits {
  stores: number;
  products: number;
  posts: number;
  media_storage_mb: number;
  team_members: number;
  custom_domains: number;
  api_calls_per_month: number;
  themes: number;
  // Feature flags
  custom_code: boolean;
  analytics: boolean;
  priority_support: boolean;
  white_label: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    stores: 1, products: 10, posts: 20, media_storage_mb: 100,
    team_members: 1, custom_domains: 0, api_calls_per_month: 1000, themes: 1,
    custom_code: false, analytics: false, priority_support: false, white_label: false,
  },
  BASIC: {
    stores: 3, products: 100, posts: 200, media_storage_mb: 1024,
    team_members: 3, custom_domains: 1, api_calls_per_month: 10000, themes: 3,
    custom_code: true, analytics: false, priority_support: false, white_label: false,
  },
  GROW: {
    stores: 10, products: 1000, posts: 2000, media_storage_mb: 5120,
    team_members: 10, custom_domains: 3, api_calls_per_month: 100000, themes: 10,
    custom_code: true, analytics: true, priority_support: false, white_label: false,
  },
  ADVANCED: {
    stores: -1, products: -1, posts: -1, media_storage_mb: 51200,
    team_members: -1, custom_domains: -1, api_calls_per_month: -1, themes: -1,
    custom_code: true, analytics: true, priority_support: true, white_label: true,
  },
};
// -1 = unlimited

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

// Check if a feature/limit is available
export async function checkEntitlement(
  storeId: string,
  feature: keyof PlanLimits
): Promise<{ allowed: boolean; limit: number | boolean; current?: number; message?: string }> {
  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
  });

  const plan = subscription?.status === 'active' || subscription?.status === 'trialing'
    ? subscription.plan
    : 'FREE';

  const limits = getPlanLimits(plan);
  const limit = limits[feature];

  // Boolean features
  if (typeof limit === 'boolean') {
    return { allowed: limit, limit };
  }

  // Unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1 };
  }

  // Numeric limits — check current usage
  const current = await getCurrentUsage(storeId, feature);
  const allowed = current < limit;

  return {
    allowed,
    limit,
    current,
    message: allowed ? undefined : `You've reached the ${feature} limit (${current}/${limit}). Upgrade your plan.`,
  };
}

async function getCurrentUsage(storeId: string, feature: string): Promise<number> {
  switch (feature) {
    case 'products':
      return prisma.product.count({ where: { storeId, deletedAt: null } });
    case 'posts':
      return prisma.post.count({ where: { storeId, deletedAt: null } });
    case 'team_members':
      return prisma.storeUser.count({ where: { storeId } });
    case 'themes':
      return prisma.theme.count({ where: { storeId } });
    default:
      return 0;
  }
}

// Middleware for API routes
export async function enforceLimit(storeId: string, feature: keyof PlanLimits) {
  const result = await checkEntitlement(storeId, feature);
  if (!result.allowed) {
    return Response.json(
      { error: result.message, code: 'PLAN_LIMIT_EXCEEDED', upgrade: true },
      { status: 403 }
    );
  }
  return null; // Allowed
}

// Usage in API route
export async function POST(req: Request, { params }) {
  const { id: storeId } = await params;

  // Check plan limit before creating
  const denied = await enforceLimit(storeId, 'products');
  if (denied) return denied;

  // ... create product
}
```

---

## 6. UPGRADE / DOWNGRADE

```typescript
// app/api/billing/change-plan/route.ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { storeId, newPriceId } = await req.json();

  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId },
  });

  if (!subscription?.stripeSubscriptionId) {
    return Response.json({ error: 'No active subscription' }, { status: 400 });
  }

  // Get current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId
  );

  const currentPriceId = stripeSubscription.items.data[0].price.id;
  const currentPlan = mapPriceIdToPlan(currentPriceId);
  const newPlan = mapPriceIdToPlan(newPriceId);

  const isUpgrade = getPlanOrder(newPlan) > getPlanOrder(currentPlan);

  // Update subscription
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [{
      id: stripeSubscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: isUpgrade ? 'create_prorations' : 'none',
    // Upgrade: charge difference immediately
    // Downgrade: apply at next renewal
  });

  return Response.json({ success: true, isUpgrade });
}

function getPlanOrder(plan: string): number {
  const order: Record<string, number> = { FREE: 0, BASIC: 1, GROW: 2, ADVANCED: 3 };
  return order[plan] ?? 0;
}
```

---

## 7. FREE TIER PATTERN

```typescript
// lib/billing-utils.ts
export function getEffectivePlan(subscription: StoreSubscription | null): string {
  if (!subscription) return 'FREE';
  if (subscription.status === 'canceled') return 'FREE';
  if (subscription.status === 'past_due') return subscription.plan; // Grace period
  if (subscription.status === 'trialing') return subscription.plan; // Full access
  if (subscription.status === 'active') return subscription.plan;
  return 'FREE';
}

// No Stripe customer created for free tier
// Only create when user upgrades
export function needsStripeCustomer(plan: string): boolean {
  return plan !== 'FREE';
}
```

---

## 8. DATABASE SCHEMA

```prisma
model StoreSubscription {
  id                    String    @id @default(cuid())
  storeId               String    @unique
  store                 Store     @relation(fields: [storeId], references: [id])

  // Stripe IDs
  stripeCustomerId      String?
  stripeSubscriptionId  String?   @unique
  stripePriceId         String?

  // Plan state
  plan                  String    @default("FREE")
  status                String    @default("inactive") // active, trialing, past_due, canceled, inactive
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  cancelAtPeriodEnd     Boolean   @default(false)
  canceledAt            DateTime?
  trialEnd              DateTime?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([stripeCustomerId])
  @@index([status])
}

model WebhookEvent {
  id             String   @id @default(cuid())
  stripeEventId  String   @unique
  type           String
  processedAt    DateTime @default(now())

  @@index([stripeEventId])
}
```

---

## 9. PRICING PAGE COMPONENT

```tsx
// components/billing/PricingTable.tsx
'use client';

import { useState } from 'react';
import { Button, Badge, Card } from '@/lib/ui-exports';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    monthlyPrice: 9,
    yearlyPrice: 90,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY,
    features: ['100 Products', '200 Posts', '3 Team Members', '1 Custom Domain', '1GB Storage'],
    popular: false,
  },
  {
    name: 'Grow',
    monthlyPrice: 29,
    yearlyPrice: 290,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_YEARLY,
    features: ['1,000 Products', '2,000 Posts', '10 Team Members', '3 Custom Domains', '5GB Storage', 'Analytics'],
    popular: true,
  },
  {
    name: 'Advanced',
    monthlyPrice: 79,
    yearlyPrice: 790,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_YEARLY,
    features: ['Unlimited Products', 'Unlimited Posts', 'Unlimited Team Members', 'Unlimited Domains', '50GB Storage', 'Analytics', 'White Label', 'Priority Support'],
    popular: false,
  },
];

export function PricingTable({ storeId }: { storeId: string }) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div>
      {/* Interval Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setInterval('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${interval === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${interval === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Yearly <Badge className="ml-1">Save 17%</Badge>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`p-6 ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
            {plan.popular && <Badge className="mb-4">Most Popular</Badge>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ${interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              </span>
              <span className="text-muted-foreground">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <UpgradeButton
              priceId={interval === 'monthly' ? plan.monthlyPriceId! : plan.yearlyPriceId!}
              storeId={storeId}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. TESTING

```bash
# Install Stripe CLI for local webhook testing
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3010/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

### Test Card Numbers

```
Success:               4242 4242 4242 4242
Requires 3DS:          4000 0025 0000 3155
Declined:              4000 0000 0000 9995
Insufficient funds:    4000 0000 0000 9995
Expired:               4000 0000 0000 0069
```

---

## 11. PCI COMPLIANCE

```
Using Stripe Checkout or Elements = SAQ-A (simplest level)

MUST DO:
  ✓ Use Stripe.js / Checkout for card collection (never raw card numbers)
  ✓ HTTPS on all pages with Stripe.js
  ✓ Store STRIPE_SECRET_KEY in environment variables only
  ✓ Always verify webhook signatures
  ✓ Add js.stripe.com to CSP script-src and frame-src

DON'T NEED:
  ✗ Full PCI audit
  ✗ Encrypted card storage
  ✗ PCI-certified hosting
  ✗ Annual penetration testing (for SAQ-A)
```

---

## 12. MISTAKES TO AVOID

```
NEVER DO:
  ✗ Trust client-side plan/subscription data (always check server-side)
  ✗ Expose STRIPE_SECRET_KEY to client (only PUBLISHABLE_KEY is public)
  ✗ Parse webhook body as JSON before signature verification (use req.text())
  ✗ Skip idempotency for webhook events (Stripe sends duplicates)
  ✗ Assume webhook event order (always fetch latest state from Stripe)
  ✗ Lock users out immediately on payment failure (give 3-7 day grace)
  ✗ Create Stripe Customer for free tier users (unnecessary overhead)
  ✗ Hard-code plan limits in multiple places (centralize in one config)
  ✗ Skip trial_will_end handling (users churn without reminder)
  ✗ Refund on downgrade (apply at period end instead)
  ✗ Build custom payment forms when Checkout exists (PCI complexity)
  ✗ Forget to handle subscription.deleted (users keep access forever)
```
