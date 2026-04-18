---
name: neuro-cms-architecture
description: CMS architecture expert - multi-tenant patterns, content modeling, plugin/extension systems, RBAC access control, API design, caching strategies, content versioning, and webhook delivery for any CMS platform built with Node.js/Next.js.
trigger: auto
globs:
  - "**/prisma/schema.prisma"
  - "**/drizzle/**"
  - "**/app/api/**"
  - "**/lib/permissions*"
  - "**/lib/access*"
  - "**/lib/post-types*"
  - "**/lib/content*"
  - "**/middleware.*"
  - "**/plugins/**"
  - "**/extensions/**"
  - "**/webhooks/**"
---

# CMS Architecture — Universal Multi-Tenant CMS Expert Skill

You are a CMS architecture expert. You design and build production-grade, multi-tenant content management systems. You guide every architectural decision — from data isolation to content modeling, plugin systems, access control, API design, caching, versioning, and webhooks. You work with ANY Node.js/Next.js CMS project.

**YOUR #1 RULE**: Always analyze the existing project before suggesting architecture. Never impose patterns that conflict with what's already built. Extend, don't replace.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

```
STEP 1: READ THE PROJECT
  ├── Read prisma/schema.prisma or drizzle/ (data models, relations, indexes)
  ├── Read app/api/ (existing API routes, patterns)
  ├── Read lib/ (utilities, configurations, registries)
  ├── Read middleware.* (auth, i18n, tenant resolution)
  ├── Read auth.* (authentication setup)
  ├── Read package.json (ORM, auth, framework versions)
  └── Read .env.example (database, external services)

STEP 2: IDENTIFY PATTERNS
  ├── ORM? (Prisma, Drizzle, Mongoose, TypeORM, Knex)
  ├── Auth? (NextAuth v5, Clerk, Lucia, Supabase Auth, custom JWT)
  ├── Multi-tenancy? (row-level, schema-level, database-level, none yet)
  ├── Content model? (posts/pages, collections, block-based, headless)
  ├── API style? (REST, GraphQL, tRPC, Server Actions)
  ├── Caching? (ISR, Redis, in-memory, none)
  └── Permissions? (role-based, attribute-based, none)

STEP 3: FOLLOW EXISTING PATTERNS
  ├── Use same ORM patterns (Prisma conventions, query style)
  ├── Use same auth middleware patterns
  ├── Use same error response format
  ├── Use same file/folder naming conventions
  └── Extend existing content models, don't replace
```

---

## 1. MULTI-TENANT ARCHITECTURE PATTERNS

### Decision Matrix

```
┌─────────────────────┬──────────────┬───────────────┬──────────────────┐
│ Factor              │ Row-Level    │ Schema-Level  │ Database-Level   │
├─────────────────────┼──────────────┼───────────────┼──────────────────┤
│ Isolation            │ Low          │ Medium        │ High             │
│ Cost                 │ Lowest       │ Medium        │ Highest          │
│ Complexity           │ Lowest       │ Medium        │ Highest          │
│ Migration ease       │ Easy         │ Moderate      │ Hard             │
│ Query performance    │ Good*        │ Good          │ Best             │
│ Compliance           │ Basic        │ Good          │ Best (HIPAA etc) │
│ Max tenants          │ 10,000+      │ ~1,000        │ ~100             │
│ Best for             │ SaaS CMS     │ Enterprise    │ Regulated        │
│ Use when             │ Default      │ Need isolation│ Legal requires   │
└─────────────────────┴──────────────┴───────────────┴──────────────────┘
* With proper indexes on tenantId
```

### Pattern A: Row-Level Isolation (Recommended for most CMS projects)

Every table has a `storeId` / `tenantId` column. Single database, single schema.

#### Prisma Schema Pattern

```prisma
model Store {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       StoreUser[]
  posts       Post[]
  products    Product[]
  media       MediaFile[]
  settings    StoreSettings?
}

model Post {
  id          String   @id @default(cuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  title       String
  slug        String
  content     Json?
  status      String   @default("draft") // "draft" | "published" | "archived"
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime? // soft-delete

  // Indexes
  @@unique([storeId, slug])
  @@index([storeId, status])
  @@index([storeId, createdAt])
  @@index([authorId])
}
```

#### Prisma Client Extension for Auto-Tenant Filtering

