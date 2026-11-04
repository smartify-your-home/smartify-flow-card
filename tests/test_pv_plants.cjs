// PV plant grouping and late-installation regression tests
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');
const from=src.indexOf('function sfcPvPlants('),to=src.indexOf('function sfcHistoricalBalance(',from);
assert(from>=0&&to>from,'PV helpers available');
const p=vm.runInNewContext(src.slice(from,to)+'\n({plants:sfcPvPlants,energy:sfcPvEnergy})');
const legacy=p.plants({power:'sensor.old_power',energy_total:'sensor.old_energy',name:'Alt'});
assert.equal(legacy.length,1);
assert.equal(legacy[0].name,'Alt');
assert.equal(legacy[0].power,'sensor.old_power');
const plants=p.plants({plants:[
  {name:'Dach',power:'sensor.dach_w',energy_total:'sensor.dach_kwh'},
  {name:'Balkon',power:'sensor.balkon_w',energy_total:'sensor.balkon_kwh'},
]});
assert.equal(plants.length,2);
assert.equal(plants[0].name,'Dach');
assert.equal(plants[1].name,'Balkon');
assert.equal(p.energy(plants,id=>({ 'sensor.dach_kwh':10000,'sensor.balkon_kwh':1152.72 })[id]),11152.72);
assert.equal(p.energy(plants,id=>id==='sensor.dach_kwh'?10000:null),null,'missing energy must not silently zero');
assert.equal(p.energy([{energy_total:'same'},{energy_total:'same'}],()=>5),5,'duplicate sensor not counted twice');
assert.match(src,/this\._pvPlants\(\)\.reduce\(\(sum,p\)=>sum\+Math\.max\(this\._num\(p\.power\),0\),0\)/,'live watts sum all plants');
assert.match(src,/sfcPvEnergy\(this\._pvPlants\(\),get\)/,'history sums individual statistics');
assert.match(src,/firstDay>=range\.to/,'plant added after selected period does not block historical sum');
assert.match(src,/this\._pvPlantControls\(sec\)/,'editor provides per-plant controls');
assert.match(src,/this\._picker\(item,'Gesamtenergiezähler \(kWh\)'/,'separate entity picker for each PV plant');
console.log('Named PV plants, summed power and independent energy regression checks passed');
