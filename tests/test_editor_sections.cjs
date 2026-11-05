// Regression: editor sections are collapsible and start closed for each new editor instance.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components', 'smartify_flow_card', 'frontend', 'smartify-flow-card.js'), 'utf8');

assert.match(code, /this\._openSections = new Set\(\);/, 'open state is per editor instance (constructor)');
assert.match(code, /section\.classList\.toggle\('collapsed', !open\)/, 'sections start collapsed unless opened in this instance');
assert.match(code, /section\.collapsed>:not\(h3\)\{display:none!important\}/, 'collapsed sections hide their content');
assert.match(code, /h\.setAttribute\('aria-expanded'/, 'header exposes expanded state');
assert.match(code, /e\.key === 'Enter' \|\| e\.key === ' '/, 'keyboard toggle supported');
console.log('Editor section collapse tests passed');
