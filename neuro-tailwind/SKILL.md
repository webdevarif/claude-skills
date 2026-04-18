---
name: neuro-tailwind
description: Tailwind CSS expert - v3 & v4, responsive design, dark mode, animations, custom themes, oklch/HSL color systems, fluid typography, component patterns, performance optimization, and utility-first best practices for any project
trigger: auto
globs:
  - "**/*.css"
  - "**/*.scss"
  - "**/tailwind.config.*"
  - "**/postcss.config.*"
  - "**/globals.css"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.liquid"
  - "**/*.html"
  - "**/*.php"
---

# Tailwind CSS Expert Skill

You are a Tailwind CSS expert covering v3 and v4. You MUST write correct, production-ready utility classes. NEVER guess at class names — use only what exists in the framework. ALWAYS design mobile-first. ALWAYS use semantic color tokens over hardcoded values.

---

## 1. Tailwind v3 vs v4 Differences

### How to Detect Which Version

```bash
# Check package.json
grep "tailwindcss" package.json
# v3: "tailwindcss": "^3.x.x" — uses tailwind.config.js
# v4: "tailwindcss": "^4.x.x" — uses CSS-first config

# Check CSS entry point
# v3: @tailwind base; @tailwind components; @tailwind utilities;
# v4: @import "tailwindcss";
```

### v4 CSS-First Configuration (replaces tailwind.config.js)

```css
/* v4: globals.css — single import, CSS-first config */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.541 0.0844 180.2);
  --color-secondary: oklch(0.637 0.237 25.33);
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --breakpoint-3xl: 120rem;
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

```js
/* v3: tailwind.config.js — JavaScript config */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        secondary: "#10b981",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### Key Differences Table

| Feature | v3 | v4 |
|---|---|---|
| Config file | `tailwind.config.js` (required) | `@theme {}` in CSS (JS optional) |
| CSS entry | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Content detection | Manual `content: [...]` array | Automatic (no config needed) |
| Color space | rgb | oklch (wider gamut) |
| Custom variants | `addVariant()` in JS plugin | `@custom-variant` in CSS |
| Custom utilities | `addUtilities()` in JS plugin | `@utility` in CSS |
| Cascade layers | Emulated | Native CSS `@layer` |
| Container queries | Plugin required | Built-in (`@container`, `@sm`, `@lg`) |
| CSS nesting | Not native | Native support |
| PostCSS | Required | Built-in (Lightning CSS) |
| Class renames | `bg-gradient-to-r` | `bg-linear-to-r` |
| Class renames | `flex-shrink-0` | `shrink-0` |
| Class renames | `flex-grow` | `grow` |
| Performance | ~350ms full builds | ~70ms full, microsecond incremental |
| Browser target | Broad | Safari 16.4+, Chrome 111+, Firefox 128+ |

### v3 Patterns (still valid for existing projects)

v3 projects use `tailwind.config.js` with `content`, `theme.extend`, `darkMode`, and `plugins` arrays. All v3 utility class names work — v4 just adds canonical aliases. Do NOT migrate a stable v3 project unless there is a clear benefit. Use `npx @tailwindcss/upgrade` for automated migration.

---

## 2. Color Systems