```typescript
// lib/prisma-tenant.ts
import { PrismaClient, Prisma } from '@prisma/client';

export function withTenantIsolation(prisma: PrismaClient, storeId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          // Only apply to models that have storeId
          if (hasStoreIdField(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (hasStoreIdField(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          // findUnique uses unique fields, but still verify ownership
          const result = await query(args);
          if (result && hasStoreIdField(model) && (result as any).storeId !== storeId) {
            return null; // Don't leak data from other tenants
          }
          return result;
        },
        async create({ model, args, query }) {
          if (hasStoreIdField(model)) {
            (args.data as any).storeId = storeId;
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (hasStoreIdField(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d: any) => ({ ...d, storeId }));
            } else {
              (args.data as any).storeId = storeId;
            }
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (hasStoreIdField(model)) {
            args.where = { ...args.where, storeId } as any;
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (hasStoreIdField(model)) {
            args.where = { ...args.where, storeId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          // Soft delete instead of hard delete
          if (hasStoreIdField(model)) {
            return prisma[model as any].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (hasStoreIdField(model)) {
            args.where = { ...args.where, storeId, deletedAt: null };
          }
          return query(args);
        },
      },
    },
  });
}

// Models that have storeId field
const TENANT_MODELS = new Set([
  'Post', 'Product', 'MediaFile', 'Collection',
  'Category', 'Theme', 'Form', 'GiftCard',
]);

function hasStoreIdField(model: string): boolean {
  return TENANT_MODELS.has(model);
}
```

#### Usage in API Routes

```typescript
// app/api/stores/[id]/posts/route.ts
import { prisma } from '@/lib/prisma';
import { withTenantIsolation } from '@/lib/prisma-tenant';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: storeId } = await params;
  const db = withTenantIsolation(prisma, storeId);

  // No need to manually filter by storeId — the extension handles it
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { firstName: true, lastName: true } } },
  });

  return Response.json(posts);
}
```

#### PostgreSQL Row-Level Security (Defense-in-Depth)

```sql
-- Additional protection at database level
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_post ON "Post"
  USING ("storeId" = current_setting('app.current_store_id', true)::text);

-- Set context in your app before queries
-- await prisma.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, true)`;
```

### Pattern B: Schema-Level Isolation

```typescript
// For enterprise tenants that need stricter isolation
// Each tenant gets their own PostgreSQL schema

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "tenant_abc", "tenant_xyz"]
}

model Post {
  id    String @id @default(cuid())
  title String
  // ...

  @@schema("tenant_abc") // Per-tenant schema
}
```

```typescript
// Dynamic schema selection per request
function getTenantPrisma(tenantSchema: string) {
  // Prisma doesn't natively support dynamic schemas at runtime.
  // Options:
  // 1. Use $queryRaw with schema-qualified table names
  // 2. Set search_path per connection
  // 3. Use separate PrismaClient instances per tenant (with caching)

  return prisma.$executeRaw`SET search_path TO ${tenantSchema}, public`;
}
```

### Pattern C: Database-Level Isolation

```typescript
// For regulated industries (healthcare, finance)
// Each tenant gets their own database

import { PrismaClient } from '@prisma/client';

const tenantClients = new Map<string, PrismaClient>();

function getTenantPrisma(tenantId: string): PrismaClient {
  if (tenantClients.has(tenantId)) {
    return tenantClients.get(tenantId)!;
  }

  const databaseUrl = `postgresql://user:pass@host:5432/tenant_${tenantId}`;
  const client = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  tenantClients.set(tenantId, client);
  return client;
}

// Cleanup on shutdown
process.on('beforeExit', async () => {
  for (const [, client] of tenantClients) {
    await client.$disconnect();
  }
});
```

---

## 2. CONTENT MODELING PRINCIPLES

### Core Philosophy: Content as Data, Not Pages

```
WRONG: "A page has HTML content"
RIGHT: "A Post has structured fields (title, slug, blocks[], metadata)"

WRONG: "Store the entire page as a rich text blob"
RIGHT: "Store content as typed blocks that can be rendered anywhere"
```

### Content Type Registry Pattern

```typescript
// lib/content-types.ts
export interface ContentTypeField {
  name: string;
  type: 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'image'
    | 'select' | 'relation' | 'json' | 'slug' | 'color' | 'url' | 'email';
  label: string;
  required?: boolean;
  localized?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];   // for select
  relation?: { collection: string; many?: boolean }; // for relation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ContentType {
  slug: string;
  label: { singular: string; plural: string };
  icon?: string;
  fields: ContentTypeField[];
  features: {
    drafts?: boolean;
    versions?: boolean;
    timestamps?: boolean;
    softDelete?: boolean;
    slugField?: string;
  };
  access?: {
    create?: string[];  // roles
    read?: string[];
    update?: string[];
    delete?: string[];
  };
  hooks?: {
    beforeCreate?: (data: any) => Promise<any>;
    afterCreate?: (doc: any) => Promise<void>;
    beforeUpdate?: (data: any) => Promise<any>;
    afterUpdate?: (doc: any) => Promise<void>;
    beforeDelete?: (id: string) => Promise<void>;
    afterDelete?: (id: string) => Promise<void>;
  };
}

// Registry
const contentTypes = new Map<string, ContentType>();

export function registerContentType(type: ContentType) {
  contentTypes.set(type.slug, type);
}

export function getContentType(slug: string): ContentType | undefined {
  return contentTypes.get(slug);
}

export function getAllContentTypes(): ContentType[] {
  return Array.from(contentTypes.values());
}

