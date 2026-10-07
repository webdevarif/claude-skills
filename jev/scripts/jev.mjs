#!/usr/bin/env node
// jev.mjs - ad-hoc Jev (TypeSafe AI System One) calls from the terminal.
// Zero dependencies: uses global fetch. Requires Node 20+.
//
// Auth: reads TYPESAFE_API_KEY from the environment. The key is never printed or written.
//
//   node jev.mjs --smoke
//   node jev.mjs --noul "The text expresses urgency" --state "fix this now please"
//   node jev.mjs --choice "dept=billing,technical,sales" --state-file ticket.txt
//   cat ticket.txt | node jev.mjs --questions ./questions.json --raw
//
// --questions <path> takes the full REST questions object:
//   { "<key>": { "type": "noul"|"choice"|"score",
//                "instructions": "...",
//                "criteria": { "key": "desc" } | ["level 0", "level 1"] } }

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const DEFAULT_MODEL = process.env.TYPESAFE_DEFAULT_MODEL || "jev-latest";

const USAGE = `jev.mjs - ad-hoc Jev calls

  --state <text>          state as an inline string
  --state-file <path>     state from a file (JSON is parsed, otherwise plain text)
                          with neither, state is read from stdin
  --questions <path>      questions object as JSON (full control)
  --noul "<statement>"    shorthand: one yes/no question
  --choice "key=a,b,c"    shorthand: one choice question over those options
  --score "key=low,mid,high"  shorthand: one ordinal question, first = level 0
  --model <name>          default: ${DEFAULT_MODEL}
  --raw                   print the full JSON response
  --smoke                 verify the key and endpoint with a tiny fixed call
  -h, --help              this text

Shorthands may be repeated and combined; they all go in one parallel call.`;

function die(msg) {
  console.error(`jev: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { repeats: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) die(`${a} needs a value`);
      return v;
    };
    switch (a) {
      case "--state":       out.state = next(); break;
      case "--state-file":  out.stateFile = next(); break;
      case "--questions":   out.questionsFile = next(); break;
      case "--model":       out.model = next(); break;
      case "--noul":        out.repeats.push(["noul", next()]); break;
      case "--choice":      out.repeats.push(["choice", next()]); break;
      case "--score":       out.repeats.push(["score", next()]); break;
      case "--raw":         out.raw = true; break;
      case "--smoke":       out.smoke = true; break;
      case "-h":
      case "--help":        out.help = true; break;
      default: die(`unknown argument: ${a}`);
    }
  }
  return out;
}

// "key=a,b,c" -> ["key", ["a","b","c"]]
function splitSpec(spec, flag) {
  const eq = spec.indexOf("=");
  if (eq === -1) die(`--${flag} needs "key=option1,option2,..." (got: ${spec})`);
  const key = spec.slice(0, eq).trim();
  const parts = spec.slice(eq + 1).split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || parts.length === 0) die(`bad --${flag} spec: ${spec}`);
  return [key, parts];
}

function buildShorthand(repeats) {
  const questions = {};
  let n = 0;
  for (const [type, spec] of repeats) {
    if (type === "noul") {
      questions[`q${++n}`] = { type: "noul", instructions: spec };
      continue;
    }
    const [key, parts] = splitSpec(spec, type);
    questions[key] = type === "choice"
      ? { type: "choice", instructions: `Which applies: ${key}`,
          criteria: Object.fromEntries(parts.map((p) => [p, null])) }
      : { type: "score", instructions: `Rate: ${key}`, criteria: parts };
  }
  return questions;
}

async function readStdin() {
  if (process.stdin.isTTY) return null;
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  return text || null;
}

async function resolveState(args, fs) {
  if (args.state !== undefined) return args.state;
  if (args.stateFile) {
    const text = await fs.readFile(args.stateFile, "utf8");
    try { return JSON.parse(text); } catch { return text; }
  }
  const piped = await readStdin();
  if (piped === null) die("no state: pass --state, --state-file, or pipe it on stdin");
  return piped;
}

async function callJev(state, questions, model) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) die("TYPESAFE_API_KEY is not set (get a key at https://console.typesafe.ai)");

  const started = Date.now();
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state, model, questions }),
    });
  } catch (err) {
    die(`request failed: ${err.message}`);
  }

  const body = await res.text();
  if (!res.ok) die(`HTTP ${res.status}\n${body}`);

  try {
    return { json: JSON.parse(body), ms: Date.now() - started };
  } catch {
    die(`response was not JSON:\n${body}`);
  }
}

// Compact human-readable view. The full response is always available with --raw.
function render({ json, ms }) {
  const lines = [];
  for (const [key, a] of Object.entries(json.answers ?? {})) {
    const label = key.padEnd(20);
    if (a.type === "noul") {
      lines.push(`${label} noul   ${a.noul.toFixed(3)}`);
    } else if (a.type === "choice") {
      const dist = Object.entries(a.probabilities ?? {})
        .sort((x, y) => y[1] - x[1])
        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
        .join(" ");
      lines.push(`${label} choice ${a.choice}  conf=${a.confidence.toFixed(3)}  [${dist}]`);
    } else if (a.type === "score") {
      const dist = Object.entries(a.probabilities ?? {})
        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
        .join(" ");
      lines.push(`${label} score  ${a.score.toFixed(2)}  conf=${a.confidence.toFixed(3)}  [${dist}]`);
    } else {
      lines.push(`${label} ${a.type ?? "?"}  ${JSON.stringify(a)}`);
    }
  }
  const u = json.usage ?? {};
  lines.push("");
  lines.push(`model=${json.model}  ${ms}ms  in=${u.input_tokens ?? "?"} out=${u.output_tokens ?? "?"}`);
  return lines.join("\n");
}

const SMOKE_STATE = "I was charged twice for my subscription. Please fix this today.";
const SMOKE_QUESTIONS = {
  category: {
    type: "choice",
    instructions: "What is this about",
    criteria: {
      billing: "Payment or subscription issues",
      technical: "Bugs or integration problems",
      other: "Neither of the above",
    },
  },
  is_urgent: { type: "noul", instructions: "The message conveys urgency" },
};

async function main() {
  const fs = await import("node:fs/promises");
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(USAGE);
    return;
  }

  const model = args.model || DEFAULT_MODEL;

  if (args.smoke) {
    const result = await callJev(SMOKE_STATE, SMOKE_QUESTIONS, model);
    console.log(args.raw ? JSON.stringify(result.json, null, 2) : render(result));
    console.log("\nsmoke test OK - key and endpoint work.");
    return;
  }

  let questions = buildShorthand(args.repeats);
  if (args.questionsFile) {
    const text = await fs.readFile(args.questionsFile, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      die(`${args.questionsFile}: ${e.message}`);
    }
    questions = { ...parsed, ...questions };
  }
  if (Object.keys(questions).length === 0) {
    die("no questions: pass --questions <path>, or --noul/--choice/--score (see --help)");
  }

  const state = await resolveState(args, fs);
  const result = await callJev(state, questions, model);
  console.log(args.raw ? JSON.stringify(result.json, null, 2) : render(result));
}

main().catch((err) => die(err.stack || err.message));