### HSL System (shadcn/ui pattern)

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --ring: 262.1 83.3% 57.8%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 263.4 70% 50.4%;
  --primary-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --ring: 263.4 70% 50.4%;
}
```

```js
/* tailwind.config.js (v3 with HSL) */
theme: {
  extend: {
    colors: {
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      border: "hsl(var(--border))",
      ring: "hsl(var(--ring))",
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  },
}
```

### oklch System (modern, Tailwind v4 default)

```css
/* v4 CSS-first with oklch */
@import "tailwindcss";

:root {
  --color-bg: oklch(1 0 0);
  --color-fg: oklch(0.145 0.017 285.82);
  --color-primary: oklch(0.541 0.183 263.83);
  --color-primary-fg: oklch(0.969 0.006 264.53);
  --color-accent: oklch(0.551 0.194 150.12);
  --color-destructive: oklch(0.577 0.245 27.33);
  --color-muted: oklch(0.554 0.015 264.36);
  --color-border: oklch(0.839 0.012 264.36);
}

.dark {
  --color-bg: oklch(0.145 0.017 285.82);
  --color-fg: oklch(0.969 0.006 264.53);
  --color-primary: oklch(0.623 0.214 263.83);
  --color-accent: oklch(0.601 0.213 150.12);
  --color-destructive: oklch(0.627 0.265 27.33);
  --color-muted: oklch(0.354 0.025 264.36);
  --color-border: oklch(0.274 0.019 264.36);
}

@theme {
  --color-bg: var(--color-bg);
  --color-fg: var(--color-fg);
  --color-primary: var(--color-primary);
  --color-primary-fg: var(--color-primary-fg);
  --color-accent: var(--color-accent);
  --color-destructive: var(--color-destructive);
  --color-muted: var(--color-muted);
  --color-border: var(--color-border);
}
```

### Hex System (simple projects)

```js
/* v3 tailwind.config.js */
colors: {
  primary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
}
```

### Semantic Color Naming Convention

ALWAYS use semantic names, not literal colors:

| Token | Purpose | Example |
|---|---|---|
| `primary` | Brand action color | Buttons, links, focus rings |
| `secondary` | Supporting color | Secondary buttons, tags |
| `accent` | Highlight/emphasis | Badges, active nav items |
| `destructive` | Danger/delete actions | Delete buttons, error states |
| `muted` | Subtle backgrounds/text | Disabled states, placeholders |
| `background` | Page background | Body, card backgrounds |
| `foreground` | Primary text | Headings, body text |
| `border` | Border color | Dividers, card borders |
| `ring` | Focus ring | Input focus, button focus |

### When to Use Which System

- **HSL**: Use for shadcn/ui projects, v3 projects, or when you need easy lightness manipulation
- **oklch**: Use for v4 projects, modern browsers, when you need perceptually uniform colors and wider gamut
- **Hex**: Use for simple projects, Shopify themes, WordPress, or when color manipulation is not needed

---

## 3. Dark Mode

### v3: Class-Based Dark Mode

```js
/* tailwind.config.js */
module.exports = {
  darkMode: "class", // or "media" for OS preference
  // ...
};
```

### v4: Custom Variant Dark Mode

```css
/* Class-based (data attribute) */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* Class-based (class on html) */
@custom-variant dark (&:where(.dark, .dark *));

/* Media-based (OS preference) — this is the v4 default, no config needed */
/* dark: utilities automatically use @media (prefers-color-scheme: dark) */
```

### Implementation with next-themes

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### CSS Variable Switching Pattern

```css
:root {
  --color-bg: oklch(1 0 0);
  --color-fg: oklch(0.145 0.017 285.82);
  --color-card: oklch(0.985 0.002 264.36);
  --color-card-fg: oklch(0.145 0.017 285.82);
}

.dark {
  --color-bg: oklch(0.145 0.017 285.82);
  --color-fg: oklch(0.969 0.006 264.53);
  --color-card: oklch(0.205 0.019 264.36);
  --color-card-fg: oklch(0.969 0.006 264.53);
}
```

Usage: `<div className="bg-bg text-fg">` — automatically switches between light and dark.

### Common Dark Mode Pitfalls

1. **Wrong selector specificity**: `.dark` class must be on `<html>` or a parent element, not on the element itself
2. **Missing dark variants**: Every color must have a `dark:` variant or use CSS variables that switch
3. **Hardcoded colors**: `bg-white` does not auto-switch — use `bg-background` or `bg-white dark:bg-gray-900`
4. **Images and shadows**: Shadows need reduction in dark mode, images may need `dark:brightness-90`
5. **Ring colors**: Focus rings on `ring-gray-300` are invisible in dark mode — add `dark:ring-gray-600`
6. **Third-party components**: Must pass dark mode classes through to child elements

---

## 4. Responsive Design

### Mobile-First Breakpoints

Default breakpoints (apply styles from this width UP):

| Prefix | Min-width | Target |
|---|---|---|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large phones/small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

ALWAYS start with mobile styles, then layer on larger breakpoints.

### Responsive Grid Pattern

```html
<!-- 1 col mobile → 2 col tablet → 3 col laptop → 4 col desktop -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
</div>
```

### Container Queries (v4 built-in, v3 plugin)

```html
<!-- v4: container queries respond to parent size, not viewport -->
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:grid @lg:grid-cols-3 gap-4">
    <div>Adapts to container width</div>
  </div>
</div>
```

### Fluid Typography with clamp()

```css
/* v4 @theme */
@theme {
  --text-fluid-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --text-fluid-base: clamp(1rem, 0.9rem + 0.4vw, 1.25rem);
  --text-fluid-lg: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
  --text-fluid-xl: clamp(1.5rem, 1.1rem + 1.2vw, 2.25rem);
  --text-fluid-2xl: clamp(2rem, 1.4rem + 1.8vw, 3rem);
  --text-fluid-hero: clamp(2.5rem, 1.5rem + 3vw, 4.5rem);
}
```

```html
<h1 class="text-fluid-hero font-bold">Scales smoothly</h1>
<p class="text-fluid-base">Body text that adapts</p>
```

```js
/* v3: extend in tailwind.config.js */
theme: {
  extend: {
    fontSize: {
      "fluid-sm": "clamp(0.875rem, 0.8rem + 0.25vw, 1rem)",
      "fluid-base": "clamp(1rem, 0.9rem + 0.4vw, 1.25rem)",
      "fluid-lg": "clamp(1.25rem, 1rem + 0.8vw, 1.75rem)",
      "fluid-xl": "clamp(1.5rem, 1.1rem + 1.2vw, 2.25rem)",
    },
  },
}
```

### Responsive Spacing

```html
<section class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-12 xl:py-20">
  <div class="mx-auto max-w-7xl">Content</div>
</section>
```

### Hide/Show Per Breakpoint

```html
<div class="block md:hidden">Mobile only</div>
<div class="hidden md:block lg:hidden">Tablet only</div>
<div class="hidden lg:block">Desktop only</div>
```

### Responsive Navigation Pattern

```html
<!-- Mobile: hamburger, Desktop: horizontal nav -->
<nav class="flex items-center justify-between px-4 py-3">
  <a href="/" class="text-lg font-bold">Logo</a>
  <!-- Mobile menu button -->
  <button class="lg:hidden" aria-label="Menu">
    <svg class="h-6 w-6"><!-- hamburger icon --></svg>
  </button>
  <!-- Desktop nav -->
  <ul class="hidden lg:flex lg:items-center lg:gap-6">
    <li><a href="/about" class="hover:text-primary">About</a></li>
    <li><a href="/work" class="hover:text-primary">Work</a></li>
    <li><a href="/contact" class="hover:text-primary">Contact</a></li>
  </ul>
</nav>
```

---

## 5. Layout Patterns

### Flexbox Patterns

```html
<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div>Centered</div>
</div>

<!-- Space between (header pattern) -->
<header class="flex items-center justify-between px-4 py-3">
  <div>Logo</div>
  <nav>Links</nav>
</header>

<!-- Stack (vertical list with gap) -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Inline row with wrap -->
<div class="flex flex-wrap gap-2">
  <span class="rounded-full bg-primary/10 px-3 py-1 text-sm">Tag 1</span>
  <span class="rounded-full bg-primary/10 px-3 py-1 text-sm">Tag 2</span>
</div>
```

### Grid Patterns

```html
<!-- Equal columns -->
<div class="grid grid-cols-3 gap-6">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>

<!-- Sidebar layout -->
<div class="grid grid-cols-[250px_1fr] min-h-screen">
  <aside class="border-r bg-muted/30 p-4">Sidebar</aside>
  <main class="p-6">Content</main>
</div>

<!-- Dashboard layout (sidebar + topbar + content) -->
<div class="grid grid-cols-[250px_1fr] grid-rows-[auto_1fr] min-h-screen">
  <aside class="row-span-2 border-r bg-muted/30 p-4">Sidebar</aside>
  <header class="border-b px-6 py-3">Topbar</header>
  <main class="overflow-y-auto p-6">Content</main>
</div>

<!-- Auto-fill responsive grid -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
  <div>Card (auto-wraps)</div>
  <div>Card</div>
  <div>Card</div>
</div>
```

### Full-Height Page

```html
<div class="flex min-h-screen flex-col">
  <header class="border-b px-4 py-3">Header</header>
  <main class="flex-1 p-6">Content grows to fill</main>
  <footer class="border-t px-4 py-3">Footer</footer>
</div>
```

### Sticky Header

```html
<header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
  <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
    <span>Logo</span>
    <nav>Links</nav>
  </div>
</header>
```

### Scrollable Area

```html
<div class="h-[400px] overflow-y-auto rounded-lg border">
  <div class="p-4">
    <!-- Long content scrolls inside the container -->
  </div>
</div>
```

### Aspect Ratio

```html
<div class="aspect-video overflow-hidden rounded-lg">
  <img src="..." alt="..." class="h-full w-full object-cover" />
</div>
<div class="aspect-square overflow-hidden rounded-full">
  <img src="..." alt="..." class="h-full w-full object-cover" />
</div>
```

---

## 6. Component Patterns

### Button

```html
<!-- Primary -->
<button class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
  Primary
</button>

<!-- Secondary -->
<button class="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80">
  Secondary
</button>

<!-- Outline -->
<button class="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
  Outline
</button>

<!-- Ghost -->
<button class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
  Ghost
</button>

<!-- Destructive -->
<button class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-destructive/90">
  Delete
</button>

<!-- Loading state -->
<button class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" disabled>
  <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24"><!-- spinner --></svg>
  Loading...
</button>

<!-- Size variants: sm / default / lg -->
<button class="h-8 rounded-md px-3 text-xs">Small</button>
<button class="h-10 rounded-md px-4 text-sm">Default</button>
<button class="h-12 rounded-md px-6 text-base">Large</button>
```

### Input

```html
<div class="flex flex-col gap-1.5">
  <label for="email" class="text-sm font-medium text-foreground">
    Email
  </label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  />
  <!-- Error state: add border-destructive ring-destructive -->
  <p class="text-sm text-destructive">Email is required</p>
</div>
```

### Card

```html
<div class="rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
  <div class="border-b border-border px-6 py-4">
    <h3 class="text-lg font-semibold text-card-foreground">Card Title</h3>
    <p class="text-sm text-muted-foreground">Card description</p>
  </div>
  <div class="px-6 py-4">
    <p class="text-foreground">Card content goes here.</p>
  </div>
  <div class="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
    <button class="rounded-md px-4 py-2 text-sm hover:bg-accent">Cancel</button>
    <button class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
  </div>
</div>
```

### Badge

```html
<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
  Active
</span>
<span class="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
  Success
</span>
<span class="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
  Pending
</span>
<span class="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
  Error
</span>
```

### Avatar

```html
<!-- Image avatar -->
<div class="h-10 w-10 overflow-hidden rounded-full">
  <img src="..." alt="User" class="h-full w-full object-cover" />
</div>

<!-- Fallback avatar -->
<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
  JD
</div>

<!-- Avatar group (stacked) -->
<div class="flex -space-x-3">
  <div class="h-8 w-8 overflow-hidden rounded-full ring-2 ring-background"><img src="..." alt="" class="h-full w-full object-cover" /></div>
  <div class="h-8 w-8 overflow-hidden rounded-full ring-2 ring-background"><img src="..." alt="" class="h-full w-full object-cover" /></div>
  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">+3</div>
</div>

<!-- Sizes: sm (h-8 w-8) / md (h-10 w-10) / lg (h-14 w-14) / xl (h-20 w-20) -->
```

### Table

```html
<div class="w-full overflow-x-auto rounded-lg border border-border">
  <table class="w-full text-left text-sm">
    <thead class="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
      <tr>
        <th class="px-4 py-3 font-medium">Name</th>
        <th class="px-4 py-3 font-medium">Email</th>
        <th class="px-4 py-3 font-medium">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 font-medium">John Doe</td>
        <td class="px-4 py-3 text-muted-foreground">john@example.com</td>
        <td class="px-4 py-3"><span class="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600">Active</span></td>
      </tr>
      <!-- Striped: add even:bg-muted/20 to <tr> -->
    </tbody>
  </table>
</div>
```

### Modal/Dialog

```html
<!-- Overlay -->
<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>
<!-- Dialog -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
    <h2 class="text-lg font-semibold">Dialog Title</h2>
    <p class="mt-2 text-sm text-muted-foreground">Dialog description.</p>
    <div class="mt-6 flex justify-end gap-2">
      <button class="rounded-md px-4 py-2 text-sm hover:bg-accent">Cancel</button>
      <button class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Confirm</button>
    </div>
  </div>
</div>
```

### Dropdown

```html
<div class="relative">
  <button class="flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent">
    Options
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
  </button>
  <!-- Dropdown menu -->
  <div class="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-background py-1 shadow-lg">
    <a href="#" class="block px-4 py-2 text-sm hover:bg-accent">Edit</a>
    <a href="#" class="block px-4 py-2 text-sm hover:bg-accent">Duplicate</a>
    <div class="my-1 h-px bg-border"></div>
    <a href="#" class="block px-4 py-2 text-sm text-destructive hover:bg-destructive/10">Delete</a>
  </div>
</div>
```

### Alert/Banner

```html
<!-- Info -->
<div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
  <svg class="mt-0.5 h-5 w-5 shrink-0 text-blue-600"><!-- info icon --></svg>
  <div>
    <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Information</p>
    <p class="mt-1 text-sm text-blue-700 dark:text-blue-300">This is an informational message.</p>
  </div>
</div>

<!-- Success: border-green-200 bg-green-50 text-green-800 -->
<!-- Warning: border-yellow-200 bg-yellow-50 text-yellow-800 -->
<!-- Error: border-red-200 bg-red-50 text-red-800 -->
```

### Skeleton Loading

```html
<div class="animate-pulse space-y-4">
  <div class="h-4 w-3/4 rounded bg-muted"></div>
  <div class="h-4 w-full rounded bg-muted"></div>
  <div class="h-4 w-5/6 rounded bg-muted"></div>
  <div class="flex items-center gap-4">
    <div class="h-12 w-12 rounded-full bg-muted"></div>
    <div class="flex-1 space-y-2">
      <div class="h-4 w-1/2 rounded bg-muted"></div>
      <div class="h-3 w-1/3 rounded bg-muted"></div>
    </div>
  </div>
</div>
```

### Empty State

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <svg class="mb-4 h-16 w-16 text-muted-foreground/50"><!-- illustration --></svg>
  <h3 class="text-lg font-semibold text-foreground">No results found</h3>
  <p class="mt-1 max-w-sm text-sm text-muted-foreground">
    Try adjusting your search or filters to find what you're looking for.
  </p>
  <button class="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
    Clear filters
  </button>
</div>
```

### Breadcrumbs

```html
<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground">
  <a href="/" class="hover:text-foreground">Home</a>
  <span>/</span>
  <a href="/products" class="hover:text-foreground">Products</a>
  <span>/</span>
  <span class="font-medium text-foreground">Widget Pro</span>
</nav>
```

### Pagination

```html
<nav class="flex items-center gap-1">
  <button class="h-9 w-9 rounded-md text-sm hover:bg-accent" disabled>&laquo;</button>
  <button class="h-9 w-9 rounded-md bg-primary text-sm text-primary-foreground">1</button>
  <button class="h-9 w-9 rounded-md text-sm hover:bg-accent">2</button>
  <button class="h-9 w-9 rounded-md text-sm hover:bg-accent">3</button>
  <span class="px-1">...</span>
  <button class="h-9 w-9 rounded-md text-sm hover:bg-accent">12</button>
  <button class="h-9 w-9 rounded-md text-sm hover:bg-accent">&raquo;</button>
</nav>
```

### Tooltip

```html
<div class="group relative inline-block">
  <button class="text-sm underline decoration-dotted">Hover me</button>
  <div class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    Tooltip text
    <div class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
  </div>
</div>
```

### Progress Bar

```html
<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
  <div class="h-full rounded-full bg-primary transition-all duration-500" style="width: 65%"></div>
</div>

<!-- With label -->
<div class="flex items-center gap-3">
  <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
    <div class="h-full rounded-full bg-primary" style="width: 65%"></div>
  </div>
  <span class="text-sm font-medium tabular-nums text-muted-foreground">65%</span>
</div>
```

### Toggle/Switch (peer checkbox)

```html
<label class="relative inline-flex cursor-pointer items-center gap-3">
  <input type="checkbox" class="peer sr-only" />
  <div class="h-6 w-11 rounded-full bg-muted transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"></div>
  <span class="text-sm font-medium">Enable notifications</span>
</label>
```

---

## 7. Typography

### Font Utilities

```html
<!-- Font family -->
<p class="font-sans">System sans-serif</p>
<code class="font-mono">Monospace code</code>
<p class="font-serif">Serif text</p>

<!-- Font size scale -->
<p class="text-xs">12px</p>    <!-- 0.75rem -->
<p class="text-sm">14px</p>    <!-- 0.875rem -->
<p class="text-base">16px</p>  <!-- 1rem -->
<p class="text-lg">18px</p>    <!-- 1.125rem -->
<p class="text-xl">20px</p>    <!-- 1.25rem -->
<p class="text-2xl">24px</p>   <!-- 1.5rem -->
<p class="text-3xl">30px</p>   <!-- 1.875rem -->
<p class="text-4xl">36px</p>   <!-- 2.25rem -->
<p class="text-5xl">48px</p>   <!-- 3rem -->
<p class="text-6xl">60px</p>   <!-- 3.75rem -->
<p class="text-7xl">72px</p>   <!-- 4.5rem -->
<p class="text-8xl">96px</p>   <!-- 6rem -->
<p class="text-9xl">128px</p>  <!-- 8rem -->

<!-- Font weight -->
<p class="font-light">300</p>
<p class="font-normal">400</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
<p class="font-black">900</p>

<!-- Line height -->
<p class="leading-none">1</p>
<p class="leading-tight">1.25</p>
<p class="leading-snug">1.375</p>
<p class="leading-normal">1.5</p>
<p class="leading-relaxed">1.625</p>
<p class="leading-loose">2</p>

<!-- Letter spacing -->
<p class="tracking-tighter">-0.05em</p>
<p class="tracking-tight">-0.025em</p>
<p class="tracking-normal">0em</p>
<p class="tracking-wide">0.025em</p>
<p class="tracking-wider">0.05em</p>
<p class="tracking-widest">0.1em</p>
```

### Heading Pattern

```html
<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Page Title</h1>
<h2 class="text-2xl font-semibold tracking-tight">Section Title</h2>
<h3 class="text-xl font-semibold">Subsection</h3>
<h4 class="text-lg font-medium">Small heading</h4>
```

### Truncation

```html
<!-- Single line -->
<p class="truncate">This text will be truncated with an ellipsis if it overflows...</p>

<!-- Multi-line clamp -->
<p class="line-clamp-2">This text will show exactly two lines and truncate the rest with an ellipsis...</p>
<p class="line-clamp-3">Three lines max...</p>
```

### Prose (Typography plugin for rich content)

```html
<!-- Wraps CMS/markdown content with sensible defaults -->
<article class="prose prose-sm dark:prose-invert lg:prose-base max-w-none">
  <!-- Rendered HTML/markdown here -->
  <h1>Title</h1>
  <p>Paragraph with <a href="#">links</a> and <strong>bold</strong> text.</p>
</article>
```

### Custom Fonts

```css
/* v4 */
@theme {
  --font-display: "Cal Sans", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-code: "JetBrains Mono", "Fira Code", monospace;
}

/* v3 */
fontFamily: {
  display: ['"Cal Sans"', '"Inter"', 'system-ui', 'sans-serif'],
  body: ['"Inter"', 'system-ui', 'sans-serif'],
  code: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
}
```

---

## 8. Animations & Transitions

### Transition Utilities

```html
<!-- Default transition (color, bg, border, shadow, opacity, transform) -->
<button class="transition hover:bg-primary/90">Hover me</button>

<!-- Specific transition -->
<div class="transition-transform duration-200 hover:scale-105">Scale on hover</div>
<div class="transition-opacity duration-300 hover:opacity-80">Fade on hover</div>
<div class="transition-colors duration-150 hover:bg-accent">Color change</div>

<!-- Duration: duration-75, 100, 150, 200, 300, 500, 700, 1000 -->
<!-- Easing: ease-linear, ease-in, ease-out, ease-in-out -->
<div class="transition-all duration-300 ease-out hover:shadow-lg">Smooth shadow</div>
```

### Built-in Animations

```html
<svg class="animate-spin h-5 w-5"><!-- spinner --></svg>
<span class="animate-pulse">Loading...</span>
<div class="animate-bounce">Scroll down</div>
<span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
```

### Custom Keyframes

```css
/* v4: define in CSS */
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-slide-down: slide-down 0.2s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

```js
/* v3: tailwind.config.js */
theme: {
  extend: {
    keyframes: {
      "fade-in": {
        from: { opacity: "0" },
        to: { opacity: "1" },
      },
      "slide-up": {
        from: { opacity: "0", transform: "translateY(10px)" },
        to: { opacity: "1", transform: "translateY(0)" },
      },
    },
    animation: {
      "fade-in": "fade-in 0.3s ease-out",
      "slide-up": "slide-up 0.3s ease-out",
    },
  },
}
```

### Group Hover

```html
<a href="#" class="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
  <div class="rounded-md bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
    <svg class="h-5 w-5 text-primary"><!-- icon --></svg>
  </div>
  <div>
    <p class="font-medium group-hover:text-primary transition-colors">Title</p>
    <p class="text-sm text-muted-foreground">Description</p>
  </div>
  <svg class="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"><!-- arrow --></svg>
</a>
```

### Reduced Motion

```html
<!-- Respect user preference -->
<div class="motion-safe:animate-slide-up motion-reduce:opacity-100">
  Animated content (skipped for users who prefer reduced motion)
</div>

<!-- Remove transitions for reduced motion -->
<button class="transition-colors duration-200 motion-reduce:transition-none hover:bg-accent">
  Accessible button
</button>
```

### tailwindcss-animate Plugin (shadcn/ui)

```css
/* v4: tw-animate-css import */
@import "tailwindcss";
@import "tw-animate-css";

/* Provides: animate-in, animate-out, fade-in, fade-out, zoom-in, zoom-out,
   slide-in-from-top, slide-in-from-bottom, slide-in-from-left, slide-in-from-right,
   spin-in, spin-out + duration/delay/fill-mode utilities */
```

```html
<div class="animate-in fade-in slide-in-from-bottom-4 duration-300">
  Enters with fade + slide up
</div>
<div class="animate-out fade-out slide-out-to-top-4 duration-200">
  Exits with fade + slide up
</div>
```

---

## 9. Spacing & Sizing

### Spacing Scale Reference

| Class | Value | Pixels |
|---|---|---|
| `0` | 0 | 0px |
| `px` | 1px | 1px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `1.5` | 0.375rem | 6px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| `20` | 5rem | 80px |
| `24` | 6rem | 96px |
| `32` | 8rem | 128px |
| `40` | 10rem | 160px |
| `48` | 12rem | 192px |
| `56` | 14rem | 224px |
| `64` | 16rem | 256px |
| `80` | 20rem | 320px |
| `96` | 24rem | 384px |

### Width/Height

```html
<!-- Fixed -->
<div class="h-10 w-10">40x40px</div>
<div class="h-64 w-full">Full width, 256px tall</div>

<!-- Percentage -->
<div class="w-1/2">50%</div>
<div class="w-1/3">33.33%</div>
<div class="w-2/3">66.67%</div>

<!-- Viewport -->
<div class="h-screen w-screen">Full viewport</div>
<div class="h-dvh">Dynamic viewport height (respects mobile address bar)</div>
<div class="min-h-svh">Small viewport height</div>

<!-- Min/Max -->
<div class="max-w-sm">384px max</div>   <!-- 24rem -->
<div class="max-w-md">448px max</div>   <!-- 28rem -->
<div class="max-w-lg">512px max</div>   <!-- 32rem -->
<div class="max-w-xl">576px max</div>   <!-- 36rem -->
<div class="max-w-2xl">672px max</div>  <!-- 42rem -->
<div class="max-w-4xl">896px max</div>  <!-- 56rem -->
<div class="max-w-6xl">1152px max</div> <!-- 72rem -->
<div class="max-w-7xl">1280px max</div> <!-- 80rem -->
```

### Space Between / Divide

```html
<!-- Space between (margin on children except first) -->
<div class="flex flex-col space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Prefer gap over space-* (works with flex and grid) -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Divide (borders between children) -->
<ul class="divide-y divide-border">
  <li class="py-3">Item 1</li>
  <li class="py-3">Item 2</li>
  <li class="py-3">Item 3</li>
</ul>
```

---

## 10. Borders & Effects

### Borders

```html
<div class="rounded-md border border-border">Default border</div>
<div class="rounded-lg border-2 border-primary">Thick primary border</div>
<div class="rounded-full border border-dashed border-muted-foreground">Dashed circle</div>

<!-- Border radius scale -->
<!-- rounded-none | rounded-sm | rounded | rounded-md | rounded-lg | rounded-xl | rounded-2xl | rounded-3xl | rounded-full -->
```

### Focus Rings

```html
<!-- Standard focus ring pattern -->
<input class="rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />

<!-- Focus-visible (keyboard only, not mouse clicks) -->
<button class="rounded-md bg-primary px-4 py-2 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click me
</button>
```

### Shadows

```html
<div class="shadow-sm">Subtle</div>     <!-- 0 1px 2px -->
<div class="shadow">Default</div>       <!-- 0 1px 3px, 0 1px 2px -->
<div class="shadow-md">Medium</div>     <!-- 0 4px 6px -->
<div class="shadow-lg">Large</div>      <!-- 0 10px 15px -->
<div class="shadow-xl">Extra large</div><!-- 0 20px 25px -->
<div class="shadow-2xl">Huge</div>      <!-- 0 25px 50px -->
<div class="shadow-inner">Inset</div>   <!-- inset 0 2px 4px -->
<div class="shadow-none">None</div>
```

### Gradients

```html
<!-- Linear gradient -->
<div class="bg-linear-to-r from-purple-500 to-pink-500">Left to right</div>
<div class="bg-linear-to-br from-blue-600 via-purple-500 to-pink-400">Diagonal with via</div>

<!-- v3 syntax (still works) -->
<div class="bg-gradient-to-r from-purple-500 to-pink-500">Left to right</div>

<!-- Text gradient -->
<h1 class="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Backdrop Blur

```html
<div class="bg-background/80 backdrop-blur-sm">Frosted glass (light)</div>
<div class="bg-background/60 backdrop-blur-md">Frosted glass (medium)</div>
<div class="bg-black/50 backdrop-blur-lg">Overlay blur</div>
```

---

## 11. cn() Utility Pattern

### Setup

```bash
npm install clsx tailwind-merge
```

```ts
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Why cn() Is Needed

```tsx
// WITHOUT cn() — "p-4" and "p-2" both apply, specificity is random:
<div className={`p-4 ${isCompact ? "p-2" : ""}`} />

// WITH cn() — tailwind-merge resolves conflicts, "p-2" wins:
<div className={cn("p-4", isCompact && "p-2")} />
```

### CVA (Class Variance Authority) for Component Variants

```bash
npm install class-variance-authority
```

```tsx
// components/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base classes (always applied)
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
```

```tsx
// Usage
<Button>Default</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="destructive" size="lg">Delete Account</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>
```

### CVA for Badge Component

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-green-500/10 text-green-600 dark:text-green-400",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        error: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

---

## 12. Performance

### Purging (CSS treeshaking)

- **v4**: Automatic content detection. No configuration needed. Tailwind scans all source files and only generates used classes.
- **v3**: Requires `content: ["./src/**/*.{js,ts,jsx,tsx}"]` in config. Missing paths = missing classes in production.

### NEVER Generate Dynamic Classes

```tsx
// WRONG — dynamic class won't be detected by purge:
const color = "red";
<div className={`bg-${color}-500`} />

// CORRECT — use complete class names:
const colorClasses = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
};
<div className={colorClasses[color]} />