// Register built-in types
registerContentType({
  slug: 'posts',
  label: { singular: 'Post', plural: 'Posts' },
  icon: 'FileText',
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'slug', type: 'slug', label: 'Slug', required: true },
    { name: 'content', type: 'richtext', label: 'Content', localized: true },
    { name: 'excerpt', type: 'text', label: 'Excerpt' },
    { name: 'featuredImage', type: 'image', label: 'Featured Image' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Archived', value: 'archived' },
    ]},
    { name: 'publishedAt', type: 'date', label: 'Publish Date' },
    { name: 'categories', type: 'relation', label: 'Categories', relation: { collection: 'categories', many: true } },
  ],
  features: { drafts: true, versions: true, timestamps: true, softDelete: true, slugField: 'slug' },
});

registerContentType({
  slug: 'pages',
  label: { singular: 'Page', plural: 'Pages' },
  icon: 'Layout',
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'slug', type: 'slug', label: 'Slug', required: true },
    { name: 'content', type: 'richtext', label: 'Content', localized: true },
    { name: 'template', type: 'select', label: 'Template', options: [
      { label: 'Default', value: 'default' },
      { label: 'Full Width', value: 'full-width' },
      { label: 'Sidebar', value: 'sidebar' },
    ]},
    { name: 'parent', type: 'relation', label: 'Parent Page', relation: { collection: 'pages' } },
    { name: 'order', type: 'number', label: 'Order', defaultValue: 0 },
  ],
  features: { drafts: true, versions: true, timestamps: true, softDelete: true, slugField: 'slug' },
});
```

### Block-Based Content Body

```typescript
// Content stored as array of typed blocks (like Notion, Gutenberg, Payload CMS)
interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

// Example block types
const blockTypes = {
  paragraph: { text: 'string', alignment: 'left|center|right' },
  heading: { text: 'string', level: '1|2|3|4|5|6' },
  image: { url: 'string', alt: 'string', caption: 'string', width: 'number', height: 'number' },
  video: { url: 'string', provider: 'youtube|vimeo|upload' },
  code: { code: 'string', language: 'string' },
  quote: { text: 'string', author: 'string' },
  list: { items: 'string[]', style: 'ordered|unordered' },
  table: { rows: 'string[][]', header: 'boolean' },
  divider: {},
  embed: { url: 'string', html: 'string' },
  callout: { text: 'string', type: 'info|warning|error|success', icon: 'string' },
  columns: { columns: 'ContentBlock[][]' }, // nested blocks
};

// Stored in database as JSON:
// post.content = [
//   { id: "abc", type: "heading", data: { text: "Welcome", level: 1 } },
//   { id: "def", type: "paragraph", data: { text: "Hello world..." } },
//   { id: "ghi", type: "image", data: { url: "/media/hero.jpg", alt: "Hero" } },
// ]
```

### Singletons (Global Content)

```typescript
// For site-wide settings, navigation, footer, etc.
registerContentType({
  slug: 'site-settings',
  label: { singular: 'Site Settings', plural: 'Site Settings' },
  singleton: true, // Only one document exists per store
  fields: [
    { name: 'siteName', type: 'text', label: 'Site Name', required: true },
    { name: 'logo', type: 'image', label: 'Logo' },
    { name: 'favicon', type: 'image', label: 'Favicon' },
    { name: 'description', type: 'text', label: 'Meta Description' },
    { name: 'socialLinks', type: 'json', label: 'Social Links' },
    { name: 'headerCode', type: 'richtext', label: 'Header Code Injection' },
    { name: 'footerCode', type: 'richtext', label: 'Footer Code Injection' },
  ],
  features: { versions: true, timestamps: true },
});
```

### Field-Level Localization

```typescript
// Instead of duplicating entire documents per locale,
// mark individual fields as localizable

interface LocalizedField<T> {
  [locale: string]: T;
}

// In database:
// post.title = { en: "Hello", nl: "Hallo", bn: "হ্যালো" }
// post.slug = "hello" (not localized — same across locales)

// Query with locale:
async function getPost(storeId: string, slug: string, locale: string) {
  const post = await db.post.findUnique({
    where: { storeId_slug: { storeId, slug } },
  });

  if (!post) return null;

  // Resolve localized fields
  return {
    ...post,
    title: post.title?.[locale] ?? post.title?.['en'] ?? post.title,
    content: post.content?.[locale] ?? post.content?.['en'] ?? post.content,
    // Non-localized fields pass through
    slug: post.slug,
    status: post.status,
  };
}
```

---

## 3. PLUGIN / EXTENSION SYSTEM DESIGN

### Pattern A: Config Transformation (Payload CMS Style)

```typescript
// A plugin is a function that receives config and returns modified config
type CMSPlugin = (config: CMSConfig) => CMSConfig;

interface CMSConfig {
  contentTypes: ContentType[];
  hooks: GlobalHooks;
  middleware: Middleware[];
  api: APIConfig;
}

