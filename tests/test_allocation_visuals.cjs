// Verify proportional source allocation respects budgets and line scaling.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const text = fs.readFileSync(path.join(__dirname,'..','custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');
const start = text.indexOf('function sfcAllocateSources(');
const end = text.indexOf('\nclass SmartifyFlowCard extends HTMLElement',start);
assert.ok(start>=0 && end>start,'helpers found');
const helpers = vm.runInNewContext(text.slice(start,end) + '\n({small:sfcAllocateSources,proportional:sfcAllocateProportional,width:sfcLineWidth})');
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-7, `${a} vs ${b}`);
const totals = new Map();
const sum = (alloc,key) => [...alloc.values()].reduce((s,x)=>s+x[key],0);
{
  const loads=[{key:'low',w:100},{key:'mid',w:200},{key:'high',w:1500}];
  const budget={pv:1000,battery:300,grid:200};
  const ascending=helpers.small(loads,budget);
  near(ascending.get('low').pv,100);
  near(ascending.get('mid').pv,200);
  near(ascending.get('high').pv,700);
  const proportional=helpers.proportional(loads,budget);
  for (const x of loads) {
    const a=proportional.get(x.key);
    near(a.pv+a.battery+a.grid+a.unassigned,x.w);
    near(a.pv/x.w,budget.pv/1800);
    near(a.battery/x.w,budget.battery/1800);
    near(a.grid/x.w,budget.grid/1800);
  }
  for(const key of ['pv','battery','grid']) assert.ok(sum(proportional,key)<=budget[key]+1e-7);
  near(sum(proportional,'unassigned'),300);
}
{
  // Abundant combined supply must never allocate more than a device needs.
  const loads=[{key:'a',w:50},{key:'b',w:150}];
  const r=helpers.proportional(loads,{pv:1000,battery:1000,grid:1000});
  near(r.get('a').pv+r.get('a').battery+r.get('a').grid,50);
  near(r.get('b').pv+r.get('b').battery+r.get('b').grid,150);
  for (const key of ['pv','battery','grid']) assert.ok(sum(r,key)<=1000);
}
{
  const r=helpers.proportional([{key:'off',w:0},{key:'load',w:200}],{pv:0,battery:0,grid:0});
  near(r.get('off').unassigned,0);
  near(r.get('load').unassigned,200);
  near(sum(r,'pv'),0);
}
near(Number(helpers.width(0,10000,1.5,6,'sqrt')),1.5);
near(Number(helpers.width(10000,10000,1.5,6,'sqrt')),6);
const sq=Number(helpers.width(100,10000,1.5,6,'sqrt'));
const ln=Number(helpers.width(100,10000,1.5,6,'linear'));
assert.ok(sq>ln, 'square-root must increase visibility of smaller flows');
near(Number(helpers.width(10000,10000,1.5,4.5,'sqrt')),4.5);
assert.ok(Number(helpers.width(10000,10000,6,2,'sqrt'))>=6,'max lower than min is clamped');
assert.match(text, /c\.allocation === 'proportional'/, 'allocation switch is wired');
assert.match(text, /sfcLineWidth\(f\.w, maxW, this\._c\.line_width_min, this\._c\.line_width_max, this\._c\.line_scale\)/,'stroke width uses settings');
assert.match(text, /if \(p\.dur === null\)/,'animation duration is not restarted with every power update');
assert.match(text, /Quellenverteilung \(Visualisierungsmodell\)/,'editor contains allocation selection');
assert.match(text, /Skalierung der Linienbreite/,'editor contains line scaling option');
console.log('Source allocation and line scaling regressions passed');