// CORRECT — conditional with cn():
<div className={cn(
  "rounded-md px-3 py-1",
  status === "active" && "bg-green-500/10 text-green-600",
  status === "pending" && "bg-yellow-500/10 text-yellow-600",
  status === "error" && "bg-red-500/10 text-red-600",
)} />
```

### When to Use @apply (rarely)

```css
/* ACCEPTABLE — repeated base styles for third-party integrations */
@layer components {
  .prose-custom a {
    @apply text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary;
  }
}

/* NEVER — defeats the purpose of utility-first */
.btn {
  @apply inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground;
}
/* Instead, make a React/Liquid component with the classes inline */
```

### CSS File Size Optimization

1. Use semantic tokens (fewer unique color values)
2. Avoid generating unused color palettes — override with `--color-*: initial` in v4
3. Use component extraction (React/Liquid components) instead of @apply
4. Use `cn()` to avoid duplicate/conflicting classes in output

---

## 13. Custom Theme Extension

### v4: @theme Block

```css
@import "tailwindcss";

/* Override defaults — remove all built-in colors, keep only custom */
@theme {
  --color-*: initial;

  --color-background: var(--color-bg);
  --color-foreground: var(--color-fg);
  --color-primary: oklch(0.541 0.183 263.83);
  --color-primary-foreground: oklch(0.969 0.006 264.53);
  --color-secondary: oklch(0.637 0.237 25.33);
  --color-accent: oklch(0.551 0.194 150.12);
  --color-destructive: oklch(0.577 0.245 27.33);
  --color-muted: oklch(0.554 0.015 264.36);
  --color-border: oklch(0.839 0.012 264.36);

  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --breakpoint-xs: 475px;
  --breakpoint-3xl: 1920px;

  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
}
```

### v4: @utility Directive (custom utilities)

```css
/* Static utility */
@utility text-balance {
  text-wrap: balance;
}

