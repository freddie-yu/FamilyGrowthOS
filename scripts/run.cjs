const { spawn } = require('node:child_process');
const { loadEnvironment } = require('./environment.cjs');
const [action, target, environment = process.env.APP_ENV || (action === 'dev' ? 'dev' : 'prod')] =
  process.argv.slice(2);
const workspaces = { mini: 'miniprogram', server: 'server', admin: 'web-admin' };
if (!['dev', 'build'].includes(action) || !workspaces[target])
  throw new Error('Usage: run.cjs dev|build mini|server|admin [dev|staging|prod]');
const config = loadEnvironment(environment);
const child = spawn(
  process.execPath,
  [process.env.npm_execpath, 'run', action, '--workspace', workspaces[target]],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      APP_ENV: config.environment,
      NODE_ENV: action === 'dev' ? 'development' : 'production',
      TZ: 'Asia/Shanghai',
    },
  },
);
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
