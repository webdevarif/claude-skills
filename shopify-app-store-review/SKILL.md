---
name: shopify-app-store-review
description: "Run a pre-submission Shopify App Store compliance check against the current app's codebase. Wrapper for the app-store-review topic inside the Shopify AI Toolkit `shopify` skill (the standalone skill was merged into it in toolkit 2.0)."
---

# Shopify App Store review (wrapper)

The Shopify AI Toolkit 2.x removed the standalone `shopify-app-store-review`
skill and moved its instructions into the `shopify` skill as the
`app-store-review` reference. This wrapper loads that reference so the old
command still works and always follows the installed toolkit version.

## Steps

1. Find the reference file with Glob:
   `$HOME/.claude/plugins/cache/claude-plugins-official/shopify-ai-toolkit/*/skills/shopify/references/app-store-review.md`
   If several versions match, use the highest version number. If none match,
   tell the user the Shopify AI Toolkit plugin is missing and stop.
2. Read that file in full (and any `app-store-review.part*.md` next to it).
3. Follow its instructions exactly to review the current project's codebase.
   Any requirements in the user's arguments (for example opt-in groups) go
   to the review as the user's request.
4. The project's own CLAUDE.md rules still apply: evidence as file:line,
   reply language and writing rules, and no deploys or listing submits.
