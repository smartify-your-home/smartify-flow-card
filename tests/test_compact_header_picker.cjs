// The four selected-period totals and datepicker auto-apply must work together.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname,'..','custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');

const metricsStart=src.indexOf('function sfcHeaderMetrics(');
const metricsEnd=src.indexOf('function sfcEnergyDelta(',metricsStart);
assert.ok(metricsStart>=0&&metricsEnd>metricsStart,'dedicated metrics helper');
const metrics=vm.runInNewContext(src.slice(metricsStart,metricsEnd)+'\nsfcHeaderMetrics');
const normalize=value=>JSON.parse(JSON.stringify(value));
assert.deepEqual(normalize(metrics({houseEnergy:24.73,impT:6.58,expT:10.26,pvT:28.41})),
  [['demand',24.73],['import',6.58],['export',10.26],['pv',28.41]],
  'order: Energiebedarf, Netzbezug, Netzbelieferung, PV Ertrag');
assert.deepEqual(normalize(metrics({houseEnergy:null,impT:0,expT:null,pvT:0})),
  [['demand',null],['import',0],['export',null],['pv',0]],
  'missing meters remain unknown and measured zero remains zero');
assert.match(src,/houseEnergy: sfcHistoricalBalance\(this\._pvToday\(\)/,
  'live demand uses existing balance, excluding battery charge');
assert.match(src,/houseEnergy:balance\?\.total\?\?null/,
  'historical demand uses existing validated balance');
assert.match(src,/\.history-header\{margin:0 -6px 12px/,
  'the header reaches toward the left card edge regardless of flow max_width');
assert.match(src,/<div class="history-header">[\s\S]*?<\/div>\s*<div class="wrap">/,
  'date controls and summary live outside the centered flow wrapper');
assert.match(src,/\.period-summary-row\{[^}]*background:none;border:0;padding:0/,
  'summary rows have no independent backgrounds or boxes');
assert.match(src,/\.period-summary\{[^}]*color:var\(--primary-text-color\)/,
  'summary respects HA theme text color');
assert.match(src,/\.period-summary-value \.unit\{font-size:\.8em/,
  'kWh is smaller than its value');
assert.match(src,/\.history-toolbar button\{[^}]*min-height:32px/,
  'Live and picker buttons are shorter');
const rowLabels=[...src.matchAll(/class="period-summary-row" data-metric="([^"]+)"><span class="period-summary-label">([^<]+)<\/span>/g)]
  .map(m=>[m[1],m[2]]);
assert.deepEqual(rowLabels,[
  ['demand','Energiebedarf'],['import','Netzbezug'],
  ['export','Netzbelieferung'],['pv','PV Ertrag']
],'exact user labels and priority order');
assert.match(src,/this\._updateHeaderSummary\(m\);\s*this\._updateStats\(m\);/,
  'summary refreshes even when detailed statistics are disabled');

// Exercise the REAL popup handlers with a tiny DOM shim, without external packages.
function makeElement() {
  const classes=new Set();
  const el={
    children:[],dataset:{},disabled:false,hidden:false,_listeners:{},
    classList:{
      add: name=>classes.add(name),
      toggle: (name,enabled)=>enabled?classes.add(name):classes.delete(name),
    },
    addEventListener(type,callback){this._listeners[type]=callback;},
    appendChild(child){this.children.push(child);},
    setAttribute(name,value){(this.attributes ||= {})[name]=value;},
    querySelectorAll(sel){return sel==='.history-preset'?this.children.filter(x=>x.className==='history-preset'):[];},
    closest(sel){return sel==='button[data-date]'&&this.dataset.date?this:null;},
    focus(){},
    click(){this._listeners.click?.({target:this});},
  };
  Object.defineProperty(el,'innerHTML',{get(){return this._html||'';},set(value){this._html=value;this.children=[];}});
  return el;
}
let root={
  overlay:null,
  querySelector(sel){return sel==='.history-overlay'?this.overlay:null;},
  appendChild(el){this.overlay=el;},
};
function makeOverlay(){
  const overlay=makeElement(),nodes={};
  for(const selector of [
    '.history-presets','.history-calendar-days','.calendar-title',
    '.calendar-next','.calendar-prev','.history-range-mode','.history-ok',
    '.history-cancel','.history-pending','.history-error','h3'
  ])nodes[selector]=makeElement();
  overlay.querySelector=selector=>nodes[selector]||null;
  overlay.remove=()=>{root.overlay=null;};
  overlay.nodes=nodes;
  return overlay;
}
const doc={createElement:tag=>tag==='div'?makeOverlay():makeElement()};
const d0=src.indexOf('function sfcLocalDate(');
const d1=src.indexOf('function sfcHistoryPoints(',d0);
const p0=src.indexOf('  _openHistoryDialog(){');
const p1=src.indexOf('  _initHistoryControls(){',p0);
assert.ok(d0>=0&&d1>d0&&p0>=0&&p1>p0,'picker source fragments');
const api=vm.runInNewContext(src.slice(d0,d1)+'\nclass PickerHarness{'+src.slice(p0,p1)+'}\n({PickerHarness,sfcPickerPreset,SFC_PERIOD_PRESETS})',{document:doc,Date,Intl});
function fresh(){
  root.overlay=null;
  const calls=[],card=new api.PickerHarness();
  card.shadowRoot=root;card._historyMode='live';
  card._loadHistory=(...args)=>calls.push(args);
  card._openHistoryDialog();
  assert.ok(root.overlay,'popup is opened');
  return {calls,card};
}
for(const [key] of api.SFC_PERIOD_PRESETS){
  const {calls}=fresh(),overlay=root.overlay;
  const preset=overlay.nodes['.history-presets'].children.find(p=>p.dataset.mode===key);
  assert.ok(preset,'shortcut exists: '+key);
  preset.click();
  const expected=api.sfcPickerPreset(key);
  assert.deepEqual(calls,[[expected.start,expected.end,key]],key+' applies immediately');
  assert.equal(root.overlay,null,key+' closes popup without Auswählen');
}
{
  const {calls}=fresh(),overlay=root.overlay;
  const day=overlay.nodes['.history-calendar-days'].children.find(b=>!b.disabled&&b.className==='calendar-day'&&b.dataset.date);
  assert.ok(day,'clickable calendar day');
  overlay.nodes['.history-calendar-days']._listeners.click({target:day});
  assert.deepEqual(calls,[[day.dataset.date,day.dataset.date,'day']],'single calendar click immediately applies');
  assert.equal(root.overlay,null,'single day closes calendar');
}
{
  const {calls}=fresh(),overlay=root.overlay,range=overlay.nodes['.history-range-mode'];
  range.click();
  assert.equal(range.attributes['aria-pressed'],'true','explicit free-range mode active');
  const days=overlay.nodes['.history-calendar-days'],choices=days.children.filter(b=>!b.disabled&&b.dataset.date).map(b=>b.dataset.date).sort();
  assert.ok(choices.length>2);
  const start=choices[0],end=choices[2];
  days._listeners.click({target:days.children.find(b=>b.dataset.date===start)});
  assert.equal(calls.length,0,'first range boundary does not auto-apply');
  assert.equal(overlay.nodes['.history-ok'].disabled,true,'incomplete range not confirmable');
  days._listeners.click({target:days.children.find(b=>b.dataset.date===end)});
  assert.equal(calls.length,0,'complete range waits for confirmation');
  assert.equal(overlay.nodes['.history-ok'].disabled,false);
  overlay.nodes['.history-ok'].click();
  assert.deepEqual(calls,[[start,end,null]],'free range applies only on Auswählen');
  assert.equal(root.overlay,null,'confirmed range closes calendar');
}
{
  const {calls}=fresh(),overlay=root.overlay;
  overlay.nodes['.history-cancel'].click();
  assert.equal(root.overlay,null);
  assert.equal(calls.length,0,'Abbrechen does not change period');
}
console.log('Compact themed summary, exact metric order, all ten instant presets, single day and confirmed free ranges passed');
