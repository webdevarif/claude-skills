# Global Claude Code config (backup)

Copy of `~/.claude/CLAUDE.md` and `~/.claude/rules/`, kept here in case the
local machine is lost.

## Restore

```bash
cp claude-config/CLAUDE.md ~/.claude/CLAUDE.md
mkdir -p ~/.claude/rules && cp claude-config/rules/*.md ~/.claude/rules/
```

Then run `/context` in a new session: `CLAUDE.md` and `rules/context7.md`
load at start; `ui-kit.md`, `shopify-app.md` and `qa-personas.md` load only
when a matching file is read or edited (their `paths:` frontmatter).

| File | Loads |
| --- | --- |
| `CLAUDE.md` | every session |
| `rules/context7.md` | every session |
| `rules/ui-kit.md` | UI files (`.tsx`, `.css`, `.liquid`, `.php`, kit folders) |
| `rules/shopify-app.md` | Shopify app files (`shopify.app*.toml`, `extensions/**`, `app/routes/**`) |
| `rules/qa-personas.md` | test files and Playwright/Vitest config |

Last synced: 2026-10-07.
