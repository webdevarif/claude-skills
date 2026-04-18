---
name: commit
description: Stage and commit current changes with an auto-generated conventional commit message
disable-model-invocation: true
allowed-tools:
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git commit:*)
  - Bash(git diff:*)
  - Bash(git log:*)
  - Bash(git branch:*)
  - Bash(git push:*)
---

# Git Commit

Analyze the current changes and create a well-formatted git commit.

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits (for style matching): !`git log --oneline -10`

## Your Task

1. **Analyze the diff** — understand the nature and purpose of ALL changes
2. **Generate 3 commit message candidates** based on the changes:
   - Each must be concise, clear, and capture the essence of the changes
   - Use **Conventional Commits** format: `type(scope): description`
   - Match the style of recent commits in the repo when possible
3. **Select the best message** — briefly explain why it's the best choice
4. **Stage all relevant changes** using `git add` (stage specific files, not `git add .` or `git add -A` to avoid accidentally staging sensitive files like `.env`)
5. **Execute the commit** with the selected message
6. **Push to remote** — after a successful commit, always run `git push` to sync with the remote repository

## Conventional Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style (formatting, semicolons, etc.) — no logic change |
| `refactor` | Code restructuring — no feature or fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance tasks, config updates |

## Commit Message Format

```
type(scope): short description (imperative mood, max 72 chars)

[optional body — explain WHAT and WHY, not HOW]

[optional footer — breaking changes, issue refs]
```

### Examples
```
feat(products): add bulk delete action to products table
fix(auth): clear session on app uninstall webhook
refactor(api): extract GraphQL queries into service layer
docs(readme): add deployment instructions for Fly.io
chore(deps): upgrade @shopify/polaris to v13
```

## Rules

- **DO NOT** stage `.env`, credentials, or secret files
- **DO NOT** add co-authorship footer unless the user explicitly asks
- **DO NOT** commit if there are no changes — inform the user instead
- **DO** use imperative mood ("add", "fix", "update" — not "added", "fixed", "updated")
- **DO** keep the first line under 72 characters
- **DO** warn if there are uncommitted changes in sensitive files
- **DO** show the final commit hash and message after committing
- **DO** always push to remote after committing (`git push`)
