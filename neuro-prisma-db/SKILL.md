---
name: neuro-prisma-db
description: Prisma & PostgreSQL expert - schema design for multi-tenant SaaS, N+1 prevention, query optimization, zero-downtime migrations, indexing strategies, Client Extensions, connection pooling, seeding, transactions, and cursor-based pagination for any project.
trigger: auto
globs:
  - "**/prisma/schema.prisma"
  - "**/prisma/migrations/**"
  - "**/prisma/seed.*"
  - "**/lib/prisma.*"
  - "**/lib/db.*"
  - "**/drizzle/**"
  - "**/db/**"
  - "**/*.sql"
---

# Prisma & PostgreSQL — Universal Database Expert Skill

You are a Prisma and PostgreSQL expert. You design production-grade database schemas, write optimized queries, create safe migrations, and implement advanced patterns for multi-tenant SaaS applications. You work with ANY project using Prisma and PostgreSQL.

**YOUR #1 RULE**: Always read the existing schema before suggesting changes. Never create duplicate models or conflicting relations. Extend the existing schema, don't redesign it.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

```
STEP 1: READ THE PROJECT
  ├── Read prisma/schema.prisma (ALL models, relations, indexes, enums)
  ├── Read prisma/seed.ts (existing seed data and patterns)
  ├── Read prisma/migrations/ (migration history)
  ├── Read lib/prisma.ts (singleton, extensions, middleware)
  ├── Read package.json (prisma version, @prisma/client version)
  ├── Read .env or .env.example (DATABASE_URL format, pooling config)
  └── Read any db/ or lib/db.* files (helpers, utilities)

STEP 2: IDENTIFY PATTERNS
  ├── ID strategy? (cuid, uuid, autoincrement)
  ├── Multi-tenant? (storeId/tenantId column, RLS, separate schemas)
  ├── Soft-delete? (deletedAt field)
  ├── Audit fields? (createdAt, updatedAt, createdBy, updatedBy)
  ├── Naming? (@map/@@ map for table/column names)
  ├── Relations? (explicit join tables vs implicit many-to-many)
  ├── Enums? (Prisma enum vs string field)
  └── Extensions? (Client Extensions, middleware)

STEP 3: FOLLOW EXISTING PATTERNS
  ├── Use same ID strategy
  ├── Use same field naming conventions
  ├── Use same relation patterns
  ├── Add same audit fields to new models
  ├── Add same indexes pattern (tenantId first)
  └── Match existing code style exactly
```

---

## 1. SCHEMA DESIGN PRINCIPLES

### Model Template (Multi-Tenant SaaS)

```prisma
// Every tenant-scoped model should follow this template:
model ExampleModel {
  id          String    @id @default(cuid())
  storeId     String
  store       Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)

  // Business fields
  name        String
  slug        String
  description String?
  status      String    @default("active")
  metadata    Json?

  // Audit fields
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft-delete

  // Indexes
  @@unique([storeId, slug])           // Natural key per tenant
  @@index([storeId, status])          // Common query pattern
  @@index([storeId, createdAt])       // List with sorting
}
```

### ID Strategy

```prisma
// RECOMMENDED: CUID (Collision-resistant, sortable, URL-safe)
id String @id @default(cuid())

// ALTERNATIVE: UUID (Standard, wider ecosystem support)
id String @id @default(uuid())

// NEVER in multi-tenant: Auto-increment (predictable, leaks count)
// id Int @id @default(autoincrement()) ← AVOID
```

### Enum vs String

```prisma
// APPROACH 1: Prisma enum (compile-time safety, but rigid — requires migration to change)
enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}
model Post {
  status PostStatus @default(DRAFT)
}

// APPROACH 2: String + Zod validation (flexible — no migration to add values)
model Post {
  status String @default("draft") // validated at app level with Zod
}

// RECOMMENDATION: Use String for values that may grow (status, type, category)
// Use Enum for truly fixed values (role: USER/ADMIN/SUPER_ADMIN)
```

### Self-Referencing Relations

```prisma
// Categories with parent-child hierarchy
model Category {
  id        String     @id @default(cuid())
  storeId   String
  store     Store      @relation(fields: [storeId], references: [id], onDelete: Cascade)
  name      String
  slug      String
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  order     Int        @default(0)

  @@unique([storeId, slug])
  @@index([storeId, parentId])
}
```

### Many-to-Many with Explicit Join Tables

```prisma
// PREFER explicit join tables over implicit many-to-many
// Allows extra fields (position, metadata) on the relation

model Product {
  id         String                    @id @default(cuid())
  storeId    String
  title      String
  categories ProductCategoryRelation[]
  collections CollectionProduct[]
}

model ProductCategoryRelation {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  position   Int      @default(0) // Extra field: ordering

  @@unique([productId, categoryId])
  @@index([categoryId])
}
```

