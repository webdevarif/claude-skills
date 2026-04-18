---
name: changelog
description: Generate or update CHANGELOG.md from git history using Keep a Changelog format with conventional commit parsing
disable-model-invocation: true
allowed-tools:
  - Bash(git log:*)
  - Bash(git tag:*)
  - Bash(git branch:*)
  - Bash(git diff:*)
  - Bash(git describe:*)
  - Read
  - Write
  - Edit
  - Glob
---

# Changelog Generator

Generate or update CHANGELOG.md from git history.

## Context

- Current branch: !`git branch --show-current`
- Latest tag: !`git describe --tags --abbrev=0 2>/dev/null || echo "no tags"`
- All tags: !`git tag --sort=-version:refname | head -10`

## Process

### Step 1: Determine Scope
1. Check if CHANGELOG.md already exists
2. If it exists, find the last documented version/date
3. Determine the range of commits to process:
   - **If tag provided as argument**: commits between that tag and HEAD
   - **If CHANGELOG.md exists**: commits since the last documented entry
   - **If no CHANGELOG.md**: all commits (or since the first tag)

### Step 2: Fetch Commits
```
git log <range> --pretty=format:"%H|%s|%an|%ad" --date=short
```

### Step 3: Parse & Categorize
Parse each commit message and categorize by conventional commit type:

| Category | Commit Types |
|----------|-------------|
| **Added** | `feat`, `feature` |
| **Fixed** | `fix`, `bugfix`, `hotfix` |
| **Changed** | `refactor`, `perf`, `style`, `update` |
| **Removed** | commits mentioning "remove", "delete", "drop" |
| **Security** | `security`, commits mentioning "vulnerability", "CVE" |
| **Documentation** | `docs` |
| **Other** | `chore`, `build`, `ci`, `test`, or non-conventional commits |

**Rules for parsing:**
- `feat(auth): add login page` → **Added**: Add login page (auth)
- `fix: resolve crash on empty cart` → **Fixed**: Resolve crash on empty cart
- `refactor(api): simplify query builder` → **Changed**: Simplify query builder (api)
- Non-conventional commits: use the full message, categorize by keywords

### Step 4: Generate Changelog Entry

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added
- Add login page (auth) — abc1234

### Fixed
- Resolve crash on empty cart — def5678

### Changed
- Simplify query builder (api) — ghi9012
```

If a version is being released:
```markdown
## [1.2.0] - 2026-04-10

### Added
- ...
```

### Step 5: Write/Update File
- If CHANGELOG.md doesn't exist: create it with header + entries
- If it exists: insert new entries BELOW the header and ABOVE existing entries
- Never overwrite or remove existing entries

## CHANGELOG.md Template (New File)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- ...

### Fixed
- ...

### Changed
- ...
```

## Arguments

The user can pass optional arguments:

- `/changelog` — generate from last tag or last entry to HEAD
- `/changelog v1.2.0` — label the entry as version 1.2.0 with today's date
- `/changelog v1.1.0..v1.2.0` — only include commits in that range
- `/changelog --all` — regenerate entire changelog from all tags

## Rules

- **Never delete existing entries** — only add new ones
- **Skip merge commits** — they add noise, not value
- **Skip chore/ci/build** commits unless they're significant (like a major dependency upgrade)
- **Group by category** — don't just list commits chronologically
- **Include commit short hash** — for traceability (7 chars, e.g., `abc1234`)
- **Remove scope prefix from description** — `feat(auth): add login` → "Add login (auth)" not "auth: add login"
- **Capitalize first letter** of each entry
- **Use imperative mood** — "Add" not "Added" in the description (the section header says "Added")
- **Remove duplicate entries** — if two commits say similar things, merge them
- **Date format**: YYYY-MM-DD
- **Show summary** after generating: how many entries added per category
