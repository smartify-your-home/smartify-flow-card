// Regression: source percentages belong in compact colored footer, not header badge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components', 'smartify_flow_card', 'frontend', 'smartify-flow-card.js'), 'utf8');

assert.match(code, /<div class="source-strip" hidden><\/div>/, 'source strip is part of each node');
assert.match(code, /\.node\.has-source-strip::after\{display:none\}/, 'old color-only pseudo strip hidden on consumers');
assert.match(code, /--sf-source-height,22px/, 'source bar is high enough for labels');
assert.match(code, /\.flow\.radial \.node\.has-source-strip\{padding-bottom:/, 'radial reserves footer text space');
assert.match(code, /this\._updateSourceStrip\(strip, n\)/, 'segments are populated from each device');
assert.match(code, /this\._fitSourceLabels\(\)/, 'tiny segment labels are measured before display');
assert.match(code, /label\.hidden = true/, 'tiny segments cannot overlap adjacent labels');
assert.match(code, /Math\.round\(pct\)/, 'percentage labels are rounded to zero decimals');
assert.match(code, /el\.querySelector\('\.bd'\)\.textContent = isSourceConsumer\(n\) \? ''/, 'consumer header badge is empty');
console.log('Color-segment footer layout tests passed');