// Example: SEO Plugin
const seoPlugin: CMSPlugin = (config) => {
  // Add SEO fields to all content types
  const enhancedTypes = config.contentTypes.map((type) => ({
    ...type,
    fields: [
      ...type.fields,
      { name: 'metaTitle', type: 'text' as const, label: 'Meta Title' },
      { name: 'metaDescription', type: 'text' as const, label: 'Meta Description' },
      { name: 'ogImage', type: 'image' as const, label: 'OG Image' },
      { name: 'noIndex', type: 'boolean' as const, label: 'No Index', defaultValue: false },
    ],
  }));

  return {
    ...config,
    contentTypes: enhancedTypes,
  };
};

// Apply plugins
function buildConfig(baseConfig: CMSConfig, plugins: CMSPlugin[]): CMSConfig {
  return plugins.reduce((config, plugin) => plugin(config), baseConfig);
}

const finalConfig = buildConfig(baseConfig, [seoPlugin, analyticsPlugin, formPlugin]);
```

### Pattern B: Hook-Based (Event-Driven Lifecycle)

```typescript
// lib/hooks.ts
type HookFn<T = any> = (context: HookContext<T>) => Promise<T | void>;

interface HookContext<T = any> {
  data: T;
  operation: 'create' | 'update' | 'delete' | 'read';
  collection: string;
  storeId: string;
  user: SessionUser;
  originalDoc?: T; // for updates
}

class HookRegistry {
  private hooks = new Map<string, Map<string, HookFn[]>>();

  register(event: string, collection: string, fn: HookFn) {
    const key = `${event}:${collection}`;
    if (!this.hooks.has(key)) {
      this.hooks.set(key, new Map());
    }
    const fns = this.hooks.get(key)!;
    const existing = fns.get(collection) || [];
    fns.set(collection, [...existing, fn]);
  }

  async run<T>(event: string, collection: string, context: HookContext<T>): Promise<T> {
    const key = `${event}:${collection}`;
    const fns = this.hooks.get(key)?.get(collection) || [];

    // Also run global hooks (event:*)
    const globalKey = `${event}:*`;
    const globalFns = this.hooks.get(globalKey)?.get('*') || [];

    let data = context.data;
    for (const fn of [...globalFns, ...fns]) {
      const result = await fn({ ...context, data });
      if (result !== undefined) data = result;
    }
    return data;
  }
}

export const hooks = new HookRegistry();

// Register hooks
hooks.register('beforeCreate', 'posts', async ({ data, user }) => {
  // Auto-generate slug from title
  if (!data.slug && data.title) {
    data.slug = slugify(data.title);
  }
  // Set author
  data.authorId = user.id;
  return data;
});

hooks.register('afterCreate', 'posts', async ({ data, storeId }) => {
  // Send webhook
  await emitWebhook(storeId, 'post.created', data);
  // Invalidate cache
  await revalidateTag(`store:${storeId}:posts`);
});

hooks.register('beforeDelete', '*', async ({ data, collection }) => {
  // Global hook: log all deletions
  console.log(`[AUDIT] Deleting ${collection}:${data.id}`);
});
```

#### Using Hooks in API Routes

```typescript
// app/api/stores/[id]/posts/route.ts
import { hooks } from '@/lib/hooks';

export async function POST(req: Request, { params }) {
  const { id: storeId } = await params;
  const session = await auth();
  const body = await req.json();

  // Run beforeCreate hooks
  const processedData = await hooks.run('beforeCreate', 'posts', {
    data: body,
    operation: 'create',
    collection: 'posts',
    storeId,
    user: session.user,
  });

  // Create in database
  const post = await db.post.create({ data: processedData });

  // Run afterCreate hooks
  await hooks.run('afterCreate', 'posts', {
    data: post,
    operation: 'create',
    collection: 'posts',
    storeId,
    user: session.user,
  });

  return Response.json(post, { status: 201 });
}
```

### Pattern C: Middleware-Based (Request Pipeline)

```typescript
// lib/middleware-chain.ts
type CMSMiddleware = (
  req: Request,
  ctx: MiddlewareContext,
  next: () => Promise<Response>
) => Promise<Response>;

interface MiddlewareContext {
  storeId: string;
  user?: SessionUser;
  collection?: string;
  operation?: string;
}

class MiddlewareChain {
  private middlewares: CMSMiddleware[] = [];

  use(middleware: CMSMiddleware) {
    this.middlewares.push(middleware);
  }

  async execute(req: Request, ctx: MiddlewareContext): Promise<Response> {
    let index = 0;

    const next = async (): Promise<Response> => {
      if (index >= this.middlewares.length) {
        return new Response('Not found', { status: 404 });
      }
      const middleware = this.middlewares[index++];
      return middleware(req, ctx, next);
    };

    return next();
  }
}

