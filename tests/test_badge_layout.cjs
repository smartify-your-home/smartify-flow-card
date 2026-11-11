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
assert.match(code, /isSourceConsumer\(n\) \? \(useStrip \? '' : this\._consumerBadge\(n, mf\)\)/, 'consumer badge only in badge mode');
assert.match(code, /<div class="vr"><div class="val"><\/div><span class="bd"><\/span><\/div>/, 'badge sits in the value row, not next to the name');
assert.match(code, /source_display: 'badge'/, 'badge display is the default');
assert.match(code, /\.source-segment\.grid\{background:var\(--c\)/, 'grid segment uses the individual device color');
assert.match(code, /strip\.dataset\.sources !== signature/, 'rebuild segments only when source identities change');
assert.match(code, /if \(label\.textContent !== display\)/, 'avoid unnecessary label writes');
assert.match(code, /context\.measureText\(/, 'use stable canvas text measurement');
assert.match(code, /required \+ 3/, 'hysteresis prevents flashing around narrow-label threshold');
assert.match(code, /required - 3/, 'opposite hysteresis threshold applied when visible');
assert.doesNotMatch(code, /label\.hidden = false;\s*\/\/ Tiny segments/, 'old unconditional visibility reset removed');
console.log('Color-segment footer layout tests passed');

// v0.6.27: share-bar label color follows the rendered background color.
{
  const begin = code.indexOf('function sfcContrastText(');
  const end = code.indexOf('\nclass SmartifyFlowCard extends HTMLElement', begin);
  assert.ok(begin >= 0 && end > begin, 'contrast helper exists');
  const contrast = require('node:vm').runInNewContext(code.slice(begin, end) + '\nsfcContrastText');
  assert.equal(contrast('rgb(142, 36, 170)'), '#ffffff', 'violet device color → white text');
  assert.equal(contrast('rgb(136, 136, 136)'), '#111111', 'grey (rest) → dark text');
  assert.equal(contrast('rgb(227, 166, 0)'), '#111111', 'PV yellow → dark text');
  assert.equal(contrast('rgb(46, 125, 50)'), '#ffffff', 'battery green → white text');
  assert.equal(contrast('rgb(17 17 17)'), '#ffffff', 'space syntax, dark grid color → white text');
  assert.equal(contrast('rgba(255, 255, 255, 0.9)'), '#111111');
  assert.equal(contrast('color(srgb 0.1 0.2 0.6)'), '#ffffff');
  assert.equal(contrast('rgba(0, 0, 0, 0)'), null, 'transparent keeps CSS default');
  assert.equal(contrast('oklch(0.5 0.1 200)'), null, 'unknown format keeps CSS default');
  assert.doesNotMatch(code, /\.source-segment\.grid\{[^}]*text-shadow/, 'no light glow behind grid label');
  assert.match(code, /segment\.dataset\.bg !== bg/, 'color is only recomputed when the background changes');
}
