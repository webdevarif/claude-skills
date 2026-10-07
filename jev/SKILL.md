---
name: jev
description: "Use when a task needs a fast, typed, probability-backed DECISION from text or JSON state instead of generated prose: classification, intent routing, labelling, triage, yes/no gates, guardrails, moderation, rubric/anchor scoring, eval judging, or any hot loop where an LLM call is too slow or too expensive. Also use for any mention of Jev, jev-latest, TypeSafe AI, System One, System-1 model, @typesafe-ai/sdk, TYPESAFE_API_KEY, or api.typesafe.ai. Do NOT use for writing, summarising, chat, code generation, or open-ended reasoning: Jev cannot generate text."
---

# Jev — TypeSafe AI System One

## What it is, and what it is not

Jev is **not an LLM**. It generates no text, holds no conversation, writes no code.

It takes **state** (a string or JSON object) plus **typed questions**, and returns
**typed answers with a calibrated confidence and a full probability distribution**.
All questions are answered in one non-autoregressive parallel pass.

> Decide by the shape of the output, not the difficulty of the task:
> output is a **decision** -> Jev. Output is **language** -> an LLM.

| The task | Use |
|---|---|
| Which bucket does this text belong to | Jev `choice` |
| Is this true of the text, yes or no | Jev `noul` |
| Where on a rubric does this sit | Jev `score` |
| Route this request to the right handler | Jev `choice` + confidence gate |
| Should the expensive agent run at all | Jev `noul` as a pre-gate |
| Grade a model output against criteria | Jev `score` (cheap LLM-judge replacement) |
| Write, explain, summarise, refactor, converse | An LLM. Jev cannot do it. |
| Extract long free-form structured content | An LLM. Jev classifies, it does not extract prose. |

## Setup

API key from <https://console.typesafe.ai> — read it from the environment, **never** inline
it in source.

```powershell
# Windows, user-level (once, then restart the terminal)
[Environment]::SetEnvironmentVariable('TYPESAFE_API_KEY','<paste-key>','User')
```

```sh
npm install @typesafe-ai/sdk   # Node 20+
```

Optional env: `TYPESAFE_DEFAULT_MODEL` (e.g. `jev-latest`), `TYPESAFE_LOG_LEVEL`.

Per-project: put `TYPESAFE_API_KEY` in `.env` and confirm `.env` is in `.gitignore`.
The SDK redacts secret headers from its logs but **not** request/response bodies, so do
not log bodies that carry personal data.

No-dependency path (REST, verified):

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <TYPESAFE_API_KEY>
Content-Type: application/json
```

## The three primitives

`noul` = yes/no probability. `choice` = one of N. `score` = ordinal rubric level.

JavaScript / TypeScript — the answer type is inferred from the questions:

```ts
import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();            // reads TYPESAFE_API_KEY
const { answers } = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: "Payment or subscription issues",
      technical: "Bugs or integration problems",
      other: null,                               // null = no description
    }),
    is_urgent: noul("The message conveys urgency or time-sensitivity"),
  },
});

answers.category.choice;      // "billing"
answers.category.confidence;  // 0.0 - 1.0
answers.is_urgent.noul;       // probability of yes, 0.0 - 1.0
```

REST body — send every question you need in **one** call, they run in parallel:

```json
{
  "state": "Stripe connect has failed for 3 days. I'm losing sales. Help ASAP.",
  "model": "jev-latest",
  "questions": {
    "department": {
      "type": "choice",
      "instructions": "Which team should handle this",
      "criteria": {
        "billing": "Payment or subscription issues",
        "technical": "Bugs or integration problems",
        "sales": "Pricing or account questions"
      }
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the customer appears",
      "criteria": [
        "Calm, just stating facts",
        "Frustrated but civil",
        "Very angry, strong language"
      ]
    },
    "is_urgent": {
      "type": "noul",
      "instructions": "The message conveys urgency or time-sensitivity"
    }
  }
}
```

`score` criteria is an **ordered array**: index 0 is the lowest level. The response returns
the `legend` back to you, plus an **expected** `score` that can land between integer levels
(e.g. `1.06`), and `probabilities` keyed by level.

Full response schemas, field by field: `references/api.md`.

## Confidence is the whole point

Every answer carries `confidence`. A model that can say "0.39" is telling you something an
LLM's confident prose never does. **Gate on it.**

```ts
const a = answers.action;
if (a.confidence < 0.5)               return routeToHuman(msg);   // genuinely unsure
if (a.choice === "check_balance")     return showBalance(id);     // low stakes
if (a.choice === "approve_transfer")  return a.confidence > 0.9   // high stakes
  ? confirmThenExecute(id)
  : askUserToConfirm(id);
```

Three rules that follow from this:

1. **Raise the bar with the stakes.** A read-only action at 0.5 is fine; a destructive or
   irreversible one wants 0.9+.
2. **Tune thresholds on your own labelled data** — plot confidence against accuracy and pick
   the knee. The 0.5 / 0.8 / 0.9 values above are starting points, not settings.
3. **`confidence` is not `max(probabilities)`.** TypeSafe's own documented example returns
   `choice: "returns"` with `probabilities.returns = 0.6` but `confidence = 0.39`. They are
   separate fields. Route on `confidence`; use `probabilities` for inspection, tie detection
   and audit trails.

## Hard rules

- **Never ask Jev to generate.** No prose, no code, no summary. Wrong tool.
- **Never present a probability as a fact.** `confidence: 0.91` is a calibration signal, not
  ground truth, and not evidence that the thing is true.
- **Never ship a Jev swap without a gold set.** Label a few hundred real examples first, then
  compare Jev against whatever it replaces on accuracy AND cost. No baseline, no claim.
- **One call, many questions.** Batching questions into a single `systemOne` call is the
  design. N sequential calls for N questions throws away the parallel pass.
- **Keep it behind a thin interface** (`classify(state, questions)`) so the model stays
  swappable and nothing downstream branches on the vendor.
- **Do not send data you would not send to any third-party API.** Strip personal identifiers
  from `state` before the call, not after.
- **Verify helper signatures before writing code.** The REST JSON above is verified. For SDK
  helper signatures — especially `score()` in JS and the Python `Score` / `Choice` classes —
  read the installed package types or query context7
  `/websites/typesafe_ai_sdk_javascript`. Do not guess from symmetry.

## Cost and latency — vendor-claimed, verify on your own workload

Roughly 70–500 ms for a full parallel pass; about $0.042 per million input tokens with
output free; TypeSafe claims up to 200x faster and 400x cheaper than comparable LLMs on
classification. These are the vendor's numbers. Measure your own p95 latency and per-1k-item
cost before putting them in a decision doc.

## More

- `references/api.md` — full request/response schemas, all three primitives, errors.
- `references/patterns.md` — intent routing, LLM pre-gate, rubric scoring, eval judge,
  threshold tuning, migrating off an LLM classifier.
- `scripts/jev.mjs` — zero-dependency CLI for ad-hoc calls and key smoke tests.
