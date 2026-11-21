// Calendar and arrows must recover live-day historic values after an earlier
// missing/partial response, including fast changes while promises are pending.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const start=src.indexOf('function sfcLocalDate('),end=src.indexOf('function sfcPvPlants(',start);
const loadStart=src.indexOf('  async _loadHistory('),loadEnd=src.indexOf('  _historicalModel(){',loadStart);
assert(start>0&&end>start&&loadStart>0&&loadEnd>loadStart);
const frozen=new Date(2026,10,21,18,25,0).getTime();
class Clock extends Date {
  constructor(...args){super(...(args.length?args:[frozen]));}
  static now(){return frozen;}
}
const context=vm.createContext({Date:Clock,Number,Map,Math,Promise,Intl,Set});
vm.runInContext(src.slice(start,end),context);
const load=vm.runInContext('({'+src.slice(loadStart,loadEnd)+'})',context)._loadHistory;
const days=vm.runInContext('({today:sfcLocalDate(new Date()),date:sfcDateWindow,valid:sfcValidatePeriod,page:sfcPickerPage})',context);
assert.equal(days.today,'2026-11-21');
const previous='2026-11-20',ids=['sensor.pv','sensor.import','sensor.export'];
let ready=false,delayedResolve=null;
const results=[];
const card={
 _historySeq:0,_historyCache:new Map(),_historyMode:'live',
 _c:{grid:{import_total:'sensor.import',export_total:'sensor.export'}},
 _historyIds(){return ids;},_pvPlants(){return [{energy_total:'sensor.pv'}]},_consumerEntities(){return []},
 _historyStatus(){},_update(){results.push({range:this._historyRange?.start,data:this._historyData?.energy||null});},
 async _getStatistics(requested,from,to,period,units){
   if(period==='5minute')return {};
   if(period==='day')return {};
   assert.equal(period,'hour');
   assert.equal(units?.energy,'kWh');
   const w=days.date(this._historyRange.start,this._historyRange.end);
   const currentEnd=Math.min(w.to,frozen);
   const head=from===w.from-3600000,tail=from===currentEnd-7200000;
   if(!ready)return Object.fromEntries(requested.map(id=>[id,[]]));
   const v={'sensor.pv':7,'sensor.import':4,'sensor.export':2};
   if(!head&&!tail)return {};
   return Object.fromEntries(requested.map(id=>[id,[{
      start:new Date(head?w.from-3600000:Math.floor((currentEnd-3600000)/3600000)*3600000).toISOString(),
      sum:head?100:100+v[id]
   }]]));
 }
};
(async()=>{
  assert.deepEqual(JSON.parse(JSON.stringify(days.page({start:previous,end:previous},'day',1,new Clock()))),
   {start:days.today,end:days.today,mode:'day'});
  await load.call(card,days.today,days.today,'day');
  assert.equal(card._historyData.energy['sensor.pv'],null,'temporary missing current-day statistics');
  assert.equal(card._historyCache.size,0,'ongoing incomplete day must not be cached');
  ready=true;
  await load.call(card,days.today,days.today,'day');
  assert.equal(card._historyData.energy['sensor.pv'],7);
  assert.equal(card._historyData.energy['sensor.import'],4);
  assert.equal(card._historyData.energy['sensor.export'],2);
  assert.equal(card._historyCache.size,1,'complete ongoing day allowed very short cache');
  // Returning via previous day and then via calendar must preserve the actual selected date.
  assert.match(src,/if\(cache\?\.until>Date\.now\(\)&&cache\?\.complete===true\)/);
  assert.doesNotMatch(src,/if\(start===today&&end===today\)/,
   'today via arrows is the same history path as today via calendar');
  assert.ok(results.some(v=>v.range===days.today&&v.data?.['sensor.pv']===7));
  console.log('Ongoing day: arrow/calendar share loader, initial blanks not cached, later Recorder values displayed');
})().catch(e=>{console.error(e);process.exitCode=1;});
