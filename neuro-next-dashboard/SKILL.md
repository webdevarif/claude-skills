---
name: neuro-next-dashboard
description: Next.js dashboard expert for ANY project - admin panels, SaaS dashboards, CMS platforms, CRM, analytics, e-commerce admin. Covers all dashboard UI components, layout patterns, data tables, forms, media library, modals, multi-tenant architecture, API patterns, and screenshot-to-dashboard analysis.
trigger: auto
globs:
  - "**/app/**/dashboard/**"
  - "**/app/**/store/**"
  - "**/app/**/admin/**"
  - "**/app/**/panel/**"
  - "**/app/api/**"
  - "**/components/ui/**"
  - "**/lib/ui-exports.*"
  - "**/hooks/**"
  - "**/prisma/schema.prisma"
  - "**/drizzle/**"
  - "**/auth.*"
  - "**/middleware.*"
  - "**/(auth)/**"
  - "**/(platform)/**"
  - "**/(stores)/**"
  - "**/layout.tsx"
  - "**/providers/**"
---

# Next.js Dashboard — Universal Admin & Platform Skill

You are an expert in building modern dashboard interfaces with Next.js. You produce production-grade, accessible, performant dashboard code for ANY project type — SaaS platforms, CMS systems, CRM tools, analytics dashboards, e-commerce admin panels, or internal tools.

**CRITICAL**: Before writing ANY code, you MUST first analyze the current project to identify its exact stack, UI library, and patterns. Then follow those patterns exactly. Never assume — always read the project first.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

Before writing dashboard code, you MUST identify:

```
STEP 1: READ THE PROJECT
  ├── Read package.json (framework version, UI library, state management)
  ├── Read tsconfig.json (path aliases, strict mode)
  ├── Read tailwind.config.* (theme, colors, custom config)
  ├── Read app/layout.tsx (providers, theme, fonts)
  ├── Read components/ui/ (existing UI primitives)
  ├── Read lib/ (utilities, helpers, exports)
  ├── Read hooks/ (data fetching patterns)
  ├── Read prisma/schema.prisma OR drizzle/ (database models)
  └── Read auth.* or middleware.* (authentication)

STEP 2: IDENTIFY STACK
  ├── UI Library? (shadcn/ui, @webdevarif/dashui, Radix, MUI, Ant Design, Mantine, custom)
  ├── Styling? (Tailwind, CSS Modules, styled-components, vanilla CSS)
  ├── Color system? (oklch, HSL, hex, CSS variables)
  ├── State management? (SWR, React Query/TanStack, Redux, Zustand, Context)
  ├── ORM? (Prisma, Drizzle, Mongoose, TypeORM)
  ├── Auth? (NextAuth, Clerk, Supabase Auth, Lucia, custom JWT)
  ├── Forms? (React Hook Form + Zod, Formik + Yup, native)
  ├── Icons? (Lucide, HugeIcons, Heroicons, Phosphor, Tabler)
  └── Patterns? (cn() utility, CVA variants, barrel exports)

STEP 3: FOLLOW THE PROJECT'S PATTERNS
  ├── Use same UI library imports
  ├── Use same className utility (cn, clsx, twMerge)
  ├── Use same data fetching pattern
  ├── Use same form library and validation
  ├── Use same layout structure
  ├── Use same naming conventions
  └── Match existing code style exactly
```

**NEVER** introduce a new library or pattern if the project already has one for that purpose.

---

## COMMON DASHBOARD STACKS (Reference)

### Stack A: shadcn/ui (Most Popular)
```
Next.js 14/15 + React 18/19 + TypeScript
shadcn/ui + Radix UI + Tailwind CSS (HSL variables)
Prisma/Drizzle + PostgreSQL
NextAuth/Clerk + React Hook Form + Zod
TanStack Table + SWR/React Query
Lucide React icons + Sonner toasts
cn() = clsx + tailwind-merge
```

### Stack B: @webdevarif/dashui (BulifyCMS)
```
Next.js 15 + React 19 + TypeScript
@webdevarif/dashui + @base-ui/react + Tailwind CSS 4 (oklch)
Prisma + PostgreSQL + SWR
NextAuth 5 + React Hook Form + Zod
TipTap + Monaco Editor
Lucide + HugeIcons + Sonner
cn() = clsx + tailwind-merge
```

### Stack C: MUI / Ant Design
```
Next.js 14/15 + React 18/19 + TypeScript
MUI or Ant Design (built-in styling)
Prisma/Drizzle + PostgreSQL
NextAuth/Clerk + React Hook Form
Built-in tables + data grid
MUI/Ant icons
```

### Stack D: Custom / Minimal
```
Next.js 14/15 + React 18/19 + TypeScript
Custom components + Tailwind CSS
Any ORM + Any DB
Any auth + native forms or RHF
Custom table components
Any icon library
```

---

## 1. SCREENSHOT / IMAGE ANALYSIS FOR DASHBOARD

When a user provides a dashboard screenshot or mockup, perform a FULL systematic analysis before writing any code. This is non-negotiable — every pixel matters in dashboard UI.

### Analysis Protocol

