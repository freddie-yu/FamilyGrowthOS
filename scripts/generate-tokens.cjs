const fs = require('node:fs');
const path = require('node:path');
const tokens = require('../shared/ui/tokens.json');
function flatten(value, keys = []) {
  return Object.entries(value).flatMap(([key, child]) => {
    const parts = [...keys, key];
    if (typeof child === 'object') return flatten(child, parts);
    const name = parts.join('-').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const unit =
      typeof child !== 'number' || parts.includes('weight')
        ? ''
        : parts[0] === 'motion' && key !== 'pressOffset'
          ? 'ms'
          : 'px';
    return [[name, `${child}${unit}`]];
  });
}
const entries = flatten(
  Object.fromEntries(Object.entries(tokens).filter(([key]) => key !== 'provenance')),
);
const notice = 'Generated from shared/ui/tokens.json (MIT, guokaigdg 2026). Do not edit.';
const outputs = {
  'miniprogram/ui/tokens.scss': `// ${notice}\n${entries.map(([key, value]) => `$fg-${key}: ${value};`).join('\n')}\n`,
  'web-admin/src/ui/tokens.css': `/* ${notice} */\n:root {\n${entries.map(([key, value]) => `  --fg-${key}: ${value};`).join('\n')}\n}\n`,
};
for (const [file, content] of Object.entries(outputs)) {
  const target = path.join(__dirname, '..', file);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content)
      throw new Error(`Stale tokens: ${file}`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}
