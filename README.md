# claude-skills

Backup of my Claude Code setup: global skills, `CLAUDE.md`, rules, hooks,
agents, and templates for `settings.json` and the user scope MCP servers.
The goal is that a new machine (the Mac mini) is set up from one clone and
one script.

## Layout

| Path | What it is |
| --- | --- |
| `<skill>/` (131 folders) | Global skills, copied to `~/.claude/skills/<skill>/` |
| `claude-config/CLAUDE.md`, `RTK.md` | Global instructions, go to `~/.claude/` |
| `claude-config/rules/` | Detail rule files, go to `~/.claude/rules/` |
| `claude-config/hooks/` | Hook scripts, go to `~/.claude/hooks/` |
| `claude-config/agents/` | Custom subagents (seo-*), go to `~/.claude/agents/` |
| `claude-config/settings.template.json` | `settings.json` without secrets, permissions or Orca hooks |
| `claude-config/mcp-servers.template.json` | MCP servers with `${KEY}` placeholders |
| `claude-config/secrets.env.example` | List of the keys the templates need |
| `scripts/restore-mac.sh` | Installs everything above on a Mac |
| `scripts/backup-from-windows.ps1` | Re-syncs this repo from the Windows PC |

Not in this repo on purpose: memory, session transcripts, API keys, the
`permissions` list from `settings.json` (it holds a production database URL)
and the Orca hooks. See [MIGRATION.md](MIGRATION.md) for how to move those.

## Restore on a Mac

```bash
brew install node rsync
npm install -g @anthropic-ai/claude-code
git clone https://github.com/webdevarif/claude-skills.git ~/claude-skills
cp ~/claude-skills/claude-config/secrets.env.example ~/.claude-secrets.env
chmod 600 ~/.claude-secrets.env   # then fill in the keys
bash ~/claude-skills/scripts/restore-mac.sh
```

The script is safe to run again. It never overwrites an existing
`~/.claude/settings.json`; it writes `settings.json.new` next to it instead.
MCP servers whose key is missing from the secrets file are skipped with a
message, so you can fill the key later and run the script again.

After it finishes: `claude mcp list`, then `/mcp` inside a session to log in
to the OAuth servers (sentry, posthog, notion, hf-mcp-server, cloudflare-api).

## Re-sync from Windows

```powershell
pwsh -File scripts\backup-from-windows.ps1   # PowerShell 7
git status
```

It copies `~/.claude` into the repo, regenerates `settings.template.json`
(home path becomes `__HOME__`, secret env values are blanked, Orca hooks are
dropped) and warns when `~/.claude.json` has an MCP server that the template
does not list yet. Commit on a branch and open a PR; never push to main.
