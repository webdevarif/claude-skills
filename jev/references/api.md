# Jev API reference

Verified against docs.typesafe.ai. Endpoint, primitives and response fields below are
documented; anything marked UNVERIFIED must be checked against the installed SDK types
before you write code on top of it.

## Endpoint

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <TYPESAFE_API_KEY>
Content-Type: application/json
```

Request top level:

| Field | Type | Notes |
|---|---|---|
| `state` | string or JSON object | The thing being judged. Strip personal identifiers first. |
| `model` | string | e.g. `jev-latest`. Or set `TYPESAFE_DEFAULT_MODEL`. |
| `questions` | object | Map of `your_key` -> question. All answered in one parallel pass. |

Response top level: `{ model, answers, usage }` where `usage` is
`{ input_tokens, output_tokens }`. Answers are keyed by your question keys, and each answer
carries a `type` discriminator matching the question type.

## SDKs

| Language | Package | Client |
|---|---|---|
| JS / TS | `@typesafe-ai/sdk` (Node 20+) | `new TypeSafeClient()` -> `client.systemOne({ state, questions })` |
| Python | TypeSafe Python SDK | `TypeSafeClient(...)` -> `client.system_one(state=..., questions={...})` |
| .NET | `/saibimajdi/typesafe-dotnet-sdk` (community-maintained, not official) | — |

Python `TypeSafeClient` constructor options: `api_key`, `model`, `retry` (RetryPolicy),
`timeout`, `headers`, `transport`, `http_client`, `base_url`. Explicit arguments win over
environment variables. Logging via the `typesafe_sdk` logger or `TYPESAFE_LOG_LEVEL`.
Secret headers are redacted in logs; **request and response bodies are not**.

## Primitive 1 — `noul` (yes / no)

Request:

```json
{ "type": "noul", "instructions": "The message conveys urgency or time-sensitivity" }
```

Write `instructions` as a **statement that could be true or false**, not a question, and
keep it to one proposition. "The message conveys urgency" is good. "Is it urgent and is the
customer angry" is two questions wearing one hat — split it.

Response (`NoulResponse`):

| Field | Type | Meaning |
|---|---|---|
| `noul` | number | Probability of yes, 0.0–1.0 |
| `type` | `"noul"` | Discriminator |

JS: `noul("The message conveys urgency")` -> `answers.key.noul`.

## Primitive 2 — `choice` (one of N)

Request — `criteria` is an object of `value -> description`; a description may be `null`:

```json
{
  "type": "choice",
  "instructions": "Which team should handle this",
  "criteria": {
    "billing": "Payment or subscription issues",
    "technical": "Bugs or integration problems",
    "sales": "Pricing or account questions"
  }
}
```

Response (`ChoiceResponse`):

| Field | Type | Meaning |
|---|---|---|
| `choice` | string | The selected key |
| `confidence` | number | Calibrated confidence, 0.0–1.0 |
| `probabilities` | object | `key -> probability` across all options |
| `type` | `"choice"` | Discriminator |

Make the option set **exhaustive and mutually exclusive**, and include an explicit escape
hatch (`other`, `none`, `unclear`) so the model is never forced to pick a wrong bucket.
Descriptions do real work — write them as boundary definitions, not synonyms of the key.

### `confidence` is not `max(probabilities)`

From TypeSafe's own documented example:

```json
"department": {
  "type": "choice",
  "choice": "returns",
  "confidence": 0.39,
  "probabilities": { "shipping": 0.02, "billing": 0.38, "returns": 0.6 }
}
```

The winning option has 0.6 of the mass but `confidence` is 0.39. Treat them as two separate
signals: **route on `confidence`**, and use `probabilities` for inspection, near-tie
detection (`top1 - top2` is small -> the option set is probably overlapping) and audit logs.

## Primitive 3 — `score` (ordinal rubric)

Request — `criteria` is an **ordered array**, index 0 = lowest level:

```json
{
  "type": "score",
  "instructions": "How severe is this bug",
  "criteria": [
    "Cosmetic; no impact to functionality",
    "Broken or degraded feature, but workaround exists",
    "Blocking issue; no workaround exists"
  ]
}
```

Response (`ScoreResponse` / `ScoreAnswer`):

| Field | Type | Meaning |
|---|---|---|
| `score` | number | **Expected** score — can land between integer levels, e.g. `1.06` |
| `confidence` | number | Confidence in the score |
| `legend` | object | Rubric echoed back, keyed by integer level, with `what` and `examples` |
| `probabilities` | object | Probability per integer level |
| `type` | `"score"` | Discriminator |

Example response:

```json
"bug_severity": {
  "type": "score",
  "score": 1.06,
  "confidence": 0.91,
  "legend": {
    "0": { "what": "Cosmetic; no impact to functionality",
           "examples": ["typo in a label", "misaligned icon"] },
    "1": { "what": "Broken or degraded feature, but workaround exists",
           "examples": ["export fails in one browser but works in another"] },
    "2": { "what": "Blocking issue; no workaround exists",
           "examples": ["cannot log in", "data loss"] }
  },
  "probabilities": { "0": 0.0, "1": 0.94, "2": 0.06 }
}
```

Two consequences of `score` being an expectation:

- **Do not round silently.** `1.5` means the model is genuinely split between levels 1 and 2,
  not that the answer is 1 or 2. If you need a discrete level, take `argmax(probabilities)`
  and keep the expected `score` beside it.
- **Do not reuse a score across rubric versions.** Change the `criteria` array and the number
  means something else. Version the rubric and store the version with the result.

Keep rubrics to 3–5 levels with **behaviourally distinct** anchors. If two adjacent levels
need the same example, they are one level.

## Types (JS SDK)

`ResultFor<T>` maps a question type to its response type:

```ts
type ResultFor<T> =
  T extends NoulQuestion   ? NoulResponse   :
  T extends ScoreQuestion<infer S>  ? ScoreResponse<S>  :
  T extends ChoiceQuestion<infer E> ? ChoiceResponse<E> : never;
```

So `answers` is fully typed from the `questions` object you passed — the choice keys survive
into the response type, and a typo in `answers.category.choise` is a compile error.

### UNVERIFIED — check before use

- The JS `score()` helper's exact signature (the `noul()` and `choice()` signatures are
  verified above). Read `node_modules/@typesafe-ai/sdk` types, or query context7
  `/websites/typesafe_ai_sdk_javascript`.
- Rate limits, quota behaviour and the exact error body shape. Check
  <https://console.typesafe.ai> and `https://docs.typesafe.ai/api`.
- Whether `state` as an object has a size ceiling, and how it is serialised into tokens.
  `usage.input_tokens` in the response is the ground truth for what you were billed for —
  log it.

## Error handling

Treat it as any HTTP API: retry `429` and `5xx` with backoff (the Python SDK takes a
`RetryPolicy`; in JS wrap your own), fail closed on `4xx`, and **never** let a Jev failure
silently become a default classification. A failed call is `UNKNOWN`, not `"other"`.