### JSON Fields — When to Use

```prisma
// USE Json for:
//   ├── Flexible/dynamic data (form submissions, custom fields)
//   ├── Content blocks (rich text editor output)
//   ├── Settings/config (key-value pairs)
//   └── External API data (raw payloads)

// DON'T USE Json for:
//   ├── Data you need to filter/sort by (use proper columns)
//   ├── Relations (use foreign keys)
//   ├── Status/type fields (use String or Enum)
//   └── Anything frequently queried (no index support without GIN)

model Post {
  content   Json?    // ✓ Block editor content — queried as whole, not filtered
  metadata  Json?    // ✓ SEO metadata, custom fields — flexible structure
  // tags   Json?    // ✗ Better as a relation — you'll want to filter by tag
}
```

---

## 2. N+1 DETECTION & PREVENTION

### The Problem

```typescript
// BAD: N+1 queries — 1 query for users + N queries for posts
const users = await prisma.user.findMany(); // Query 1
for (const user of users) {
  const posts = await prisma.post.findMany({  // Query 2, 3, 4... N+1
    where: { authorId: user.id },
  });
  user.posts = posts;
}
// If 100 users → 101 queries!
```

### The Fix: include (Eager Loading)

```typescript
// GOOD: 1 query with JOIN
const users = await prisma.user.findMany({
  include: {
    posts: true, // Prisma generates a JOIN or IN query
  },
});
// Always 2 queries max (1 for users, 1 for posts with IN clause)
```

### select vs include

```typescript
// include: fetches ALL fields + adds relations
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: true }, // all user fields + all post fields
});

// select: fetches ONLY specified fields (more efficient)
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
        status: true,
      },
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
// Returns ONLY { id, name, email, posts: [{ id, title, status }] }
// Smaller payload, faster query
```

### Query Logging to Detect N+1

```typescript
// lib/prisma.ts — Enable in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
      ]
    : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      console.warn(`🐌 SLOW QUERY (${e.duration}ms): ${e.query}`);
    }
  });
}
```

### Complex Aggregations with $queryRaw

```typescript
// When Prisma's query API isn't enough
const stats = await prisma.$queryRaw<{ status: string; count: bigint }[]>`
  SELECT status, COUNT(*)::int as count
  FROM "Post"
  WHERE "storeId" = ${storeId}
    AND "deletedAt" IS NULL
  GROUP BY status
  ORDER BY count DESC
`;

// With typed result
interface ProductStats {
  categoryName: string;
  productCount: number;
  avgPrice: number;
}

const categoryStats = await prisma.$queryRaw<ProductStats[]>`
  SELECT
    c.name as "categoryName",
    COUNT(pcr."productId")::int as "productCount",
    COALESCE(AVG(p.price), 0)::float as "avgPrice"
  FROM "Category" c
  LEFT JOIN "ProductCategoryRelation" pcr ON pcr."categoryId" = c.id
  LEFT JOIN "Product" p ON p.id = pcr."productId"
  WHERE c."storeId" = ${storeId}
  GROUP BY c.id, c.name
  ORDER BY "productCount" DESC
`;
```

---

## 3. MIGRATION STRATEGIES

### Zero-Downtime: Expand-Contract Pattern

```
SAFE way to rename a column:

Step 1: EXPAND — Add new column
  prisma migrate dev --name add_display_name
  → ALTER TABLE "User" ADD COLUMN "displayName" TEXT;

Step 2: BACKFILL — Copy data
  UPDATE "User" SET "displayName" = "name" WHERE "displayName" IS NULL;

Step 3: SWITCH — Deploy code using new column
  → App reads from displayName, writes to both

Step 4: CONTRACT — Remove old column (later migration)
  prisma migrate dev --name remove_name_column
  → ALTER TABLE "User" DROP COLUMN "name";
```

### Dangerous Operations

```
✗ NEVER: Rename column directly
  → Data loss if app doesn't know new name

✗ NEVER: Add NOT NULL without default
  → ALTER TABLE fails if existing rows have NULL

✗ NEVER: CREATE INDEX without CONCURRENTLY
  → Locks entire table during index build

✗ NEVER: DROP COLUMN on deployed code
  → App crashes if it still references the column

✓ SAFE: Add nullable column
✓ SAFE: Add column with default value
✓ SAFE: Add new table
✓ SAFE: Add index CONCURRENTLY
✓ SAFE: Add new enum value (at end)
```

### Custom SQL in Migrations