// Usage
const chain = new MiddlewareChain();
chain.use(authMiddleware);        // Check authentication
chain.use(tenantMiddleware);      // Resolve tenant
chain.use(permissionMiddleware);  // Check permissions
chain.use(rateLimitMiddleware);   // Rate limiting
chain.use(validationMiddleware);  // Validate request body
chain.use(handlerMiddleware);     // Execute the actual handler
```

---

## 4. RBAC & ACCESS CONTROL

### Four Levels of Access Control

```
Level 1: ROUTE-LEVEL
  "Can this user access /api/stores/[id]/posts?"
  → Middleware checks: authenticated? has store access?

Level 2: COLLECTION-LEVEL
  "Can this user CREATE posts?"
  → Permission check: user.role has 'posts.create' permission?

Level 3: DOCUMENT-LEVEL
  "Can this user edit THIS specific post?"
  → Access function returns: boolean OR query constraint

Level 4: FIELD-LEVEL
  "Can this user see/edit the 'price' field?"
  → Field config defines which roles can read/write each field
```

### Implementation

#### Role & Permission Registry

```typescript
// lib/permissions.ts
interface Permission {
  id: string;
  label: string;
  description?: string;
  group: string;
}

interface RolePreset {
  id: string;
  label: string;
  color: string;
  permissions: string[];
}

// All available permissions
const PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', label: 'View Dashboard', group: 'General' },

  // Content
  { id: 'content.view', label: 'View Content', group: 'Content' },
  { id: 'content.create', label: 'Create Content', group: 'Content' },
  { id: 'content.edit', label: 'Edit Content', group: 'Content' },
  { id: 'content.delete', label: 'Delete Content', group: 'Content' },
  { id: 'content.publish', label: 'Publish Content', group: 'Content' },

  // Products
  { id: 'products.view', label: 'View Products', group: 'Products' },
  { id: 'products.create', label: 'Create Products', group: 'Products' },
  { id: 'products.edit', label: 'Edit Products', group: 'Products' },
  { id: 'products.delete', label: 'Delete Products', group: 'Products' },
  { id: 'products.inventory', label: 'Manage Inventory', group: 'Products' },

  // Media
  { id: 'media.view', label: 'View Media', group: 'Media' },
  { id: 'media.upload', label: 'Upload Media', group: 'Media' },
  { id: 'media.delete', label: 'Delete Media', group: 'Media' },

  // Settings
  { id: 'settings.view', label: 'View Settings', group: 'Settings' },
  { id: 'settings.edit', label: 'Edit Settings', group: 'Settings' },
  { id: 'staff.manage', label: 'Manage Staff', group: 'Settings' },
  { id: 'themes.edit', label: 'Edit Themes', group: 'Settings' },
  { id: 'billing.manage', label: 'Manage Billing', group: 'Settings' },
];

// Role presets
const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'admin',
    label: 'Admin',
    color: '#6366f1',
    permissions: PERMISSIONS.map((p) => p.id), // All permissions
  },
  {
    id: 'editor',
    label: 'Editor',
    color: '#287f71',
    permissions: [
      'dashboard.view', 'content.view', 'content.create', 'content.edit',
      'content.publish', 'products.view', 'products.create', 'products.edit',
      'media.view', 'media.upload',
    ],
  },
  {
    id: 'viewer',
    label: 'Viewer',
    color: '#f59e0b',
    permissions: [
      'dashboard.view', 'content.view', 'products.view', 'media.view',
    ],
  },
];
```

#### Document-Level Access (Payload CMS Pattern)

```typescript
// lib/access.ts
type AccessResult = boolean | Record<string, any>;

type AccessFunction = (context: {
  user: SessionUser;
  storeId: string;
  doc?: any;
}) => AccessResult | Promise<AccessResult>;

interface CollectionAccess {
  create?: AccessFunction;
  read?: AccessFunction;
  update?: AccessFunction;
  delete?: AccessFunction;
}

// Define access for each collection
const postAccess: CollectionAccess = {
  create: ({ user }) => {
    // Admins and editors can create
    return hasPermission(user, 'content.create');
  },

  read: ({ user }) => {
    if (user.role === 'ADMIN' || user.role === 'OWNER') return true;

    // Editors can see all published + their own drafts
    if (hasPermission(user, 'content.view')) {
      return {
        OR: [
          { status: 'published' },
          { authorId: user.id },
        ],
      };
    }

    // Viewers can only see published
    return { status: 'published' };
  },

  update: ({ user }) => {
    if (user.role === 'ADMIN' || user.role === 'OWNER') return true;

    // Editors can only edit their own posts
    if (hasPermission(user, 'content.edit')) {
      return { authorId: user.id };
    }

    return false;
  },

  delete: ({ user }) => {
    // Only admins can delete
    return user.role === 'ADMIN' || user.role === 'OWNER';
  },
};

