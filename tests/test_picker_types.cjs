// Real picker logic: power/energy separation and icon suggestions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'custom_components','smartify_flow_card','frontend','smartify-flow-card.js'),'utf8');
const start = code.indexOf('  _matchingEntities(mode) {');
const end = code.indexOf('  _labels() {', start);
assert.ok(start > 0 && end > start, 'editor entity matcher exists');
const iconsStart = code.indexOf('const SFC_ICON_OPTIONS = ');
const iconsEnd = code.indexOf('\nconst SFC_DASH', iconsStart);
assert.ok(iconsStart > 0 && iconsEnd > iconsStart, 'curated MDI icon previews exist');
const source = code.slice(iconsStart, iconsEnd) + '\nconst picker = ({' +
  code.slice(start, end) + '});\n({picker, icons:SFC_ICON_OPTIONS})';
const {picker, icons} = vm.runInNewContext(source);
const fake = {
  _config: {solar:{icon:'mdi:solar-power'},battery:{},grid:{},consumers:{}},
  _labels: () => [],
  _entities: () => [
    {id:'sensor.watt', label:'Power W', unit:'W', device_class:'',icon:'mdi:flash'},
    {id:'sensor.kilowatt', label:'Power kW', unit:'kW', device_class:'',icon:'mdi:flash'},
    {id:'sensor.megawatt', label:'Power MW', unit:'MW', device_class:'',icon:'mdi:flash'},
    {id:'sensor.powerclass',label:'Power class',unit:'',device_class:'power',icon:''},
    {id:'sensor.wh',label:'Energy Wh',unit:'Wh',device_class:'',icon:''},
    {id:'sensor.kwh',label:'Energy kWh',unit:'kWh',device_class:'',icon:''},
    {id:'sensor.mwh',label:'Energy MWh',unit:'MWh',device_class:'',icon:''},
    {id:'sensor.energyclass',label:'Energy class',unit:'',device_class:'energy',icon:''},
    {id:'sensor.wrong',label:'Bad metadata',unit:'W',device_class:'energy',icon:''},
    {id:'sensor.temperature',label:'Temperature',unit:'°C',device_class:'temperature',icon:''},
    {id:'switch.power',label:'Switch',unit:'W',device_class:'power',icon:''}
  ],
};
const get = type => Array.from(picker._matchingEntities.call(fake,type),x => x.id);
assert.deepEqual(get('power').sort(),['sensor.kilowatt','sensor.megawatt','sensor.powerclass','sensor.watt']);
assert.deepEqual(get('energy').sort(),['sensor.energyclass','sensor.kwh','sensor.mwh','sensor.wh','sensor.wrong']);
assert.ok(!get('power').includes('sensor.wrong'), 'misclassified energy is never accepted as power');
assert.ok(icons.length > 80, 'substantial searchable icon set with previews');
assert.ok(get('icon').includes('mdi:solar-power'), 'solar icon selectable');
assert.ok(get('icon').includes('mdi:heat-pump'), 'heat-pump icon selectable');
assert.ok(get('icon').includes('mdi:washing-machine'), 'washing-machine icon selectable');
assert.match(code, /_picker\(section, title, path, mode = 'entity', hint = '', options = \{\}\)/);
assert.match(code, /if \(obj\.onChoose\) obj\.onChoose\(id\)/, 'modal selection stays staged');
assert.match(code, /this\._picker\(dialog, title, \['_consumer_draft', key\], mode, hint/, 'dialog uses same search implementation');
assert.match(code, /p\.mode === 'icon' \? item\.id : item\.icon/, 'live icon suggestions display actual MDI symbol');
for (const [section, prop] of [['solar','PV-Icon'],['battery','Akku-Icon'],['grid','Netz-Icon']]) {
  assert.ok(code.includes("['"+section+"','icon'],'icon'"),prop + ' available through icon search');
}
assert.doesNotMatch(code.slice(code.indexOf('  _consumerList(section) {'),code.indexOf('  _backupSection() {')),/createElement\('datalist'\)/,'no native popup datalist');
console.log('Power/energy picker separation and icon preview checks passed');