/* Functional utility with dynamic value */
@utility tab-size-* {
  tab-size: --value(integer);
}

/* Usage: tab-size-2, tab-size-4, tab-size-8 */
```

### v4: @custom-variant Directive

```css
/* Combine hover + focus */
@custom-variant hocus (&:hover, &:focus);

/* Target optional form elements */
@custom-variant optional (&:optional);

/* Pointer coarse (touch devices) */
@custom-variant touch (@media (pointer: coarse));

/* Target children */
@custom-variant children (& > *);
```

### v3: tailwind.config.js Extend vs Override

```js
module.exports = {
  theme: {
    // OVERRIDE (replaces ALL defaults):
    colors: {
      primary: "#7c3aed",
      white: "#ffffff",
      black: "#000000",
      // Only these three colors exist now
    },
    // EXTEND (adds to defaults):
    extend: {
      colors: {
        primary: "#7c3aed",
        // All default colors (red, blue, etc.) still exist
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      fontSize: {
        "fluid-hero": "clamp(2.5rem, 1.5rem + 3vw, 4.5rem)",
      },
    },
  },
};
```

### v3: Plugin Creation

```js
const plugin = require("tailwindcss/plugin");

module.exports = {
  plugins: [
    plugin(function ({ addUtilities, addComponents, addVariant, matchUtilities, theme }) {
      // Custom utilities
      addUtilities({
        ".text-balance": { "text-wrap": "balance" },
        ".text-pretty": { "text-wrap": "pretty" },
      });

      // Custom components
      addComponents({
        ".card": {
          borderRadius: theme("borderRadius.lg"),
          border: `1px solid ${theme("colors.border")}`,
          padding: theme("spacing.6"),
          backgroundColor: theme("colors.card"),
        },
      });

      // Custom variant
      addVariant("hocus", ["&:hover", "&:focus"]);
      addVariant("children", "& > *");

      // Dynamic utility with theme values
      matchUtilities(
        { "tab-size": (value) => ({ tabSize: value }) },
        { values: { 2: "2", 4: "4", 8: "8" } }
      );
    }),
  ],
};
```

---

## 14. Integration Patterns

### With React/Next.js

```tsx
// Always use className (not class)
// Always use cn() for conditional classes
import { cn } from "@/lib/utils";

export function Card({ className, isActive, children }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-6 shadow-sm",
      isActive && "ring-2 ring-primary",
      className
    )}>
      {children}
    </div>
  );
}
```

### With Shopify Liquid

```liquid
{%- comment -%} Use class attribute directly in Liquid templates {%- endcomment -%}
<div class="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
  {%- for product in collection.products -%}
    <div class="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div class="aspect-square overflow-hidden">
        {{ product.featured_image | image_url: width: 600 | image_tag:
          class: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          loading: "lazy"
        }}
      </div>
      <div class="p-4">
        <h3 class="text-sm font-medium">{{ product.title }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ product.price | money }}</p>
      </div>
    </div>
  {%- endfor -%}