```
STEP 1: IDENTIFY DASHBOARD SECTION TYPE
  ├── Is it a data table? (columns, rows, filters, pagination, bulk actions)
  ├── Is it a form page? (fields, labels, validation, submit)
  ├── Is it a detail/edit page? (tabs, sections, sidebar info)
  ├── Is it a list/grid view? (cards, thumbnails, actions)
  ├── Is it a media library? (grid, upload, folders, selection)
  ├── Is it a settings page? (sections, toggles, inputs)
  ├── Is it a modal/dialog? (header, content, footer actions)
  ├── Is it a sidebar/navigation? (menu items, groups, icons)
  └── Is it a dashboard overview? (stats cards, charts, recent activity)

STEP 2: LAYOUT ANALYSIS
  ├── Overall structure (sidebar + topbar + content)
  ├── Content area layout (single column, 2-column, grid)
  ├── Card/section arrangement
  ├── Spacing between elements (~px estimates)
  ├── Background colors and borders
  └── Responsive behavior (breakpoints, stacking)

STEP 3: COMPONENT BREAKDOWN
  For EACH visible component:
  ├── Component type (Button, Input, Select, Card, Table, Badge, etc.)
  ├── Variant (primary, outline, ghost, destructive)
  ├── Size (sm, md, lg)
  ├── State (default, hover, active, disabled, loading)
  ├── Content (text, icon, both)
  ├── Position and alignment
  ├── Spacing (margin, padding in ~px)
  └── Colors (background, text, border — oklch values or hex approximation)

STEP 4: DATA STRUCTURE
  ├── What data is displayed? (products, posts, users, orders, media, etc.)
  ├── What fields are shown? (title, status, date, price, author, etc.)
  ├── What actions are available? (create, edit, delete, filter, sort, export)
  ├── What filters exist? (status, date range, category, search)
  └── Pagination pattern (numbered, load more, infinite scroll)

STEP 5: INTERACTION MAP
  ├── Clickable elements and their destinations
  ├── Hover effects (bg change, underline, scale, shadow)
  ├── Dropdown/popover triggers
  ├── Modal triggers (which buttons open which dialogs)
  ├── Form submission flows
  ├── Keyboard shortcuts (Ctrl+K command palette, Escape to close, etc.)
  └── Drag-and-drop zones
```

### Output Format

After analysis, produce a structured specification:

```markdown
## Dashboard Section: [Type]

### Layout
- Structure: [sidebar + topbar + scrollable content]
- Content width: [max-w-7xl centered / full-width / 2-column 60/40]
- Background: [bg-muted/30 / bg-background]
- Padding: [p-6 / p-8]

### Components Required
1. **PageHeader** — title: "...", description: "...", actions: [Button: "Add New"]
2. **DataTable** — columns: [...], filters: [...], pagination: true
3. **Badge** — variants: active(green), draft(yellow), archived(gray)
...

### Data Shape
interface Product {
  id: string;
  title: string;
  status: "active" | "draft" | "archived";
  price: number;
  // ...
}

### Interactions
- "Add New" button → opens /store/[slug]/products/new
- Row click → navigates to /store/[slug]/products/[id]
- Status badge → shows dropdown to change status
- Bulk select → enables "Delete Selected" action bar
```

This specification is copy-pastable as a prompt for exact reproduction.

---

## 2. DASHBOARD LAYOUT ARCHITECTURE

### Project Structure

```
apps/dashboard/
  app/
    [locale]/
      (auth)/           → login, register, forgot-password, verify-email
        login/page.tsx
        register/page.tsx
        forgot-password/page.tsx
        verify-email/page.tsx
      (platform)/       → admin dashboard (super admin)
        layout.tsx      → PlatformLayout
        dashboard/page.tsx
        stores/page.tsx
        users/page.tsx
      (stores)/         → store management
        layout.tsx      → StoresLayout
        store/[slug]/   → individual store dashboard
          layout.tsx    → StoreTenantLayout
          page.tsx      → store overview
          content/[postType]/     → posts, pages, custom types
          media/                  → media library
          online-store/themes/[themeId]/editor  → theme builder
          products/               → product management
          settings/               → store settings
    api/                → REST API routes
      auth/[...nextauth]/route.ts
      stores/[id]/
        posts/route.ts
        products/route.ts
        media/route.ts
        themes/route.ts
  components/
    ui/               → re-exported @webdevarif/dashui primitives
    layouts/          → layout components
    shared/           → shared dashboard components
  lib/
    ui-exports.ts     → centralized UI component exports
    utils.ts          → cn() and other utilities
    prisma.ts         → Prisma client singleton
    auth.ts           → NextAuth config
    schemas/          → Zod validation schemas
  hooks/              → SWR-based data hooks
  types/              → TypeScript declarations
```

### Root Layout

```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Store Tenant Layout (Core Dashboard Shell)

```tsx
// app/[locale]/(stores)/store/[slug]/layout.tsx
import { StoreTenantLayoutClient } from "@/components/layouts/StoreTenantLayoutClient";
import { getStoreBySlug } from "@/lib/queries/stores";
import { notFound } from "next/navigation";

export default async function StoreTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) notFound();

  return (
    <StoreTenantLayoutClient store={store}>
      {children}
    </StoreTenantLayoutClient>
  );
}
```

### Client Layout Shell

```tsx
// components/layouts/StoreTenantLayoutClient.tsx
"use client";

import { useState } from "react";
import { StoreTenantSidebar } from "./StoreTenantSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { cn } from "@/lib/utils";

interface StoreTenantLayoutClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  children: React.ReactNode;
}

