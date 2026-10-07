# Global Claude Code config (backup)

Copy of `~/.claude/CLAUDE.md` and `~/.claude/rules/`, kept here in case the
local machine is lost.

## Restore

```bash
cp claude-config/CLAUDE.md ~/.claude/CLAUDE.md
mkdir -p ~/.claude/rules && cp claude-config/rules/*.md ~/.claude/rules/
```

Then run `/context` in a new session: `CLAUDE.md`, `rules/context7.md` and
`rules/human-writing.md` load at start; `ui-kit.md`, `shopify-app.md` and
`qa-personas.md` load only when a matching file is read or edited (their
`paths:` frontmatter).

| File | Loads |
| --- | --- |
| `CLAUDE.md` | every session |
| `rules/context7.md` | every session |
| `rules/human-writing.md` | every session (no AI-style symbols or stock phrases) |
| `rules/ui-kit.md` | UI files (`.tsx`, `.css`, `.liquid`, `.php`, kit folders) |
| `rules/shopify-app.md` | Shopify app files (`shopify.app*.toml`, `extensions/**`, `app/routes/**`) |
| `rules/qa-personas.md` | test files and Playwright/Vitest config |

## Safety hook

`hooks/block-dangerous.js` is a PreToolUse hook (exit 2 = blocked) for the
Bash and PowerShell tools. It blocks `git push` to main/master (explicit
refspec, `HEAD`, or a bare push while on main/master), `prisma migrate dev`,
`prisma migrate reset`, `prisma db push` and `drizzle-kit push`.

Restore: copy it to `~/.claude/hooks/`, then merge `hooks/settings-snippet.json`
into `~/.claude/settings.json` (add the entry to the existing `PreToolUse`
array; don't replace the file, it holds other hooks and env values).
`settings.json` itself is not backed up here because it holds tokens.

Known limits: it matches text, so a command that only prints one of these
strings is blocked too; a package script that wraps one of them (for example
`pnpm db:push`) is not caught.

Last synced: 2026-10-07.