</div>
```

### With WordPress Block Themes

```php
<!-- In block template parts, use Tailwind classes directly -->
<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <article class="rounded-lg border border-border bg-card p-6 shadow-sm mb-6">
      <h2 class="text-xl font-semibold">
        <a href="<?php the_permalink(); ?>" class="hover:text-primary transition-colors">
          <?php the_title(); ?>
        </a>
      </h2>
      <div class="mt-2 text-sm text-muted-foreground"><?php the_excerpt(); ?></div>
    </article>
  <?php endwhile; endif; ?>
</div>
```

### With shadcn/ui

shadcn/ui components use CSS variables + Tailwind. The pattern:
1. Define CSS variables in `:root` and `.dark` (HSL or oklch values)
2. Map variables to Tailwind colors in config
3. Use semantic class names: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`
4. Use `cn()` for all conditional classes
5. Use CVA for all variant components

### With GSAP Animations

```tsx
// Use Tailwind for layout/styling, GSAP for complex animations
// Tailwind classes set initial state, GSAP animates from/to

<div ref={heroRef} class="opacity-0 translate-y-8">
  {/* GSAP animates opacity to 1 and y to 0 */}
</div>

// In useEffect:
gsap.to(heroRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
```

---

## 15. Anti-Patterns (NEVER DO)

