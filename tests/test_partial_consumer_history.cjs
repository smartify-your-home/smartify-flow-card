// Run the actual history loader with Recorder fixtures; no browser or HA required.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const helperStart=src.indexOf('function sfcLocalDate('),helperEnd=src.indexOf('function sfcPvPlants(',helperStart);
const loadStart=src.indexOf('async _loadHistory('),loadEnd=src.indexOf('  _historicalModel(){',loadStart);
assert(helperStart>=0&&helperEnd>helperStart&&loadStart>0&&loadEnd>loadStart);
const context=vm.createContext({Date,Map,Number,Math,Promise});
vm.runInContext(src.slice(helperStart,helperEnd),context);
const history=vm.runInContext('({'+src.slice(loadStart,loadEnd)+'})',context);
const from='2026-01-01',to='2026-10-31';
const day=(v)=>new Date(v).toISOString();
const samples=(entries)=>entries.map(([date,sum])=>({start:day(date),sum}));
const lateFirst='2026-07-01T10:00:00Z';
const lateDay='2026-07-01T00:00:00Z';
const end='2026-10-31T22:00:00Z';
let dailyCalls=0,openingCalls=0;
const c={
 _historySeq:0,_historyCache:new Map(),_historyMode:'live',
 _historyStatus(){},_update(){},_historyIds(){return ['sensor.wm_total','sensor.no_data'];},
 _pvPlants(){return [];},_consumerEntities(){return ['sensor.wm','sensor.empty'];},
 _energyId(id){return id==='sensor.wm'?'sensor.wm_total':'sensor.no_data';},
 _c:{grid:{import_total:null}},
 async _getStatistics(ids,start,finish,period,units){
   assert.equal(units.energy,'kWh');
   if(period==='day'){
     dailyCalls++;
     assert.equal(ids.length,2,'daily discovery must be batched');
     return {'sensor.wm_total':samples([[lateDay,100]]),'sensor.no_data':[]};
   }
   if(period==='5minute')return {};
   if(ids.length===1){
     openingCalls++;
     assert.equal(ids[0],'sensor.wm_total');
     return {'sensor.wm_total':samples([[lateFirst,105]])};
   }
   if(start>new Date('2026-10-01').getTime()){
     return {'sensor.wm_total':samples([[end,142]]),'sensor.no_data':[]};
   }
   return {'sensor.wm_total':[],'sensor.no_data':[]};
 }
};
(async()=>{
 await history._loadHistory.call(c,from,to,'year');
 assert.equal(c._historyData.energy['sensor.wm_total'],37,
   'consumer displays only 142-105 kWh after actual July baseline, not 142 kWh');
 assert.equal(c._historyData.energy['sensor.no_data'],null,
   'missing Recorder statistics must remain unknown, not zero');
 assert.equal(c._historyData.partialIds.length,1);
 assert.equal(c._historyData.partialIds[0],'sensor.wm_total');
 assert.equal(c._historyData.partialFrom['sensor.wm_total'],Date.parse(lateFirst)+3600000);
 assert.equal(dailyCalls,1,'one bounded daily discovery for missing IDs');
 assert.equal(openingCalls,1,'one small hourly lookup for recorded device');
 assert.match(src,/Teilzeitraum · Daten ab/,'device tile must identify partial coverage');
 assert.match(src,/n\.historyNote=\[n\.historyNote/,'source warnings preserve partial note');
 console.log('Late-starting consumer annual statistics regression passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
