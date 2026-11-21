// Regression: the four header totals must never refer to the previously selected day.
// Historical complete days need a verified statistic at their exact end boundary.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const helperStart=src.indexOf('function sfcLocalDate('),helperEnd=src.indexOf('function sfcPvPlants(',helperStart);
const metricsStart=src.indexOf('function sfcHeaderMetrics('),metricsEnd=src.indexOf('function sfcEnergyDelta(',metricsStart);
const loaderStart=src.indexOf('async _loadHistory('),loaderEnd=src.indexOf('  _historicalModel(){',loaderStart);
const summaryStart=src.indexOf('  _updateHeaderSummary(m) {'),summaryEnd=src.indexOf('  _updateStats(m) {',summaryStart);
assert.ok(helperStart>=0&&helperEnd>helperStart&&metricsStart>=0&&metricsEnd>metricsStart&&loaderStart>=0&&loaderEnd>loaderStart&&summaryStart>=0&&summaryEnd>summaryStart);
const fakeDoc={
  createElement(){return {className:'',textContent:''};},
  createTextNode(text){return {textContent:String(text)};}
};
const context=vm.createContext({Date,Map,Number,Math,Promise,Intl,document:fakeDoc});
vm.runInContext(src.slice(helperStart,helperEnd)+src.slice(metricsStart,metricsEnd),context);
const loader=vm.runInContext('({'+src.slice(loaderStart,loaderEnd)+'})',context);
const summary=vm.runInContext('({'+src.slice(summaryStart,summaryEnd)+'})',context);
const ids=['sensor.pv','sensor.import','sensor.export'];
function dateRows(endsComplete=true){
  const start=new Date('2024-02-15T00:00:00').getTime();
  const end=new Date('2024-02-16T00:00:00').getTime();
  const sample=(ts,sum)=>[{start:new Date(ts).toISOString(),sum}];
  const head={};
  const tail={};
  const totals=[12,9,2];
  ids.forEach((id,i)=>{
    head[id]=sample(start-3600000,100);
    tail[id]=sample(end-(endsComplete||id!=='sensor.pv'?3600000:7200000),100+totals[i]);
  });
  return {start,end,head,tail};
}
function cardFor(endsComplete){
  const data=dateRows(endsComplete),snapshots=[];
  const card={
    _historySeq:0,_historyCache:new Map(),_historyMode:'live',
    _c:{grid:{import_total:'sensor.import',export_total:'sensor.export'}},
    _pvPlants(){return [{energy_total:'sensor.pv'}];},
    _consumerEntities(){return [];},
    _historyIds(){return ids;},
    _historyStatus(){},
    _update(){snapshots.push(this._historyData?this._historyData.energy:null);},
    async _getStatistics(names,start,_end,period,units){
      assert.equal(period,'hour','old day uses hourly sums');
      assert.equal(units.energy,'kWh','energy always in kWh');
      const rows=start<data.start ?data.head:data.tail;
      return Object.fromEntries(names.map(id=>[id,rows[id]||[]]));
    }
  };
  return {card,snapshots};
}
(async()=>{
  {
    const {card,snapshots}=cardFor(true);
    await loader._loadHistory.call(card,'2024-02-15','2024-02-15','day');
    assert.equal(snapshots[0],null,'new date must clear old history immediately, before Recorder resolves');
    assert.equal(card._historyData.energy['sensor.pv'],12);
    assert.equal(card._historyData.energy['sensor.import'],9);
    assert.equal(card._historyData.energy['sensor.export'],2);
    assert.deepEqual(Array.from(card._historyData.missingEndIds),[],'all three counters have full selected period');
  }
  {
    const {card}=cardFor(false);
    await loader._loadHistory.call(card,'2024-02-15','2024-02-15','day');
    assert.equal(card._historyData.energy['sensor.pv'],null,
      'PV value one hour short must NOT be shown as selected full day');
    assert.equal(card._historyData.energy['sensor.import'],9);
    assert.equal(card._historyData.energy['sensor.export'],2);
    assert.deepEqual(Array.from(card._historyData.missingEndIds),['sensor.pv']);
  }
  assert.match(src,/if\(!m\)\{[\s\S]{0,250}this\._updateHeaderSummary\(null\)/,
    'when historic model is loading or errored, update() clears all four stale totals');
  assert.match(src,/if\(!incompleteEnd&&\(/,
    'missing end must not launch the missing-start recovery');
  assert.match(src,/if\(!range\.isToday&&value\.through!==range\.to\)/,
    'late-start fallback also requires complete end for past intervals');
  const summaryMetrics=vm.runInContext('sfcHeaderMetrics',context);
  assert.deepEqual(JSON.parse(JSON.stringify(summaryMetrics(
    {houseEnergy:19,impT:9,expT:2,pvT:12},['demand','pv'])
  )),[['demand',null],['import',9],['export',2],['pv',null]],
    'partial PV suppresses PV and house-demand header totals, preserving complete grid values');
  const row=()=>({
    dataset:{},textContent:'',
    replaceChildren(...nodes){this.textContent=nodes.map(n=>n.textContent).join('');}
  });
  const elements=Object.fromEntries(['demand','import','export','pv'].map(k=>[k,row()]));
  const widget={shadowRoot:{
    querySelector(selector){
      const key=selector.match(/data-metric="([^"]+)"/)?.[1];
      return elements[key]||null;
    }
  }};
  summary._updateHeaderSummary.call(widget,{houseEnergy:19,impT:9,expT:2,pvT:12});
  assert.equal(elements.pv.dataset.value,'12,00');
  // Reproduces: energy tiles have correct model values, but a header row is
  // blank/stale despite its dataset cache claiming the same value.
  elements.pv.textContent='–';
  summary._updateHeaderSummary.call(widget,{houseEnergy:19,impT:9,expT:2,pvT:12});
  assert.match(elements.pv.textContent,/12,00 kWh/,'header repairs stale DOM although dataset value was unchanged');

  summary._updateHeaderSummary.call(widget,null);
  for(const [k,el] of Object.entries(elements)){
    assert.equal(el.textContent,'–',k+' is cleared when no current-period result');
    assert.equal(el.dataset.value,'–',k+' cache updated to missing');
  }
  summary._updateHeaderSummary.call(widget,{houseEnergy:4,impT:3,expT:1,pvT:2});
  assert.equal(elements.import.dataset.value,'3,00','next period replaces missing with its own value');
  assert.equal(elements.pv.dataset.value,'2,00');
  widget._pvPlants=()=>[{energy_total:'sensor.pv'}];
  widget._c={grid:{import_total:'sensor.import',export_total:'sensor.export'}};
  widget._historyData={partialIds:['sensor.pv']};
  summary._updateHeaderSummary.call(widget,{
    historical:true,houseEnergy:19,impT:9,expT:2,pvT:12
  });
  assert.equal(elements.pv.dataset.value,'12,00|partial','partial-start PV value remains visible with a marker');
  assert.match(elements.pv.textContent,/12,00 kWh · Teil/,'PV covered interval is explicitly labelled');
  assert.equal(elements.demand.dataset.value,'19,00|partial','derived demand is also marked as partial');
  assert.match(elements.demand.textContent,/19,00 kWh · Teil/);
  assert.equal(elements.import.dataset.value,'9,00','complete imported energy remains visible');
  assert.equal(elements.export.dataset.value,'2,00','complete exported energy remains visible');
  console.log('Selected-period header: stale reset, strict full intervals, partial source warning and next period passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