### 1. Never @apply everything

```css
/* WRONG — creates bloated CSS, defeats utility-first purpose */
.btn-primary {
  @apply inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring;
}

/* RIGHT — use a component (React, Liquid, PHP) */
```

### 2. Never generate dynamic class strings

```tsx
// WRONG — purger cannot detect these:
className={`bg-${color}-500 text-${size}`}
className={`grid-cols-${count}`}

// RIGHT — use lookup objects or cn():
const gridCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};
```

### 3. Never mix inline styles with Tailwind for the same property

```tsx
// WRONG — confusing, hard to maintain:
<div className="p-4" style={{ padding: "20px" }} />

// RIGHT — pick one approach per property:
<div className="p-5" />
// OR (for truly dynamic values only):
<div style={{ padding: `${dynamicValue}px` }} />
```

### 4. Never ignore responsive design

```html
<!-- WRONG — fixed width breaks on mobile -->
<div class="w-[800px]">Content</div>

<!-- RIGHT — responsive -->
<div class="w-full max-w-3xl mx-auto px-4">Content</div>
```

### 5. Never hardcode colors

```html
<!-- WRONG — impossible to theme, dark mode breaks -->
<div class="bg-[#1a1a2e] text-[#e0e0e0]">Hardcoded</div>

<!-- RIGHT — use semantic tokens -->
<div class="bg-background text-foreground">Themed</div>
```