```sql
-- After generating migration with prisma migrate dev,
-- edit the SQL file to add CONCURRENTLY:

-- prisma/migrations/20260410_add_search_index/migration.sql
-- Instead of: CREATE INDEX "Post_title_idx" ON "Post"("title");
-- Use:
CREATE INDEX CONCURRENTLY "Post_title_idx" ON "Post"("title");

-- Note: CONCURRENTLY can't run inside a transaction
-- Add to top of migration file:
-- SET statement_timeout = '0';
```

### Production Migration Commands

```bash
# Development: generate + apply migration
npx prisma migrate dev --name add_orders_table

# Production: apply pending migrations (no generation)
npx prisma migrate deploy

# Preview SQL without applying
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script

# Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

---

## 4. INDEXING GUIDE

### PostgreSQL Index Types in Prisma

```prisma
model Post {
  id          String   @id @default(cuid())
  storeId     String
  title       String
  slug        String
  status      String
  content     Json?
  tags        String[]
  publishedAt DateTime?
  createdAt   DateTime @default(now())

  // B-tree (default) — equality, range, ORDER BY
  @@index([storeId])
  @@index([storeId, status])
  @@index([storeId, createdAt])
  @@index([storeId, publishedAt(sort: Desc)])

  // Unique (also creates B-tree index)
  @@unique([storeId, slug])

  // GIN — full-text search, JSONB, arrays
  // Must be added via raw SQL migration:
  // CREATE INDEX "Post_tags_idx" ON "Post" USING GIN ("tags");
  // CREATE INDEX "Post_content_idx" ON "Post" USING GIN ("content" jsonb_path_ops);

  // Full-text search on title (via raw SQL):
  // CREATE INDEX "Post_title_search_idx" ON "Post" USING GIN (to_tsvector('english', "title"));
}
```

### Composite Index Column Order Rules

```
RULE: Equality columns FIRST, range/sort columns LAST

Example query:
  WHERE storeId = 'abc' AND status = 'published' ORDER BY createdAt DESC

Best index:
  @@index([storeId, status, createdAt])
  │         │        │         └── Range/sort (last)
  │         │        └── Equality (second)
  │         └── Equality (first — most selective for multi-tenant)

RULE: Always lead with tenantId in multi-tenant apps
  @@index([storeId, ...])  ← storeId ALWAYS first
```

### Partial Indexes (via raw SQL)

```sql
-- Index only active/published records
-- Much smaller index, faster queries for the common case
CREATE INDEX "Post_published_idx"
  ON "Post" ("storeId", "publishedAt" DESC)
  WHERE "status" = 'published' AND "deletedAt" IS NULL;

-- Index only non-deleted records
CREATE INDEX "Product_active_idx"
  ON "Product" ("storeId", "createdAt" DESC)
  WHERE "deletedAt" IS NULL;
```

### Checking Index Usage

```sql
-- Find unused indexes (candidates for removal)
SELECT
  schemaname || '.' || relname AS table,
  indexrelname AS index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS size,
  idx_scan AS times_used
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE idx_scan < 50
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Analyze a slow query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM "Post"
WHERE "storeId" = 'abc123'
  AND "status" = 'published'
ORDER BY "createdAt" DESC
LIMIT 20;

-- Look for Seq Scan (bad) vs Index Scan (good)
```

---

## 5. CLIENT EXTENSIONS

### Multi-Tenant Isolation Extension

```typescript
// lib/prisma-extensions.ts
import { Prisma, PrismaClient } from '@prisma/client';

const TENANT_MODELS = new Set([
  'Post', 'Product', 'MediaFile', 'Collection',
  'Category', 'Theme', 'Form', 'GiftCard',
]);

export function withTenantIsolation(prisma: PrismaClient, storeId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            (args.data as any).storeId = storeId;
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, storeId } as any;
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          // Soft delete
          if (TENANT_MODELS.has(model)) {
            return (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
      },
    },
  });
}
```

### Computed Fields Extension

```typescript
export const withComputedFields = prisma.$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`.trim();
        },
      },
    },
    product: {
      displayPrice: {
        needs: { price: true, comparePrice: true },
        compute(product) {
          const price = product.price / 100; // cents to dollars
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price);
        },
      },
      isOnSale: {
        needs: { price: true, comparePrice: true },
        compute(product) {
          return product.comparePrice !== null && product.comparePrice > product.price;
        },
      },
    },
  },
});
```

### Slow Query Logger Extension

```typescript
export const withQueryLogging = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const duration = performance.now() - start;

        if (duration > 100) {
          console.warn(
            `🐌 Slow query: ${model}.${operation} took ${duration.toFixed(1)}ms`,
            JSON.stringify(args, null, 2).slice(0, 200)
          );
        }

        return result;
      },
    },
  },
});
```

### Chaining Extensions

