---
name: design-systems
description: >-
  Library of 150 brand-grade design systems (adapted from Open Design's
  DESIGN.md library). Use BEFORE building or restyling any UI — web page,
  dashboard, app screen, landing page, component, or artifact — to apply a
  concrete, opinionated design contract instead of generic/templated defaults.
  Each system is a curated DESIGN.md (palette, type scale, components, layout,
  depth, do's/don'ts, responsive) plus exact design-tokens.json. Pick one that
  fits the brief's mood/brand/domain, read it, and follow it.
---

# Design Systems

A library of **150 brand-grade design systems**. Each lives in
`systems/<name>/` with:
- **`DESIGN.md`** — the design contract: visual theme, color palette + roles,
  typography, component stylings, layout, depth/elevation, do's & don'ts,
  responsive behavior, and an **Agent Prompt Guide** written for you.
- **`design-tokens.json`** — exact token values (colors, spacing, radii, type).

## When to use
Any time you design or restyle UI and the output should look intentional and
brand-grade — landing pages, dashboards, app screens, marketing sites, decks,
components. Skip only for trivial one-off tweaks where a full system is overkill.

## Workflow
1. **Read the brief for mood / brand / domain.** Fintech? Dev tool? Playful
   consumer app? Editorial? Match to a category below.
2. **Pick ONE system** from the index. If the brief names or resembles a brand
   (Linear, Stripe, Notion…), use it. If unsure, use `default` (Neutral Modern)
   or `warm-editorial`. Do NOT mix two systems in one screen.
3. **Read `systems/<name>/DESIGN.md`** and follow it as a contract — its palette,
   type scale, component specs, layout rules, and its Agent Prompt Guide.
4. **For exact values**, read `systems/<name>/design-tokens.json`.
5. **Apply consistently.** Universal rules from the library:
   - Don't invent hex values outside the system's palette — use the closest
     token; if truly missing, add a warning comment and use the nearest one.
   - One hero accent + at most one CTA accent per screen unless the system says
     otherwise (Bold/Expressive systems allow more).
   - Respect the system's depth model (e.g. no glassmorphism in a Flat system).
   - Keep type sizes to the system's scale; avoid >3 sizes on one screen.

## Index (150 systems)

**Starter (safe defaults):** `default` (Neutral Modern) · `warm-editorial`

**AI & LLM:** `claude` · `openai` · `cohere` · `perplexity` · `mistral-ai` ·
`huggingface` · `elevenlabs` · `ollama` · `replicate` · `runwayml` ·
`together-ai` · `minimax` · `voltagent` · `x-ai` · `opencode-ai`

**Developer Tools:** `vercel` · `github` · `cursor` · `raycast` · `warp` ·
`superhuman` · `lovable` · `expo` · `mission-control`

**Productivity & SaaS:** `linear-app` · `notion` · `slack` · `discord` ·
`intercom` · `cal` · `zapier` · `resend` · `mintlify` · `duolingo` · `webex` · `arc`

**Modern & Minimal:** `minimal` · `modern` · `clean` · `flat` · `mono` ·
`simple` · `sleek` · `refined` · `contemporary` · `shadcn`

**Bold & Expressive:** `bold` · `brutalism` · `neobrutalism` · `colorful` ·
`vibrant` · `dramatic` · `energetic` · `expressive`

**Morphism & Effects:** `glassmorphism` · `claymorphism` · `neumorphism` ·
`skeumorphism` · `gradient` · `neon`

**Professional & Corporate:** `corporate` · `enterprise` · `professional` ·
`material` · `ant` · `application` · `dashboard` · `elegant` · `premium` · `luxury`

**Fintech & Crypto:** `stripe` · `coinbase` · `binance` · `kraken` · `revolut` ·
`wise` · `mastercard`

**Backend & Data:** `supabase` · `mongodb` · `sentry` · `posthog` · `sanity` ·
`clickhouse` · `hashicorp` · `composio` · `cisco`

**Design & Creative:** `figma` · `framer` · `canva` · `webflow` · `miro` ·
`airtable` · `clay`

**Creative & Artistic:** `creative` · `artistic` · `editorial` · `publication` ·
`storytelling` · `cosmic` · `fantasy` · `friendly` · `doodle` · `cafe` · `lingo`

**Media & Consumer:** `apple` · `spotify` · `nvidia` · `spacex` · `uber` ·
`pinterest` · `playstation` · `theverge` · `wired` · `ibm` · `vodafone` · `xiaohongshu`

**E-Commerce & Retail:** `shopify` · `airbnb` · `nike` · `starbucks` · `meta`

**Automotive:** `tesla` · `bmw` · `bmw-m` · `ferrari` · `lamborghini` ·
`bugatti` · `renault`

**Layout & Structure:** `bento` · `levels` · `perspective` · `spacious`

**Retro & Nostalgic:** `retro` · `vintage` · `paper` · `dithered`

**Editorial & Print:** `atelier-zero` · `kami` · `urdu`

**Social & Messaging:** `wechat`

**Themed & Unique:** `agentic` · `futuristic` · `hud` · `loom` ·
`trading-terminal` · `pacman` · `tetris` · `totality-festival`

---

_Source: adapted from Open Design's open-source DESIGN.md library
(github.com/nexu-io/open-design). The full product is an MCP-served desktop app;
this skill vendors just the design-system contracts for offline use._
