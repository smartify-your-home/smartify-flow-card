// Regression tests: PV prioritizes the smallest consumer, independently of display sorting.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components', 'smartify_flow_card', 'frontend', 'smartify-flow-card.js'), 'utf8');
const begin = code.indexOf('function sfcAllocateSources(');
const end = code.indexOf('\nclass SmartifyFlowCard extends HTMLElement', begin);
assert.ok(begin >= 0 && end > begin, 'allocation function exists');
const allocate = vm.runInNewContext(code.slice(begin, end) + '\nsfcAllocateSources');
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.00001, `${a} != ${b}`);

{
  // Small load (100 W) gets PV fully; remaining 100 W goes to WP (2000 W).
  const result = allocate([{key:'wp', w:2000}, {key:'light', w:100}], {pv:200,battery:0,grid:1900});
  close(result.get('light').pv,100);
  close(result.get('light').grid,0);
  close(result.get('wp').pv,100);
  close(result.get('wp').grid,1900);
  close(result.get('wp').pv / 2000 * 100, 5);
}
{
  const result = allocate([{key:'wp', w:2000}], {pv:200,battery:500,grid:1300});
  const wp = result.get('wp');
  close(wp.pv, 200); close(wp.battery, 500); close(wp.grid, 1300);
  close((wp.pv + wp.battery + wp.grid) / 2000 * 100, 100);
}
{
  const result = allocate([{key:'wp', w:2000}], {pv:200,battery:0,grid:300});
  const wp = result.get('wp');
  close(wp.unassigned, 1500);
  assert.ok(wp.grid <= 300, 'never invent missing grid power');
}
{
  // Even if input is in descending order, PV allocation is ascending.
  const result = allocate([{key:'large', w:1200},{key:'small', w:400}], {pv:1000,battery:400,grid:200});
  close(result.get('small').pv,400);
  close(result.get('large').pv,600);
  close(result.get('large').battery,400);
  close(result.get('large').grid,200);
  close(result.get('small').grid,0);
}
{
  // Exhaust PV on small consumers, including those zero or below display threshold.
  const result = allocate([{key:'large',w:1000},{key:'tiny',w:50},{key:'small',w:100}], {pv:120,battery:0,grid:1030});
  close(result.get('tiny').pv,50);
  close(result.get('small').pv,70);
  close(result.get('large').pv,0);
}
{
  const result = allocate([{key:'off', w:0}], {pv:500,battery:500,grid:500});
  close(result.get('off').pv,0); close(result.get('off').battery,0); close(result.get('off').grid,0);
}
console.log('PV smallest-first / battery-grid allocation tests passed');
