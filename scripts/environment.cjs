const { readFileSync } = require('node:fs');
const path = require('node:path');
const environments = ['dev', 'staging', 'prod'];

function loadEnvironment(name, directory = path.join(__dirname, '../config/environments')) {
  if (!environments.includes(name)) throw new Error('APP_ENV must be dev, staging or prod');
  const config = JSON.parse(readFileSync(path.join(directory, `${name}.json`), 'utf8'));
  if (config.environment !== name) throw new Error('Environment configuration mismatch');
  const url = new URL(config.apiBaseUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    (name !== 'dev' && url.protocol !== 'https:')
  ) {
    throw new Error('Invalid API URL protocol');
  }
  // Public configuration is an explicit allowlist; never spread config into a client bundle.
  return Object.freeze({ environment: name, apiBaseUrl: url.origin });
}
module.exports = { loadEnvironment };