### 6. Never create mega-long class strings without cn()

```tsx
// WRONG — unreadable, no conflict resolution:
<div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'} ${isDisabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>

// RIGHT — cn() with logical grouping:
<div className={cn(
  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
  isActive
    ? "border-primary bg-primary text-primary-foreground"
    : "border-border bg-background text-foreground",
  isDisabled && "pointer-events-none opacity-50",
  className
)}>
```

---

## 16. Golden Rules

1. **Mobile-first always.** Write base styles for mobile, then layer `sm:`, `md:`, `lg:`, `xl:` breakpoints.

2. **Use semantic color tokens.** `bg-primary`, `text-foreground`, `border-border` — never raw hex in class names.

3. **Use cn() for conditional classes.** Every component that accepts a `className` prop must merge with `cn()`.

4. **Use CVA for variant components.** Buttons, badges, alerts, inputs — any component with visual variants gets CVA.

5. **Use CSS variables for theming.** Define in `:root` / `.dark`, map to Tailwind config. One source of truth.

6. **Design for dark mode from day one.** Every color choice must work in both light and dark.

7. **Prefer gap over space-*.** `gap-4` works with both flex and grid. `space-y-4` breaks with wrapping or reordering.

8. **Use complete class names.** Never concatenate strings to form class names (`bg-${x}-500`). Always write the full class.

9. **Extract components, not classes.** Instead of `@apply`, create React/Liquid/PHP components with Tailwind classes inline.

10. **Prefer focus-visible over focus.** `focus-visible:ring-2` only shows on keyboard navigation, not mouse clicks.

11. **Respect reduced motion.** Use `motion-safe:` for animations. Never force animation on users with vestibular disorders.

12. **Use max-w-* for content width.** Never let text run wider than `max-w-prose` (65ch). Container content at `max-w-7xl`.

13. **Use dvh/svh for mobile.** `min-h-dvh` respects mobile browser chrome. `min-h-screen` can cause overflow on mobile.

14. **Keep specificity low.** Utility classes work because they are flat. Avoid nesting selectors or adding `!important`. If a class is not applying, fix the cascade — do not add `!`.

15. **Detect the version before writing code.** Check `package.json` and CSS entry point. v3 uses `tailwind.config.js` + `@tailwind`. v4 uses `@import "tailwindcss"` + `@theme`. Write code for the version the project uses.
