// Keep the consumer source badge as the original compact header pill.
// Run with: node tests/test_badge_layout.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components', 'smartify_flow_card', 'frontend', 'smartify-flow-card.js'), 'utf8');
assert.match(code, /<span class="nm">\$\{this\._esc\(n\.name\)\}<\/span><span class="bd"><\/span><\/div>/,
  'the badge remains inside the title header, at the top right');
assert.match(code, /<div class="val"><\/div><div class="sub"><\/div>/,
  'the badge is no longer placed between power and energy values');
const style = code.match(/\.bd\{([^}]*)\}/)?.[1] || '';
assert.match(style, /width:auto/, 'the badge has intrinsic width, not a full-width bar');
assert.doesNotMatch(style, /width:100%/, 'the badge must never span the full tile');
assert.match(style, /white-space:pre/, 'each source remains on its own line');
assert.match(code, /return parts\.join\('\\n'\)/, 'source percentages stack inside the badge');
console.log('Compact source badge layout tests passed');
