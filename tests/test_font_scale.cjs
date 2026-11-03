// Validate editable percentage scaling of all visible card text.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname,'..','custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');
assert.match(code, /_fontScaleControl\(section\)/, 'percentage font editor control exists');
assert.match(code, /Schriftgröße aller Kartentexte \(%\)/, 'editor uses visible percentage label');
assert.match(code, /this\._put\(\['font_scale'\], value \/ 100\)/, 'percentage is persisted as legacy-compatible ratio');
assert.match(code, /this\._fontScaleControl\(sec\)/, 'control appears in editor');
assert.match(code, /font-size:\$\{scale\}em/, 'text scaling applied to card font root');
assert.match(code, /Math\.max\(0\.5, Math\.min\(2, Number\(this\._c\.font_scale\) \|\| 1\)\)/, '50–200 percent supported');
assert.doesNotMatch(code, /\['Schriftgröße \/ Skalierung','font_scale'\]/, 'old confusing raw scaling input removed');
console.log('Font percentage control tests passed');
