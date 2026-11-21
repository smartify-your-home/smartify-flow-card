// Regression: same completed day, selected by arrows or calendar, must requery
// after a missing/partial response instead of resurrecting an empty cache.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const begin=src.indexOf('function sfcLocalDate('),end=src.indexOf('function sfcPvPlants(',begin);
const loadStart=src.indexOf('  async _loadHistory('),loadEnd=src.indexOf('  _historicalModel(){',loadStart);
const controlsStart=src.indexOf('  _initHistoryControls(){'),controlsEnd=src.indexOf('  /* ---------- model ---------- */',controlsStart);
assert(begin>0&&end>begin&&loadStart>0&&loadEnd>loadStart&&controlsStart>0&&controlsEnd>controlsStart);
const context=vm.createContext({Date,Map,Set,Promise,Math,Number,Intl});
vm.runInContext(src.slice(begin,end),context);
const loader=vm.runInContext('({'+src.slice(loadStart,loadEnd)+'})',context)._loadHistory;
const controls=vm.runInContext('({'+src.slice(controlsStart,controlsEnd)+'})',context)._initHistoryControls;
const dates=vm.runInContext('({page:sfcPickerPage,window:sfcDateWindow,add:sfcAddDays})',context);
const target='2026-11-18',previous='2026-11-17',ids=['sensor.pv','sensor.import','sensor.export'];
const callbacks={},buttons=new Map();
const button=selector=>{
  if(!buttons.has(selector))buttons.set(selector,{
    addEventListener(_event,cb){callbacks[selector]=cb;},
    click(){return callbacks[selector]?.();}
  });
  return buttons.get(selector);
};
let readiness=false;
let hourlyCalls=0;
const updates=[],requests=[];
const card={
  _historySeq:0,_historyCache:new Map(),_historyMode:'history',_historyRange:{start:previous,end:previous},_historyPreset:'day',
  _historyStatus(){},_update(){updates.push(this._historyData?.energy||null);},
  _historyIds(){return ids;},_pvPlants(){return [{energy_total:'sensor.pv'}]},_consumerEntities(){return []},
  _c:{grid:{import_total:'sensor.import',export_total:'sensor.export'}},
  _maybeEnergy(){},_maybeLivePeak(){},
  shadowRoot:{querySelector(selector){return button(selector)}},
  async _getStatistics(requested,from,to,period,units){
    assert.equal(units?.energy,'kWh');
    if(period==='5minute')return {};
    if(period==='day')return {};
    if(period!=='hour')throw Error('unexpected period');
    hourlyCalls++;
    const range=dates.window(this._historyRange.start,this._historyRange.end);
    const start=range.from,finish=range.to;
    if(!readiness)return Object.fromEntries(requested.map(id=>[id,[]]));
    const isHead=from===start-3600000,isTail=from===finish-7200000;
    const values={'sensor.pv':5,'sensor.import':10,'sensor.export':2};
    return Object.fromEntries(requested.map(id=>[id,
      isHead?[{start:new Date(start-3600000).toISOString(),sum:100}]:
      isTail?[{start:new Date(finish-3600000).toISOString(),sum:100+values[id]}]:[]
    ]));
  }
};
const loads=[];
card._loadHistory=(start,end,preset)=>{
  requests.push({start,end,preset});
  const promise=loader.call(card,start,end,preset);
  loads.push(promise);return promise;
};
controls.call(card);
(async()=>{
  // Calendar and arrow both call exactly the same history loader.
  button('.history-next').click();
  await loads.at(-1);
  assert.deepEqual(requests.at(-1),{start:target,end:target,preset:'day'});
  assert.equal(card._historyData.energy['sensor.pv'],null,'first Recorder read missing');
  assert.equal(card._historyCache.size,0,'unknown day MUST NOT be cached');
  readiness=true;
  // On the same date, calendar selection now sees fresh data immediately.
  await card._loadHistory(target,target,'day');
  assert.equal(card._historyData.energy['sensor.pv'],5);
  assert.equal(card._historyData.energy['sensor.import'],10);
  assert.equal(card._historyData.energy['sensor.export'],2);
  assert.equal(card._historyCache.size,1,'complete day can be cached');
  // A subsequent visit should reuse COMPLETE data, including via the arrows.
  card._historyRange={start:previous,end:previous};card._historyPreset='day';
  button('.history-next').click();
  await loads.at(-1);
  assert.equal(card._historyData.energy['sensor.pv'],5);
  assert.equal(updates.at(-1)['sensor.import'],10);
  assert.ok(hourlyCalls>=2,'Recorder rechecked following incomplete history');
  assert.match(src,/if\(cache\?\.until>Date\.now\(\)&&cache\?\.complete===true\)/,
    'only complete cache entries may be replayed');
  assert.match(src,/this\._historyCache\.delete\(key\)/,'missing data cache discarded');
  console.log('Completed day arrow/calendar reselect: empty response re-fetched, valid results reused');
})().catch(e=>{console.error(e);process.exitCode=1;});