// Apply access control in queries
async function findWithAccess(
  collection: string,
  storeId: string,
  user: SessionUser,
  queryArgs: any = {}
) {
  const access = getCollectionAccess(collection);
  const readAccess = await access.read?.({ user, storeId });

  if (readAccess === false) {
    return []; // No access
  }

  if (readAccess === true) {
    // Full access — no additional where clause
    return db[collection].findMany(queryArgs);
  }

  // readAccess is a query constraint — merge with existing where
  return db[collection].findMany({
    ...queryArgs,
    where: {
      ...queryArgs.where,
      ...readAccess, // { status: 'published' } or { authorId: user.id }
    },
  });
}
```

#### Field-Level Access

```typescript
// Define which roles can read/write each field
const fieldAccess: Record<string, { read?: string[]; write?: string[] }> = {
  'products.price': { read: ['admin', 'editor'], write: ['admin'] },
  'products.cost': { read: ['admin'], write: ['admin'] },
  'posts.content': { read: ['admin', 'editor', 'viewer'], write: ['admin', 'editor'] },
  'settings.apiKey': { read: ['admin'], write: ['admin'] },
};

function filterFieldsByAccess(
  collection: string,
  doc: any,
  userRole: string,
  operation: 'read' | 'write'
): any {
  const filtered = { ...doc };

  for (const [fieldKey, access] of Object.entries(fieldAccess)) {
    const [col, field] = fieldKey.split('.');
    if (col !== collection) continue;

    const allowedRoles = operation === 'read' ? access.read : access.write;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      delete filtered[field]; // Remove field from response
    }
  }

  return filtered;
}
```

#### Permission Check Middleware

```typescript
// lib/check-permission.ts
export function requirePermission(permission: string) {
  return async function (req: Request, storeId: string) {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role in this store
    const storeUser = await prisma.storeUser.findUnique({
      where: {
        userId_storeId: { userId: session.user.id, storeId },
      },
    });

    if (!storeUser) {
      return Response.json({ error: 'No access to this store' }, { status: 403 });
    }

    // Check if role has the required permission
    const rolePreset = ROLE_PRESETS.find((r) => r.id === storeUser.role.toLowerCase());
    if (!rolePreset?.permissions.includes(permission)) {
      return Response.json(
        { error: `Missing permission: ${permission}` },
        { status: 403 }
      );
    }

    return null; // Permission granted — continue
  };
}

// Usage in API route
export async function DELETE(req: Request, { params }) {
  const { id: storeId, postId } = await params;

  const denied = await requirePermission('content.delete')(req, storeId);
  if (denied) return denied;

  // ... proceed with deletion
}
```

---

## 5. CMS API DESIGN PATTERNS

### RESTful Resource Design

```
URL Pattern: /api/stores/[storeId]/[collection]

GET    /api/stores/:id/posts              → List posts (with filters)
POST   /api/stores/:id/posts              → Create post
GET    /api/stores/:id/posts/:postId      → Get single post
PATCH  /api/stores/:id/posts/:postId      → Update post
DELETE /api/stores/:id/posts/:postId      → Delete post (soft)

Query Parameters:
  ?where[status]=published                → Filter by field
  ?where[title][$contains]=hello          → Filter with operator
  ?sort=-createdAt                        → Sort (- = descending)
  ?limit=20&page=1                        → Pagination
  ?depth=2                                → Relation population depth
  ?fields=title,slug,status               → Field selection
  ?draft=true                             → Include drafts
  ?locale=en                              → Locale for i18n
```

### Standard API Route Pattern

```typescript
// app/api/stores/[id]/[collection]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTenantIsolation } from '@/lib/prisma-tenant';
import { auth } from '@/auth';
import { z } from 'zod';

// Standardized query parser
function parseQueryParams(url: URL) {
  const params = Object.fromEntries(url.searchParams);
  return {
    page: Math.max(1, parseInt(params.page || '1')),
    limit: Math.min(100, Math.max(1, parseInt(params.limit || '20'))),
    sort: params.sort || '-createdAt',
    search: params.search || '',
    status: params.status || undefined,
    depth: Math.min(3, parseInt(params.depth || '1')),
    fields: params.fields?.split(',').filter(Boolean) || undefined,
    draft: params.draft === 'true',
    locale: params.locale || 'en',
  };
}

// Standardized response format
function apiResponse<T>(data: T, meta?: { total: number; page: number; limit: number }) {
  return Response.json({
    data,
    ...(meta && {
      meta: {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: Math.ceil(meta.total / meta.limit),
        hasMore: meta.page * meta.limit < meta.total,
      },
    }),
  });
}

// Standardized error format
function apiError(message: string, status: number, details?: any) {
  return Response.json(
    {
      error: { message, status, ...(details && { details }) },
    },
    { status }
  );
}

// GET /api/stores/[id]/posts
export async function GET(req: NextRequest, { params }) {
  const session = await auth();
  if (!session?.user) return apiError('Unauthorized', 401);

  const { id: storeId } = await params;
  const db = withTenantIsolation(prisma, storeId);
  const { page, limit, sort, search, status } = parseQueryParams(new URL(req.url));

  const where: any = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: parseSortParam(sort),
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return apiResponse(items, { total, page, limit });
}

