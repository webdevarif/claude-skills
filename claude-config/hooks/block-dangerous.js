#!/usr/bin/env node
// PreToolUse guard for Bash/PowerShell (global, ~/.claude/settings.json).
// Exit 2 blocks the call and shows stderr to Claude. Blocks:
//   - git push that targets main/master (explicit refspec, HEAD, or bare push while on main/master)
//   - prisma migrate dev | prisma migrate reset | prisma db push
//   - drizzle-kit push
// Why: local .env points at the production DB; main auto-deploys.
const { execFileSync } = require("child_process");
const path = require("path");

const PROTECTED = new Set(["main", "master"]);

function currentBranch(cwd) {
  try {
    // symbolic-ref also works on a branch with no commits yet
    return execFileSync("git", ["-C", cwd, "symbolic-ref", "--short", "-q", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 3000,
    }).trim();
  } catch {
    return "";
  }
}

function refTarget(ref, branch) {
  const dest = ref.includes(":") ? ref.split(":").pop() : ref;
  const name = dest.replace(/^\+/, "").replace(/^refs\/heads\//, "");
  return name === "HEAD" ? branch : name;
}

function checkGitPush(tokens, cwd) {
  let i = tokens.indexOf("git");
  if (i < 0) return null;
  i++;
  // git global options before the subcommand, e.g. git -C dir push
  while (i < tokens.length && tokens[i].startsWith("-")) {
    if (tokens[i] === "-C" && tokens[i + 1]) {
      cwd = path.resolve(cwd, tokens[i + 1]);
      i += 2;
    } else if (tokens[i] === "-c") {
      i += 2;
    } else {
      i++;
    }
  }
  if (tokens[i] !== "push") return null;
  const args = tokens.slice(i + 1).filter((t) => !t.startsWith("-"));
  const branch = currentBranch(cwd);
  const refs = args.slice(1); // args[0] = remote
  if (refs.length === 0) {
    return PROTECTED.has(branch) ? `bare "git push" while on ${branch}` : null;
  }
  for (const r of refs) {
    const target = refTarget(r, branch);
    if (PROTECTED.has(target)) return `"git push" targets ${target}`;
  }
  return null;
}

const DB_RULES = [
  [/\bprisma\s+migrate\s+dev\b/, "prisma migrate dev"],
  [/\bprisma\s+migrate\s+reset\b/, "prisma migrate reset"],
  [/\bprisma\s+db\s+push\b/, "prisma db push"],
  [/\bdrizzle-kit\s+push\b/, "drizzle-kit push"],
];

function check(command, cwd) {
  const segments = command.split(/&&|\|\||;|\||\r?\n/);
  for (const raw of segments) {
    const seg = raw.trim();
    if (!seg) continue;
    const tokens = seg.split(/\s+/).map((t) => t.replace(/^["']|["']$/g, ""));
    if ((tokens[0] === "cd" || tokens[0] === "Set-Location") && tokens[1]) {
      cwd = path.resolve(cwd, tokens[1].replace(/^~/, process.env.HOME || process.env.USERPROFILE || "~"));
      continue;
    }
    for (const [re, label] of DB_RULES) {
      if (re.test(seg)) return `${label} (rewrites the schema without a migration; local DB is production)`;
    }
    const push = checkGitPush(tokens, cwd);
    if (push) return `${push} (never push to main: branch + PR, Arif merges)`;
  }
  return null;
}

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const command = (data.tool_input && data.tool_input.command) || "";
  const reason = check(command, data.cwd || process.cwd());
  if (reason) {
    process.stderr.write(
      `BLOCKED by ~/.claude/hooks/block-dangerous.js: ${reason}. ` +
        `If Arif explicitly wants this, ask him to run it himself.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});