```typescript
// Combine multiple extensions
export function createTenantPrisma(storeId: string) {
  return prisma
    .$extends(withComputedFields)
    .$extends(withQueryLogging)
    .$extends(withTenantIsolation(prisma, storeId));
}

// Usage in API routes
const db = createTenantPrisma(storeId);
const products = await db.product.findMany(); // auto-filtered, computed fields, logged
```

---

## 6. CONNECTION POOLING

### Singleton Pattern (Critical for Next.js)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Serverless Configuration

```env
# .env

# For serverless (Vercel, AWS Lambda):
# Use a connection pooler like PgBouncer or Supabase pooler
DATABASE_URL="postgresql://user:pass@pooler-host:6543/mydb?pgbouncer=true&connection_limit=1"

# Direct connection for migrations only
DIRECT_DATABASE_URL="postgresql://user:pass@db-host:5432/mydb"
```

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // Pooled (for app)
  directUrl = env("DIRECT_DATABASE_URL") // Direct (for migrations)
}
```

---

## 7. SEEDING BEST PRACTICES

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Admin user (upsert = idempotent)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: await hash('password123', 10),
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  // 2. Demo store
  const store = await prisma.store.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      description: 'A demo store for development',
    },
  });
  console.log(`  ✓ Demo store: ${store.slug}`);

  // 3. Store user association
  await prisma.storeUser.upsert({
    where: { userId_storeId: { userId: admin.id, storeId: store.id } },
    update: {},
    create: {
      userId: admin.id,
      storeId: store.id,
      role: 'OWNER',
    },
  });

  // 4. Sample posts (bulk)
  const samplePosts = [
    { title: 'Getting Started', slug: 'getting-started', status: 'published' },
    { title: 'Advanced Guide', slug: 'advanced-guide', status: 'draft' },
    { title: 'API Reference', slug: 'api-reference', status: 'published' },
  ];

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { storeId_slug: { storeId: store.id, slug: post.slug } },
      update: {},
      create: {
        ...post,
        storeId: store.id,
        authorId: admin.id,
        type: 'post',
      },
    });
  }
  console.log(`  ✓ Sample posts: ${samplePosts.length}`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

```json
// package.json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

---

## 8. TRANSACTION PATTERNS

```typescript
// Sequential transaction (all-or-nothing)
const [post, category] = await prisma.$transaction([
  prisma.post.create({ data: postData }),
  prisma.category.create({ data: categoryData }),
]);

// Interactive transaction (logic between queries)
const result = await prisma.$transaction(async (tx) => {
  // 1. Check stock
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product || product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  // 2. Decrement stock
  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  // 3. Create order
  const order = await tx.order.create({
    data: { productId, quantity, total: product.price * quantity },
  });

  // 4. Log adjustment
  await tx.inventoryAdjustment.create({
    data: {
      productId,
      quantity: -quantity,
      reason: 'SALE',
      orderId: order.id,
    },
  });

  return order;
}, {
  timeout: 10000,            // 10s timeout
  isolationLevel: 'Serializable', // Strictest isolation
});
```

---

## 9. PAGINATION

### Cursor-Based (Recommended)

```typescript
// API route with cursor pagination
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));

  const items = await prisma.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    orderBy: { createdAt: 'desc' },
    where: { storeId, deletedAt: null },
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return Response.json({
    data,
    meta: {
      hasMore,
      nextCursor,
    },
  });
}

// Client usage (SWR infinite)
// GET /api/posts?limit=20
// GET /api/posts?limit=20&cursor=clx123abc
// GET /api/posts?limit=20&cursor=clx456def
```

### Offset-Based (Simple, for small datasets)

```typescript
const page = parseInt(params.page || '1');
const limit = parseInt(params.limit || '20');

const [items, total] = await Promise.all([
  prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.post.count({ where: { storeId } }),
]);

return Response.json({
  data: items,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
```

---

## 10. COMMON MISTAKES

```
NEVER DO:
  ✗ Create PrismaClient inside request handlers (connection leak)
  ✗ Use skip-based pagination for large datasets (degrades at scale)
  ✗ Loop with individual queries instead of include/select
  ✗ Forget indexes on foreign keys (every FK needs an index)
  ✗ Use autoincrement IDs in multi-tenant (predictable, leaks count)
  ✗ Run prisma db push in production (use migrate deploy)
  ✗ Add NOT NULL column without default on existing table
  ✗ Rename columns directly (use expand-contract)
  ✗ Create indexes without CONCURRENTLY on large tables
  ✗ Store frequently-queried data in Json fields (no index)
  ✗ Skip deletedAt filter in queries (leaks "deleted" data)
  ✗ Use implicit many-to-many when you need extra fields on relation
  ✗ Forget connection_limit=1 in serverless environments
  ✗ Run heavy queries without timeout in transactions
```
