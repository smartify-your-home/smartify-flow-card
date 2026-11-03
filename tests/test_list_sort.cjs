// Aggregated and unassigned consumers must be ordered by live W in list layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components', 'smartify_flow_card', 'frontend', 'smartify-flow-card.js'), 'utf8');
const start = code.indexOf('function sfcSortLoadTiles(');
const end = code.indexOf('\nfunction sfcAllocateSources(', start);
assert.ok(start >= 0 && end > start, 'list sorter function exists');
const sort = vm.runInNewContext(code.slice(start, end) + '\nsfcSortLoadTiles');
const tiles = [
  {key:'sensor.wp',w:850},
  {key:'sensor.light',w:100},
  {key:'_other',w:1200},
  {key:'_rest',w:1700},
];
assert.deepEqual(Array.from(sort(tiles), tile => tile.key), ['_rest','_other','sensor.wp','sensor.light']);
assert.equal(tiles[0].key, 'sensor.wp', 'input unchanged');
assert.deepEqual(Array.from(sort([{key:'_other',w:500},{key:'sensor.wp',w:600}]), x => x.key), ['sensor.wp','_other']);
assert.match(code, /if \(c\.layout !== 'radial'\) \{\s*right\.splice\(/, 'do not rearrange radial positions');
console.log('Consumer list watt sorting regression tests passed');
