#!/usr/bin/env bash
# Restores the Claude Code setup from this repo on a Mac.
#   git clone https://github.com/webdevarif/claude-skills.git ~/claude-skills
#   cp ~/claude-skills/claude-config/secrets.env.example ~/.claude-secrets.env   # then fill it in
#   bash ~/claude-skills/scripts/restore-mac.sh
# Safe to run again: files are overwritten from the repo, an existing
# settings.json is never replaced (a settings.json.new is written next to it).

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
CFG="$REPO/claude-config"
CLAUDE_HOME="$HOME/.claude"
SECRETS="${CLAUDE_SECRETS:-$HOME/.claude-secrets.env}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1 ($2)"; exit 1; }; }
need node   "brew install node"
need claude "npm install -g @anthropic-ai/claude-code"
need python3 "xcode-select --install (graphify hooks use python3)"
need rsync  "brew install rsync"
command -v rtk >/dev/null 2>&1 || echo "Note: rtk not found, the rtk hook will do nothing until it is installed"

mkdir -p "$CLAUDE_HOME"/{rules,hooks,agents,skills}

echo "1/5 config, rules, hooks, agents"
cp "$CFG/CLAUDE.md" "$CFG/RTK.md" "$CLAUDE_HOME/"
cp "$CFG"/rules/*.md "$CLAUDE_HOME/rules/"
cp "$CFG"/hooks/*.js "$CLAUDE_HOME/hooks/"
cp "$CFG"/agents/*.md "$CLAUDE_HOME/agents/"

echo "2/5 skills"
count=0
for dir in "$REPO"/*/; do
  name="$(basename "$dir")"
  case "$name" in claude-config|scripts) continue ;; esac
  rsync -a "$dir" "$CLAUDE_HOME/skills/$name/"
  count=$((count + 1))
done
echo "    $count skills copied"

echo "3/5 settings.json"
target="$CLAUDE_HOME/settings.json"
[ -f "$target" ] && target="$CLAUDE_HOME/settings.json.new"
SECRETS="$SECRETS" node - "$CFG/settings.template.json" "$target" <<'EOF'
const fs = require('fs');
const [tplPath, outPath] = process.argv.slice(2);
const secrets = {};
if (fs.existsSync(process.env.SECRETS)) {
  for (const line of fs.readFileSync(process.env.SECRETS, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) secrets[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
}
// escaped so a quote or backslash in the home path can't break the JSON
const home = JSON.stringify(process.env.HOME).slice(1, -1);
const s = JSON.parse(fs.readFileSync(tplPath, 'utf8').split('__HOME__').join(home));
for (const k of Object.keys(s.env || {})) {
  if (s.env[k] === '' && secrets[k]) s.env[k] = secrets[k];
}
fs.writeFileSync(outPath, JSON.stringify(s, null, 2) + '\n');
EOF
echo "    wrote $target"
[ "$target" != "$CLAUDE_HOME/settings.json" ] && echo "    settings.json already existed, merge settings.json.new by hand"

echo "4/5 MCP servers (user scope)"
[ -f "$SECRETS" ] || echo "    $SECRETS not found, servers that need a key will be skipped"
SECRETS="$SECRETS" node - "$CFG/mcp-servers.template.json" <<'EOF' |
const fs = require('fs');
const secrets = {};
if (fs.existsSync(process.env.SECRETS)) {
  for (const line of fs.readFileSync(process.env.SECRETS, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) secrets[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
}
const { servers } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const [name, conf] of Object.entries(servers)) {
  const missing = [];
  const json = JSON.stringify(conf).replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => {
    if (!secrets[k]) missing.push(k);
    // the placeholder sits inside a JSON string, so escape quotes and backslashes
    return JSON.stringify(secrets[k] || '').slice(1, -1);
  });
  if (missing.length) { console.error(`    skip ${name}: missing ${missing.join(', ')}`); continue; }
  process.stdout.write(`${name}\t${json}\n`);
}
EOF
while IFS=$'\t' read -r name json; do
  # </dev/null so claude can't read the remaining server lines from the pipe
  claude mcp remove "$name" --scope user </dev/null >/dev/null 2>&1 || true
  if claude mcp add-json --scope user "$name" "$json" </dev/null >/dev/null; then
    echo "    added $name"
  else
    echo "    FAILED $name"
  fi
done

echo "5/5 plugins"
claude plugin marketplace add anthropics/claude-plugins-official || true
claude plugin marketplace add affaan-m/ecc || true
for p in shopify-ai-toolkit@claude-plugins-official frontend-design@claude-plugins-official \
         ecc@ecc rust-analyzer-lsp@claude-plugins-official; do
  claude plugin install "$p" || echo "    FAILED $p"
done

echo "Done. Next: claude mcp list, then /mcp inside Claude to log in to OAuth servers (sentry, posthog, notion, hf, cloudflare)."