export function StoreTenantLayoutClient({
  store,
  children,
}: StoreTenantLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <StoreTenantSidebar
        store={store}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar — fixed 56px */}
        <DashboardTopbar store={store} />

        {/* Scrollable content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-muted/30 p-6",
            "transition-all duration-300 ease-in-out"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Collapsible Sidebar

```tsx
// components/layouts/StoreTenantSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FileText,
  Image,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Tooltip } from "@/lib/ui-exports";

interface SidebarProps {
  store: { id: string; name: string; slug: string; logo?: string };
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Content", icon: FileText, path: "/content/posts" },
  { label: "Media", icon: Image, path: "/media" },
  { label: "Online Store", icon: Palette, path: "/online-store" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function StoreTenantSidebar({ store, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const basePath = `/store/${store.slug}`;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-80"
      )}
    >
      {/* Store header */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-foreground">
            {store.name}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const href = `${basePath}${item.path}`;
          const isActive =
            item.path === ""
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(href);

          const linkContent = (
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.label} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return <div key={item.label}>{linkContent}</div>;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
```

### Topbar (56px)

```tsx
// components/layouts/DashboardTopbar.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, User, LogOut } from "lucide-react";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/lib/ui-exports";
import { Avatar } from "@/components/ui/Avatar";
import { useSession, signOut } from "next-auth/react";

export function DashboardTopbar({ store }: { store: { name: string } }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search... (Ctrl+K)"
          className="pl-9"
          onFocus={() => {
            // Open command palette
          }}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar
                src={session?.user?.image}
                name={session?.user?.name ?? "User"}
                size="sm"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

---

## 3. ALL DASHBOARD UI COMPONENTS

### UI Exports Hub

All @webdevarif/dashui components are re-exported from a single file for clean imports:

```tsx
// lib/ui-exports.ts
export {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Checkbox,
  Switch,
  Label,
  Separator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Skeleton,
  ScrollArea,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  RadioGroup,
  RadioGroupItem,
  Calendar,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@webdevarif/dashui";
```

### cn() Utility

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### DATA DISPLAY COMPONENTS

#### Data Table (Full Implementation)

```tsx
// components/shared/DataTable.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Button,
  Checkbox,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/lib/ui-exports";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface Filter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  filters?: Filter[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  bulkActions?: { label: string; icon?: React.ReactNode; onClick: (ids: string[]) => void; variant?: "destructive" }[];
  rowKey?: (item: T) => string;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery = "",
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  filters,
  activeFilters,
  onFilterChange,
  isLoading,
  onRowClick,
  bulkActions,
  rowKey = (item) => item.id as string,
  emptyState,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const totalPages = Math.ceil(totalCount / pageSize);

  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(rowKey(item)));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(rowKey)));
    }
  }, [allSelected, data, rowKey]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-lg border border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border p-4">
              {columns.map((_, j) => (
                <Skeleton key={j} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filters + Bulk Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange && (
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filters?.map((filter) => (
          <Select
            key={filter.key}
            value={activeFilters?.[filter.key] ?? "all"}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && bulkActions && (
          <div className="ml-auto flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant === "destructive" ? "destructive" : "outline"}
                size="sm"
                onClick={() => action.onClick(Array.from(selectedIds))}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {bulkActions && (
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(col.sortable && "cursor-pointer select-none")}
                  onClick={() => col.sortable && onSortChange?.(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortBy === col.key ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : col.sortable ? (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                    ) : null}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (bulkActions ? 2 : 1)}
                  className="h-48 text-center"
                >
                  {emptyState ? (
                    <div className="flex flex-col items-center gap-3">
                      {emptyState.icon}
                      <h3 className="text-lg font-semibold">{emptyState.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {emptyState.description}
                      </p>
                      {emptyState.action && (
                        <Button onClick={emptyState.action.onClick}>
                          {emptyState.action.label}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No results found.</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const id = rowKey(item);
                return (
                  <TableRow
                    key={id}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      selectedIds.has(id) && "bg-primary/5"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {bulkActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(id)}
                          onCheckedChange={() => toggleRow(id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render
                          ? col.render(item)
                          : (item[col.key] as React.ReactNode)}
                      </TableCell>
                    ))}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Stats Cards

```tsx
// components/shared/StatsCard.tsx
"use client";

import { Card, CardContent } from "@/lib/ui-exports";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({ icon, label, value, trend, className }: StatsCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Status Badge

```tsx
// components/shared/StatusBadge.tsx
import { Badge } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  published: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  draft: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  archived: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400",
  pending: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  error: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  deleted: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        statusStyles[status.toLowerCase()] ?? statusStyles.inactive,
        className
      )}
    >
      {status}
    </Badge>
  );
}
```

#### Avatar with Fallback

```tsx
// components/ui/Avatar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `oklch(0.65 0.15 ${hue})`;
}

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-full", sizes[size], className)}>
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className
      )}
      style={{ backgroundColor: stringToColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}
```

#### Empty State

```tsx
// components/shared/EmptyState.tsx
import { Button } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16", className)}>
      <div className="rounded-xl bg-muted p-4 text-muted-foreground">{icon}</div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

---

### FORM & INPUT COMPONENTS

#### Form with React Hook Form + Zod

```tsx
// Example: Product Create Form
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Input,
  Textarea,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/ui-exports";
import { toast } from "sonner";

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0).optional(),
  status: z.enum(["active", "draft", "archived"]),
  trackInventory: z.boolean().default(false),
  quantity: z.number().int().min(0).optional(),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isEditing?: boolean;
}

export function ProductForm({ defaultValues, onSubmit, isEditing }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "draft",
      trackInventory: false,
      ...defaultValues,
    },
  });

  const trackInventory = watch("trackInventory");

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register("title").onChange(e);
    if (!isEditing) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", slug);
    }
  };

  const submit = async (data: ProductFormValues) => {
    try {
      await onSubmit(data);
      toast.success(isEditing ? "Product updated" : "Product created");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Two-column layout: Main content + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  onChange={handleTitleChange}
                  placeholder="Product title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/products/</span>
                  <Input
                    id="slug"
                    {...register("slug")}
                    placeholder="product-slug"
                    className="font-mono"
                  />
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Product description..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      {...register("compareAtPrice", { valueAsNumber: true })}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track inventory</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable stock tracking for this product
                  </p>
                </div>
                <Switch
                  checked={trackInventory}
                  onCheckedChange={(checked) => setValue("trackInventory", checked)}
                />
              </div>

              {trackInventory && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" {...register("sku")} placeholder="SKU-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register("quantity", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ProductFormValues["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
```

#### File Upload with Drag-Drop

```tsx
// components/shared/FileUpload.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, File, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onUpload: (files: File[]) => Promise<void>;
  className?: string;
}

export function FileUpload({
  accept = "image/*",
  multiple = true,
  maxSizeMB = 10,
  onUpload,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size <= maxSizeMB * 1024 * 1024
      );

      if (files.length > 0) {
        setUploading(true);
        try {
          await onUpload(files);
        } finally {
          setUploading(false);
          setProgress(0);
        }
      }
    },
    [maxSizeMB, onUpload]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploading(true);
      try {
        await onUpload(files);
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8",
        "transition-colors duration-200",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
          {progress > 0 && (
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drag and drop files here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse (max {maxSizeMB}MB per file)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose Files
          </Button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
```

#### Rich Text Editor (TipTap)

```tsx
// components/shared/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { Button, Separator } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
      Image,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isActive && "bg-muted text-foreground")}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
```

#### Code Editor (Monaco — Lazy Loaded)

```tsx
// components/shared/CodeEditor.tsx
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/lib/ui-exports";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "css",
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          readOnly,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "gutter",
          folding: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
```

#### Color Picker (oklch)

```tsx
// components/shared/ColorPicker.tsx
"use client";

import { useState, useCallback } from "react";
import { Input, Label, Popover, PopoverTrigger, PopoverContent } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  format?: "hex" | "oklch" | "hsl";
}

export function ColorPicker({
  value,
  onChange,
  label,
  format = "oklch",
}: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-lg border border-border bg-card px-3",
              "transition-colors hover:border-muted-foreground/50"
            )}
          >
            <div
              className="h-6 w-6 shrink-0 rounded border border-border"
              style={{ backgroundColor: localValue }}
            />
            <span className="truncate font-mono text-sm text-foreground">
              {localValue}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3" align="start">
          {/* Native color input for hex picking */}
          <input
            type="color"
            value={localValue.startsWith("#") ? localValue : "#6366f1"}
            onChange={(e) => handleChange(e.target.value)}
            className="h-32 w-full cursor-pointer rounded border-0 bg-transparent p-0"
          />

          {/* Manual input */}
          <div className="space-y-2">
            <Label className="text-xs">Value ({format})</Label>
            <Input
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="font-mono text-sm"
              placeholder={
                format === "oklch"
                  ? "oklch(0.65 0.15 270)"
                  : format === "hsl"
                    ? "hsl(240 60% 50%)"
                    : "#6366f1"
              }
            />
          </div>

          {/* Preset swatches */}
          <div>
            <Label className="text-xs">Presets</Label>
            <div className="mt-1.5 grid grid-cols-8 gap-1.5">
              {[
                "#ef4444", "#f97316", "#eab308", "#22c55e",
                "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
                "#f43f5e", "#d946ef", "#14b8a6", "#84cc16",
                "#0ea5e9", "#6366f1", "#a855f7", "#000000",
              ].map((color) => (
                <button
                  key={color}
                  className={cn(
                    "h-6 w-6 rounded border border-border",
                    "transition-transform hover:scale-110",
                    localValue === color && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange(color)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

#### Tag Input

```tsx
// components/shared/TagInput.tsx
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input, Badge } from "@/lib/ui-exports";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  suggestions = [],
  className,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-border bg-card px-3 py-2",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="rounded-sm hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
          {filtered.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              className="w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### NAVIGATION & LAYOUT COMPONENTS

#### Page Header

```tsx
// components/shared/PageHeader.tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@/lib/ui-exports";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => (
              <BreadcrumbItem key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

#### Command Palette

```tsx
// components/shared/CommandPalette.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Dialog,
  DialogContent,
} from "@/lib/ui-exports";
import {
  LayoutDashboard,
  Package,
  FileText,
  Image,
  Settings,
  Search,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  storeSlug: string;
}

export function CommandPalette({ storeSlug }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = (path: string) => {
    router.push(`/store/${storeSlug}${path}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-lg">
        <Command className="bg-transparent">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => navigate("")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => navigate("/products")}>
                <Package className="mr-2 h-4 w-4" />
                Products
              </CommandItem>
              <CommandItem onSelect={() => navigate("/content/posts")}>
                <FileText className="mr-2 h-4 w-4" />
                Posts
              </CommandItem>
              <CommandItem onSelect={() => navigate("/media")}>
                <Image className="mr-2 h-4 w-4" />
                Media Library
              </CommandItem>
              <CommandItem onSelect={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => navigate("/products/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </CommandItem>
              <CommandItem onSelect={() => navigate("/content/posts/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                Toggle Theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

#### Confirmation Dialog

```tsx
// components/shared/ConfirmDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/lib/ui-exports";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### MEDIA COMPONENTS

#### Media Library

```tsx
// components/media/MediaLibrary.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Card,
  Checkbox,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/lib/ui-exports";
import {
  Search,
  Upload,
  Grid3X3,
  List,
  Folder,
  Image as ImageIcon,
  File,
  Film,
  Trash2,
  Download,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/shared/FileUpload";
import { useMedia } from "@/hooks/useMedia";

interface MediaLibraryProps {
  storeId: string;
  selectable?: boolean;
  multiple?: boolean;
  onSelect?: (items: MediaItem[]) => void;
  accept?: string;
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  folderId?: string;
  createdAt: string;
}

export function MediaLibrary({
  storeId,
  selectable = false,
  multiple = false,
  onSelect,
  accept,
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading, mutate } = useMedia(storeId, {
    search,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const items: MediaItem[] = data?.items ?? [];

  const toggleSelect = useCallback(
    (item: MediaItem) => {
      if (!selectable) return;
      setSelectedItems((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          if (!multiple) next.clear();
          next.add(item.id);
        }
        return next;
      });
    },
    [selectable, multiple]
  );

  const handleConfirmSelection = () => {
    const selected = items.filter((i) => selectedItems.has(i.id));
    onSelect?.(selected);
  };

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    await fetch(`/api/stores/${storeId}/media`, {
      method: "POST",
      body: formData,
    });

    mutate();
    setShowUpload(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />;
    if (mimeType.startsWith("video/")) return <Film className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3X3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setShowUpload(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Upload area (toggleable) */}
      {showUpload && (
        <FileUpload
          accept={accept ?? "image/*,video/*,application/pdf"}
          multiple
          maxSizeMB={50}
          onUpload={handleUpload}
        />
      )}

      {/* Grid view */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-lg border bg-card",
                  "transition-all hover:border-primary/50 hover:shadow-sm",
                  isSelected && "border-primary ring-2 ring-primary/30"
                )}
                onClick={() => toggleSelect(item)}
              >
                <div className="relative aspect-square bg-muted">
                  {item.mimeType.startsWith("image/") ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      {getFileIcon(item.mimeType)}
                    </div>
                  )}

                  {/* Selection overlay */}
                  {selectable && (
                    <div
                      className={cn(
                        "absolute inset-0 flex items-start justify-end p-2",
                        "bg-black/0 transition-colors group-hover:bg-black/20",
                        isSelected && "bg-black/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border-2",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white bg-black/30"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="truncate text-xs font-medium">{item.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="rounded-lg border border-border">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 border-b border-border px-4 py-3 last:border-0",
                "cursor-pointer hover:bg-muted/50",
                selectedItems.has(item.id) && "bg-primary/5"
              )}
              onClick={() => toggleSelect(item)}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                {item.mimeType.startsWith("image/") ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.filename}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {getFileIcon(item.mimeType)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {item.mimeType} — {(item.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Selection footer */}
      {selectable && selectedItems.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
          </span>
          <Button onClick={handleConfirmSelection}>
            Insert Selected
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 4. STYLING SYSTEM

### oklch Color System

BulifyCMS uses oklch colors defined as CSS variables. All color tokens live in `globals.css` inside a `@theme` block for Tailwind CSS 4.

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Light mode (default) */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.546 0.245 262.88);
  --color-primary-foreground: oklch(0.985 0.001 286.37);
  --color-secondary: oklch(0.97 0.001 286.37);
  --color-secondary-foreground: oklch(0.205 0.015 286.07);
  --color-muted: oklch(0.97 0.001 286.37);
  --color-muted-foreground: oklch(0.556 0.015 286.07);
  --color-accent: oklch(0.97 0.001 286.37);
  --color-accent-foreground: oklch(0.205 0.015 286.07);
  --color-destructive: oklch(0.577 0.245 27.33);
  --color-destructive-foreground: oklch(0.985 0.001 286.37);
  --color-border: oklch(0.922 0.004 286.32);
  --color-input: oklch(0.922 0.004 286.32);
  --color-ring: oklch(0.546 0.245 262.88);

  /* Sidebar tokens */
  --color-sidebar: oklch(0.985 0.001 286.37);
  --color-sidebar-foreground: oklch(0.145 0 0);
  --color-sidebar-border: oklch(0.922 0.004 286.32);
  --color-sidebar-accent: oklch(0.97 0.001 286.37);
  --color-sidebar-accent-foreground: oklch(0.205 0.015 286.07);

  /* Radius */
  --radius: 0.625rem;
}

/* Dark mode overrides */
.dark {
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0.001 286.37);
  --color-card: oklch(0.205 0.015 286.07);
  --color-card-foreground: oklch(0.985 0.001 286.37);
  --color-popover: oklch(0.205 0.015 286.07);
  --color-popover-foreground: oklch(0.985 0.001 286.37);
  --color-primary: oklch(0.623 0.214 259.53);
  --color-primary-foreground: oklch(0.985 0.001 286.37);
  --color-secondary: oklch(0.269 0.015 286.07);
  --color-secondary-foreground: oklch(0.985 0.001 286.37);
  --color-muted: oklch(0.269 0.015 286.07);
  --color-muted-foreground: oklch(0.711 0.015 286.07);
  --color-accent: oklch(0.269 0.015 286.07);
  --color-accent-foreground: oklch(0.985 0.001 286.37);
  --color-destructive: oklch(0.577 0.245 27.33);
  --color-destructive-foreground: oklch(0.985 0.001 286.37);
  --color-border: oklch(0.333 0.015 286.07);
  --color-input: oklch(0.333 0.015 286.07);
  --color-ring: oklch(0.623 0.214 259.53);

  --color-sidebar: oklch(0.175 0.015 286.07);
  --color-sidebar-foreground: oklch(0.985 0.001 286.37);
  --color-sidebar-border: oklch(0.333 0.015 286.07);
}
```

### Tailwind Class Usage

Always use the semantic tokens in Tailwind classes:

```tsx
// DO THIS:
<div className="bg-background text-foreground border-border" />
<div className="bg-card text-card-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-destructive text-destructive-foreground" />

// NEVER hard-code colors:
// <div className="bg-gray-900 text-white" /> ← WRONG
```

### cn() Utility Pattern

```tsx
import { cn } from "@/lib/utils";

// Merging conditional classes
<div className={cn(
  "rounded-lg border bg-card p-4",
  isActive && "border-primary bg-primary/5",
  isDisabled && "pointer-events-none opacity-50"
)} />
```

### Class Variance Authority (CVA)

Use CVA for component variants when building custom components:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function CustomButton({ className, variant, size, ...props }: CustomButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

### Custom Animations

```css
/* Used by @webdevarif/dashui components */
@keyframes dashui-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes dashui-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dashui-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 5. DATA FETCHING PATTERNS

### SWR Hook Pattern

Every data entity has a dedicated SWR hook:

```tsx
// hooks/useProducts.ts
"use client";

import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseProductsOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useProducts(storeId: string, options: UseProductsOptions = {}) {
  const { search, status, page = 1, limit = 20, sortBy, sortOrder } = options;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (sortBy) params.set("sortBy", sortBy);
  if (sortOrder) params.set("sortOrder", sortOrder);

  const key = `/api/stores/${storeId}/products?${params.toString()}`;

  return useSWR<{
    data: Product[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
}

export function useProduct(storeId: string, productId: string) {
  return useSWR<{ data: Product }>(
    productId ? `/api/stores/${storeId}/products/${productId}` : null,
    fetcher
  );
}
```

### Debounced Search

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage in a list page:
function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useProducts(storeId, {
    search: debouncedSearch,
    page,
    limit: pageSize,
  });

  // ...
}
```

### Optimistic Updates

```tsx
// hooks/useUpdateProduct.ts
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

async function updateProduct(
  url: string,
  { arg }: { arg: Partial<Product> }
) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export function useUpdateProduct(storeId: string, productId: string) {
  return useSWRMutation(
    `/api/stores/${storeId}/products/${productId}`,
    updateProduct,
    {
      onSuccess: () => toast.success("Product updated"),
      onError: () => toast.error("Failed to update product"),
      // Optimistic: update local cache immediately
      optimisticData: (current: any, arg: any) => ({
        ...current,
        data: { ...current?.data, ...arg },
      }),
      rollbackOnError: true,
    }
  );
}
```

### Loading Skeletons

```tsx
// components/shared/ProductListSkeleton.tsx
import { Skeleton } from "@/lib/ui-exports";

export function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="ml-auto h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. FORM PATTERNS

### Standard Form Layout

```tsx
// Two-column: Main content (left) + Sidebar info (right)
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
  {/* Main column */}
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle>Section Title</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Form fields */}
      </CardContent>
    </Card>
  </div>

  {/* Sidebar column */}
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle>Status</CardTitle></CardHeader>
      <CardContent>{/* Status select, publish date, etc. */}</CardContent>
    </Card>
  </div>
</div>
```

### Zod Schema Patterns

```tsx
import { z } from "zod";

// Post schema
export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().optional(),
  excerpt: z.string().max(300, "Excerpt too long").optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["published", "draft", "archived"]),
  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.coerce.date().optional(),
  seo: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      ogImage: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

export type PostFormValues = z.infer<typeof postSchema>;

// Product schema with nested variants
export const productSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  status: z.enum(["active", "draft", "archived"]),
  images: z.array(z.string().url()).optional(),
  variants: z
    .array(
      z.object({
        title: z.string().min(1),
        price: z.number().min(0),
        sku: z.string().optional(),
        inventory: z.number().int().min(0).default(0),
      })
    )
    .optional(),
});
```

### Unsaved Changes Warning

```tsx
// hooks/useUnsavedChanges.ts
"use client";

import { useEffect } from "react";

export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}

// Usage:
function PostEditor() {
  const { formState: { isDirty } } = useForm<PostFormValues>({ /* ... */ });
  useUnsavedChanges(isDirty);
  // ...
}
```

---

## 7. AUTHENTICATION & AUTHORIZATION

### NextAuth Configuration

```tsx
// lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.hashedPassword) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // SUPER_ADMIN | ADMIN | USER
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

### Middleware — Protected Routes

```tsx
// middleware.ts
import { auth } from "@/lib/auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "bn"],
  defaultLocale: "en",
});

const publicPaths = ["/login", "/register", "/forgot-password", "/verify-email"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if public path
  const isPublic = publicPaths.some((p) => pathname.includes(p));

  if (!isPublic) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### Role-Based Access in API Routes

```tsx
// Utility: check store membership and role
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type StoreRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export async function requireStoreRole(
  storeId: string,
  minRole: StoreRole
): Promise<{ userId: string; role: StoreRole } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Super admins bypass store-level checks
  if (session.user.role === "SUPER_ADMIN") {
    return { userId: session.user.id, role: "OWNER" };
  }

  const membership = await prisma.storeMember.findUnique({
    where: {
      storeId_userId: { storeId, userId: session.user.id },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hierarchy: StoreRole[] = ["VIEWER", "EDITOR", "ADMIN", "OWNER"];
  const userLevel = hierarchy.indexOf(membership.role as StoreRole);
  const requiredLevel = hierarchy.indexOf(minRole);

  if (userLevel < requiredLevel) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return { userId: session.user.id, role: membership.role as StoreRole };
}
```

### Permission Check in UI

```tsx
// hooks/useStoreRole.ts
"use client";

import useSWR from "swr";

type StoreRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export function useStoreRole(storeId: string) {
  const { data } = useSWR<{ role: StoreRole }>(
    `/api/stores/${storeId}/membership`,
    (url) => fetch(url).then((r) => r.json())
  );

  const role = data?.role;

  return {
    role,
    isOwner: role === "OWNER",
    isAdmin: role === "OWNER" || role === "ADMIN",
    isEditor: role === "OWNER" || role === "ADMIN" || role === "EDITOR",
    canEdit: role !== "VIEWER",
    canDelete: role === "OWNER" || role === "ADMIN",
    canManageMembers: role === "OWNER" || role === "ADMIN",
  };
}

// Usage:
function ProductActions({ storeId, productId }: { storeId: string; productId: string }) {
  const { canEdit, canDelete } = useStoreRole(storeId);

  return (
    <div className="flex gap-2">
      {canEdit && <Button>Edit</Button>}
      {canDelete && <Button variant="destructive">Delete</Button>}
    </div>
  );
}
```

---

## 8. MULTI-TENANT ARCHITECTURE

### Routing Structure

```
/store/[slug]/                    → Store dashboard overview
/store/[slug]/products            → Product list
/store/[slug]/products/new        → Create product
/store/[slug]/products/[id]       → Edit product
/store/[slug]/content/posts       → Post list
/store/[slug]/content/posts/new   → Create post
/store/[slug]/content/pages       → Page list
/store/[slug]/media               → Media library
/store/[slug]/online-store/themes/[themeId]/editor → Theme builder
/store/[slug]/settings            → Store settings
/store/[slug]/settings/members    → Team management
```

### Store Context Provider

```tsx
// components/providers/StoreProvider.tsx
"use client";

import { createContext, useContext } from "react";

interface StoreContext {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: string;
}

const StoreCtx = createContext<StoreContext | null>(null);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreContext;
  children: React.ReactNode;
}) {
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreContext {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
```

### API Data Isolation

Every API route scopes queries to the store:

```tsx
// app/api/stores/[id]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreRole } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const roleCheck = await requireStoreRole(storeId, "VIEWER");
  if (roleCheck instanceof NextResponse) return roleCheck;

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");

  const where = {
    storeId, // Always scope to store
    ...(search && {
      title: { contains: search, mode: "insensitive" as const },
    }),
    ...(status && status !== "all" && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const roleCheck = await requireStoreRole(storeId, "EDITOR");
  if (roleCheck instanceof NextResponse) return roleCheck;

  const body = await req.json();

  // Validate with Zod
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, storeId },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
```

### Store Switching

```tsx
// components/shared/StoreSwitcher.tsx
"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/lib/ui-exports";
import { useStore } from "@/components/providers/StoreProvider";
import { Store as StoreIcon, Plus } from "lucide-react";

export function StoreSwitcher() {
  const router = useRouter();
  const currentStore = useStore();
  const { data } = useSWR<{ data: { id: string; name: string; slug: string }[] }>(
    "/api/stores",
    (url) => fetch(url).then((r) => r.json())
  );

  const stores = data?.data ?? [];

  return (
    <Select
      value={currentStore.slug}
      onValueChange={(slug) => router.push(`/store/${slug}`)}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <StoreIcon className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
          <SelectItem key={store.slug} value={store.slug}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## 9. API DESIGN PATTERNS

### Standard Response Format

```tsx
// Success with data
{ data: T }

// Success with list + pagination
{
  data: T[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}

// Error
{
  error: string,
  details?: Record<string, string[]>  // Zod field errors
}
```

### Route Handler Template

```tsx
// app/api/stores/[id]/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreRole } from "@/lib/auth-helpers";
import { z } from "zod";

// GET list
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const roleCheck = await requireStoreRole(storeId, "VIEWER");
  if (roleCheck instanceof NextResponse) return roleCheck;

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

    const [data, total] = await Promise.all([
      prisma.resource.findMany({
        where: { storeId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.resource.count({ where: { storeId } }),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const roleCheck = await requireStoreRole(storeId, "EDITOR");
  if (roleCheck instanceof NextResponse) return roleCheck;

  try {
    const body = await req.json();
    const parsed = resourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: { ...parsed.data, storeId },
    });

    return NextResponse.json({ data: resource }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Single Resource Route

```tsx
// app/api/stores/[id]/[resource]/[resourceId]/route.ts

// GET single
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  const { id: storeId, resourceId } = await params;
  const roleCheck = await requireStoreRole(storeId, "VIEWER");
  if (roleCheck instanceof NextResponse) return roleCheck;

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId, storeId }, // Always scope to store
  });

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: resource });
}

// PATCH update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  const { id: storeId, resourceId } = await params;
  const roleCheck = await requireStoreRole(storeId, "EDITOR");
  if (roleCheck instanceof NextResponse) return roleCheck;

  const body = await req.json();
  const parsed = resourceSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.update({
    where: { id: resourceId, storeId },
    data: parsed.data,
  });

  return NextResponse.json({ data: resource });
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  const { id: storeId, resourceId } = await params;
  const roleCheck = await requireStoreRole(storeId, "ADMIN");
  if (roleCheck instanceof NextResponse) return roleCheck;

  await prisma.resource.delete({
    where: { id: resourceId, storeId },
  });

  return NextResponse.json({ data: { deleted: true } });
}
```

---

## 10. PERFORMANCE PATTERNS

### React Server Components by Default

```tsx
// Server Component (default) — no "use client" directive
// app/[locale]/(stores)/store/[slug]/products/page.tsx
import { prisma } from "@/lib/prisma";
import { ProductListClient } from "./ProductListClient";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });

  // Fetch initial data server-side for instant render
  const products = await prisma.product.findMany({
    where: { storeId: store!.id },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.product.count({ where: { storeId: store!.id } });

  return (
    <ProductListClient
      storeId={store!.id}
      initialData={{ data: products, pagination: { total, page: 1, limit: 20, totalPages: Math.ceil(total / 20) } }}
    />
  );
}
```

### Lazy Loading Heavy Components

```tsx
import dynamic from "next/dynamic";
import { Skeleton } from "@/lib/ui-exports";

// TipTap editor — only loaded when needed
const RichTextEditor = dynamic(
  () => import("@/components/shared/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
  }
);

// Monaco editor — heavy, always lazy
const CodeEditor = dynamic(
  () => import("@/components/shared/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
  }
);

// Media library — loads on demand
const MediaLibrary = dynamic(
  () => import("@/components/media/MediaLibrary").then((m) => m.MediaLibrary),
  { loading: () => <Skeleton className="h-96 w-full rounded-lg" /> }
);
```

### Image Optimization

```tsx
import Image from "next/image";

// Always use Next.js Image for dashboard images
<Image
  src={product.imageUrl}
  alt={product.title}
  width={80}
  height={80}
  className="rounded-lg object-cover"
  sizes="80px"
/>

// For thumbnail grids
<Image
  src={media.thumbnailUrl}
  alt={media.filename}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
/>
```

### SWR Caching Strategy

```tsx
// Global SWR config
// app/providers.tsx
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,        // Don't refetch on tab focus
        revalidateOnReconnect: true,     // Refetch on reconnect
        dedupingInterval: 5000,          // Dedup same requests within 5s
        errorRetryCount: 3,              // Retry failed requests 3 times
        keepPreviousData: true,          // Keep stale data while revalidating
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

---

## 11. DASHBOARD FEATURE CHECKLIST

When building ANY new dashboard feature, verify EVERY item:

### Core Views
- [ ] **List view** — table or grid with proper columns, responsive
- [ ] **Create form** — all required fields, validation, proper layout
- [ ] **Edit form** — pre-populated, same validation as create
- [ ] **Detail view** — read-only display with all relevant data
- [ ] **Delete** — confirmation dialog, cascade warnings, success toast

### Search & Filter
- [ ] **Search** — debounced (300ms), by relevant text fields
- [ ] **Filter** — by status, category, date range, type
- [ ] **Sort** — by date, title, price, status (asc/desc toggle)
- [ ] **Pagination** — page numbers, per-page selector, total count

### Bulk Operations
- [ ] **Bulk select** — checkbox per row + "select all" header
- [ ] **Bulk delete** — confirmation with count
- [ ] **Bulk status change** — dropdown with new status options
- [ ] **Selection bar** — shows count + available actions

### States
- [ ] **Loading** — skeleton matching exact layout of loaded state
- [ ] **Empty** — illustration + title + description + CTA button
- [ ] **Error** — error message + retry button
- [ ] **No results** — "No results for [query]" + clear filters link

### Navigation
- [ ] **Breadcrumbs** — dynamic, based on current route
- [ ] **Page header** — title, description, action buttons
- [ ] **Back button** — where contextually appropriate

### Feedback
- [ ] **Toast notifications** — success/error for every mutation
- [ ] **Loading indicators** — button loading state during submission
- [ ] **Unsaved changes** — browser warning on navigation when form is dirty
- [ ] **Validation errors** — inline field errors from Zod

### Responsiveness
- [ ] **Mobile** — stacked layout, hamburger sidebar, touch targets >= 44px
- [ ] **Tablet** — adapted grid, collapsible sidebar
- [ ] **Desktop** — full layout with sidebar expanded

### Accessibility
- [ ] **Keyboard navigation** — Tab through all interactive elements
- [ ] **Screen reader** — aria-labels on icon-only buttons
- [ ] **Focus management** — focus trap in dialogs, return focus on close
- [ ] **Color contrast** — WCAG AA minimum (4.5:1 for text)

### Security
- [ ] **Permission checks** — UI hides unauthorized actions
- [ ] **API authorization** — server-side role checks on every endpoint
- [ ] **Input sanitization** — Zod validation on both client and server

---

## 12. GOLDEN RULES

1. **Server Components first.** Every component is a React Server Component unless it needs interactivity (useState, useEffect, event handlers, browser APIs). Add `"use client"` only when required.

2. **Import UI from `@/lib/ui-exports`.** Never import directly from `@webdevarif/dashui` in feature code. The re-export hub is the single source of truth.

3. **Use `cn()` for all dynamic classes.** Never concatenate strings manually. Always `cn("base-classes", condition && "conditional-class")`.

4. **oklch tokens only.** Use Tailwind semantic classes (`bg-background`, `text-foreground`, `border-border`). Never hard-code hex or RGB colors in component code.

5. **SWR for all client-side data.** Never use `useEffect` + `fetch` for data fetching. Use SWR hooks with proper error handling, loading states, and cache keys.

6. **Zod validates everything.** Every form uses React Hook Form with `zodResolver`. Every API route validates input with Zod before touching the database.

7. **Scope all queries to store.** Every Prisma query in a store context MUST include `storeId` in the `where` clause. No exceptions. Data leakage between tenants is a critical vulnerability.

8. **Toast every mutation.** Success and error feedback via Sonner for every create, update, and delete operation. Users must always know what happened.

9. **Lazy load heavy editors.** TipTap, Monaco, and MediaLibrary are loaded with `dynamic()` and `ssr: false`. They are too large for initial bundle.

10. **Skeleton before data.** Every list and detail view has a matching skeleton loading state. Never show a blank page or a spinner without layout context.

11. **Permission-gate the UI.** Use `useStoreRole()` to conditionally render edit/delete buttons. Never show actions the user cannot perform.

12. **Debounce search inputs.** All search inputs use a 300ms debounce before triggering API calls. Never fire on every keystroke.

13. **Two-column form layout.** Forms with sidebar info (status, publish date, category) use `grid-cols-[1fr_340px]` on large screens, stacking on mobile.

14. **Breadcrumbs on every page.** Use the PageHeader component with breadcrumbs derived from the current route. Users must always know where they are.

15. **Result objects, not exceptions.** API routes return structured responses (`{ data }` or `{ error }`) with proper HTTP status codes. Never rely on try/catch for control flow in the client.
