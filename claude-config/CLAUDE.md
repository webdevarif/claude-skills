# Global working rules (WebDeveloperArif)

Solo developer building SaaS: Surfacly (Next.js dashboard + Shopify app + WP
plugin), GoFitment, TablePilot. I sometimes run work through multiple agents.

## Language and voice
- Reply in Banglish (Bengali in roman letters) by default; English only if
  I write English and clearly want it back. NEVER Bengali script, anywhere: my
  terminal renders it as boxes.
- Code, paths, commands, commit messages, artifacts and docs stay in English.
- Everything you give me must read like a person wrote it: follow
  `~/.claude/rules/human-writing.md` (no em dashes, arrows, emoji or AI
  stock phrases).

## Truth rules
- Every claim carries evidence I can check: file:line, command plus its
  output, query result, screenshot, or a URL you actually opened. No evidence
  means you write "unverified" and say how to verify it.
- Library, API or CLI questions: fetch current docs first (rules/context7.md).
- Never invent numbers, file names, flags, prices or "best practices".
- "Done" means a check ran and passed, with its output shown. If you can't
  run one, say so.

## Lifecycle (every GitHub project, unless its own CLAUDE.md overrides)
1. Understand: read the code and the real data before proposing anything.
2. One living artifact per project is the source of truth: system map,
   numbered issues (K1, K2 and so on, with priority and file:line), change
   log, one change card per fix. Republish it after every step without being
   asked; mirror progress in memory.
3. Change card, then stop: live evidence, what changes, what does NOT,
   before/after table, risk, how it will be verified. Ask "CC-N approved?".
   Small cards can be batched; I approve by number. An approved live-data
   write is a read-only dry run first, then one transaction that asserts the
   row count or rolls back.
4. Build: branch from the latest origin/main (local main may be stale), one
   focused change, clear commit. Typecheck, lint and tests before push; new
   pure logic gets a test that fails without the fix. Never push to main;
   give me the `/pull/new/<branch>` link. When two repos change, say the
   merge/deploy order and why.
5. Review: before calling it done, a fresh subagent checks the diff against
   the card (correctness and scope only, not style).
6. Verify live after I say merged/deployed: prove the new code is served,
   then test the real flow (Playwright, API, read-only DB) using
   rules/qa-personas.md. Report verified and NOT verified separately, with
   numbers. Only then close the card and propose the next one.

## Safety
- The local DB connection is production: read-only unless a card is approved.
  Never `prisma migrate dev`, `migrate reset` or `db push`. The hook
  ~/.claude/hooks/block-dangerous.js enforces this and blocks pushes to main.
- Test data uses a `QA-` prefix and is deleted afterwards. Never test on a real
  client's store or site. Never print secrets.
- Deploys, theme Save, listing submits, emails and production data changes
  need my explicit OK every time.

## Multi-agent
- Subagents load these rules but NOT this conversation or memory; built-in
  Explore/Plan agents skip CLAUDE.md entirely. Give every agent a
  self-contained brief: goal, files, constraints, read-only or not, output
  format.
- Parallel edits get one git worktree and branch per agent; remove the
  worktree after merge. Never two agents on the same file.
- The agent that did the work never grades it: use a runnable check or a
  separate reviewer.

## Detail files (auto-load on matching files; if the task touches the area and
the file isn't in context, Read it first)
- `~/.claude/rules/ui-kit.md`: shared component kit, tokens, research before UI
- `~/.claude/rules/shopify-app.md`: Shopify artifact, deploy, live checks, listing
- `~/.claude/rules/qa-personas.md`: persona test matrix, test quality
- `~/.claude/rules/human-writing.md`: loads every session

## Tools and brands
- `/graphify`: use the graphify skill before anything else.
- Hugging Face MCP: model/dataset search; images via dynamic_space
  (evalstate/flux1_schnell fast, mcp-tools/Qwen-Image-Fast).
- GoFitment is a Year/Make/Model fitment Shopify app (CSV/FTP import with
  auto-sync, fitment badges, search analytics). Brand teal #0fb5b0, clean SaaS
  look; Shopify feature image 1600x900.
