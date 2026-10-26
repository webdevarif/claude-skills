# Global Claude Code config (backup)

Copy of `~/.claude/CLAUDE.md`, `RTK.md`, `rules/`, `hooks/` and `agents/`,
plus templates for `settings.json` and the MCP servers, kept here in case the
local machine is lost. On a Mac, `scripts/restore-mac.sh` installs all of it
(see the root README); `scripts/backup-from-windows.ps1` refreshes it from
the PC.

| File | Goes to | Notes |
| --- | --- | --- |
| `CLAUDE.md`, `RTK.md` | `~/.claude/` | `CLAUDE.md` imports `RTK.md` |
| `rules/*.md` | `~/.claude/rules/` | see the load table below |
| `hooks/*.js` | `~/.claude/hooks/` | block-dangerous, context-nudge, graphify-precompact |
| `agents/*.md` | `~/.claude/agents/` | 18 seo-* subagents used by the seo skills |
| `settings.template.json` | `~/.claude/settings.json` | `__HOME__` is replaced; no permissions, statusLine or Orca hooks |
| `mcp-servers.template.json` | `claude mcp add-json --scope user` | `${KEY}` values come from the secrets file |
| `secrets.env.example` | `~/.claude-secrets.env` | key names only, fill on the machine |

## Restore by hand

```bash
cp claude-config/CLAUDE.md claude-config/RTK.md ~/.claude/
mkdir -p ~/.claude/rules ~/.claude/hooks ~/.claude/agents
cp claude-config/rules/*.md ~/.claude/rules/
cp claude-config/hooks/*.js ~/.claude/hooks/
cp claude-config/agents/*.md ~/.claude/agents/
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

It is already wired in `settings.template.json`. On a machine that has its
own `settings.json`, merge `hooks/settings-snippet.json` instead (add the
entry to the existing `PreToolUse` array; don't replace the file).
The real `settings.json` is not backed up here because it holds tokens and a
database URL.

Known limits: it matches text, so a command that only prints one of these
strings is blocked too; a package script that wraps one of them (for example
`pnpm db:push`) is not caught.

Last synced: 2026-10-26.
