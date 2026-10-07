---
paths:
  - "**/*.{test,spec}.{ts,tsx,js,mjs}"
  - "**/{e2e,tests,__tests__,playwright}/**"
  - "**/playwright.config.*"
  - "**/vitest.config.*"
---

# QA: persona-based testing and test quality

Used at the Verify step of the lifecycle and whenever tests are written.

## Personas come from real data
- Build personas from the project DB (read-only): platform, plan tier,
  billing status, catalogue size, country/locale. Re-run that query when a
  card touches billing, limits or onboarding, and whenever the first real paid
  customer appears: replace assumed personas with observed ones.
- Until then personas are ASSUMED; label them so in every report.
- Default SaaS persona set (adapt per project):
  1. New free user, empty account (first-run, empty states, onboarding).
  2. Platform merchant on the free tier (install → connect → first value).
  3. Paying merchant at the largest plan size (limits, slow pages, big tables).
  4. Billing edge: trial ending, cancelled, failed payment, downgrade.
  5. Non-English store / different currency / far-away timezone.
  6. Mobile-only user at 350 px.
  7. Admin/staff (role gates, impersonation, audit log).
  8. Hostile user (other workspace's IDs, tampered input, prompt injection
     into AI features).

## For each card, a charter per affected persona
- Format: "Explore <area> as <persona> with <data/setup> to discover
  <risk>". One area per charter; record pass/fail with evidence
  (screenshot, response, row count).
- Always include the hostile persona when a card touches auth, IDs in URLs,
  webhooks, or LLM input.

## Test quality (a test must be able to fail)
- Bug fix: write the test first, show it failing, then fix and show it passing.
- Assert behaviour the user sees, not implementation details. Playwright:
  `getByRole` locators, web-first assertions, isolated tests, mock only third
  parties.
- No test that only checks a mock returned what the mock was given.
- For pure logic with wide input ranges, prefer a property test (fast-check).
- When a test suite matters (billing, limits, auth), run mutation testing
  (Stryker) once; surviving mutants = missing assertions.

## Report format
| Persona | Charter | Result | Evidence |
Then two lists: VERIFIED (with numbers) and NOT verified (with why).
