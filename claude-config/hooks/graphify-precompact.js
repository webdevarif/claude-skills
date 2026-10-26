// PreCompact hook: refresh the code graph (AST only, no LLM) before compacting,
// but only in projects that already have a graphify graph.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const cwd = (JSON.parse(input || '{}').cwd) || process.cwd();
    if (fs.existsSync(path.join(cwd, 'graphify-out', 'graph.json'))) {
      spawnSync('graphify', ['update', '.', '--no-cluster'], { cwd, timeout: 55000, stdio: 'ignore', shell: true });
    }
  } catch {}
  process.stdout.write('{}');
});
