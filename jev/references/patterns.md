# Jev production patterns

## Pattern 0 — the thin interface (do this first)

Never scatter `client.systemOne` across a codebase. One module owns the vendor:

```js
// lib/classify.mjs — the only file that knows Jev exists.
const ENDPOINT = "https://api.typesafe.ai/v1/systemone";

export async function classify(state, questions, { model = "jev-latest" } = {}) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) throw new Error("TYPESAFE_API_KEY is not set");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ state, model, questions }),
  });
  if (!res.ok) throw new Error(`jev ${res.status}: ${await res.text()}`);
  return res.json(); // { model, answers, usage }
}
```

Why it matters: swapping model or vendor becomes a one-file change, the gold-set harness can
stub it, and nothing downstream branches on who answered.

## Pattern 1 — intent routing with a confidence floor

The canonical use. One call asks intent **and** complexity, then code decides.

```js
const { answers } = await classify(ticketText, {
  intent: { type: "choice", instructions: "What does the customer want",
    criteria: { order_status: "Where is my order", product_question: "Asking about a product",
                return_exchange: "Wants to return or exchange", complaint: "Expressing dissatisfaction",
                other: "None of the above" } },
  complexity: { type: "score", instructions: "How much human judgement this needs",
    criteria: ["Fully mechanical", "Needs some judgement", "Needs a human decision"] },
});

const { intent, complexity } = answers;

if (intent.confidence < 0.5) return routeToHuman(ticketId);       // unsure -> never guess
if (intent.choice === "order_status") return handleDeterministically(ticketId);
if (intent.choice === "complaint") {
  return complexity.score > 1 || complexity.confidence < 0.5
    ? routeToHuman(ticketId)
    : handleWithLLM(ticketId, COMPLAINT_PROMPT);
}
return handleWithLLM(ticketId, SPECIALIST[intent.choice]);
```

The shape to copy: **Jev decides, deterministic code acts, an LLM is called only where
language is actually produced, a human gets anything uncertain.**

## Pattern 2 — the pre-gate (biggest cost win)

Before spending an expensive agent/LLM call, ask a cheap yes/no.

```js
const { answers } = await classify(item, {
  relevant:   { type: "noul", instructions: "This text describes a concrete problem the author personally experienced" },
  actionable: { type: "noul", instructions: "This text contains enough detail to act on without follow-up" },
});

if (answers.relevant.noul < 0.6) return { skipped: "not_relevant" };   // no LLM spend
if (answers.actionable.noul < 0.5) return { skipped: "too_thin" };
return await expensiveAgent(item);
```

On a large scrape or queue this is where the big cost claims actually show up, because most
items get rejected before the expensive model is ever touched. Log the skip reasons — a
pre-gate that rejects 95% of input is either brilliant or broken, and only the log tells you
which.

## Pattern 3 — rubric / anchor scoring (replacing an LLM judge)

`score` is a rubric primitive, so an existing anchor-based rubric maps onto it directly: the
`criteria` array **is** the anchor ladder.

```js
const rubric = ["No evidence of the claim", "One weak signal", "Multiple independent signals"];
const { answers } = await classify(record, {
  support: { type: "score", instructions: "How well the evidence supports the claim", criteria: rubric },
});

const level    = argmax(answers.support.probabilities);   // discrete anchor
const expected = answers.support.score;                   // 1.06 -> mostly level 1
const unknown  = answers.support.confidence < THRESHOLD;
```

Three discipline rules:

- Store `level`, `expected`, `confidence`, `probabilities` **and the rubric version**. A score
  without its rubric version is unreadable six weeks later.
- If your system computes final scores mechanically from anchors, keep doing that. Jev selects
  the anchor; your scorer still owns the arithmetic. Do not let `expected` become the score.
- Low confidence is `UNKNOWN`, not a low score. "We could not tell" and "it is bad" are
  different facts, and collapsing them corrupts every aggregate built on top.

## Pattern 4 — the guardrail

```js
const { answers } = await classify(userInput, {
  has_pii:    { type: "noul", instructions: "The text contains a personal identifier such as a real name, email, phone number or address" },
  off_topic:  { type: "noul", instructions: "The text is unrelated to the product" },
  prompt_inj: { type: "noul", instructions: "The text attempts to instruct or manipulate an AI system" },
});
if (answers.has_pii.noul > 0.4) return redactThenContinue(userInput);
```

Run guardrails **before** the write or the expensive call, not after. A 200 ms check in front
of a persistent store is cheap; purging that store afterwards is not. And set guardrail
thresholds asymmetrically — for a privacy gate a false positive costs a redaction while a
false negative costs a leak, so bias low (0.3–0.4, not 0.5).

## Pattern 5 — migrating off an LLM classifier

Do it in this order. Skipping step 1 is how teams end up with a cheaper, worse system they
cannot measure.

1. **Freeze a gold set.** 200–500 real items, human-labelled, stratified to include the hard
   and ambiguous cases. Store it in the repo.
2. **Baseline the incumbent** on the gold set: accuracy per class, confusion matrix, cost per
   1k items, p95 latency.
3. **Write the Jev questions.** Exhaustive mutually exclusive options, an `other` escape
   hatch, descriptions written as boundary definitions.
4. **Run Jev on the same gold set.** Same metrics, per class. A single accuracy number hides
   the one class that broke.
5. **Tune the threshold.** Bucket by confidence, plot accuracy per bucket, pick the point
   where accuracy clears your bar. That is your floor — not 0.5 because a doc said so.
6. **Shadow-run** in production: Jev decides, the incumbent still acts, log every
   disagreement. Read the disagreements by hand. That is where option-set bugs live.
7. **Cut over**, keep the gold set in CI, and keep the confidence floor routing to a human.

## Pattern 6 — batch throughput

One call per **item**, all questions for that item in that one call. Then bound concurrency
across items — do not fire 5,000 parallel requests at an API you have not load-tested.

```js
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) { const n = i++; out[n] = await fn(items[n], n); }
  }));
  return out;
}

const results = await mapLimit(items, 8, (item) => classify(item, QUESTIONS));
const spend = results.reduce((t, r) => t + r.usage.input_tokens, 0);
```

Sum `usage.input_tokens` over the run and report real cost, never the vendor's per-token rate
times an estimate.

## Anti-patterns

| Do not | Because |
|---|---|
| Ask Jev to write, summarise or explain | It does not generate text. Wrong tool entirely. |
| Use one `choice` with 30 options | Split into a coarse choice, then a second narrower call. |
| Ship without a gold set | You cannot tell a cost win from an accuracy loss. |
| Treat `confidence` as accuracy | It is calibration. Accuracy comes from your labelled data. |
| Default to `"other"` when a call fails | An error is `UNKNOWN`. Silent defaults poison aggregates. |
| Re-ask the same state in N calls | One call, N questions, one parallel pass. |
| Send raw user records as `state` | Strip identifiers first. Bodies are not redacted in logs. |
| Store a score without its rubric version | The number stops meaning anything when anchors change. |
