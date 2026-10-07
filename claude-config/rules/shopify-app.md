---
paths:
  - "**/shopify.app*.toml"
  - "**/shopify.web.toml"
  - "**/extensions/**"
  - "**/app/shopify.server.*"
  - "**/app/routes/**"
---

# Shopify app work (all my Shopify apps; proven on TablePilot, Sep 2026)

Adds to the global lifecycle in ~/.claude/CLAUDE.md.

## Artifact
- One living audit/progress artifact per app: market audit, competitor matrix,
  gap register, roadmap, PR table with live-check status, "still on you" list.
  Republish after every shipped step.
- When a comparison matters (competitor, client prospect), build a separate
  side-by-side artifact with real measurements and screenshots.
- After each PR: what changed, what was verified (numbers), what was NOT.
  Say honestly where competitors are still better.

## Deploy
- Before any deploy remind me: `git checkout main && git pull` first, then
  Dokploy (server) and `shopify app deploy` (theme extension). A stale local
  checkout deploys old code.
- Background agents in git worktrees: after their branch merges, move or
  delete the worktree. Nested `shopify.*.toml` copies there break
  `shopify app deploy`.

## Verify live
- Confirm it is really live: extension version in the storefront asset URL,
  the new code inside the served file, the admin bundle.
- Test on the dev store with Playwright at 1440 / 820 / 350 px using the
  theme's real font. Each live check usually finds the next bug: fix it the
  same way (branch, test, PR).
- Storefront changes: test first in a local harness (static page with the
  extension assets + the real config JSON) before pushing.

## Safety
- Local .env may point at the PRODUCTION DB. Migrations are hand-written SQL
  applied by `migrate deploy` at start-up. Read-only queries unless I say
  "haan".
- Never Save in the theme editor, submit the listing for review, or change
  live listing/production data without my explicit OK.
- Mandatory privacy webhooks (customers/data_request, customers/redact,
  shop/redact) must answer 200 and 401 on bad HMAC.

## Listing and images
- Feature image 1600x900, SEO-friendly file name and alt text.
- Look at competitor thumbnails first. Bold coloured backgrounds with real
  product context beat plain white ones on the App Store.
- App must not drop storefront Lighthouse by more than 10 points.
