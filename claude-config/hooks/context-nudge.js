// UserPromptSubmit hook: when the session context passes a threshold, tell
// Claude to write a handoff and give the user a one-line resume prompt.
const fs = require('fs');

const LIMIT = 150000;
const TAIL = 2 * 1024 * 1024;

function lastContextTokens(file) {
  const size = fs.statSync(file).size;
  const len = Math.min(size, TAIL);
  const buf = Buffer.alloc(len);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, buf, 0, len, size - len);
  fs.closeSync(fd);
  const lines = buf.toString('utf8').split('\n').reverse();
  for (const line of lines) {
    if (!line.includes('"usage"')) continue;
    try {
      const j = JSON.parse(line);
      const u = j.message && j.message.usage;
      if (j.type !== 'assistant' || !u || j.isSidechain) continue;
      return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    } catch {}
  }
  return 0;
}

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const { transcript_path } = JSON.parse(input);
    const used = transcript_path ? lastContextTokens(transcript_path) : 0;
    if (used < LIMIT) return process.stdout.write('{}');
    const k = Math.round(used / 1000);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext:
          `Context is ${k}k tokens. Answer the user's prompt first. Then, at the next natural stopping point ` +
          `(card done, PR link given, verify finished, or before starting a new topic), write a handoff: ` +
          `update the project's living artifact/change card and a memory file with what is done (commits, branch, PR), ` +
          `what is left, what was tried and failed and why, and the exact next step. Then tell the user in one line ` +
          `to run /clear and paste a resume prompt you give them, e.g. "<project> CC-N continue koro". ` +
          `Mention this once per stopping point, not on every reply.`,
      },
    }));
  } catch {
    process.stdout.write('{}');
  }
});
