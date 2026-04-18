---
name: pr
description: Create a GitHub pull request with auto-generated title, summary, and test plan from branch commits and changes
disable-model-invocation: true
allowed-tools:
  - Bash(git diff:*)
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git branch:*)
  - Bash(git push:*)
  - Bash(git remote:*)
  - Bash(gh pr:*)
  - Bash(gh api:*)
  - Read
  - Grep
  - Glob
---

# Create Pull Request

Analyze all branch changes and create a well-documented GitHub PR.

## Context

- Current branch: !`git branch --show-current`
- Default/base branch: !`git remote show origin | grep 'HEAD branch' | cut -d' ' -f5`
- Git status: !`git status --short`
- Remote tracking: !`git branch -vv --list $(git branch --show-current)`

## Process

### Step 1: Gather All Changes
1. Identify the base branch (usually `main` or `master`)
2. Get ALL commits on this branch since diverging from base:
   ```
   git log <base>..HEAD --oneline
   ```
3. Get the full diff against base:
   ```
   git diff <base>...HEAD
   ```
4. Check if there are unstaged/uncommitted changes — warn the user if so

### Step 2: Analyze Changes
- Read ALL commits (not just the latest!) to understand the full scope
- Identify: new features, bug fixes, refactors, config changes, test additions
- Note which areas of the codebase are affected (routes, components, services, DB, etc.)
- Identify any breaking changes

### Step 3: Generate PR Content

**Title** (under 70 characters):
- Use conventional format: `feat: ...`, `fix: ...`, `refactor: ...`
- Be specific about WHAT, not HOW
- If multiple types, use the dominant one

**Summary** (bullet points):
- 1-3 concise bullet points explaining WHAT changed and WHY
- Focus on the user/business impact, not implementation details
- Mention breaking changes if any

**Test Plan**:
- List specific steps to verify the PR works
- Include edge cases worth testing
- Mention if tests were added/updated

### Step 4: Push & Create PR
1. If not pushed, push the branch with `-u` flag:
   ```
   git push -u origin <branch-name>
   ```
2. Create PR using `gh`:
   ```
   gh pr create --title "..." --body "..."
   ```

## PR Body Format

```markdown
## Summary
- [What changed and why - bullet 1]
- [What changed and why - bullet 2]
- [What changed and why - bullet 3]

## Changes
- `path/to/file.tsx` — [what changed in this file]
- `path/to/other.ts` — [what changed in this file]

## Breaking Changes
[List any breaking changes, or "None"]

## Test Plan
- [ ] [Step 1 to verify]
- [ ] [Step 2 to verify]
- [ ] [Edge case to check]

## Screenshots
[If UI changes, note that screenshots should be added manually]
```

## Rules

- **Analyze ALL commits** on the branch, not just the latest one
- **Never force push** — use regular `git push`
- **Don't commit** uncommitted changes — just warn the user
- **Keep title under 70 chars** — use body for details
- **Don't guess the base branch** — detect it from remote
- **Include file change summary** so reviewers know where to look
- **Use HEREDOC** for PR body to preserve formatting:
  ```
  gh pr create --title "title" --body "$(cat <<'EOF'
  body content here
  EOF
  )"
  ```
- **Return the PR URL** at the end so the user can click it
- If `gh` is not authenticated, tell the user to run `gh auth login` first
