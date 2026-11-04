// Regression: switching Live -> Monat -> Tag must not leave historical SVG paths stale.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');
assert.match(src,/this\._historyRange=\{start,end\};this\._historyLoading=true;[\s\S]{0,300}this\._historyDrawPending=true/,'period change schedules follow-up redraw');
assert.match(src,/this\._historyMode='live';this\._historyPreset=null;this\._historyLoading=false;this\._historyDrawPending=true/,'live mode also resets geometry');
assert.match(src,/this\._drawLines\(\);[\s\S]{0,380}if\(this\._historyDrawPending\)/,'historical second layout frame is requested');
assert.match(src,/if\(p && p\.path\.parentNode!==this\._pg\) this\._pg\.appendChild\(p\.path\)/,'existing SVG path reattached without restarting animation');
assert.match(src,/n\.historyNote='Quellenzuordnung unvollständig/,'unassigned historical kWh is explained');
const a=src.indexOf('function sfcAllocateSources('),b=src.indexOf('function sfcAllocateProportional(',a);
const alloc=vm.runInNewContext(src.slice(a,b)+'\nsfcAllocateSources');
// With sufficient budgets, every measured consumer must receive a connection.
const assigned=alloc([{key:'washer',w:1680},{key:'dryer',w:0},{key:'pump',w:62710}],{pv:35770,grid:95000,battery:0});
assert.equal(assigned.get('washer').unassigned,0);
assert.ok(assigned.get('washer').pv+assigned.get('washer').grid>0,'washer has positive modelled source');
assert.equal(assigned.get('dryer').pv+assigned.get('dryer').grid,0,'zero-kWh dryer has no line');
// If the grid source statistics are missing, do not invent a connection.
const incomplete=alloc([{key:'washer',w:1680}],{pv:0,grid:0,battery:0});
assert.equal(incomplete.get('washer').unassigned,1680);
console.log('Historical filter redraw and source-gap regression checks passed');
