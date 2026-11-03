// Regression tests for real per-device PV/battery/grid allocation.
// Run with: node tests/test_power_allocation.cjs
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
  const result = allocate([{key:'wp', w:2000}, {key:'light', w:100}], {pv:200,battery:0,grid:1900});
  const wp = result.get('wp'), light = result.get('light');
  close(wp.pv, 200); close(wp.grid, 1800); close(wp.battery, 0);
  close(wp.pv / 2000 * 100, 10); close(wp.grid / 2000 * 100, 90);
  close(light.pv, 0); close(light.grid, 100);
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
  const result = allocate([{key:'small',w:400},{key:'large',w:1200}], {pv:1000,battery:400,grid:200});
  close(result.get('large').pv,1000); close(result.get('small').pv,0);
  close(result.get('large').battery,200); close(result.get('small').battery,200);
  close(result.get('small').grid,200);
}
{
  const result = allocate([{key:'off', w:0}], {pv:500,battery:500,grid:500});
  close(result.get('off').pv,0); close(result.get('off').battery,0); close(result.get('off').grid,0);
}
console.log('PV / battery / grid allocation tests passed');
