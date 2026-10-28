const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname, '..');

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory() ? files(path.join(directory, item.name)) : [path.join(directory, item.name)],
  );
}
function verifyArtifacts() {
  const dist = path.join(root, 'miniprogram/dist');
  const output = files(dist);
  const wxss = output
    .filter((file) => file.endsWith('.wxss'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  assert.match(wxss, /min-height:\s*88rpx/);
  assert.match(wxss, /border-radius:\s*100rpx/);
  assert.match(wxss, /translateY\(4rpx\)/);
  assert.match(wxss, /#19c8b9/i);
  assert.match(wxss, /fg-button--primary\.fg-button--pressed/);
  const app = JSON.parse(readFileSync(path.join(dist, 'app.json'), 'utf8'));
  assert.deepEqual(app.pages, ['pages/index/index']);
  assert.ok(output.some((file) => file.endsWith('.wxml')));
  assert.ok(readFileSync(path.join(root, 'web-admin/dist/index.html'), 'utf8').includes('zh-CN'));
  console.info(
    'PASS: actual weapp artifacts, 44 logical px -> 88rpx (converted once), primary/pressed tokens, Web bundle',
  );
}

async function smoke(target, workspace, args, ready) {
  const child = spawn(
    process.execPath,
    [process.env.npm_execpath, 'run', 'dev', '--workspace', workspace, ...args],
    {
      cwd: root,
      detached: process.platform !== 'win32',
      env: { ...process.env, APP_ENV: 'dev', NODE_ENV: 'development', PORT: '18080' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  try {
    const deadline = Date.now() + 120000;
    let success = false;
    while (Date.now() < deadline && child.exitCode === null) {
      if (await ready(output)) {
        success = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    assert.ok(success, `${target} dev failed: ${output.slice(-5000)}`);
    console.info(`PASS: ${target} actual dev command started`);
  } finally {
    if (process.platform === 'win32')
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        /* already exited */
      }
    }
    await new Promise((resolve) => {
      if (child.exitCode !== null) resolve();
      else child.once('exit', resolve);
    });
  }
}
async function httpReady(url, expected) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok && (await response.text()).includes(expected);
  } catch {
    return false;
  }
}
async function main() {
  verifyArtifacts();
  await smoke(
    'Express',
    'server',
    [],
    (output) =>
      output.includes('server listening on 18080 (dev)') &&
      httpReady('http://127.0.0.1:18080/healthz', '"environment":"dev"'),
  );
  await smoke(
    'Web admin',
    'web-admin',
    ['--', '--port', '15173'],
    async (output) =>
      output.includes('ready in') &&
      (await httpReady('http://127.0.0.1:15173/', '家庭成长支持')) &&
      (await httpReady('http://127.0.0.1:15173/src/main.tsx', 'createRoot')),
  );
  await smoke('Taro weapp watch compiler', 'miniprogram', [], (output) =>
    /compiled successfully|编译成功/i.test(output),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
