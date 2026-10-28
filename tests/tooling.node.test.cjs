const { mkdtempSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const YAML = require('yaml');
const { loadEnvironment } = require('../scripts/environment.cjs');
const root = path.join(__dirname, '..');

test('verification actually runs on the pinned Node version', () => {
  expect(process.versions.node).toBe(require('../package.json').engines.node);
});

test('public configuration loads dev/staging/prod independently with an allowlist', () => {
  const environmentHash = () =>
    createHash('sha256').update(JSON.stringify(process.env)).digest('hex');
  const before = environmentHash();
  for (const name of ['prod', 'dev', 'staging', 'dev']) {
    const config = loadEnvironment(name);
    expect(config.environment).toBe(name);
    expect(Object.keys(config).sort()).toEqual(['apiBaseUrl', 'environment']);
    expect(Object.isFrozen(config)).toBe(true);
  }
  expect(loadEnvironment('dev').apiBaseUrl).toBe('http://127.0.0.1:8080');
  expect(environmentHash()).toBe(before);
});

test('rejects unknown environments, mismatched files and unsafe URL protocols', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fg-public-'));
  try {
    expect(() => loadEnvironment('../prod')).toThrow('APP_ENV');
    writeFileSync(path.join(dir, 'dev.json'), JSON.stringify({ environment: 'prod' }));
    expect(() => loadEnvironment('dev', dir)).toThrow('mismatch');
    for (const apiBaseUrl of ['file:///tmp', 'http://example.invalid']) {
      writeFileSync(
        path.join(dir, 'prod.json'),
        JSON.stringify({ environment: 'prod', apiBaseUrl }),
      );
      expect(() => loadEnvironment('prod', dir)).toThrow('protocol');
    }
    writeFileSync(
      path.join(dir, 'prod.json'),
      JSON.stringify({
        environment: 'prod',
        apiBaseUrl: 'https://api.example.invalid',
        REDIS_URL: 'private-value',
        VITE_SECRET: 'private-value',
      }),
    );
    expect(loadEnvironment('prod', dir)).toEqual({
      environment: 'prod',
      apiBaseUrl: 'https://api.example.invalid',
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the actual commit-msg hook rejects malformed messages and accepts Conventional Commits', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fg-hook-'));
  const gitExec = spawnSync('git', ['--exec-path'], { encoding: 'utf8' }).stdout.trim();
  const shell =
    process.platform === 'win32' ? path.resolve(gitExec, '../../../bin/bash.exe') : 'sh';
  try {
    const file = path.join(dir, 'message');
    writeFileSync(file, 'bad message\n');
    const invalid = spawnSync(shell, ['.githooks/commit-msg', file], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(invalid.error).toBeUndefined();
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toContain('subject-empty');
    writeFileSync(file, 'chore: initialize project\n');
    const valid = spawnSync(shell, ['.githooks/commit-msg', file], { cwd: root, encoding: 'utf8' });
    expect(valid.status).toBe(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CI YAML defines the local verification command and has no deployment action', () => {
  const workflow = YAML.parse(readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'));
  expect(workflow.jobs.verify.steps.some((step) => step.run === 'npm run verify')).toBe(true);
  expect(workflow.jobs.verify.strategy.matrix.os).toEqual(['ubuntu-latest', 'windows-latest']);
  expect(workflow.permissions).toEqual({ contents: 'read' });
});

test('tokens are canonical, generated styles are current, and Taro packages use a single version', () => {
  const result = spawnSync(process.execPath, ['scripts/generate-tokens.cjs', '--check'], {
    cwd: root,
  });
  expect(result.status).toBe(0);
  const tokens = require('../shared/ui/tokens.json');
  expect(tokens.control.minTouchSize).toBe(44);
  expect(tokens.provenance.revision).toBe('8df30b8fcd842acfe18d5192d4c32ccb5c1f5f00');
  const mini = require('../miniprogram/package.json');
  const taro = Object.entries({ ...mini.dependencies, ...mini.devDependencies }).filter(([name]) =>
    name.startsWith('@tarojs/'),
  );
  expect(new Set(taro.map(([, version]) => version))).toEqual(new Set(['4.3.1']));
});

test('primary button text retains 4.5:1 contrast in default and pressed states', () => {
  const tokens = require('../shared/ui/tokens.json');
  const luminance = (hex) => {
    const [r, g, b] = hex
      .slice(1)
      .match(/../g)
      .map((part) => parseInt(part, 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
  };
  for (const background of [tokens.color.primary.default, tokens.color.primary.active]) {
    expect(
      (luminance(background) + 0.05) / (luminance(tokens.color.text.onPrimary) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
  }
});
