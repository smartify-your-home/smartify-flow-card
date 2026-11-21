// Regression: Live -> left arrow -> yesterday -> older days must show measured energy
// even when an inverter stops reporting its cumulative energy sensor at night.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const a=src.indexOf('function sfcLocalDate('),b=src.indexOf('function sfcPvPlants(',a);
const l=src.indexOf('async _loadHistory('),le=src.indexOf('  _historicalModel(){',l);
const h=src.indexOf('  _initHistoryControls(){'),he=src.indexOf('  /* ---------- model ---------- */',h);
assert(a>=0&&b>a&&l>0&&le>l&&h>0&&he>h);
const context=vm.createContext({Date,Math,Map,Promise,Number,Intl,Set});
vm.runInContext(src.slice(a,b),context);
const loader=vm.runInContext('({'+src.slice(l,le)+'})',context)._loadHistory;
const controls=vm.runInContext('({'+src.slice(h,he)+'})',context)._initHistoryControls;
const preset=vm.runInContext('sfcPickerPreset',context);
const valid=vm.runInContext('sfcValidatePeriod',context);
const slice=vm.runInContext('sfcMeasuredDaySlice',context);
const dateWindow=vm.runInContext('sfcDateWindow',context);
const addDays=vm.runInContext('sfcAddDays',context);
const ms=3600000;
const rows=values=>values.map(([t,v])=>({start:t,sum:v})); // HA websocket uses unix ms
const point=(t,sum)=>[t,sum];
{
  const from=dateWindow('2026-11-18','2026-11-18').from,to=dateWindow('2026-11-18','2026-11-18').to;
  const measured=slice(new Map([
    point(from-9*ms,100),point(from+11*ms,111),point(to-9*ms,123)
  ]),from,to);
  assert.equal(measured.kwh,23);
  assert.equal(measured.partialStart,true);
  assert.equal(measured.partialEnd,true);
  assert.equal(slice(new Map([point(to-9*ms,123)]),from,to),null,'one point is not a real delta');
  assert.equal(slice(new Map([point(from-9*ms,200),point(to-9*ms,180)]),from,to),null,'negative counter reset rejected');
}
const callbacks={};
const buttons=new Map();
function button(name){
  if(!buttons.has(name))buttons.set(name,{
    addEventListener(kind,fn){callbacks[name+':'+kind]=fn;},
    click(){callbacks[name+':click']?.();}
  });
  return buttons.get(name);
}
const loaded=[],loadCalls=[],snapshots=[];
const card={
  _historyMode:'live',_historyPreset:null,_historySeq:0,_historyCache:new Map(),
  _historyStatus(){},_update(){snapshots.push(this._historyData?.energy||null);},
  _maybeEnergy(){},_maybeLivePeak(){},
  shadowRoot:{querySelector(selector){return button(selector);}},
  _historyIds(){return ['sensor.pv','sensor.import','sensor.export'];},
  _c:{grid:{import_total:'sensor.import',export_total:'sensor.export'}},
  _pvPlants(){return [{energy_total:'sensor.pv'}];},
  _consumerEntities(){return [];},_st(){return {attributes:{unit_of_measurement:'kWh'}};},
  async _getStatistics(ids,start,end,period,units){
    const selected=valid(this._historyRange.start,this._historyRange.end);
    assert(selected);
    if(period==='5minute')return {};
    if(period==='day')return {};
    assert.equal(period,'hour');
    assert.equal(units?.energy,'kWh');
    const {from,to}=selected;
    const isAround=start===from-14*ms&&end===to;
    const isHead=start===from-ms;
    const isTail=start===to-2*ms;
    assert(isAround||isHead||isTail,'unexpected period query');
    const items={
      'sensor.pv':isAround?rows([
        point(from-9*ms,100),point(from+11*ms,111),point(to-9*ms,123)
      ]):[],
      'sensor.import':isHead?rows([point(from-ms,200)]):isTail?rows([point(to-ms,209)]):[],
      'sensor.export':isHead?rows([point(from-ms,500)]):isTail?rows([point(to-ms,502)]):[]
    };
    return Object.fromEntries(ids.map(id=>[id,items[id]||[]]));
  }
};
card._loadHistory=(start,end,mode)=>{
  const task=loader.call(card,start,end,mode);
  loadCalls.push({start,end,mode,task});
  return task;
};
controls.call(card);
(async()=>{
  const yesterday=addDays(preset('today').start,-1);
  for(let i=0;i<3;i++){
    button('.history-prev').click();
    const call=loadCalls.at(-1);
    assert.equal(call.start,addDays(yesterday,-i),'arrow moves back one day each click');
    assert.equal(call.end,call.start);
    assert.equal(call.mode,'day');
    await call.task;
    assert.deepEqual(JSON.parse(JSON.stringify(card._historyData.energy)),{
      'sensor.pv':23,'sensor.import':9,'sensor.export':2
    },'real cumulative deltas returned for day '+call.start);
    assert.deepEqual(Array.from(card._historyData.partialIds),['sensor.pv']);
    assert.deepEqual(Array.from(card._historyData.missingEndIds),['sensor.pv']);
    assert.equal(snapshots.at(-2),null,'previous day is cleared while the next loads');
    loaded.push(call.start);
  }
  assert.equal(new Set(loaded).size,3,'three different historical days selected');
  assert.match(src,/\.period-summary-value \.coverage\{/,'partial values have visible marker style');
  assert.match(src,/note\.textContent=' · Teil'/,'partial values explicitly labelled');
  console.log('Live back-arrow: 3 consecutive archived days, night gaps, bounded recovery, exact grid and partial labels passed');
})().catch(err=>{console.error(err);process.exitCode=1;});
