// Regression for "Kacheln show the selected day's energy, but all four
// summary rows stay –". A tile rendering error must not skip the summaries.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const u0=src.indexOf('  _update() {'),u1=src.indexOf('  async _maybeMonthlyPeaks() {',u0);
const h0=src.indexOf('  _updateHeaderSummary(m) {'),h1=src.indexOf('  _updateStats(m) {',h0);
const m0=src.indexOf('function sfcHeaderMetrics('),m1=src.indexOf('function sfcEnergyDelta(',m0);
assert.ok(u0>0&&u1>u0&&h0>0&&h1>h0&&m0>0&&m1>m0);
const doc={createElement(){return {textContent:'',className:'',title:''}},
  createTextNode(text){return {textContent:String(text)}}};
const ctx=vm.createContext({document:doc,Map,Set,Date,Intl,Math,Number});
vm.runInContext(src.slice(m0,m1),ctx);
const run=vm.runInContext('({'+src.slice(u0,u1)+'})',ctx)._update;
const summary=vm.runInContext('({'+src.slice(h0,h1)+'})',ctx)._updateHeaderSummary;
const metrics=['demand','import','export','pv'];
const rows=Object.fromEntries(metrics.map(k=>[k,{
  dataset:{},textContent:'–',title:'',
  replaceChildren(...nodes){this.textContent=nodes.map(x=>x.textContent).join('')}
}]));
const root={
  querySelector(selector){
    if(selector==='.stats')return {hidden:false};
    const match=selector.match(/data-metric="([^"]+)"/);
    if(match)return rows[match[1]]||null;
    return null;
  }
};
const model={historical:true,left:[{key:'_grid',kind:'grid'}],right:[],
  houseEnergy:12.5,impT:8.5,expT:1.25,pvT:5.25};
let tileUpdates=0;
const card={
 _h:{},_c:{show_stats:true,grid:{import_total:'sensor.import',export_total:'sensor.export'}},
 _flowEl:{hidden:false},_leftEl:{},_rightEl:{},
 _historyMode:'history',_historyData:{partialIds:[],missingEndIds:[]},
 _historicalModel(){return model},
 _pvPlants(){return [{energy_total:'sensor.pv'}]},
 _updateHeaderSummary:summary,
 shadowRoot:root,
 _syncNodes(){tileUpdates++;throw new Error('simulated error while rendering tiles')},
};
assert.throws(()=>run.call(card),/simulated error/);
assert.equal(tileUpdates,1);
assert.equal(rows.demand.textContent,'12,50 kWh',
  'full-period demand must be displayed BEFORE any tile can fail');
assert.equal(rows.import.textContent,'8,50 kWh');
assert.equal(rows.export.textContent,'1,25 kWh');
assert.equal(rows.pv.textContent,'5,25 kWh');
assert.equal(card._m,model);
const first=src.slice(u0,u1).indexOf('this._updateHeaderSummary(m)');
const firstTile=src.slice(u0,u1).indexOf('this._syncNodes(');
assert.ok(first>=0&&firstTile>first,
  'header refresh must precede tile setup, loops and optional statistics');
assert.equal(src.slice(u0,u1).match(/this\._updateHeaderSummary\(m\)/g)?.length,1,
  'one authoritative header refresh per valid render');
// No drawn flows and zero eligible tiles must NOT suppress period totals.
const emptyModel={...model,left:[],right:[],flows:[]};
const noTiles={
 ...card,
 _c:{...card._c,show_stats:false,min_power:99999,min_flow:99999,
   hide_below_display_power:true},
 _historicalModel(){return emptyModel},
 _syncNodes(_container,nodes){assert.deepEqual(Array.from(nodes),[],'tile set is filtered out')},
 _updateStats(){},_scheduleDraw(){},
};
for(const key of metrics){rows[key].textContent='–';rows[key].dataset.value='–';}
run.call(noTiles);
assert.equal(rows.demand.textContent,'12,50 kWh','all consumers hidden: demand remains');
assert.equal(rows.import.textContent,'8,50 kWh','all flow lines hidden: import remains');
assert.equal(rows.export.textContent,'1,25 kWh','no tiles: export remains');
assert.equal(rows.pv.textContent,'5,25 kWh','PV tile hidden: measured PV total remains');
assert.equal(noTiles._flowEl.hidden,false,'a model with no rendered nodes remains a valid period');

// When the history loader is still pending, no previous period can leak.
card._historicalModel=()=>null;
run.call(card);
for(const key of metrics)assert.equal(rows[key].textContent,'–',key+' resets on pending history');
console.log('Period totals render before tile errors, preserve 4 current values, clear during history loading');
