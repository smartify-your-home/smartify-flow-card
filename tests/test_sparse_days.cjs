// Sparse historical days: real daily Recorder sums and independent source-derived demand.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components/smartify_flow_card/frontend/smartify-flow-card.js'),'utf8');
const from=src.indexOf('function sfcLocalDate('),to=src.indexOf('function sfcEnergyDelta(',from);
const statsStart=src.indexOf('  async _getStatistics('),statsEnd=src.indexOf('  _showLive(){',statsStart),loadStart=src.indexOf('  async _loadHistory(',statsStart);
const loadEnd=src.indexOf('  _historicalModel(){',loadStart);
assert(from>=0&&to>from&&statsStart>=0&&loadStart>statsStart&&loadEnd>loadStart);
const c=vm.createContext({Date,Map,Promise,Math,Number,Set,Intl});
vm.runInContext(src.slice(from,to),c);
const util=vm.runInContext('({window:sfcDateWindow,day:sfcDailyBoundaryEnergy,house:sfcHistoricalHouseEnergy,balance:sfcHistoricalBalance,add:sfcAddDays})',c);
const loader=vm.runInContext('({'+src.slice(loadStart,loadEnd)+'})',c)._loadHistory;
const getStats=vm.runInContext('({'+src.slice(statsStart,statsEnd)+'})',c)._getStatistics;
const day='2026-11-18',boundary=util.window(day,day);
const prev=util.window(util.add(day,-1),util.add(day,-1)).from;
const sample=(t,sum)=>({start:new Date(t).toISOString(),sum});
const ids=['sensor.pv','sensor.import','sensor.export'];
(async()=>{
  assert.equal(util.day(new Map([[prev,100],[boundary.from,107]]),prev,boundary.from),7);
  assert.equal(util.day(new Map([[boundary.from,107]]),prev,boundary.from),null,'a single day stat cannot imply a zero baseline');
  assert.equal(util.day(new Map([[prev,110],[boundary.from,105]]),prev,boundary.from),null,'counter resets are unknown');
  assert.equal(util.house(4,11,2,0,0,false),13);
  assert.equal(util.balance(4,11,2,0,0,18,false),null,'overlapping consumers still invalidate unrecorded remainder');
  let dailyBoundaryQueries=0;
  const card={
    _historySeq:0,_historyCache:new Map(),_historyMode:'live',_historyStatus(){},_update(){},
    _c:{grid:{import_total:'sensor.import',export_total:'sensor.export'}},
    _pvPlants(){return [{energy_total:'sensor.pv'}];},_consumerEntities(){return [];},
    _historyIds(){return ids;},
    async _getStatistics(requested,start,end,period,units){
      assert.equal(units.energy,'kWh');
      if(period==='5minute')return {};
      if(period==='hour')return Object.fromEntries(requested.map(id=>[id,[]]));
      if(period!=='day')throw Error('unexpected period');
      // Missing-start discovery is separate from a true adjacent-day delta.
      if(start!==prev)return {};
      dailyBoundaryQueries++;
      const last={ 'sensor.pv':6,'sensor.import':15,'sensor.export':2 };
      return Object.fromEntries(requested.map(id=>[
        id,[sample(prev,100),sample(boundary.from,100+last[id])]
      ]));
    }
  };
  await loader.call(card,day,day,'day');
  assert.equal(dailyBoundaryQueries,1,'single batched query after hourly boundary failures');
  assert.deepEqual(JSON.parse(JSON.stringify(card._historyData.energy)),{
    'sensor.pv':6,'sensor.import':15,'sensor.export':2
  },'daily cumulative SUMs restore old days missing all hourly boundary observations');
  assert.equal(card._historyData.partialIds.length,0,'two real adjacent day boundaries give a complete day');
  assert.equal(card._historyData.missingEndIds.length,0);
  // If an HA WebSocket query fails only for one sensor, do not drop the other counters.
  const queries=[];
  const ws={
    _h:{async callWS(request){
      queries.push([...request.statistic_ids]);
      if(request.statistic_ids.includes('sensor.bad'))throw Error('bad stats ID');
      return Object.fromEntries(request.statistic_ids.map(id=>[id,[sample(prev,101)]]));
    }},
    _getStatistics:getStats
  };
  const good=await getStats.call(ws,['sensor.import','sensor.bad','sensor.export'],
    prev,boundary.to,'hour',{energy:'kWh'});
  assert.deepEqual(Object.keys(good).sort(),['sensor.export','sensor.import'],
    'a failed one-ID query is isolated instead of blanking entire day');
  assert.ok(queries.some(q=>q.length===1&&q[0]==='sensor.bad'));
  await assert.rejects(()=>getStats.call(ws,['sensor.bad'],prev,boundary.to,'hour',{energy:'kWh'}));
  assert.match(src,/Keine Recorder-Werte für:/,'when an actual counter is missing, status tells user which');
  console.log('Sparse days: adjacent real daily sums, no fabricated baseline, independent demand and split Recorder retries passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