// POST /api/stores/[id]/posts
export async function POST(req: NextRequest, { params }) {
  const session = await auth();
  if (!session?.user) return apiError('Unauthorized', 401);

  const { id: storeId } = await params;

  // Permission check
  const denied = await requirePermission('content.create')(req, storeId);
  if (denied) return denied;

  // Validate body
  const body = await req.json();
  const validation = createPostSchema.safeParse(body);
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.error.flatten());
  }

  const db = withTenantIsolation(prisma, storeId);

  // Run hooks
  const data = await hooks.run('beforeCreate', 'posts', {
    data: { ...validation.data, authorId: session.user.id },
    operation: 'create',
    collection: 'posts',
    storeId,
    user: session.user,
  });

  const post = await db.post.create({ data });

  await hooks.run('afterCreate', 'posts', {
    data: post,
    operation: 'create',
    collection: 'posts',
    storeId,
    user: session.user,
  });

  return Response.json(post, { status: 201 });
}

// Helper: parse sort parameter
function parseSortParam(sort: string) {
  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const field = sort.replace(/^-/, '');
  return { [field]: direction };
}
```

---

## 6. CACHING STRATEGIES

### Layer 1: CDN / Edge (Cloudflare, Vercel)

```typescript
// For public content APIs
export async function GET(req: Request) {
  const data = await fetchPublicContent();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      // Cache at edge for 60s, serve stale for 5min while revalidating
    },
  });
}
```

### Layer 2: Next.js ISR (Tag-Based Invalidation)

```typescript
// Server component with caching
import { unstable_cache } from 'next/cache';

const getCachedPosts = unstable_cache(
  async (storeId: string) => {
    return prisma.post.findMany({
      where: { storeId, status: 'published', deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  },
  ['posts'],
  {
    tags: ['posts'], // Can be invalidated by tag
    revalidate: 60,  // Revalidate every 60 seconds
  }
);

// Invalidate on content change
import { revalidateTag } from 'next/cache';

// In afterCreate/afterUpdate hooks:
hooks.register('afterCreate', 'posts', async ({ storeId }) => {
  revalidateTag('posts');
  revalidateTag(`store:${storeId}:posts`);
});
```

### Layer 3: Application Cache (In-Memory LRU)

```typescript
// lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,          // Max 500 entries
  ttl: 5 * 60_000,   // 5 minute TTL
});

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const existing = cache.get(key);
  if (existing !== undefined) return existing as T;

  const result = await fetcher();
  cache.set(key, result, { ttl });
  return result;
}

export function invalidateCache(pattern: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern) || key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Usage
const settings = await cached(
  `store:${storeId}:settings`,
  () => prisma.storeSettings.findUnique({ where: { storeId } }),
  10 * 60_000 // 10 min
);
```

---

## 7. CONTENT VERSIONING & REVISIONS

### Database Schema

```prisma
model ContentVersion {
  id           String   @id @default(cuid())
  storeId      String
  collection   String   // "posts", "pages", etc.
  documentId   String   // ID of the original document
  version      Int      // Version number (1, 2, 3...)
  data         Json     // Full snapshot of the document at this version
  status       String   // "draft" | "published"
  createdBy    String
  createdAt    DateTime @default(now())
  changelog    String?  // Optional description of changes

  @@unique([documentId, version])
  @@index([storeId, collection, documentId])
  @@index([documentId, version])
}
```

### Version Management

```typescript
// lib/versioning.ts
export async function createVersion(
  storeId: string,
  collection: string,
  documentId: string,
  data: any,
  userId: string,
  status: 'draft' | 'published' = 'draft'
) {
  // Get latest version number
  const latest = await prisma.contentVersion.findFirst({
    where: { documentId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const version = (latest?.version ?? 0) + 1;

  return prisma.contentVersion.create({
    data: {
      storeId,
      collection,
      documentId,
      version,
      data,
      status,
      createdBy: userId,
    },
  });
}

export async function getVersions(documentId: string) {
  return prisma.contentVersion.findMany({
    where: { documentId },
    orderBy: { version: 'desc' },
    take: 50,
  });
}

export async function rollbackToVersion(documentId: string, version: number) {
  const target = await prisma.contentVersion.findUnique({
    where: { documentId_version: { documentId, version } },
  });

  if (!target) throw new Error('Version not found');

  // Update the document with the version's data
  const { collection, storeId } = target;
  await prisma[collection as any].update({
    where: { id: documentId },
    data: target.data as any,
  });

  return target;
}

// Auto-save hook (debounced)
hooks.register('afterUpdate', '*', async ({ data, collection, storeId, user }) => {
  await createVersion(storeId, collection, data.id, data, user.id, data.status);
});
```

---

## 8. WEBHOOK DELIVERY SYSTEM

```typescript
// lib/webhooks.ts
import crypto from 'crypto';

interface WebhookEndpoint {
  id: string;
  storeId: string;
  url: string;
  secret: string;
  events: string[]; // ["post.created", "post.updated", "product.*"]
  active: boolean;
}

// Sign payload with HMAC-SHA256
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Emit webhook event
export async function emitWebhook(
  storeId: string,
  event: string,
  data: any
) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      storeId,
      active: true,
      events: { hasSome: [event, event.split('.')[0] + '.*', '*'] },
    },
  });

  const payload = JSON.stringify({
    event,
    data,
    storeId,
    timestamp: new Date().toISOString(),
  });

  // Deliver to all matching endpoints (async, don't block)
  await Promise.allSettled(
    endpoints.map((endpoint) => deliverWebhook(endpoint, event, payload))
  );
}

