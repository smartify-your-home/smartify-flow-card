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
assert.deepEqual(Array.from(sort(tiles, true), x => x.key), ['_other','sensor.wp','sensor.light','_rest'], 'optional rest-last applies only when requested');
assert.deepEqual(Array.from(sort([{key:'sensor.a',w:100},{key:'sensor.b',w:100},{key:'_rest',w:100}]), x => x.key), ['_rest','sensor.a','sensor.b'], 'stable key tie-break');
assert.match(code, /right\.splice\(0, right\.length, \.\.\.sfcSortLoadTiles\(right, listLayout && c\.rest_always_last === true\)\)/, 'both layouts sort by watts, optional pin in narrow lists');
assert.match(code, /this\._toggle\(sec,'Nicht erfasst in Listenansicht immer unten',\['rest_always_last'\],false\)/, 'editor option exists');
console.log('Consumer list watt sorting regression tests passed');
