const { spawnSync } = require('node:child_process');
const { chmodSync } = require('node:fs');
const path = require('node:path');
if (!process.env.CI) {
  for (const name of ['pre-commit', 'commit-msg'])
    chmodSync(path.join(__dirname, '../.githooks', name), 0o755);
  const result = spawnSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exitCode = 1;
}