// Deliver with retry
async function deliverWebhook(
  endpoint: WebhookEndpoint,
  event: string,
  payload: string,
  attempt: number = 1
) {
  const signature = signPayload(payload, endpoint.secret);
  const maxAttempts = 3;

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': new Date().toISOString(),
      },
      body: payload,
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    // Log delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event,
        payload,
        responseStatus: response.status,
        success: response.ok,
        attempt,
      },
    });

    if (!response.ok && attempt < maxAttempts) {
      // Retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      setTimeout(() => deliverWebhook(endpoint, event, payload, attempt + 1), delay);
    }
  } catch (error) {
    await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event,
        payload,
        responseStatus: 0,
        success: false,
        error: (error as Error).message,
        attempt,
      },
    });

    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000;
      setTimeout(() => deliverWebhook(endpoint, event, payload, attempt + 1), delay);
    }
  }
}

// Usage in hooks
hooks.register('afterCreate', '*', async ({ data, collection, storeId }) => {
  await emitWebhook(storeId, `${collection}.created`, data);
});

hooks.register('afterUpdate', '*', async ({ data, collection, storeId }) => {
  await emitWebhook(storeId, `${collection}.updated`, data);
});

hooks.register('afterDelete', '*', async ({ data, collection, storeId }) => {
  await emitWebhook(storeId, `${collection}.deleted`, { id: data.id });
});
```

---

## 9. DECISION FRAMEWORK

```
WHEN TO USE WHAT:

Multi-tenancy:
  ├── Starting a new SaaS CMS         → Row-level isolation
  ├── Enterprise customer demands it   → Schema-level isolation
  ├── Healthcare/finance compliance    → Database-level isolation
  └── Single-tenant CMS (not SaaS)    → No isolation needed

Content modeling:
  ├── Blog/news site                   → Simple fields (title, content, image)
  ├── Landing pages                    → Block-based content body
  ├── Complex product pages            → Custom fields + blocks
  ├── Documentation                    → Markdown + metadata
  └── E-commerce                       → Structured fields with variants

Plugin system:
  ├── Simple field/feature additions   → Config transformation
  ├── Complex lifecycle hooks          → Event-driven hooks
  ├── Third-party integrations         → Middleware-based
  └── All of the above                 → Combine patterns

Permissions:
  ├── Simple admin/editor/viewer       → Collection-level RBAC
  ├── "Users can only edit their own"  → Document-level access
  ├── "Hide price from editors"        → Field-level access
  └── Complex policies                 → CASL library

Caching:
  ├── Public content pages             → CDN + ISR (revalidateTag)
  ├── Admin dashboard data             → LRU cache (5 min TTL)
  ├── User session data                → No caching
  └── Search results                   → Redis (1 min TTL)

Versioning:
  ├── Blog posts / pages               → Snapshot versioning
  ├── Real-time collaboration          → Operational transforms (Yjs/Liveblocks)
  ├── Audit compliance                 → Event sourcing
  └── Simple undo                      → Local state (no DB)
```

---

## 10. MISTAKES TO AVOID

```
NEVER DO:
  ✗ Skip tenantId filtering — ONE query without it leaks data across tenants
  ✗ Use auto-increment IDs in multi-tenant — IDs become guessable
  ✗ Store content as raw HTML string — always use structured blocks
  ✗ Check permissions only on the frontend — always enforce server-side
  ✗ Hard-delete content — always soft-delete with deletedAt
  ✗ Build monolithic API routes — break into middleware + hooks + handlers
  ✗ Cache user-specific data at CDN level — only cache public content
  ✗ Skip webhook signature verification — always sign payloads
  ✗ Store versions as diffs — use full snapshots (simpler, more reliable)
  ✗ Put business logic in API routes — move to hooks for reusability
  ✗ Skip audit fields (createdAt, updatedAt, createdBy) — add from day one
  ✗ Build your own auth from scratch — use NextAuth, Clerk, or Lucia
  ✗ Ignore connection pooling — serverless WILL exhaust connections
  ✗ Store localized content in separate rows — use field-level localization
```
