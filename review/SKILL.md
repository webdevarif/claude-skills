---
name: review
description: Review current code changes for bugs, security issues, performance problems, and best practice violations. Analyzes staged/unstaged diffs and provides actionable feedback.
disable-model-invocation: true
allowed-tools:
  - Bash(git diff:*)
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git branch:*)
  - Bash(git show:*)
  - Read
  - Grep
  - Glob
---

# Code Review

Perform a thorough code review on the current changes.

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Full diff: !`git diff HEAD`

## Review Process

### Step 1: Understand Scope
- Read the full diff carefully
- Identify which files changed and what type of changes (new feature, bug fix, refactor, etc.)
- Note the affected areas: routes, components, services, configs, tests, etc.

### Step 2: Check Each Category

Review the changes against these categories, **only report issues you actually find** — don't invent problems:

#### Critical (Must Fix)
- **Security**: SQL injection, XSS, exposed secrets/keys, missing auth checks, HMAC bypass, unsafe eval
- **Data Loss**: Missing error handling on destructive operations, no transaction wrapping, race conditions
- **Breaking Changes**: Removed exports still used elsewhere, changed function signatures, removed API endpoints

#### Important (Should Fix)
- **Bugs**: Off-by-one errors, null/undefined access, wrong variable, missing await, incorrect conditionals
- **Performance**: N+1 queries, missing pagination, unbounded loops, large bundle imports, memory leaks
- **Error Handling**: Missing try/catch on async ops, swallowed errors, unhelpful error messages

#### Suggestions (Nice to Have)
- **Readability**: Confusing variable names, overly complex logic, missing type annotations where helpful
- **Patterns**: Better approaches for the same result, unused code, dead code paths
- **Consistency**: Style inconsistencies with the rest of the codebase

### Step 3: Read Full Files When Needed
If the diff alone isn't enough context, read the full file to understand:
- What the function/component does overall
- Whether the change breaks existing behavior
- Whether imports/exports are correct

### Step 4: Check Shopify-Specific Patterns (if applicable)
If the changes involve Shopify code, additionally check:
- `authenticate.admin(request)` called in every loader/action
- Webhook HMAC validation not bypassed
- GraphQL query cost within limits
- Rate limiting considered
- GDPR webhooks handled
- Session token used (not cookies)
- App Bridge APIs used correctly

## Output Format

```
## Code Review Summary

**Scope**: [1-2 sentence summary of what changed]
**Risk Level**: 🟢 Low / 🟡 Medium / 🔴 High

---

### 🔴 Critical (N issues)

**[filename:line]** — [issue title]
[explanation + how to fix]

---

### 🟡 Important (N issues)

**[filename:line]** — [issue title]
[explanation + how to fix]

---

### 💡 Suggestions (N items)

**[filename:line]** — [suggestion]
[brief explanation]

---

### ✅ What Looks Good
- [positive observation 1]
- [positive observation 2]

**Verdict**: ✅ Ship it / ⚠️ Fix important issues first / 🛑 Critical issues found
```

## Rules

- **Be specific** — always reference file:line, never say "somewhere in the code"
- **Be actionable** — every issue must have a clear fix suggestion
- **Don't nitpick** — skip style preferences, minor formatting, subjective opinions
- **Don't invent issues** — only report what you actually see in the diff
- **Read full files** when diff context isn't enough to determine if something is a real issue
- **Praise good code** — always include "What Looks Good" section
- **No false positives** — if you're unsure whether something is a bug, say "potential issue" not "bug"
- **Prioritize** — Critical first, then Important, then Suggestions
- **Be concise** — explain just enough to understand the issue and fix
