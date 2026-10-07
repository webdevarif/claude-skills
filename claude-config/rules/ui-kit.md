---
paths:
  - "**/*.{tsx,jsx,vue,css,scss,liquid}"
  - "**/packages/ui/**"
  - "**/app/kit/**"
  - "**/src/Kit/**"
  - "**/*.php"
---

# UI kit: one reusable component library per project (Polaris-style)

Applies to every Next.js app, Shopify app and WordPress plugin.

## Where the kit lives
- Next.js: `packages/ui` workspace package imported as `@kit/ui` (+ app-level
  shared components).
- Shopify app: `app/kit/`.
- WordPress plugin: `src/Kit/` (PHP render helpers) + one kit CSS/JS asset set.
- Same component names across all three where possible.

## Rules
- Every UI is built from the kit, never page-by-page markup.
- The kit covers at least: page layout (page, header, section, grid/stack),
  card, modal/dialog, alert/banner with dismiss, toast, badge/pill, progress
  bar, empty state, table, tabs, form field, button, KPI tile.
- Design tokens (colour, spacing, radius, type) live in one place per kit as
  CSS variables. Pages never hard-code colours, spacing or inline styles. A
  redesign changes kit + tokens only.
- New UI uses or extends a kit component. A pattern that repeats twice goes
  into the kit. Migrate existing one-off UI gradually, one change card per
  component or page group.
- Keep a "Component kit" section in the project artifact: each component with
  a screenshot, props/variants, where it is used, status (in kit / partly /
  not yet). Update it whenever the kit changes.

## Before any UI card
- Research comparable apps, check the real data, and test with the largest
  plan size. Never ship the literal ask as the design.
- Check at 1440 / 820 / 350 px: cut words, sideways scroll, JS errors,
  duplicate elements.
