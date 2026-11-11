/* smartify-flow-card – Energiefluss Quellen -> Verbraucher (Label-basiert), E-Paper-Design
 * Inspiriert von ChromaFlow (Aresitoo/chromaflow, MIT) */
const SFC_VERSION = '0.6.26';
const SFC_PALETTE = ['#00b2bf', '#7e57c2', '#43a047', '#fb8c00', '#e53935', '#1e88e5', '#6d4c41', '#00897b', '#c0ca33', '#8e24aa', '#f4511e', '#3949ab'];
const SFC_COL = {
  solar: 'var(--smartify-flow-solar-color, #e3a600)',
  battery: 'var(--smartify-flow-battery-color, #2e7d32)',
  grid: 'var(--smartify-flow-grid-color, var(--smartify-flow-text-color, var(--primary-text-color, #111111)))',
  export: 'var(--smartify-flow-export-color, #00b2bf)',
  rest: 'var(--smartify-flow-rest-color, #888888)',
  other: 'var(--smartify-flow-other-color, #555555)',
};
/* Strichmuster je Quelle (E-Ink: Richtung + Quelle auch ohne Farbe erkennbar) */
const SFC_ICON_OPTIONS = [{"id":"mdi:solar-power","label":"Solar PV Photovoltaik Sonne"},{"id":"mdi:solar-panel","label":"Solarmodul Photovoltaik"},{"id":"mdi:white-balance-sunny","label":"Sonne Solar Wetter"},{"id":"mdi:weather-sunny","label":"Sonne Wetter"},{"id":"mdi:home-battery","label":"Hausspeicher Akku Batterie"},{"id":"mdi:battery","label":"Batterie Akku"},{"id":"mdi:battery-charging","label":"Batterie laden"},{"id":"mdi:battery-high","label":"Batterie voll"},{"id":"mdi:transmission-tower","label":"Netz Stromnetz Leitung"},{"id":"mdi:transmission-tower-export","label":"Netzbezug"},{"id":"mdi:transmission-tower-import","label":"Netzeinspeisung"},{"id":"mdi:power-plug","label":"Steckdose Verbraucher"},{"id":"mdi:power-socket-eu","label":"Steckdose Europa"},{"id":"mdi:lightning-bolt","label":"Blitz Strom Leistung"},{"id":"mdi:flash","label":"Blitz Energie"},{"id":"mdi:home","label":"Haus Zuhause"},{"id":"mdi:home-outline","label":"Haus Grundlast"},{"id":"mdi:home-lightning-bolt","label":"Haus Strom"},{"id":"mdi:lightbulb","label":"Lampe Beleuchtung"},{"id":"mdi:lightbulb-on","label":"Licht an"},{"id":"mdi:ceiling-light","label":"Deckenleuchte"},{"id":"mdi:led-strip-variant","label":"LED Streifen"},{"id":"mdi:floor-lamp","label":"Stehlampe"},{"id":"mdi:television","label":"Fernseher TV"},{"id":"mdi:monitor","label":"Monitor Computer"},{"id":"mdi:desktop-tower","label":"PC Computer"},{"id":"mdi:laptop","label":"Notebook Laptop"},{"id":"mdi:router-wireless","label":"Router WLAN"},{"id":"mdi:server","label":"Server"},{"id":"mdi:printer","label":"Drucker"},{"id":"mdi:washing-machine","label":"Waschmaschine"},{"id":"mdi:tumble-dryer","label":"Trockner"},{"id":"mdi:dishwasher","label":"Geschirrspüler"},{"id":"mdi:stove","label":"Herd"},{"id":"mdi:stove-burner","label":"Kochfeld"},{"id":"mdi:microwave","label":"Mikrowelle"},{"id":"mdi:coffee-maker","label":"Kaffeemaschine"},{"id":"mdi:kettle","label":"Wasserkocher"},{"id":"mdi:toaster","label":"Toaster"},{"id":"mdi:fridge","label":"Kühlschrank"},{"id":"mdi:fridge-outline","label":"Kühlschrank"},{"id":"mdi:snowflake","label":"Gefrierschrank Kälte"},{"id":"mdi:air-conditioner","label":"Klimaanlage"},{"id":"mdi:fan","label":"Ventilator Lüftung"},{"id":"mdi:hvac","label":"Lüftung Klima"},{"id":"mdi:air-filter","label":"Filter Lüftung"},{"id":"mdi:heat-pump","label":"Wärmepumpe"},{"id":"mdi:radiator","label":"Heizkörper Heizung"},{"id":"mdi:radiator-disabled","label":"Heizung aus"},{"id":"mdi:heating-coil","label":"Heizstab"},{"id":"mdi:water-boiler","label":"Warmwasser Boiler"},{"id":"mdi:water-pump","label":"Pumpe"},{"id":"mdi:water","label":"Wasser"},{"id":"mdi:water-thermometer","label":"Wassertemperatur"},{"id":"mdi:thermometer","label":"Temperatur"},{"id":"mdi:thermometer-lines","label":"Temperatur Sensor"},{"id":"mdi:fire","label":"Feuer Wärme"},{"id":"mdi:fireplace","label":"Kamin"},{"id":"mdi:fan-auto","label":"Automatik Ventilator"},{"id":"mdi:car","label":"Auto"},{"id":"mdi:car-electric","label":"Elektroauto"},{"id":"mdi:ev-station","label":"Wallbox Laden"},{"id":"mdi:ev-plug-type2","label":"Ladestecker Typ2"},{"id":"mdi:battery-charging-outline","label":"Laden"},{"id":"mdi:garage","label":"Garage"},{"id":"mdi:garage-open","label":"Garage offen"},{"id":"mdi:door","label":"Tür"},{"id":"mdi:door-open","label":"Tür offen"},{"id":"mdi:window-shutter","label":"Rollo Raffstore"},{"id":"mdi:blinds","label":"Jalousie"},{"id":"mdi:window-closed","label":"Fenster"},{"id":"mdi:motion-sensor","label":"Bewegungssensor"},{"id":"mdi:cctv","label":"Kamera"},{"id":"mdi:video","label":"Video"},{"id":"mdi:bell","label":"Klingel"},{"id":"mdi:phone","label":"Telefon"},{"id":"mdi:cellphone","label":"Smartphone"},{"id":"mdi:speaker","label":"Lautsprecher"},{"id":"mdi:music","label":"Musik"},{"id":"mdi:weather-cloudy","label":"Bewölkt Wetter"},{"id":"mdi:weather-partly-cloudy","label":"Leicht bewölkt"},{"id":"mdi:weather-rainy","label":"Regen"},{"id":"mdi:weather-snowy","label":"Schnee"},{"id":"mdi:weather-windy","label":"Wind"},{"id":"mdi:leaf","label":"Ökologisch"},{"id":"mdi:tree","label":"Baum"},{"id":"mdi:sprout","label":"Pflanze"},{"id":"mdi:pool","label":"Pool Schwimmbad"},{"id":"mdi:hot-tub","label":"Whirlpool"},{"id":"mdi:shower","label":"Dusche"},{"id":"mdi:bathtub","label":"Badewanne"},{"id":"mdi:bed","label":"Schlafzimmer"},{"id":"mdi:sofa","label":"Wohnzimmer Couch"},{"id":"mdi:silverware-fork-knife","label":"Küche Essen"},{"id":"mdi:clock","label":"Uhr Zeit"},{"id":"mdi:timer","label":"Timer"},{"id":"mdi:chart-line","label":"Diagramm"},{"id":"mdi:chart-bar","label":"Balkendiagramm"},{"id":"mdi:meter-electric","label":"Stromzähler"},{"id":"mdi:gauge","label":"Leistungsanzeige"},{"id":"mdi:speedometer","label":"Geschwindigkeit"},{"id":"mdi:flash-outline","label":"Leistung"},{"id":"mdi:dots-horizontal-circle-outline","label":"Sonstige"},{"id":"mdi:help-circle-outline","label":"Unbekannt"},{"id":"mdi:information-outline","label":"Info"},{"id":"mdi:check-circle","label":"Erledigt"},{"id":"mdi:alert","label":"Warnung"},{"id":"mdi:alert-circle","label":"Alarm"},{"id":"mdi:tag-outline","label":"Label"},{"id":"mdi:cog","label":"Einstellungen"},{"id":"mdi:cog-outline","label":"Einstellungen"},{"id":"mdi:wrench","label":"Werkzeug"},{"id":"mdi:plus","label":"Plus Hinzufügen"},{"id":"mdi:minus","label":"Minus Entfernen"}];
const SFC_DASH = { _solar: { a: '7 5', p: 12, k: 'fs' }, _battery: { a: '10 4 2 4', p: 20, k: 'fb' }, _grid: { a: '2 5', p: 7, k: 'fg' } };
const SFC_ICON_GUESS = [
  [/wasch/i, 'mdi:washing-machine'], [/trockner/i, 'mdi:tumble-dryer'], [/geschirr/i, 'mdi:dishwasher'],
  [/pool/i, 'mdi:pool'], [/wärmepumpe|waermepumpe|boiler|compressor|heat.?pump/i, 'mdi:heat-pump'],
  [/charger|wallbox|go-e|laden/i, 'mdi:ev-station'], [/ohmpilot/i, 'mdi:water-boiler'],
  [/gefrier|kühl|kuehl|fridge|freezer/i, 'mdi:fridge'], [/heizung|heater|radiator/i, 'mdi:radiator'],
  [/licht|spot|leuchte|lampe|rgb|led/i, 'mdi:lightbulb'], [/rollo|shutter|raffstore/i, 'mdi:window-shutter'],
  [/schreibtisch|desk|pc|computer/i, 'mdi:desk'], [/tv|fernseh/i, 'mdi:television'],
];

// List view: sort both individual devices and aggregated/unknown loads by
// current total power; stable key order prevents jitter when values are equal.
const SFC_SOURCE_KEYS = ['_solar', '_battery', '_grid'];
function sfcSourceOrder(order, available = SFC_SOURCE_KEYS) {
  const valid = new Set(available.filter(key => SFC_SOURCE_KEYS.includes(key)));
  const seen = new Set();
  const requested = Array.isArray(order) ? order : [];
  return [...requested, ...SFC_SOURCE_KEYS].filter(key => {
    if (!valid.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function sfcMoveSource(order, key, target) {
  const next = sfcSourceOrder(order);
  if (!next.includes(key) || !next.includes(target) || key === target) return next;
  const targetIndex = next.indexOf(target);
  next.splice(next.indexOf(key), 1);
  next.splice(targetIndex, 0, key);
  return next;
}

function sfcSortLoadTiles(tiles, pinRestBottom = false) {
  return [...tiles].sort((a, b) => {
    if (pinRestBottom && (a.key === '_rest' || b.key === '_rest') && a.key !== b.key) {
      return a.key === '_rest' ? 1 : -1;
    }
    return (b.w - a.w) || String(a.key).localeCompare(String(b.key));
  });
}

function sfcAllocateSources(candidates, supply) {
  // PV allocation is intentionally small-to-large. Battery/grid supply
  // fills the remaining needs afterwards and never exceeds source budgets.
  // The visual tile order is independent of allocation priority.
  const allocations = new Map();
  const remaining = {
    pv: Math.max(0, Number(supply.pv) || 0),
    battery: Math.max(0, Number(supply.battery) || 0),
    grid: Math.max(0, Number(supply.grid) || 0),
  };
  const consumers = candidates.map(item => ({
    key: item.key, w: Math.max(0, Number(item.w) || 0),
  }));
  for (const item of consumers) {
    allocations.set(item.key, { pv: 0, battery: 0, grid: 0, unassigned: item.w });
  }
  const bySmallest = [...consumers].sort((a, b) => a.w - b.w || String(a.key).localeCompare(String(b.key)));
  for (const item of bySmallest) {
    const share = allocations.get(item.key);
    const assigned = Math.min(share.unassigned, remaining.pv);
    share.pv = assigned;
    share.unassigned -= assigned;
    remaining.pv -= assigned;
  }
  const byLargest = [...consumers].sort((a, b) => b.w - a.w || String(a.key).localeCompare(String(b.key)));
  for (const source of ['battery', 'grid']) {
    for (const item of byLargest) {
      const share = allocations.get(item.key);
      const assigned = Math.min(share.unassigned, remaining[source]);
      share[source] = assigned;
      share.unassigned -= assigned;
      remaining[source] -= assigned;
    }
  }
  return allocations;
}


/**
 * Proportional model: every consumer gets the same modeled source mixture.
 * Scale demand to available supply first, so no input budget is overspent and
 * no consumer receives more watts than its measured demand.
 */
function sfcAllocateProportional(candidates, supply) {
  const budgets = ['pv', 'battery', 'grid'].map(key => Math.max(0, Number(supply[key]) || 0));
  const totalSupply = budgets.reduce((sum, w) => sum + w, 0);
  const consumers = candidates.map(c => ({ key: c.key, w: Math.max(0, Number(c.w) || 0) }));
  const totalDemand = consumers.reduce((sum, c) => sum + c.w, 0);
  const servedRatio = totalDemand > 0 ? Math.min(1, totalSupply / totalDemand) : 0;
  return new Map(consumers.map(c => {
    const served = c.w * servedRatio;
    const shares = {
      pv: totalSupply > 0 ? served * budgets[0] / totalSupply : 0,
      battery: totalSupply > 0 ? served * budgets[1] / totalSupply : 0,
      grid: totalSupply > 0 ? served * budgets[2] / totalSupply : 0,
      unassigned: c.w - served,
    };
    return [c.key, shares];
  }));
}

function sfcLineWidth(watts, maxWatts, minWidth = 1.5, maxWidth = 4.5, scale = 'sqrt') {
  const min = Math.max(0.5, Math.min(20, Number(minWidth) || 1.5));
  const max = Math.max(min, Math.min(20, Number(maxWidth) || 4.5));
  const ratio = Math.max(0, Math.min(1, (Number(watts) || 0) / Math.max(1, Number(maxWatts) || 10000)));
  const factor = scale === 'linear' ? ratio : Math.sqrt(ratio);
  return (min + (max - min) * factor).toFixed(2);
}

function sfcLocalDate(d) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function sfcDateWindow(a,b) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(a)||!/^\d{4}-\d{2}-\d{2}$/.test(b))return null;
  const x=new Date(a+'T00:00:00'),y=new Date(b+'T00:00:00');
  if(!Number.isFinite(+x)||!Number.isFinite(+y)||sfcLocalDate(x)!==a||sfcLocalDate(y)!==b||y<x)return null;
  y.setDate(y.getDate()+1);
  return {from:+x,to:+y};
}

function sfcQuickPeriod(mode,now=new Date()) {
  const today=sfcLocalDate(now);
  if(mode==='day')return {start:today,end:today};
  if(mode==='month')return {start:sfcLocalDate(new Date(now.getFullYear(),now.getMonth(),1)),end:today};
  if(mode==='year')return {start:sfcLocalDate(new Date(now.getFullYear(),0,1)),end:today};
  return null;
}
function sfcValidatePeriod(start,end,now=new Date()){
  const range=sfcDateWindow(start,end);
  if(!range||range.from>+now||end>sfcLocalDate(now))return null;
  // Bound worst-case work without imposing artificial month boundaries.
  const cap=new Date(range.from);cap.setFullYear(cap.getFullYear()+5);
  if(range.to>+cap)return null;
  return {from:range.from,to:Math.min(range.to,+now),isToday:end===sfcLocalDate(now)};
}

function sfcHistoryPoints(items,unit) {
  const mult=String(unit||'kWh').toLowerCase()==='wh'?.001:String(unit||'kWh').toLowerCase()==='mwh'?1000:1;
  const map=new Map();
  for(const r of Array.isArray(items)?items:[]) {
    const t=typeof r.start==='number'?r.start:Date.parse(r.start),v=Number(r.sum);
    if(Number.isFinite(t)&&r.sum!=null&&Number.isFinite(v))map.set(t,v*mult);
  }
  return map;
}
function sfcQuarterPeak(points,from,to) {
  if(!points||!points.size)return null;
  let result=null;const q=900000,five=300000;
  let expected=0,complete=0;
  for(let t=Math.ceil(from/q)*q;t+q<=to;t+=q){
    expected++;
    let delta=0,valid=true;
    // Short-term statistic sums are the cumulative energy at the END
    // of their named five-minute bucket; 18:00-18:15 uses 17:55 and 18:10.
    for(let i=0;i<3;i++){
      const x=points.get(t+(i-1)*five),y=points.get(t+i*five);
      if(!Number.isFinite(x)||!Number.isFinite(y)||y<x-1e-8){valid=false;break}
      delta+=Math.max(0,y-x);
    }
    if(valid){complete++;if(!result||delta*4>result.kw)result={kw:delta*4,from:t,to:t+q};}
  }
  return expected>0&&complete===expected?result:null;
}
function sfcVerifiedBoundaryEnergy(startHourly,endHourly,endFine,from,to) {
  // HA statistics SUM belongs to the END of the bucket starting at timestamp.
  // A valid initial baseline is the preceding 1h bucket. If that bucket is
  // unavailable but the first 1h bucket starts exactly at the beginning,
  // use its end as an explicitly partial baseline (never an implicit zero).
  const startPoint=startHourly?.get(from-3600000);
  const firstHour=startHourly?.get(from);
  const exactStart=Number.isFinite(startPoint);
  const initial=exactStart?startPoint:Number.isFinite(firstHour)?firstHour:null;
  const measuredFrom=exactStart?from:from+3600000;
  if(initial==null)return null;
  let lastTime=-Infinity,lastValue=null;
  for(const [points,duration] of [[endHourly,3600000],[endFine,300000]]){
    if(!points)continue;
    for(const [time,value] of points){
      const bucketEnd=time+duration;
      if(bucketEnd<=to&&bucketEnd>=to-7200000&&bucketEnd>lastTime&&Number.isFinite(value)){
        lastTime=bucketEnd;lastValue=value;
      }
    }
  }
  if(lastValue==null||lastTime<=measuredFrom||lastValue<initial-0.001)return null;
  return {kwh:Math.max(0,lastValue-initial),partialStart:!exactStart,
    partialFrom:!exactStart?measuredFrom:null,through:lastTime};
}
function sfcPvPlants(solar) {
  if(Array.isArray(solar?.plants))return solar.plants.filter(p=>p&&(p.power||p.energy_total));
  return solar?.power||solar?.energy_total?[{name:solar.name||'PV-Anlage 1',power:solar.power||'',energy_total:solar.energy_total||''}]:[];
}
function sfcPvEnergy(plants,get) {
  const ids=[...new Set(plants.map(p=>p.energy_total).filter(Boolean))];
  if(!ids.length)return null;
  const values=ids.map(get);
  return values.some(v=>v==null||!Number.isFinite(v))?null:values.reduce((a,b)=>a+b,0);
}
function sfcHistoricalBalance(pv, imported, exported, discharged, charged, recorded, hasBattery = false) {
  const required = [pv, imported, exported, recorded];
  if (hasBattery) required.push(discharged, charged);
  if (required.some(x => x == null || !Number.isFinite(x) || x < 0)) return null;
  const total = pv + imported - exported + (hasBattery ? discharged - charged : 0);
  const difference = total - recorded;
  // Negative residual indicates overlapping/incorrect meters, not an unrecorded load.
  if (total < -0.001 || difference < -0.001) return null;
  return { total: Math.max(0,total), rest: Math.max(0,difference) };
}
function sfcEnergyDelta(points,from,to) {
  // Full cumulative-energy boundaries only; do not manufacture estimates.
  // Hourly recorder sum is at the END of its labelled hour.
  const hour=3600000;
  if(!points||!points.has(from-hour)||!points.has(to-hour))return null;
  const x=points.get(from-hour),y=points.get(to-hour);
  return y>=x?y-x:null;
}

class SmartifyFlowCard extends HTMLElement {
  static getConfigElement() { return document.createElement('smartify-flow-card-editor'); }

  static getStubConfig() {
    return { label: 'verbraucher', solar: { power: '' }, grid: { import_power: '', export_power: '' } };
  }

  setConfig(config) {
    if (!config.solar || !config.grid) throw new Error('smartify-flow-card: "solar" und "grid" sind erforderlich');
    this._c = Object.assign({
      label: 'verbraucher', layout: 'classic', min_power: 10, hide_below_display_power: false, max_consumers: 8, min_flow: 5, idle_power: 5,
      show_stats: true, show_rest: true, rest_name: 'Nicht erfasst', rest_always_last: false,
      max_expected_power_kw: 10, speed_multiplier: 1, font_scale: 1, background_transparency: 0,
      source_display: 'badge', allocation: 'smallest_first', line_width_min: 1.5, line_width_max: 4.5, line_scale: 'sqrt',
      contract_power_limit_kw: null, contract_warning_pct: 0.85,
      line_speeds: {}, max_width: 900,
    }, config);
    // Migrate older cards: preserve their previous min_flow idle threshold.
    if (config.idle_power === undefined) this._c.idle_power = config.min_flow ?? 5;
    this._sig = null;
    this._energy = this._energy || {};
    this._energyTs = 0;
    this._energyDay = '';
    this._shown = new Set();
    this._radialOrder = [];
    this._paths = new Map();
    this._historyMode=this._historyMode||'live';
    this._historyPreset=this._historyPreset||null;
    this._todayPeakTs=this._todayPeakTs||0;
    this._historyCache=this._historyCache||new Map();
    this._historySeq=this._historySeq||0;
    this._monthlyPeaks=this._monthlyPeaks||{};
    this._monthlyPeaksSensor=null;
    this._monthlyPeaksFetchAt=0;
    this._monthlyPeaksLoading=false;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._build();
  }

  set hass(h) {
    this._h = h;
    if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = null; this._update(); });
    if(this._historyMode==='live')this._maybeEnergy();
    if(this._historyMode==='live')this._maybeLivePeak();
    this._maybeMonthlyPeaks();
  }

  getCardSize() { return 8; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  connectedCallback() {
    if (!this._ro) this._ro = new ResizeObserver(() => this._scheduleDraw());
    if (this._flowEl) this._ro.observe(this._flowEl);
  }
  disconnectedCallback() { if (this._ro) this._ro.disconnect(); }

  /* ---------- helpers ---------- */
  _st(id) { return id && this._h ? this._h.states[id] : undefined; }
  _pvPlants(){return sfcPvPlants(this._c.solar);}
  _num(id) {
    const s = this._st(id); if (!s) return 0;
    const v = parseFloat(s.state); if (isNaN(v)) return 0;
    const u = (s.attributes.unit_of_measurement || '').toLowerCase();
    return u === 'kw' ? v * 1000 : u === 'mw' ? v * 1e6 : v;
  }
  _kwh(id) {
    const s = this._st(id); if (!s) return null;
    const v = parseFloat(s.state); if (isNaN(v)) return null;
    const u = (s.attributes.unit_of_measurement || 'kwh').toLowerCase();
    return u === 'wh' ? v / 1000 : u === 'mwh' ? v * 1000 : v;
  }
  _fmtW(w) { return w >= 1000 ? (w / 1000).toFixed(2) + ' kW' : Math.round(w) + ' W'; }
  _fmtKwh(v) { return v == null ? '–' : v.toFixed(2); }
  _esc(s) { return String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }

  // Resolve the visible label name ("verbraucher") as well as HA's internal label ID.
  _labelEntities() {
    const entities = (this._h && this._h.entities) || {};
    const labels = (this._h && this._h.labels) || {};
    const configured = String(this._c.label || 'verbraucher').trim().toLowerCase();
    const valid = new Set([configured]);
    for (const label of (Array.isArray(labels) ? labels : Object.values(labels))) {
      if (String(label.name || '').trim().toLowerCase() === configured ||
          String(label.label_id || label.id || '').trim().toLowerCase() === configured) {
        valid.add(String(label.label_id || label.id || '').toLowerCase());
        valid.add(String(label.name || '').toLowerCase());
      }
    }
    return Object.values(entities)
      .filter(e => e && e.entity_id && e.entity_id.startsWith('sensor.') && !e.hidden &&
        Array.isArray(e.labels) && e.labels.some(l => valid.has(String(l).toLowerCase())))
      .map(e => e.entity_id)
      .filter(id => {
        const st = this._st(id);
        if (!st) return false;
        const unit = String(st.attributes.unit_of_measurement || '').trim().toLowerCase();
        return st.attributes.device_class === 'power' || ['w', 'kw', 'mw'].includes(unit);
      });
  }
  // Combine manually configured and label-discovered power sensors without duplicates.
  _consumerEntities() {
    const explicit = Object.keys(this._c.consumers || {}).filter(id => id.startsWith('sensor.'));
    const excluded = new Set(this._c.excluded_consumers || []);
    return [...new Set([...explicit, ...this._labelEntities()])].filter(id => !excluded.has(id));
  }
  _ov(id) { return (this._c.consumers || {})[id] || {}; }
  _name(id) {
    const ov = this._ov(id); if (ov.name) return ov.name;
    const s = this._st(id);
    const n = (s && s.attributes.friendly_name) || id;
    return n.replace(/\s+(Leistung|Power Total|current power|power)$/i, '').trim();
  }
  _icon(id, name) {
    const ov = this._ov(id); if (ov.icon) return ov.icon;
    const e = this._h.entities && this._h.entities[id];
    if (e && e.icon) return e.icon;
    const s = this._st(id); if (s && s.attributes.icon) return s.attributes.icon;
    for (const [re, ic] of SFC_ICON_GUESS) if (re.test(name) || re.test(id)) return ic;
    return 'mdi:power-plug';
  }
  _color(id) {
    const ov = this._ov(id); if (ov.color) return ov.color;
    let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return SFC_PALETTE[h % SFC_PALETTE.length];
  }
  _energyId(id) {
    const ov = this._ov(id); if (ov.energy !== undefined) return ov.energy || null;
    const ents = this._h.entities || {};
    const guess = id.replace(/_leistung$/, '_energie').replace(/_power$/, '_energy');
    const dev = ents[id] && ents[id].device_id;
    if (this._st(guess) && (!dev || (ents[guess] && ents[guess].device_id === dev))) return guess;
    if (!dev) return null;
    const c = Object.values(ents).filter((e) => e.device_id === dev && e.entity_id.startsWith('sensor.')).map((e) => e.entity_id)
      .filter((eid) => { const s = this._st(eid); return s && s.attributes.device_class === 'energy' && s.attributes.state_class === 'total_increasing' && !/einspeis|feed|export|return|lieferung/i.test(eid); });
    return c[0] || null;
  }

  // Gesamtenergiezähler -> Tagesdifferenz aus HA-Recorder-Statistik.
  // Keine täglichen Utility-Meter-Sensoren notwendig.
  async _maybeEnergy() {
    if (!this._h || this._loadingE) return;
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (day === this._energyDay && Date.now() - this._energyTs < 300000) return;
    this._loadingE = true;
    this._energyTs = Date.now();
    if (day !== this._energyDay) {
      this._energy = {};
      this._energyDay = day;
    }
    try {
      const ids = new Set();
      for (const e of this._consumerEntities()) {
        const x = this._energyId(e);
        if (x) ids.add(x);
      }
      const c = this._c;
      for (const id of [...this._pvPlants().map(p=>p.energy_total), c.grid.import_total, c.grid.export_total,
        c.battery?.charge_total, c.battery?.discharge_total]) {
        if (id) ids.add(id);
      }
      await Promise.all([...ids].map(async (id) => {
        try {
          const r = await this._h.callWS({
            type: 'recorder/statistic_during_period', statistic_id: id,
            fixed_period: { start_time: midnight.toISOString(), end_time: new Date().toISOString() },
            types: ['change'],
          });
          let v = r && Number.isFinite(Number(r.change)) && r.change != null ? Number(r.change) : null;
          const u = (((this._st(id) || {}).attributes || {}).unit_of_measurement || 'kWh').toLowerCase();
          if (v != null) {
            if (u === 'wh') v /= 1000;
            else if (u === 'mwh') v *= 1000;
            v = Math.max(0, v);
          }
          this._energy[id] = v;
        } catch (_) { this._energy[id] = null; }
      }));
    } finally { this._loadingE = false; this._update(); }
  }

  _pvToday() {
    const plants=this._pvPlants();
    if(!plants.length)return this._today(null,this._c.solar.energy_today);
    return sfcPvEnergy(plants,id=>this._today(id,null));
  }
  _today(totalId, legacyDayId) {
    if (totalId) return this._energy[totalId] ?? null;
    // Abwärtskompatibilität mit bereits konfigurierten Tagessensoren.
    return legacyDayId ? this._kwh(legacyDayId) : null;
  }



  async _maybeLivePeak(){
    const id=this._c?.grid?.import_total;
    if(!id||!this._h||this._livePeakLoading||Date.now()-this._todayPeakTs<300000)return;
    this._todayPeakTs=Date.now();this._livePeakLoading=true;
    const day=sfcLocalDate(new Date()),start=sfcDateWindow(day,day).from;
    try{
      const result=await this._getStatistics([id],start-300000,Date.now(),'5minute');
      const points=sfcHistoryPoints(result[id],this._st(id)?.attributes?.unit_of_measurement);
      this._livePeak=sfcQuarterPeak(points,start,Math.floor(Date.now()/900000)*900000);
    }catch(_){this._livePeak=null;}
    finally{this._livePeakLoading=false;if(this._historyMode==='live')this._update();}
  }

  _historyIds(){
    const c=this._c;
    const ids=new Set([...this._pvPlants().map(p=>p.energy_total),c.grid.import_total,c.grid.export_total,c.battery?.charge_total,c.battery?.discharge_total]);
    for(const id of this._consumerEntities())ids.add(this._energyId(id));
    return [...ids].filter(Boolean);
  }
  _historyStatus(){
    const el=this.shadowRoot.querySelector('.history-status');
    if(!el)return;
    let label='';
    if(this._historyMode==='history'){
      label=this._historyLoading?'Lade historische Energiedaten …':this._historyError||
        (this._historyRange?this._historyRange.start+' – '+this._historyRange.end:'')+
        (this._historyData?.partialIds?.length?' · Teilweise erst ab erster verfügbarer Stundenstatistik':'');
    }
    el.textContent=label;
    this.shadowRoot.querySelector('.history-live').classList.toggle('selected',this._historyMode==='live');
    this.shadowRoot.querySelector('.history-date').classList.toggle('selected',this._historyMode==='history'&&!this._historyPreset);
    for(const mode of ['day','month','year']){
      this.shadowRoot.querySelector('.history-'+mode).classList.toggle('selected',this._historyMode==='history'&&this._historyPreset===mode);
    }
  }
  async _getStatistics(ids,from,to,period,units=null){
    if(!ids.length)return {};
    return this._h.callWS({type:'recorder/statistics_during_period',statistic_ids:ids,
      start_time:new Date(from).toISOString(),end_time:new Date(to).toISOString(),
      period:period,types:['sum'],...(units?{units}:{})});
  }
  async _loadHistory(start,end,preset=null){
    const range=sfcValidatePeriod(start,end);
    if(!range){
      this._historyError='Ungültiger Zeitraum (maximal 5 Jahre, kein zukünftiges Datum).';
      this._historyStatus();return;
    }
    const seq=++this._historySeq,ids=this._historyIds();
    const key=[start,end,...ids].join('|');
    this._historyMode='history';this._historyPreset=preset;
    this._historyRange={start,end};this._historyLoading=true;
    // A period change temporarily hides .flow; make sure the SVG is laid out
    // again after the new tiles become measurable, including on iOS/WebKit.
    this._historyDrawPending=true;
    this._historyData=null;this._historyError='';this._historyStatus();this._update();
    const cache=this._historyCache.get(key);
    if(cache?.until>Date.now()){
      this._historyData=cache.data;this._historyLoading=false;
      this._historyStatus();this._update();return;
    }
    try{
      // Read only the BEGINNING and END of the selected period. Never rely
      // on recorder/statistic_during_period 'change': if its first recorded
      // point is missing, HA may subtract an implicit zero and inflate energy.
      const [head,tail,fineTail]=await Promise.all([
        this._getStatistics(ids,range.from-3600000,range.from+3600000,'hour',{energy:'kWh'}),
        this._getStatistics(ids,range.to-7200000,range.to,'hour',{energy:'kWh'}),
        range.isToday
          ?this._getStatistics(ids,range.to-3600000,range.to,'5minute',{energy:'kWh'}).catch(()=>({}))
          :Promise.resolve({})
      ]);
      const energy={},partialIds=[],partialFrom={},lastTimes=[];
      const pvIds=new Set(this._pvPlants().map(p=>p.energy_total).filter(Boolean));
      const missingStart=[];
      for(const id of ids){
        // Recorder was explicitly requested in kWh. Only verified boundaries
        // count; a sensor's current cumulative state is never its energy use.
        const first=sfcHistoryPoints(head[id],'kWh');
        const last=sfcHistoryPoints(tail[id],'kWh');
        const fine=sfcHistoryPoints(fineTail[id],'kWh');
        const value=sfcVerifiedBoundaryEnergy(first,last,fine,range.from,range.to);
        if(value){
          energy[id]=value.kwh;
          if(value.partialStart){
            partialIds.push(id);
            partialFrom[id]=value.partialFrom;
          }
          if(value.through)lastTimes.push(value.through);
        }else{
          energy[id]=null;
          // Use the same guarded late-statistic fallback for consumers and PV
          // plants, not for the grid/battery counters that define the balance.
          if(pvIds.has(id)||this._consumerEntities().some(entity=>this._energyId(entity)===id))
            missingStart.push(id);
        }
      }
      if(missingStart.length){
        // One batched daily lookup to locate true first recorded days. Don't
        // download every hourly statistic for the entire selected year.
        const days=await this._getStatistics(missingStart,range.from,range.to,'day',{energy:'kWh'});
        const discovered=missingStart.map(id=>{
          const candidates=[...sfcHistoryPoints(days[id],'kWh').keys()]
            .filter(t=>t>=range.from&&t<range.to).sort((a,b)=>a-b);
          return {id,day:candidates[0]??null};
        }).filter(x=>x.day!=null);
        const recovered=await Promise.all(discovered.map(async ({id,day})=>{
          try{
            const opening=await this._getStatistics([id],day,Math.min(day+86400000,range.to),'hour',{energy:'kWh'});
            const firstHour=[...sfcHistoryPoints(opening[id],'kWh').keys()]
              .filter(t=>t>=range.from&&t<range.to).sort((a,b)=>a-b)[0];
            if(firstHour==null)return null;
            const openingPts=sfcHistoryPoints(opening[id],'kWh');
            const last=sfcHistoryPoints(tail[id],'kWh');
            const fine=sfcHistoryPoints(fineTail[id],'kWh');
            const value=sfcVerifiedBoundaryEnergy(openingPts,last,fine,firstHour,range.to);
            if(!value)return null;
            // The first recorded bucket is an actual cumulative baseline,
            // never the fictitious zero at the beginning of the year.
            value.partialStart=true;
            value.partialFrom=firstHour+3600000;
            return {id,value};
          }catch(_){return null;}
        }));
        for(const item of recovered){
          if(!item)continue;
          energy[item.id]=item.value.kwh;
          partialIds.push(item.id);
          partialFrom[item.id]=item.value.partialFrom;
          if(item.value.through)lastTimes.push(item.value.through);
        }
      }
      const peakId=this._c.grid.import_total;
      let peak=null;
      // HA 5-minute stats have short retention: never label an incomplete
      // 15-minute sample set as the peak of an entire older period.
      const validPeakRange=range.to-range.from<=10*86400000 &&
        range.from>=Date.now()-10*86400000;
      if(peakId&&validPeakRange){
        try{
          const completeEnd=Math.floor(range.to/900000)*900000;
          if(completeEnd>range.from){
            const fine=await this._getStatistics([peakId],range.from-300000,completeEnd,'5minute');
            const finePoints=sfcHistoryPoints(fine[peakId],this._st(peakId)?.attributes?.unit_of_measurement);
            peak=sfcQuarterPeak(finePoints,range.from,completeEnd);
          }
        }catch(_){peak=null;}
      }
      if(seq!==this._historySeq||this._historyMode!=='history')return;
      this._historyData={energy,peak,partialIds,partialFrom,lastTimes};
      this._historyCache.set(key,{until:Date.now()+(range.isToday?60000:300000),data:this._historyData});
      while(this._historyCache.size>5)this._historyCache.delete(this._historyCache.keys().next().value);
    }catch(_){
      if(seq!==this._historySeq)return;
      this._historyData=null;this._historyError='Recorder-Statistiken nicht verfügbar';
    }finally{
      if(seq===this._historySeq){
        this._historyLoading=false;this._historyStatus();this._update();
      }
    }
  }
  _historicalModel(){
    if(!this._historyData)return null;
    const c=this._c,energy=this._historyData.energy;
    const get=id=>id&&Number.isFinite(energy[id])?energy[id]:null;
    const pv=sfcPvEnergy(this._pvPlants(),get),imp=get(c.grid.import_total),exp=get(c.grid.export_total);
    const hasBattery=!!(c.battery?.power);
    const charge=hasBattery?get(c.battery.charge_total):0;
    const discharge=hasBattery?get(c.battery.discharge_total):0;
    const all=[],missing=[];
    for(const id of this._consumerEntities()){
      const kwh=get(this._energyId(id)),name=this._name(id);
      if(kwh==null){missing.push(id);continue;}
      const partialTs=this._historyData.partialFrom?.[this._energyId(id)];
      const partialNote=partialTs!=null?'Teilzeitraum · Daten ab '+new Date(partialTs).toLocaleDateString('de-AT'):null;
      all.push({key:id,kind:'consumer',entity:id,name,icon:this._icon(id,name),color:this._color(id),energy:kwh,w:kwh*1000,historyNote:partialNote});
    }
    all.sort((x,y)=>y.energy-x.energy||String(x.key).localeCompare(String(y.key)));
    const measured=all.reduce((sum,n)=>sum+n.energy,0);
    const balance=sfcHistoricalBalance(pv,imp,exp,discharge,charge,measured,hasBattery);
    const rest=balance?.rest??null;
    // Missing device counters remain part of the rest balance: never subtract them
    // as zero, and never create a second "other" energy bucket for them.
    const visible=all.slice(0,c.max_consumers);
    const overflow=all.slice(c.max_consumers);
    if(overflow.length){
      const sum=overflow.reduce((v,n)=>v+n.energy,0);
      visible.push({key:'_other',kind:'load',name:'Sonstige ('+overflow.length+')',icon:'mdi:dots-horizontal-circle-outline',color:SFC_COL.other,w:sum*1000,energy:sum});
    }
    if(c.show_rest && rest!=null){
      visible.push({key:'_rest',kind:'load',name:c.rest_name,icon:'mdi:home-outline',color:SFC_COL.rest,w:rest*1000,energy:rest,
        historyNote:missing.length?missing.length+' Geräte ohne Energiezähler enthalten':'Energiebilanz'});
    }
    const pvHome=pv==null||exp==null||charge==null?null:Math.max(0,pv-exp-charge);
    const allocation=c.allocation==='proportional'?sfcAllocateProportional:sfcAllocateSources;
    const supply={pv:(pvHome||0)*1000,battery:(discharge||0)*1000,grid:(imp||0)*1000};
    // Allocate individual devices including overflow, plus rest. Aggregate overflow
    // only AFTER allocating to avoid changing smallest-first priorities.
    const candidates=[...all];
    if(c.show_rest&&rest!=null)candidates.push({key:'_rest',w:rest*1000});
    const assigned=allocation(candidates.map(x=>({key:x.key,w:x.w})),supply);
    for(const n of visible){
      let a;
      if(n.key==='_other'){
        a={};
        for(const k of ['pv','battery','grid','unassigned'])
          a[k]=overflow.reduce((sum,x)=>sum+(assigned.get(x.key)?.[k]||0),0);
      }else a=assigned.get(n.key)||{};
      n.pvW=a.pv||0;n.batteryW=a.battery||0;n.gridW=a.grid||0;n.unassignedW=a.unassigned||0;
      // An incomplete Recorder/source budget must be visible, rather than
      // silently showing a measured consumer with no energy-flow line.
      if(n.energy>0.001&&n.unassignedW>0.01)
        n.historyNote=[n.historyNote,'Quellenzuordnung unvollständig · '+(n.unassignedW/1000).toFixed(2)+' kWh offen'].filter(Boolean).join(' · ');
    }
    const right=sfcSortLoadTiles(visible,c.rest_always_last&&c.layout!=='radial');
    const sources=[
      {key:'_solar',kind:'solar',name:c.solar.name||'PV',icon:c.solar.icon||'mdi:solar-power',color:SFC_COL.solar,energy:pv,w:(pv||0)*1000,entity:this._pvPlants()[0]?.energy_total},
      {key:'_grid',kind:'grid',name:'Netz',icon:c.grid.icon||'mdi:transmission-tower',color:SFC_COL.grid,energy:imp,w:(imp||0)*1000,entity:c.grid.import_total}
    ];
    if(hasBattery)sources.push({key:'_battery',kind:'battery',name:c.battery.name||'Akku',icon:c.battery.icon||'mdi:home-battery',color:SFC_COL.battery,energy:discharge,w:(discharge||0)*1000,charge,discharge,entity:c.battery.power});
    const left=sfcSourceOrder(c.source_order,sources.map(n=>n.key)).map(k=>sources.find(n=>n.key===k));
    const flows=[];
    for(const n of right){
      if(n.pvW>0)flows.push({from:'_solar',to:n.key,w:n.pvW});
      if(n.batteryW>0)flows.push({from:'_battery',to:n.key,w:n.batteryW});
      if(n.gridW>0)flows.push({from:'_grid',to:n.key,w:n.gridW});
    }
    return {historical:true,left,right,flows,pvT:pv,impT:imp,expT:exp,chargeT:charge,dischargeT:discharge,
      houseEnergy:balance?.total??null,restEnergy:rest,peak:this._historyData.peak,missingCount:missing.length,
      limitPct:null,fc:null,fcRem:null};
  }
  _openHistoryDialog(){
    if(this.shadowRoot.querySelector('.history-overlay'))return;
    const overlay=document.createElement('div');
    overlay.className='history-overlay';
    overlay.innerHTML='<div class="history-dialog" role="dialog" aria-modal="true" aria-label="Datum auswählen">'+
      '<h3 tabindex="-1">Datum auswählen</h3><label>Auswahl<select class="history-type"><option value="day">Einzelner Tag</option><option value="range">Zeitraum</option></select></label>'+
      '<div class="history-inputs"><label>Von<input class="history-from" type="date"></label>'+
      '<label class="history-end-field" hidden>Bis<input class="history-to" type="date"></label></div>'+
      '<p>Tag oder Zeitraum auch über Monats- und Jahresgrenzen. Bis heute, maximal 5 Jahre. Viertelstundenmaximum nur bei vollständigen 5-Minuten-Statistiken.</p>'+
      '<div class="history-buttons"><button class="history-cancel" type="button">Abbrechen</button><button class="history-ok" type="button">OK</button></div>'+
      '<div class="history-error" role="status"></div></div>';
    const today=sfcLocalDate(new Date()),y=new Date();y.setDate(y.getDate()-1);
    const type=overlay.querySelector('.history-type'),from=overlay.querySelector('.history-from'),to=overlay.querySelector('.history-to');
    from.max=to.max=today;from.value=this._historyRange?.start||sfcLocalDate(y);to.value=this._historyRange?.end||from.value;
    type.value=this._historyRange?.start!==this._historyRange?.end?'range':'day';
    const sync=()=>overlay.querySelector('.history-end-field').hidden=type.value!=='range';
    type.addEventListener('change',sync);sync();
    overlay.querySelector('.history-cancel').addEventListener('click',()=>overlay.remove());
    overlay.querySelector('.history-ok').addEventListener('click',()=>{
      const end=type.value==='day'?from.value:to.value;
      if(!sfcValidatePeriod(from.value,end)){
        overlay.querySelector('.history-error').textContent='Bitte gültige Daten bis heute wählen (maximal 5 Jahre).';return;
      }
      overlay.remove();this._loadHistory(from.value,end);
    });
    this.shadowRoot.appendChild(overlay);
    overlay.querySelector('h3').focus({preventScroll:true});
  }
  _initHistoryControls(){
    this.shadowRoot.querySelector('.history-live').addEventListener('click',()=>{
      ++this._historySeq;this._historyMode='live';this._historyPreset=null;this._historyLoading=false;this._historyDrawPending=true;this._historyError='';
      this.shadowRoot.querySelector('.history-overlay')?.remove();
      this._historyStatus();this._update();this._maybeEnergy();this._maybeLivePeak();
    });
    this.shadowRoot.querySelector('.history-date').addEventListener('click',()=>this._openHistoryDialog());
    for(const mode of ['day','month','year']){
      this.shadowRoot.querySelector('.history-'+mode).addEventListener('click',()=>{
        this.shadowRoot.querySelector('.history-overlay')?.remove();
        const period=sfcQuickPeriod(mode);
        this._loadHistory(period.start,period.end,mode);
      });
    }
    this._historyStatus();
  }

  /* ---------- model ---------- */
  _compute() {
    const c = this._c, s = c.solar, g = c.grid, b = c.battery;
    const P = this._pvPlants().reduce((sum,p)=>sum+Math.max(this._num(p.power),0),0);
    // A signed grid-balance sensor replaces separate import/export power sensors.
    // Positive balance can mean either importing or exporting, as selected in the editor.
    const hasBalance = g.mode === 'saldo' || (!g.mode && !!g.saldo_power);
    const balance = hasBalance ? this._num(g.saldo_power) * (g.positive_import === false ? -1 : 1) : 0;
    const I = hasBalance ? Math.max(balance, 0) : Math.max(this._num(g.import_power), 0);
    const E = hasBalance ? Math.max(-balance, 0) : Math.max(this._num(g.export_power), 0);
    let Bd = 0, Bc = 0, soc = null;
    if (b && b.power) { let bp = this._num(b.power); if (b.invert) bp = -bp; if (bp > 0) Bd = bp; else Bc = -bp; soc = b.soc ? this._num(b.soc) : null; }
    const total = c.load_total ? Math.max(this._num(c.load_total), 0) : Math.max(P + I + Bd - E - Bc, 0);
    const pvL = Math.max(P - E - Bc, 0), sumS = pvL + I + Bd;
    const share = sumS > 0 ? { solar: pvL / sumS, grid: I / sumS, battery: Bd / sumS } : { solar: 0, grid: 0, battery: 0 };

    const list = []; let measured = 0;
    for (const id of this._consumerEntities()) {
      const st = this._st(id); if (!st || st.state === 'unavailable' || st.state === 'unknown') continue;
      const w = Math.max(this._num(id), 0); measured += w; list.push({ id, w });
    }
    list.sort((a, b2) => b2.w - a.w);
    const mp = c.min_power;
    const explicitlyConfigured = new Set(Object.keys(c.consumers || {}));
    const labelConfigured = new Set(this._labelEntities());
    // Optional visibility filter applies to BOTH label-detected and manually configured
    // consumers, without deleting any configuration. The threshold is strict (<).
    const hideBelow = c.hide_below_display_power === true;
    const vis = list.filter((x) => {
      if (hideBelow) return x.w >= Math.max(0, Number(mp) || 0);
      return explicitlyConfigured.has(x.id) || labelConfigured.has(x.id) || x.w > mp || (this._shown.has(x.id) && x.w > mp * 0.5);
    });
    const keepRest = this._shown.has('_rest');
    this._shown = new Set(vis.map((x) => x.id));
    const shown = vis.slice(0, c.max_consumers), overflow = vis.slice(c.max_consumers);

    const left = [{ key: '_solar', kind: 'solar', name: s.name || 'PV', icon: s.icon || 'mdi:solar-power', color: SFC_COL.solar, w: P, entity: s.power }];
    if (b && b.power) left.push({ key: '_battery', kind: 'battery', name: b.name || 'Speicher', icon: b.icon || 'mdi:home-battery', color: SFC_COL.battery, w: Bd || Bc, charging: Bc > 0, soc, entity: b.power });
    // One network tile: name, symbol, live power and flow follow the actual direction.
    // Swap the former import/export tower glyphs to match the requested visual direction.
    const gridState = I > c.min_flow ? 'import' : E > c.min_flow ? 'export' : 'neutral';
    left.push({ key: '_grid', kind: 'grid', gridState,
      name: gridState === 'import' ? (g.import_name || 'Netzbezug') : gridState === 'export' ? (g.export_name || 'Netzbelieferung') : 'Netz',
      icon: g.icon || (gridState === 'import' ? 'mdi:transmission-tower-export' : gridState === 'export' ? 'mdi:transmission-tower-import' : 'mdi:transmission-tower'),
      color: SFC_COL.grid, w: gridState === 'import' ? I : gridState === 'export' ? E : 0,
      entity: hasBalance ? g.saldo_power : (gridState === 'export' ? g.export_power : g.import_power) });
    // Persisted source order affects only visualization, not energy attribution.
    const orderedLeft = sfcSourceOrder(c.source_order, left.map(n => n.key))
      .map(key => left.find(n => n.key === key));
    left.splice(0, left.length, ...orderedLeft);

    const right = shown.map((x) => {
      const name = this._name(x.id), ov = this._ov(x.id);
      return { key: x.id, kind: 'consumer', entity: x.id, name, icon: this._icon(x.id, name), color: this._color(x.id), w: x.w, energy: this._energy[this._energyId(x.id)], activeBadge: ov.active_badge };
    });
    if (overflow.length) right.push({ key: '_other', kind: 'load', name: `Sonstige (${overflow.length})`, icon: 'mdi:dots-horizontal-circle-outline', color: SFC_COL.other, w: overflow.reduce((a, x) => a + x.w, 0) });
    const rest = Math.max(total - measured, 0);
    if (c.show_rest && (rest > mp || (keepRest && rest > mp * 0.5))) { right.push({ key: '_rest', kind: 'load', name: c.rest_name, icon: 'mdi:home-outline', color: SFC_COL.rest, w: rest, entity: c.load_total }); this._shown.add('_rest'); }
    // PV-Budget vom kleinsten zum größten Einzelverbraucher zuweisen.
    // Akku und Netz decken danach die übrigen Leistungen; keine Doppelzuordnung.
    const candidates = list.map(x => ({ key: x.id, w: x.w }));
    if (c.show_rest && right.some(n => n.key === '_rest') && rest > 0) {
      candidates.push({ key: '_rest', w: rest });
    }
    const supply = { pv: Math.min(pvL, total), battery: Bd, grid: I };
    const allocations = c.allocation === 'proportional'
      ? sfcAllocateProportional(candidates, supply)
      : sfcAllocateSources(candidates, supply);
    const sumAllocation = (items, source) =>
      items.reduce((sum, x) => sum + (allocations.get(x.id)?.[source] || 0), 0);
    for (const n of right) {
      const amounts = n.key === '_other'
        ? Object.fromEntries(['pv', 'battery', 'grid', 'unassigned']
            .map(k => [k, sumAllocation(overflow, k)]))
        : allocations.get(n.key);
      n.pvW = amounts?.pv || 0;
      n.batteryW = amounts?.battery || 0;
      n.gridW = amounts?.grid || 0;
      n.unassignedW = amounts?.unassigned || 0;
      n.pvPct = n.w > 0 ? 100 * n.pvW / n.w : 0;
      n.batteryPct = n.w > 0 ? 100 * n.batteryW / n.w : 0;
      n.gridPct = n.w > 0 ? 100 * n.gridW / n.w : 0;
      n.unassignedPct = n.w > 0 ? 100 * n.unassignedW / n.w : 0;
    }

    // Order every consumer (including _other and _rest) by current watts,
    // in classic and radial alike. Only the optional list setting pins rest
    // at the bottom; the radial ring always uses the real watt ranking.
    const listLayout = c.layout !== 'radial' || (this._flowEl?.clientWidth || 0) < 560;
    right.splice(0, right.length, ...sfcSortLoadTiles(right, listLayout && c.rest_always_last === true));

    const flows = [];
    for (const n of right) {
      // Dieselbe Wattverteilung steuert Linien, Streifen und Prozent-Badge.
      if (n.pvW > 0.01) flows.push({ from: '_solar', to: n.key, w: n.pvW });
      if (b && b.power && n.batteryW > 0.01) flows.push({ from: '_battery', to: n.key, w: n.batteryW });
      if (n.gridW > 0.01) flows.push({ from: '_grid', to: n.key, w: n.gridW });
    }
    if (E > c.min_flow) flows.push({ from: '_solar', to: '_grid', w: E, gridExport: true });
    if (Bc > c.min_flow) flows.push({ from: '_solar', to: '_battery', w: Bc, loop: true });

    let limitPct = null;
    if (c.contract_power_limit_kw) limitPct = I / (c.contract_power_limit_kw * 1000);

    return {
      P, I, E, Bd, Bc, soc, total, share, left, right, flows, limitPct,
      pvT: this._pvToday(), impT: this._today(g.import_total, g.import_today), expT: this._today(g.export_total, g.export_today),
      houseEnergy: sfcHistoricalBalance(this._pvToday(),this._today(g.import_total,g.import_today),
        this._today(g.export_total,g.export_today),b?.power?this._today(b.discharge_total,null):0,
        b?.power?this._today(b.charge_total,null):0,0,!!b?.power)?.total??null,
      fc: this._kwh(s.forecast_today), fcRem: this._kwh(s.forecast_remaining),
    };
  }

  /* ---------- DOM ---------- */
  _build() {
    const scale = Math.max(0.5, Math.min(2, Number(this._c.font_scale) || 1));
    const transparency = Math.max(0, Math.min(100, Number(this._c.background_transparency) || 0));
    const maxW = Number(this._c.max_width) || 900;
    this.shadowRoot.innerHTML = `
<style>
:host{display:block;
  --sf-bg:var(--smartify-flow-node-background,var(--card-background-color,#fff));
  --sf-bw:var(--smartify-flow-node-border-width,var(--ha-card-border-width,2px));
  --sf-bc:var(--smartify-flow-node-border-color,var(--ha-card-border-color,var(--divider-color,#111)));
  --sf-r:var(--ha-card-border-radius,12px);
  --sf-txt:var(--smartify-flow-text-color,var(--primary-text-color,#000));
  --sf-sub:var(--smartify-flow-secondary-text-color,var(--secondary-text-color,#333));
  --sf-pill-bg:var(--smartify-flow-pill-background,var(--secondary-background-color,#ebebeb));
  --sf-pill-bd:var(--smartify-flow-pill-border,1px solid var(--divider-color,#111));
  --sf-track:var(--smartify-flow-track-color,var(--secondary-background-color,#ebebeb));
  --sf-accent-h:var(--smartify-flow-accent-height,4px);
  --sf-gap:var(--smartify-flow-gap,14px);
}
ha-card{position:relative;font-family:inherit;border-radius:var(--ha-card-border-radius,12px);padding:16px 16px 27px;overflow:hidden;font-size:${scale}em;background:color-mix(in srgb, var(--ha-card-background, var(--card-background-color, #fff)) ${100 - transparency}%, transparent);}
.title{font-weight:800;font-size:1.05em;margin:0 0 12px 2px;color:var(--sf-txt);text-transform:uppercase;letter-spacing:.06em}
.wrap{max-width:${maxW}px;margin:0 auto}
.card-version{position:absolute;right:9px;bottom:5px;color:var(--sf-sub);opacity:.62;font-size:10px;line-height:1;font-weight:400;letter-spacing:.01em;pointer-events:none;user-select:none}

.history-toolbar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.history-toolbar button{font:inherit;min-height:36px;padding:7px 10px;cursor:pointer;border:1px solid var(--divider-color);border-radius:var(--sf-r);background:var(--secondary-background-color);color:var(--primary-text-color)}
.history-toolbar button.selected{border-color:var(--primary-color);color:var(--primary-color);font-weight:700}
.history-status{font-size:.75em;color:var(--sf-sub);overflow-wrap:anywhere}
.history-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:12px;background:#0009}
.history-dialog{box-sizing:border-box;width:min(100%,420px);max-height:90dvh;overflow:auto;padding:18px;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);opacity:1;border:1px solid var(--divider-color);border-radius:var(--sf-r);box-shadow:0 10px 30px #0005}
.history-dialog h3{margin:0 0 14px}.history-dialog label{display:grid;gap:4px;font-size:.85em}
.history-dialog input,.history-dialog select{width:100%;min-width:0;min-height:44px;box-sizing:border-box;padding:9px;color:var(--primary-text-color);background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:var(--sf-r);font:inherit}
.history-end-field[hidden]{display:none}
.history-inputs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,145px),1fr));gap:12px;margin:12px 0}
.history-dialog p,.history-error{font-size:.75em;color:var(--secondary-text-color)}
.history-buttons{display:flex;gap:8px;justify-content:flex-end}
.history-buttons button{padding:9px 14px;min-height:40px;font:inherit;cursor:pointer;border:1px solid var(--divider-color);border-radius:var(--sf-r);background:var(--secondary-background-color);color:var(--primary-text-color)}
.history-buttons .history-ok{background:var(--primary-color);color:var(--text-primary-color,#fff)}
.house-energy-row{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:8px 0 2px;border-top:1px solid var(--divider-color);color:var(--sf-txt)}
.house-energy-row ha-icon{flex:none}.house-energy-description{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}.house-energy-description strong{overflow-wrap:anywhere}.house-energy-description small{overflow-wrap:anywhere}.house-energy-value{font-variant-numeric:tabular-nums;white-space:nowrap}
.quarter-row{grid-column:1/-1;display:flex;align-items:center;gap:12px;min-width:0;padding-top:8px;border-top:1px solid var(--divider-color);flex-wrap:wrap}
.quarter-row ha-icon{flex:none;color:var(--sf-txt)}.quarter-desc{flex:1 1 160px;min-width:0}.quarter-name{overflow-wrap:anywhere}
.quarter-time{overflow-wrap:anywhere}.quarter-value{white-space:nowrap;font-variant-numeric:tabular-nums;max-width:100%;margin-left:auto}
.monthly-history{grid-column:1/-1;border-top:0;margin:-5px 0 0 36px;padding:0;min-width:0;color:var(--sf-txt)}
.monthly-history[hidden]{display:none}
.monthly-history summary{cursor:pointer;user-select:none;padding:7px 0;min-height:28px;overflow-wrap:anywhere}
.monthly-history-list{max-height:280px;max-width:100%;min-width:0;overflow:auto;margin-top:4px;border:1px solid var(--divider-color);border-radius:var(--sf-r);padding:6px 10px;background:var(--sf-bg)}
.monthly-entry{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 10px;padding:8px 2px;border-bottom:1px solid var(--divider-color)}
.monthly-entry:last-child{border:0}
.monthly-entry small{grid-column:1/-1;overflow-wrap:anywhere}.monthly-entry strong{white-space:nowrap;font-variant-numeric:tabular-nums}
@media(max-width:420px){.quarter-row{gap:8px}.quarter-desc{flex-basis:calc(100% - 48px)}.quarter-value{margin-left:36px;font-size:1.15em}.monthly-history{margin-left:36px}.monthly-entry{grid-template-columns:minmax(0,1fr) auto;gap:2px 6px}.monthly-entry small{overflow-wrap:anywhere}}

.flow{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(64px,.75fr) minmax(0,1fr);grid-template-rows:auto}
.col{display:flex;flex-direction:column;justify-content:space-around;gap:var(--sf-gap);position:relative;z-index:1;grid-row:1;min-width:0}
.col.left{grid-column:1}
.col.right{grid-column:3}
/* Radial: Quellen zentral, Verbraucher umlaufend; schmale Karten fallen auf Klassisch zurück. */
.flow.radial{display:block;min-height:560px}
.flow.radial .col{display:block;position:absolute;inset:0;pointer-events:none}
.flow.radial .col.left,.flow.radial .col.right{grid-column:auto}
.flow.radial .node{position:absolute;box-sizing:border-box;width:148px;max-width:148px;pointer-events:auto;padding:7px 8px calc(8px + var(--sf-accent-h))}
.flow.radial .node.has-source-strip{padding-bottom:calc(8px + var(--sf-source-height,22px))}
.flow.radial .node .val{font-size:1.15em}
.flow.radial .node .nm{font-size:.66em}
.flow.radial .node .bd{font-size:.55em}
.flow.radial .node ha-icon{--mdc-icon-size:16px}
.flow.radial-narrow{display:grid;min-height:0;grid-template-columns:minmax(0,1fr) minmax(32px,.35fr) minmax(0,1fr)}
.flow.radial-narrow .col{display:flex;position:relative;inset:auto;pointer-events:auto}
.flow.radial-narrow .col.left{grid-column:1}
.flow.radial-narrow .col.right{grid-column:3}
.flow.radial-narrow .node{position:relative;left:auto!important;top:auto!important;width:auto;max-width:none}
/* Netzkachel: identische Tageswert-Typografie, ohne Ellipse auch auf schmalen Screens. */
.node[data-key="_grid"] .sub,.node[data-key="_grid"] .sub2{font-family:inherit;font-weight:400;letter-spacing:0;white-space:nowrap;text-overflow:clip}
.flow.radial .node[data-key="_grid"] .sub,.flow.radial .node[data-key="_grid"] .sub2{font-size:.7em}
.flow.radial-narrow .node[data-key="_grid"] .sub,.flow.radial-narrow .node[data-key="_grid"] .sub2{font-size:.7em}

svg.lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0}
svg.lines path{fill:none;stroke-linecap:round;animation-timing-function:linear;animation-iteration-count:infinite}
path.fs{stroke-dasharray:7 5;animation-name:sfs} path.fb{stroke-dasharray:10 4 2 4;animation-name:sfb} path.fg{stroke-dasharray:2 5;animation-name:sfg}
@keyframes sfs{to{stroke-dashoffset:-12}} @keyframes sfb{to{stroke-dashoffset:-20}} @keyframes sfg{to{stroke-dashoffset:-7}}
.node{--c:#888;position:relative;overflow:hidden;border-radius:var(--sf-r);padding:9px 11px calc(10px + var(--sf-accent-h));cursor:pointer;min-width:0;
  background:var(--sf-bg);border:var(--sf-bw) solid var(--sf-bc);box-shadow:none;transition:opacity .3s}
.node::after{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--sf-accent-h);background:var(--c)}
.node.has-source-strip{padding-bottom:calc(11px + var(--sf-source-height,22px))}
.node.has-source-strip::after{display:none}
.source-strip{position:absolute;left:0;right:0;bottom:0;height:var(--sf-source-height,22px);display:flex;align-items:stretch;overflow:hidden;border-top:1px solid var(--sf-bc);font-family:inherit;font-size:.73em;line-height:1;color:var(--sf-txt)}
.source-strip[hidden]{display:none}
.source-segment{min-width:0;box-sizing:border-box;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;position:relative}
.source-segment span{display:block;min-width:0;white-space:nowrap;text-align:center;font-weight:600;padding:0 3px}
.source-segment span[hidden]{display:none}
.source-segment.pv{background:var(--smartify-flow-pv-stripe-color,#e3a600);color:#251e07}
.source-segment.battery{background:var(--smartify-flow-battery-color,#2e7d32);color:#fff}
.source-segment.grid{background:var(--c);color:var(--primary-text-color,#111);text-shadow:0 1px 2px var(--card-background-color,#fff),0 -1px 2px var(--card-background-color,#fff)}
/* Keep each consumer's chosen color as the grid (remaining) share. */
.source-segment.unassigned{background:var(--sf-track);color:var(--sf-txt)}
.source-segment + .source-segment{border-left:1px solid color-mix(in srgb,var(--sf-bc) 50%,transparent)}

.node.idle{opacity:.45}
.node.warn{background:var(--sf-txt)} .node.warn *{color:var(--sf-bg)!important}
.hd{display:flex;align-items:center;gap:6px;min-width:0}
.hd ha-icon{--mdc-icon-size:18px;color:var(--sf-txt);flex:none}
.nm{font-weight:800;color:var(--sf-txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.72em;letter-spacing:.06em;text-transform:uppercase;flex:1;min-width:0}
/* Badge sitzt in der Wertzeile (rechts neben dem Leistungswert), nicht beim Namen. */
.vr{display:flex;align-items:center;gap:6px;margin-top:4px;min-width:0}
.vr .val{margin-top:0;flex:0 1 auto;min-width:0}
.bd{flex:0 1 auto;box-sizing:border-box;max-width:60%;margin-left:auto;font-family:inherit;font-size:.6em;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:1px 6px;border-radius:var(--sf-r);color:var(--sf-txt);
  background:var(--sf-pill-bg);border:var(--sf-pill-bd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
.bd:empty{display:none}
.val .unit,.house-energy-value .unit,.quarter-value .unit,.monthly-entry strong .unit{font-size:.8em;font-weight:650;color:var(--sf-txt)}
.val{font-size:1.55em;font-weight:800;line-height:1.15;margin-top:4px;color:var(--sf-txt);white-space:nowrap;font-variant-numeric:tabular-nums}
.sub,.sub2{font-family:inherit;font-size:.76em;font-weight:400;color:var(--sf-sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;display:block}

.sub:empty,.sub2:empty{display:none}
.bar{height:6px;border-radius:var(--sf-r);background:var(--sf-track);border:var(--sf-pill-bd);margin-top:7px;overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--c);transition:width .6s}
.bar.hide{display:none}
.stats{display:grid;grid-template-columns:auto 1fr;column-gap:22px;row-gap:8px;align-items:center;margin-top:20px;padding:16px;
  border-radius:var(--sf-r);border:var(--sf-bw) solid var(--sf-bc);background:var(--sf-bg)}
.ring{position:relative;width:132px;height:132px}
.ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.ring circle{fill:none;stroke-width:9;stroke-linecap:butt;transition:stroke-dasharray .6s}
.ring circle.t{stroke:var(--sf-track)}
.ring .ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ring .pc .unit,.row .rp .unit{font-size:.8em;font-weight:650}
.ring .pc{font-size:1.25em;font-weight:800;color:var(--sf-txt);line-height:1}
.ring .lb{font-size:.52em;font-weight:800;letter-spacing:.08em;color:var(--sf-sub);margin-top:2px}
.rows{display:flex;flex-direction:column;gap:14px;min-width:0}
.row{--c:#888;display:grid;grid-template-columns:1fr auto;column-gap:8px}
.row .rt{display:flex;align-items:center;gap:6px}
.row .rt::before{content:'';width:10px;height:10px;background:var(--c);border:1px solid var(--sf-bc);flex:none}
.row .rp{text-align:right;grid-row:span 2;line-height:1}
.row .rp small{display:block;font-size:.48em;color:var(--sf-sub);font-weight:700;letter-spacing:.05em}
/* Shared typography: all five statistics use the SAME hierarchy.
   Do not assign independent font sizes inside the two added rows. */
.row .rt,.house-energy-description strong,.quarter-name,.monthly-history summary,.monthly-entry .month-name{font-size:.7em;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--sf-txt)}
.row .rs,.house-energy-description small,.quarter-time,.monthly-entry small{font-size:.76em;color:var(--sf-sub)}
.row .rp,.house-energy-value,.quarter-value,.monthly-entry strong{font-size:1.15em;font-weight:800;color:var(--sf-txt)}

.row .rs b{color:var(--sf-txt)}
.row .bar{grid-column:1 / -1}
@media (max-width:480px){.flow{grid-template-columns:minmax(0,1fr) minmax(36px,.4fr) minmax(0,1fr)}.val{font-size:1.2em}.stats{grid-template-columns:1fr}.ring{margin:0 auto}}
</style>
<ha-card>
  <div class="wrap">
  <div class="title" hidden></div>
  <div class="history-toolbar"><button class="history-live selected" type="button">Live</button><button class="history-date" type="button">Datum</button><button class="history-day" type="button">Tag</button><button class="history-month" type="button">Monat</button><button class="history-year" type="button">Jahr</button><span class="history-status"></span></div>
  <div class="flow${this._c.layout === 'radial' ? ' radial' : ''}"><svg class="lines"><g class="pg"></g></svg><div class="col left"></div><div class="col right"></div></div>
  <div class="stats" hidden>
    <div class="ring"><svg viewBox="0 0 132 132">
      <circle class="t" cx="66" cy="66" r="58"/><circle class="a1" cx="66" cy="66" r="58" style="stroke:${SFC_COL.solar}"/>
      <circle class="t" cx="66" cy="66" r="46"/><circle class="a2" cx="66" cy="66" r="46" style="stroke:${SFC_COL.grid}"/>
      <circle class="t" cx="66" cy="66" r="34"/><circle class="a3" cx="66" cy="66" r="34" style="stroke:${SFC_COL.export}"/>
    </svg><div class="ctr"><div class="pc">–</div><div class="lb">AUTARKIE</div></div></div>
    <div class="rows">
      <div class="row" style="--c:${SFC_COL.solar}"><div class="rt">PV-Eigenverbrauch</div><div class="rp r1p">–</div><div class="rs r1s"></div><div class="bar"><i class="r1b"></i></div></div>
      <div class="row" style="--c:${SFC_COL.grid}"><div class="rt">Netzbezug</div><div class="rp r2p">–</div><div class="rs r2s"></div><div class="bar"><i class="r2b"></i></div></div>
      <div class="row" style="--c:${SFC_COL.export}"><div class="rt">Einspeisung</div><div class="rp r3p">–</div><div class="rs r3s"></div><div class="bar"><i class="r3b"></i></div></div>
    </div>
    <div class="house-energy-row"><ha-icon icon="mdi:home-lightning-bolt-outline"></ha-icon><div class="house-energy-description"><strong>Gesamtenergiebedarf</strong><small class="house-energy-period">Heute</small></div><strong class="house-energy-value">–</strong></div>
    <div class="quarter-row"><ha-icon icon="mdi:gauge"></ha-icon><div class="quarter-desc"><div class="quarter-name">Max. 15-Min.-Netzbezug · aktueller Monat</div><div class="quarter-time">Lade Monatsmaximum …</div></div><div class="quarter-value">–</div></div>
    <details class="monthly-history"><summary>Historie</summary><div class="monthly-history-list"></div></details>
  </div>
  </div>
  <div class="card-version" aria-label="Smartify Flow Card Version ${SFC_VERSION}">v${SFC_VERSION}</div>
</ha-card>`;
    const r = this.shadowRoot;
    this._flowEl = r.querySelector('.flow');
    this._leftEl = r.querySelector('.col.left');
    this._rightEl = r.querySelector('.col.right');
    this._svg = r.querySelector('svg.lines');
    this._pg = this._svg.querySelector('.pg');
    const t = r.querySelector('.title'); if (this._c.title) { t.hidden = false; t.textContent = this._c.title; }
    r.querySelector('.stats').hidden = !this._c.show_stats;
    this._paths = new Map(); this._sig = null;
    this._initHistoryControls();
    if (this._ro) this._ro.observe(this._flowEl);
  }

  // Kompaktes Quellen-Badge wie bis v0.3.0: "100% PV", "Netz", "60% PV" …
  _consumerBadge(n, mf) {
    if (!(n.w > mf)) return '';
    const pv = n.pvW || 0, bat = n.batteryW || 0, grid = n.gridW || 0;
    const tot = pv + bat + grid;
    let src = '';
    if (tot > 0) {
      const pvP = Math.round(pv / tot * 100), batP = Math.round(bat / tot * 100), gridP = Math.round(grid / tot * 100);
      if (pvP >= 99) src = '100% PV';
      else if (batP >= 99) src = '100% Akku';
      else if (gridP >= 99) src = 'Netz';
      else if (pvP && batP) src = `${pvP}% PV + Akku`;
      else if (batP) src = `${batP}% Akku`;
      else src = `${pvP}% PV`;
    }
    if (n.activeBadge) return src ? `${n.activeBadge} · ${src}` : n.activeBadge;
    return src;
  }

  _nodeHtml(n) {
    return `<div class="node" data-key="${this._esc(n.key)}" style="--c:${n.color}">
      <div class="hd"><ha-icon icon="${this._esc(n.icon)}"></ha-icon><span class="nm">${this._esc(n.name)}</span></div>
      <div class="vr"><div class="val"></div><span class="bd"></span></div><div class="sub"></div><div class="sub2"></div><div class="bar hide"><i></i></div><div class="source-strip" hidden></div></div>`;
  }

  // Gleiche W-Zuordnung wie bei den animierten Flusslinien.
  // Beschriftungen erscheinen nur, wenn sie physisch ins Segment passen.
  _updateSourceStrip(strip, n) {
    if (!strip) return;
    const entries = [
      { key: 'pv', name: 'PV', w: n.pvW || 0 },
      { key: 'battery', name: 'Akku', w: n.batteryW || 0 },
      { key: 'grid', name: 'Netz', w: n.gridW || 0 },
      { key: 'unassigned', name: 'offen', w: n.unassignedW || 0 },
    ].filter(x => x.w > 0.01);

    // Do not recreate DOM on every sensor update: this made the last
    // (usually grid) percentage flash while labels were measured.
    const signature = entries.map(x => x.key).join('|');
    if (strip.dataset.sources !== signature) {
      const fragment = document.createDocumentFragment();
      for (const item of entries) {
        const segment = document.createElement('div');
        segment.className = 'source-segment ' + item.key;
        const label = document.createElement('span');
        segment.append(label);
        fragment.append(segment);
      }
      strip.replaceChildren(fragment);
      strip.dataset.sources = signature;
    }

    const segments = strip.querySelectorAll('.source-segment');
    entries.forEach((item, index) => {
      const pct = Math.max(0, Math.min(100, 100 * item.w / n.w));
      const segment = segments[index];
      const width = pct + '%';
      if (segment.style.width !== width) segment.style.width = width;
      const title = `${Math.round(pct)} % ${item.name} · ${this._fmtW(item.w)}`;
      if (segment.title !== title) segment.title = title;
      const label = segment.firstElementChild;
      const display = `${Math.round(pct)} % ${item.name}`;
      if (label.textContent !== display) label.textContent = display;
    });
    const aria = entries.map(item => `${Math.round(item.w / n.w * 100)} Prozent ${item.name}`).join(', ');
    if (strip.getAttribute('aria-label') !== aria) strip.setAttribute('aria-label', aria);
  }

  _fitSourceLabels() {
    if (!this.shadowRoot) return;
    // Measure the text itself rather than hide/show/measure scrollWidth.
    // Use a 6px hysteresis band so sensor noise at the cutoff cannot
    // repeatedly toggle a label near the edge of a narrow segment.
    const canvas = this._labelMeasureCanvas || (this._labelMeasureCanvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    if (!context) return;
    for (const strip of this.shadowRoot.querySelectorAll('.source-strip:not([hidden])')) {
      for (const segment of strip.querySelectorAll('.source-segment')) {
        const label = segment.firstElementChild;
        if (!label) continue;
        const computed = getComputedStyle(label);
        context.font = computed.font;
        const required = context.measureText(label.textContent || '').width + 10;
        const available = segment.clientWidth;
        // A missing font or a collapsed container should not flash labels.
        if (!available) { label.hidden = true; continue; }
        if (label.hidden) {
          if (available > required + 3) label.hidden = false;
        } else if (available < required - 3) {
          label.hidden = true;
        }
      }
    }
  }


  _scheduleDraw() {
    // Coalesce sensor changes and ResizeObserver callbacks into one frame.
    if (this._drawRaf || !this.isConnected) return;
    this._drawRaf = requestAnimationFrame(() => {
      this._drawRaf = null;
      if (!this.isConnected || !this._flowEl) return;
      this._fitSourceLabels();
      this._drawLines();
      // After history filters hide/show the flow container, its first
      // measured geometry can still be stale for one layout frame. Recheck
      // once without rebuilding tiles or restarting existing path animations.
      if(this._historyDrawPending){
        this._historyDrawPending=false;
        requestAnimationFrame(()=>this._scheduleDraw());
      }
    });
  }

  _syncNodes(container, nodes) {
    // Reuse existing elements instead of destroying all tiles and animations.
    const old = new Map([...container.children].map(el => [el.dataset.key, el]));
    const desired = new Set(nodes.map(n => n.key));
    for (const [key, el] of old) {
      if (!desired.has(key)) { el.remove(); old.delete(key); }
    }
    let anchor = container.firstElementChild;
    for (const n of nodes) {
      let el = old.get(n.key);
      if (!el) {
        const template = document.createElement('template');
        template.innerHTML = this._nodeHtml(n);
        el = template.content.firstElementChild;
        el.addEventListener('click', () => {
          const item = [...this._m.left, ...this._m.right].find(x => x.key === el.dataset.key);
          if (item?.entity) {
            const ev = new Event('hass-more-info', { bubbles: true, composed: true });
            ev.detail = { entityId: item.entity };
            this.dispatchEvent(ev);
          }
        });
      }
      const name = el.querySelector('.nm');
      if (name.textContent !== n.name) name.textContent = n.name;
      const icon = el.querySelector('.hd ha-icon');
      if (icon.getAttribute('icon') !== n.icon) icon.setAttribute('icon', n.icon);
      if (el.style.getPropertyValue('--c') !== n.color) el.style.setProperty('--c', n.color);
      // Avoid reinserting nodes unless the displayed order actually changed.
      if (el !== anchor) container.insertBefore(el, anchor);
      anchor = el.nextElementSibling;
    }
  }

  _update() {
    if (!this._h || !this._c || !this._flowEl) return;
    const m=this._historyMode==='history'?this._historicalModel():this._compute();
    if(!m){
      this._flowEl.hidden=true;
      this.shadowRoot.querySelector('.stats').hidden=true;
      return;
    }
    this._flowEl.hidden=false;
    this.shadowRoot.querySelector('.stats').hidden=!this._c.show_stats;
    this._m=m;
    this._syncNodes(this._leftEl, m.left);
    this._syncNodes(this._rightEl, m.right);
    const mf=m.historical?-1:Number(this._c.idle_power ?? this._c.min_flow ?? 5);
    const isSourceConsumer = n => n.kind === 'consumer' || n.key === '_rest' || n.key === '_other';
    const set = (n, val, sub, sub2, badge, bar, warn) => {
      const el = this.shadowRoot.querySelector(`.node[data-key="${CSS.escape(n.key)}"]`); if (!el) return;
      // Avoid rebuilding unchanged numbers/unit spans on every HA state.
      const valueEl = el.querySelector('.val');
      if (valueEl.dataset.value !== String(val)) {
        valueEl.dataset.value = String(val);
        const match = String(val).match(/^(.*?)(\s+)(kWh|MWh|Wh|kW|MW|W)$/i);
        if (match) {
          valueEl.replaceChildren(document.createTextNode(match[1] + match[2]));
          const unit = document.createElement('span');
          unit.className = 'unit';
          unit.textContent = match[3];
          valueEl.appendChild(unit);
        } else valueEl.textContent = val;
      }
      const subEl = el.querySelector('.sub'), sub2El = el.querySelector('.sub2');
      if (subEl.textContent !== (sub || '')) subEl.textContent = sub || '';
      if (sub2El.textContent !== (sub2 || '')) sub2El.textContent = sub2 || '';
      if (n.kind === 'grid') {
        const rows = [el.querySelector('.sub'), el.querySelector('.sub2')];
        // Reset before measuring so growing screens restore the natural text size.
        rows.forEach(row => row.style.fontSize = '');
        const fit = () => {
          if (!el.isConnected) return;
          rows.forEach(row => row.style.fontSize = '');
          const available = Math.min(...rows.map(row => row.clientWidth));
          if (!available) return;
          const base = parseFloat(getComputedStyle(rows[0]).fontSize) || 11;
          const ratio = Math.max(...rows.map(row => row.scrollWidth / available));
          if (ratio > 1) {
            const size = Math.max(8, Math.floor((base / ratio) * 10) / 10);
            rows.forEach(row => row.style.fontSize = `${size}px`);
          }
        };
        requestAnimationFrame(fit);
      }

      // Quellenanteile: Standard = Badge in der Wertzeile, optional Farbstreifen unten (source_display: strip).
      const useStrip = this._c.source_display === 'strip';
      const bdText = isSourceConsumer(n) ? (useStrip ? '' : this._consumerBadge(n, mf)) : (badge || '');
      const bdEl = el.querySelector('.bd');
      if (bdEl.textContent !== bdText) bdEl.textContent = bdText;
      const b = el.querySelector('.bar'); b.classList.toggle('hide', bar == null);
      if (bar != null) b.firstElementChild.style.width = Math.max(0, Math.min(100, bar)) + '%';
      el.classList.toggle('idle', !m.historical && n.w <= mf);
      const isLoad = isSourceConsumer(n) && useStrip;
      el.classList.toggle('has-source-strip', isLoad);
      const strip = el.querySelector('.source-strip');
      strip.hidden = !isLoad || n.w <= 0;
      if (isLoad) {
        if (n.w > 0) {
          this._updateSourceStrip(strip, n);
        } else {
          strip.replaceChildren();
        }
      }
      if (isSourceConsumer(n)) {
        el.title = m.historical
          ? 'Historisches Quellenmodell (Näherung): PV '+this._fmtKwh((n.pvW||0)/1000)+' kWh, Akku '+this._fmtKwh((n.batteryW||0)/1000)+' kWh, Netz '+this._fmtKwh((n.gridW||0)/1000)+' kWh, nicht zugeordnet '+this._fmtKwh((n.unassignedW||0)/1000)+' kWh'
          : `Modellierte Zuordnung: PV ${this._fmtW(n.pvW || 0)}, Akku ${this._fmtW(n.batteryW || 0)}, Netz ${this._fmtW(n.gridW || 0)}, offen ${this._fmtW(n.unassignedW || 0)}; Gesamt ${this._fmtW(n.w)} (PV: kleinste Verbraucher zuerst)`;
      }
      el.classList.toggle('warn', !!warn);
    };
    for (const n of m.left) {
      if(m.historical){
        if(n.kind==='grid'){
          set(n,this._fmtKwh(m.impT)+' kWh',
            'Bezug: '+this._fmtKwh(m.impT)+' kWh',
            'Lieferung: '+this._fmtKwh(m.expT)+' kWh','',null);
        }else if(n.kind==='battery'){
          set(n,n.energy==null?'–':this._fmtKwh(n.energy)+' kWh',
            'Ladung: '+this._fmtKwh(m.chargeT)+' kWh',
            'Entladung: '+this._fmtKwh(m.dischargeT)+' kWh','',null);
        }else set(n,n.energy==null?'–':this._fmtKwh(n.energy)+' kWh',
          'Ausgewählter Zeitraum','','',null);
        continue;
      }
      if (n.kind === 'solar') {
        set(n, this._fmtW(n.w),
          m.pvT != null ? `${this._fmtKwh(m.pvT)} kWh heute` : '',
          m.fcRem != null ? `${this._fmtKwh(m.fcRem)} kWh verbleibend` : '',
          m.fc != null ? `${m.fc.toFixed(1)} kWh Prog.` : '',
          m.fc ? (m.pvT || 0) / m.fc * 100 : null);
      } else if (n.kind === 'battery') {
        set(n, this._fmtW(n.w), m.soc != null ? `${Math.round(m.soc)}% SoC` : '', '', n.w > mf ? (n.charging ? 'lädt' : 'entlädt') : '', m.soc);
      } else if (n.kind === 'grid') {
        const warn = m.limitPct != null && m.limitPct >= this._c.contract_warning_pct;
        const badge = warn ? `Limit ${Math.round(m.limitPct * 100)}%` : '';
        set(n, this._fmtW(n.w),
          `Bezug: ${this._fmtKwh(m.impT)} kWh`,
          `Lieferung: ${this._fmtKwh(m.expT)} kWh`,
          badge, m.limitPct != null ? m.limitPct * 100 : null, warn);
      }
    }
    for (const n of m.right) {
      if(m.historical)set(n,n.energy==null?'–':this._fmtKwh(n.energy)+' kWh',
        n.energy==null?'Keine Energiedaten':(n.historyNote||'Modellierte Quellenanteile'),'','',null);
      else set(n,this._fmtW(n.w),n.energy!=null?this._fmtKwh(n.energy)+' kWh heute':'','','',null);
    }
    this._updateStats(m);
    this._scheduleDraw();
  }

  async _maybeMonthlyPeaks() {
    const id=this._c?.grid?.import_total;
    if(!id||!this._h?.callWS||this._monthlyPeaksLoading)return;
    if(this._monthlyPeaksSensor===id&&Date.now()<this._monthlyPeaksFetchAt)return;
    this._monthlyPeaksLoading=true;
    this._monthlyPeaksFetchAt=Date.now()+60000;
    try{
      const result=await this._h.callWS({type:'smartify_flow_card/monthly_peaks',statistic_id:id});
      if(this._c?.grid?.import_total!==id)return;
      this._monthlyPeaks=result?.months||{};
      this._monthlyPeaksSensor=id;
      if(this._m)this._updateMonthlyPeaks();
    }catch(err){
      // Older integrations continue to render their existing historical UI.
      this._monthlyPeaksFetchAt=Date.now()+60000;
    }finally{this._monthlyPeaksLoading=false;}
  }

  _updateMonthlyPeaks() {
    const root=this.shadowRoot;
    if(!root)return;
    const now=new Date(),year=now.getFullYear(),month=now.getMonth();
    const key=year+'-'+String(month+1).padStart(2,'0');
    const current=this._monthlyPeaks?.[key];
    const partial=(sample,m)=>sample?.first!=null&&sample.first>new Date(year,m,1).getTime()/1000+900;
    const fmtDate=stamp=>new Date(stamp*1000).toLocaleString('de-AT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    const currentValue=root.querySelector('.quarter-value'),currentTime=root.querySelector('.quarter-time');
    if(!currentValue||!currentTime)return;
    const currentNumber=current?.kw!=null?current.kw.toLocaleString('de-AT',{minimumFractionDigits:2,maximumFractionDigits:2}):null;
    if(currentValue.dataset.value!==String(currentNumber)){
      currentValue.dataset.value=String(currentNumber);
      if(currentNumber==null)currentValue.textContent='–';
      else{
        const unit=document.createElement('span');
        unit.className='unit';
        unit.textContent='kW';
        currentValue.replaceChildren(document.createTextNode(currentNumber+' '),unit);
      }
    }
    currentTime.textContent=current?.start!=null?fmtDate(current.start)+' – '+new Date((current.start+900)*1000).toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'}):
      'Noch kein vollständiger gespeicherter 15-Minuten-Wert';
    if(currentTime&&partial(current,month))currentTime.textContent+=' · Daten erst ab '+fmtDate(current.first);
    const history=root.querySelector('.monthly-history-list');
    if(!history)return;
    // Jan through the last completed month, newest month first.
    const rows=[];
    for(let m=month-1;m>=0;m--){
      const mk=year+'-'+String(m+1).padStart(2,'0');
      const sample=this._monthlyPeaks?.[mk];
      const label=new Date(year,m,1).toLocaleDateString('de-AT',{month:'long'});
      const value=sample?.kw!=null?sample.kw.toLocaleString('de-AT',{minimumFractionDigits:2,maximumFractionDigits:2}):null;
      const time=sample?.start!=null?fmtDate(sample.start)+(partial(sample,m)?' · Teilzeitraum ab '+fmtDate(sample.first):''):'Keine vollständigen gespeicherten Werte';
      rows.push('<div class="monthly-entry"><span class="month-name">'+this._esc(label)+'</span><strong>'+(value==null?'–':this._esc(value)+' <span class="unit">kW</span>')+'</strong><small>'+this._esc(time)+'</small></div>');
    }
    history.innerHTML=rows.length?rows.join(''):'Noch keine abgeschlossenen Monate in diesem Jahr';
    root.querySelector('.monthly-history').hidden=!rows.length;
  }

  _updateStats(m) {
    if (!this._c.show_stats) return;
    const r = this.shadowRoot;
    const hasPv = m.pvT != null, hasImp = m.impT != null, hasExp = m.expT != null;
    const pv = hasPv ? Math.max(0, m.pvT) : 0;
    const imp = hasImp ? Math.max(0, m.impT) : 0;
    const exp = hasExp ? Math.max(0, m.expT) : 0;
    // Eigenverbrauchsquote ist ein Anteil der PV-Erzeugung, NICHT des Hausverbrauchs.
    // Eigenverbrauch beinhaltet auch PV-Energie, die in den Speicher geladen wurde.
    const pvSelf = Math.max(0, Math.min(pv, pv - exp));
    const pvSelfPct = hasPv && hasExp && pv > 0 ? pvSelf / pv * 100 : null;
    const exportPct = hasPv && hasExp && pv > 0 ? exp / pv * 100 : null;
    // Ohne separaten Hausverbrauchs-/Speicher-Energiezähler lässt sich der echte
    // Autarkiegrad bei vorhandenem Akku nicht exakt aus diesen drei Zählern bestimmen.
    const approxCons = pvSelf + imp;
    const autApprox = hasPv && hasImp && hasExp && approxCons > 0 ? pvSelf / approxCons * 100 : null;
    const gridPct = hasPv && hasImp && hasExp && approxCons > 0 ? imp / approxCons * 100 : null;
    const hasStorage = !!(this._c.battery && this._c.battery.power);
    const pctText = (v) => v == null ? '–' : Math.round(v).toString();
    const ring = (cls, rad, pct) => {
      const C = 2 * Math.PI * rad;
      r.querySelector(cls).style.strokeDasharray = `${C * Math.max(0, Math.min(pct ?? 0, 100)) / 100} ${C}`;
    };
    ring('.a1', 58, autApprox);
    ring('.a2', 46, gridPct);
    ring('.a3', 34, exportPct);
    const central = `${pctText(autApprox)}<span class="unit">${autApprox == null ? '' : '%'}</span>`;
    if (r.querySelector('.ring .pc').innerHTML !== central) r.querySelector('.ring .pc').innerHTML = central;
    r.querySelector('.ring .lb').textContent = hasStorage ? 'AUTARKIE CA.' : 'AUTARKIE';
    r.querySelector('.ring').title = hasStorage
      ? 'Autarkie-Näherung: Für eine genaue Berechnung mit Speicher werden zusätzliche Energiezähler benötigt.'
      : 'Näherung aus PV-Eigenverbrauch und Netzbezug.';
    const row = (i, pct, sub, small) => {
      const percent = `${pctText(pct)}<span class="unit">${pct == null ? '' : '%'}</span><small>${small}</small>`;
      const percentEl = r.querySelector(`.r${i}p`);
      if (percentEl.innerHTML !== percent) percentEl.innerHTML = percent;
      r.querySelector(`.r${i}s`).textContent = sub;
      r.querySelector(`.r${i}b`).style.width = `${Math.max(0, Math.min(pct ?? 0, 100))}%`;
    };
    row(1, pvSelfPct,
      hasPv && hasExp ? `${pvSelf.toFixed(2)} kWh · selbst genutzt inkl. ggf. Akkuladung` : 'PV-Ertrag und Einspeisezähler erforderlich',
      'DES PV-ERTRAGS');
    row(2, gridPct,
      hasImp ? `${imp.toFixed(2)} kWh · aus dem Netz` : 'Netzbezugszähler erforderlich',
      hasStorage ? 'ANTEIL CA.' : 'DES VERBRAUCHS');
    row(3, exportPct,
      hasExp ? exp.toFixed(2)+' kWh · eingespeist' : 'Einspeisezähler erforderlich',
      'DES PV-ERTRAGS');
    const house=r.querySelector('.house-energy-value');
    if(house){
      const number=m.houseEnergy==null?'–':m.houseEnergy.toLocaleString('de-AT',{minimumFractionDigits:2,maximumFractionDigits:2});
      if(house.dataset.value!==number){
        house.dataset.value=number;
        if(m.houseEnergy==null)house.textContent='–';
        else{
          const unit=document.createElement('span');
          unit.className='unit';
          unit.textContent='kWh';
          house.replaceChildren(document.createTextNode(number+' '),unit);
        }
      }
    }
    const period=r.querySelector('.house-energy-period');
    if(period)period.textContent=m.historical?(this._historyPreset==='day'?'Heute':this._historyPreset==='month'?'Aktueller Monat':this._historyPreset==='year'?'Aktuelles Jahr':(this._historyRange?.start||'')+' – '+(this._historyRange?.end||'')):'Heute';
    // The peak display always refers to the CURRENT MONTH, independently
    // of the selected energy-history filter (Live/Tag/Monat/Jahr).
    this._updateMonthlyPeaks();
  }

  _layoutRadial() {
    if (this._c.layout !== 'radial' || !this._flowEl || !this._m) return;
    const flow = this._flowEl, width = flow.clientWidth;
    const narrow = width < 560;
    if (flow.classList.contains('radial-narrow') !== narrow) {
      flow.classList.toggle('radial-narrow', narrow);
      // If the layout crosses the narrow threshold, re-evaluate the optional
      // rest-last setting once, not during every resize or power update.
      if (this._c.rest_always_last && !this._responsiveSortPending) {
        this._responsiveSortPending = true;
        requestAnimationFrame(() => {
          this._responsiveSortPending = false;
          if (this.isConnected) this._update();
        });
      }
    }
    const nodes = [...flow.querySelectorAll('.node')];
    if (narrow) {
      if (flow.style.height) flow.style.height = '';
      for (const el of nodes) {
        if (el.style.left) el.style.left = '';
        if (el.style.top) el.style.top = '';
      }
      return;
    }
    // Reserve sufficient vertical space for each outer tile. One ring, no overlapping rows.
    const outer = this._m.right;
    const count = Math.max(outer.length, 4);
    const height = Math.max(600, Math.ceil(count / 2) * 110 + 150);
    if (flow.style.height !== `${height}px`) flow.style.height = `${height}px`;
    const nodeWidth = 148;
    const cx = width / 2, cy = height / 2;
    const rx = Math.max(0, width / 2 - nodeWidth / 2 - 10);
    const ry = height / 2 - 55;
    // Keep the 2 or 3 source tiles in a centred vertical stack.
    const sources = this._m.left;
    const srcNodes = sources.map(n => [...this._leftEl.children].find(el => el.dataset.key === n.key));
    const srcGap = 12;
    const srcH = srcNodes.reduce((sum, el) => sum + (el?.offsetHeight || 72), 0) + srcGap * (sources.length - 1);
    let sy = cy - srcH / 2;
    srcNodes.forEach(el => {
      if (!el) return;
      const left = `${cx - nodeWidth / 2}px`, top = `${sy}px`;
      if (el.style.left !== left) el.style.left = left;
      if (el.style.top !== top) el.style.top = top;
      sy += el.offsetHeight + srcGap;
    });
    outer.forEach((n, i) => {
      const el = [...this._rightEl.children].find(x => x.dataset.key === n.key);
      if (!el) return;
      const angle = -Math.PI / 2 + 2 * Math.PI * (i / outer.length);
      const left = `${cx + rx * Math.cos(angle) - nodeWidth / 2}px`;
      const top = `${cy + ry * Math.sin(angle) - el.offsetHeight / 2}px`;
      if (el.style.left !== left) el.style.left = left;
      if (el.style.top !== top) el.style.top = top;
    });
  }

  _drawLines() {
    const m = this._m; if (!m || !this._flowEl) return;
    this._layoutRadial();
    const box = this._flowEl.getBoundingClientRect(); if (!box.width) return;
    const viewBox = `0 0 ${box.width} ${box.height}`;
    if (this._svg.getAttribute('viewBox') !== viewBox) this._svg.setAttribute('viewBox', viewBox);
    const rect = (key) => {
      const el = this.shadowRoot.querySelector(`.node[data-key="${CSS.escape(key)}"]`); if (!el) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cy: (r.top + r.bottom) / 2 - box.top };
    };
    const all = [...m.left, ...m.right];
    const R = {}; for (const n of all) R[n.key] = rect(n.key);
    const order = {}; m.right.forEach((n, i) => (order[n.key] = i)); m.left.forEach((n, i) => (order[n.key] = -10 + i));
    const outs = {}, ins = {};
    for (const f of m.flows) { (outs[f.from] = outs[f.from] || []).push(f); (ins[f.to] = ins[f.to] || []).push(f); }
    const spread = (arr, key, other, prop) => {
      arr.sort((a, b) => order[a[other]] - order[b[other]]);
      const r = R[key]; const h = r ? (r.b - r.t) * 0.5 : 0;
      arr.forEach((f, i) => { f[prop] = arr.length > 1 ? -h / 2 + (h * i) / (arr.length - 1) : 0; });
    };
    for (const k in outs) spread(outs[k], k, 'to', 'oy');
    for (const k in ins) spread(ins[k], k, 'from', 'iy');

    const maxW = (Number(this._c.max_expected_power_kw) || 10) * 1000;
    const seen = new Set();
    for (const f of m.flows) {
      const a = R[f.from], b = R[f.to]; if (!a || !b) continue;
      const id = ('p' + f.from + '_' + f.to).replace(/[^a-zA-Z0-9_-]/g, '_');
      seen.add(id);
      let x1 = a.r, y1 = a.cy + (f.oy || 0);
      let x2, y2, d;
      // Radial: choose the shortest practical curved route between all four sides.
      // Scored candidate pairs prefer outward-facing ports and avoid other tiles.
      if (this._c.layout === 'radial' && !this._flowEl.classList.contains('radial-narrow')) {
        const cx = r => (r.l + r.r) / 2;
        const cy = r => (r.t + r.b) / 2;
        const ports = r => [
          { x: cx(r), y: r.t, vx: 0, vy: -1 },
          { x: r.r, y: cy(r), vx: 1, vy: 0 },
          { x: cx(r), y: r.b, vx: 0, vy: 1 },
          { x: r.l, y: cy(r), vx: -1, vy: 0 },
        ];
        const blockers = Object.entries(R)
          .filter(([key, r]) => key !== f.from && key !== f.to && r)
          .map(([, r]) => r);
        let best = null;
        for (const u of ports(a)) for (const v of ports(b)) {
          const dx = v.x - u.x, dy = v.y - u.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 1) continue;
          // Gentle curves. Short paths receive shorter handles.
          const handle = Math.min(85, Math.max(10, distance * 0.23));
          const c1 = { x: u.x + u.vx * handle, y: u.y + u.vy * handle };
          const c2 = { x: v.x + v.vx * handle, y: v.y + v.vy * handle };
          const dotOut = (dx * u.vx + dy * u.vy) / distance;
          const dotIn = (-dx * v.vx - dy * v.vy) / distance;
          let score = distance + (1 - dotOut) * 32 + (1 - dotIn) * 32;
          // Sample curve to discourage crossing other device/source tiles.
          for (let i = 1; i <= 15; i++) {
            const t = i / 16, q = 1 - t;
            const px = q*q*q*u.x + 3*q*q*t*c1.x + 3*q*t*t*c2.x + t*t*t*v.x;
            const py = q*q*q*u.y + 3*q*q*t*c1.y + 3*q*t*t*c2.y + t*t*t*v.y;
            if (blockers.some(r => px > r.l - 5 && px < r.r + 5 && py > r.t - 5 && py < r.b + 5)) score += 90;
          }
          if (!best || score < best.score) best = { score, u, v, c1, c2 };
        }
        if (best) {
          const { u, v, c1, c2 } = best;
          d = `M${u.x},${u.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${v.x},${v.y}`;
        }
      } else {
      if (f.loop || f.gridExport) { x2 = b.r; y2 = b.cy + (f.iy || 0); const cx = Math.max(x1, x2) + Math.max(30, box.width * 0.08); d = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`; }
      else { x2 = b.l; y2 = b.cy + (f.iy || 0); const mx = (x1 + x2) / 2; d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`; }
      }
      const src = all.find((n) => n.key === f.from);
      const dash = SFC_DASH[f.from] || SFC_DASH._solar;
      let p = this._paths.get(id);
      if(p && p.path.parentNode!==this._pg) this._pg.appendChild(p.path);
      if (!p) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', dash.k);
        this._pg.appendChild(path);
        p = { path, dur: null }; this._paths.set(id, p);
      }
      // Nur PV -> Verbraucher wird dunkelgelb; alle anderen Linien bleiben themebasiert.
      const stroke = f.from === '_solar' && !f.gridExport && !f.loop
        ? 'var(--smartify-flow-solar-line-color, #d4a000)'
        : 'var(--smartify-flow-line-color, var(--primary-text-color))';
      if (p.path.style.stroke !== stroke) p.path.style.stroke = stroke;
      if (p.path.getAttribute('d') !== d) p.path.setAttribute('d', d);
      const strokeWidth = sfcLineWidth(f.w, maxW, this._c.line_width_min, this._c.line_width_max, this._c.line_scale);
      if (p.path.getAttribute('stroke-width') !== strokeWidth) p.path.setAttribute('stroke-width', strokeWidth);
      const tgt = f.to.replace(/^_/, '').replace(/^sensor\./, '');
      const ls = this._c.line_speeds || {};
      const mult = (Number(this._c.speed_multiplier) || 1) * (Number(ls[`${f.from.replace(/^_/, '')}_${tgt}`]) || 1);
      const speed = (14 + Math.min(f.w, maxW) / 40) * mult; // px/s
      const dur = Math.max(0.1, Math.round((dash.p / speed) * 10) / 10);
      // CSS dash animations should not restart on every watt change.
      if (p.dur === null) { p.dur = dur; p.path.style.animationDuration = dur + 's'; }
    }
    for (const [id, p] of this._paths) if (!seen.has(id)) { p.path.remove(); this._paths.delete(id); }
  }
}

if (!customElements.get('smartify-flow-card')) customElements.define('smartify-flow-card', SmartifyFlowCard);
window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === 'smartify-flow-card'))
  window.customCards.push({ type: 'smartify-flow-card', name: 'smartify Flow Card', description: 'Energiefluss Quellen → Verbraucher (Label-basiert), E-Paper-Design' });
console.info(`%c smartify-flow-card %c ${SFC_VERSION} `, 'background:#111;color:#fff;font-weight:700', 'background:#00b2bf;color:#fff');


/* Visual configuration editor. Keeps existing YAML schema unchanged. */
class SmartifyFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._ready = false;
    this._pickers = [];
    this._openPicker = null;
    this._filters = {};
    // Aufgeklappte Editor-Bereiche: nur pro Editor-Instanz gemerkt. HA erzeugt beim
    // erneuten Öffnen von „Bearbeiten“ eine neue Instanz → alle Bereiche wieder zu.
    this._openSections = new Set();
  }
  setConfig(config) {
    // Lovelace calls setConfig after each config-changed event. Do not tear down
    // an open search dropdown just because the same configuration was echoed.
    const incoming = JSON.parse(JSON.stringify(config || {}));
    delete incoming._new_consumer;
    const current = this._config ? JSON.parse(JSON.stringify(this._config)) : null;
    if (current) delete current._new_consumer;
    if (this._ready && current && JSON.stringify(incoming) === JSON.stringify(current)) return;
    this._config = incoming;
    if (!this._config.solar) this._config.solar = { power: '' };
    if (!this._config.grid) this._config.grid = { import_power: '', export_power: '' };
    if (!this._config.consumers) this._config.consumers = {};
    this._render();
  }
  set hass(hass) {
    const previous = this._hass;
    this._hass = hass;
    if (!this._ready && this._config) this._render();
    // HA reassigns hass on every state change. Do NOT rebuild active text fields.
    if (this._ready && previous &&
        (previous.entities !== hass.entities || previous.labels !== hass.labels)) {
      this._refreshOptions();
    }
  }
  _emit() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: JSON.parse(JSON.stringify(this._config)) },
      bubbles: true, composed: true,
    }));
  }
  _get(path) {
    return path.reduce((o, k) => o && o[k], this._config);
  }
  _put(path, val) {
    let o = this._config;
    for (const part of path.slice(0, -1)) o = o[part] ||= {};
    if (val === '' || val === null || val === undefined) delete o[path.at(-1)];
    else o[path.at(-1)] = val;
    this._emit();
  }
  _entities() {
    const states = this._hass?.states || {};
    return Object.keys(states).map(id => ({
      id,
      label: states[id].attributes?.friendly_name || id,
      unit: states[id].attributes?.unit_of_measurement || '',
      icon: states[id].attributes?.icon || this._hass?.entities?.[id]?.icon || 'mdi:circle-outline',
      device_class: states[id].attributes?.device_class || '',
    }));
  }
  _matchingEntities(mode) {
    if (mode === 'label') return this._labels();
    if (mode === 'icon') {
      const known = new Map(SFC_ICON_OPTIONS.map(item => [item.id, { ...item, icon: item.id, unit: '' }]));
      // Icons from connected HA entities and existing custom card settings
      // remain searchable alongside the curated MDI preview catalog.
      for (const entity of this._entities()) {
        if (entity.icon?.startsWith('mdi:') && !known.has(entity.icon))
          known.set(entity.icon, { id: entity.icon, label: entity.icon.slice(4).replace(/-/g, ' '), icon: entity.icon, unit: '' });
      }
      const configured = [this._config.solar?.icon, this._config.battery?.icon, this._config.grid?.icon,
        ...Object.values(this._config.consumers || {}).map(x => x.icon)];
      for (const icon of configured) {
        if (icon?.startsWith('mdi:') && !known.has(icon))
          known.set(icon, { id: icon, label: icon.slice(4).replace(/-/g, ' '), icon, unit: '' });
      }
      return [...known.values()];
    }
    const all = this._entities();
    if (mode === 'power') return all.filter(x =>
      x.id.startsWith('sensor.') &&
      (x.device_class === 'power' || (!x.device_class && ['w', 'kw', 'mw'].includes(x.unit.trim().toLowerCase()))));
    if (mode === 'energy') return all.filter(x =>
      x.id.startsWith('sensor.') &&
      (x.device_class === 'energy' || (!x.device_class && ['wh', 'kwh', 'mwh'].includes(x.unit.trim().toLowerCase()))));
    if (mode === 'soc') return all.filter(x =>
      x.id.startsWith('sensor.') && (x.device_class === 'battery' || x.unit.trim() === '%'));
    return all;
  }
  _labels() {
    const labels = this._hass?.labels || {};
    return (Array.isArray(labels) ? labels : Object.values(labels)).map(l => ({
      id: l.label_id || l.id || l.name,
      label: l.name || l.label_id || l.id,
      icon: l.icon || 'mdi:tag-outline',
    })).filter(x => x.id);
  }
  _section(name, icon) {
    const section = document.createElement('section');
    const open = this._openSections.has(name);
    section.classList.toggle('collapsed', !open);
    const h = document.createElement('h3');
    h.setAttribute('role', 'button');
    h.tabIndex = 0;
    h.setAttribute('aria-expanded', String(open));
    const ic = document.createElement('ha-icon'); ic.setAttribute('icon', icon);
    const title = document.createElement('span'); title.className = 'sec-title'; title.textContent = name;
    const chev = document.createElement('ha-icon'); chev.className = 'sec-chevron'; chev.setAttribute('icon', 'mdi:chevron-down');
    h.append(ic, title, chev); section.append(h);
    const toggle = () => {
      const nowOpen = section.classList.toggle('collapsed') === false;
      h.setAttribute('aria-expanded', String(nowOpen));
      if (nowOpen) this._openSections.add(name); else this._openSections.delete(name);
    };
    h.addEventListener('click', toggle);
    h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    this._body.append(section);
    return section;
  }
  _field(section, label, el, hint = '') {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const text = document.createElement('label'); text.textContent = label;
    wrap.append(text, el);
    if (hint) { const small = document.createElement('small'); small.textContent = hint; wrap.append(small); }
    section.append(wrap);
    return wrap;
  }
  _input(section, title, path, type = 'text', hint = '') {
    const input = document.createElement('input'); input.type = type;
    input.value = this._get(path) ?? '';
    input.addEventListener('change', () => {
      const v = type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value;
      this._put(path, v);
    });
    this._field(section, title, input, hint);
    return input;
  }
  _select(section, title, path, choices, fallback) {
    const select = document.createElement('select');
    select.style.cssText = 'width:100%;min-height:43px;padding:8px 10px;border-radius:var(--ha-card-border-radius,12px);border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit';
    for (const [value, label] of choices) {
      const opt = document.createElement('option'); opt.value = value; opt.textContent = label; select.append(opt);
    }
    select.value = String(this._get(path) ?? fallback);
    select.addEventListener('change', () => {
      this._put(path, select.value === 'true' ? true : select.value === 'false' ? false : select.value);
      if (path.join('.') === 'grid.mode') this._render();
    });
    this._field(section, title, select);
    return select;
  }
  _toggle(section, title, path, fallback = false) {
    const input = document.createElement('input'); input.type = 'checkbox';
    input.checked = this._get(path) ?? fallback;
    const wrap = document.createElement('div'); wrap.className = 'toggle';
    const label = document.createElement('span'); label.textContent = title;
    wrap.append(label, input); section.append(wrap);
    input.addEventListener('change', () => this._put(path, input.checked));
    return input;
  }
  _picker(section, title, path, mode = 'entity', hint = '', options = {}) {
    const shell = document.createElement('div'); shell.className = mode === 'icon' ? 'picker icon-picker' : 'picker';
    const input = document.createElement('input'); input.type = 'text';
    input.autocomplete = 'off'; input.spellcheck = false;
    input.placeholder = mode === 'label' ? 'Label suchen oder eingeben …' : mode === 'power' ? 'Leistungssensor suchen (W / kW) …' : mode === 'energy' ? 'Energiezähler suchen (kWh) …' : 'Entität suchen …';
    const dropdown = document.createElement('div'); dropdown.className = 'suggestions';
    dropdown.hidden = true;
    // Native wheel scrolling inside a Lovelace nested scroll area can also
    // scroll the host editor, moving the scrollbar away from the mouse.
    // Consume the wheel and scroll this list explicitly, even at boundaries.
    dropdown.addEventListener('wheel', e => {
      if (dropdown.hidden) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      dropdown.scrollTop += e.deltaMode === 1 ? e.deltaY * 18 :
        e.deltaMode === 2 ? e.deltaY * dropdown.clientHeight : e.deltaY;
    }, { passive: false, capture: true });
    dropdown.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
    // Custom pointer-captured scrollbar: native scrollbar drag is unreliable
    // in nested HA editor overlays (shadow root + scrollable dialog).
    const track = document.createElement('div');
    track.className = 'suggestions-track';
    track.hidden = true;
    const thumb = document.createElement('div');
    thumb.className = 'suggestions-thumb';
    track.append(thumb);
    const syncThumb = () => {
      if (dropdown.hidden) { track.hidden = true; return; }
      const range = dropdown.scrollHeight - dropdown.clientHeight;
      track.hidden = range <= 1;
      if (track.hidden) return;
      const h = track.clientHeight;
      const th = Math.max(28, h * dropdown.clientHeight / dropdown.scrollHeight);
      thumb.style.height = th + 'px';
      thumb.style.transform = `translateY(${(dropdown.scrollTop / range) * (h - th)}px)`;
    };
    dropdown.addEventListener('scroll', syncThumb, { passive: true });
    let drag = null;
    track.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();
      const rect = track.getBoundingClientRect();
      const th = thumb.getBoundingClientRect().height;
      const y = e.clientY - rect.top;
      // Clicking the track jumps to the corresponding position.
      if (e.target !== thumb) {
        const ratio = Math.max(0, Math.min(1, (y - th / 2) / Math.max(1, rect.height - th)));
        dropdown.scrollTop = ratio * (dropdown.scrollHeight - dropdown.clientHeight);
      }
      drag = { pointerId: e.pointerId, startY: e.clientY, startScroll: dropdown.scrollTop };
      track.setPointerCapture(e.pointerId);
      track.classList.add('dragging');
      syncThumb();
    });
    track.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      e.preventDefault(); e.stopPropagation();
      const travel = Math.max(1, track.clientHeight - thumb.getBoundingClientRect().height);
      const scrollRange = Math.max(0, dropdown.scrollHeight - dropdown.clientHeight);
      dropdown.scrollTop = drag.startScroll + (e.clientY - drag.startY) * scrollRange / travel;
    });
    const endDrag = e => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      e.stopPropagation();
      drag = null;
      track.classList.remove('dragging');
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', () => { drag = null; track.classList.remove('dragging'); });
    // The list can change in response to typing: update thumb after rendering.
    dropdown._syncThumb = syncThumb;
    const preview = mode === 'icon' ? document.createElement('ha-icon') : null;
    if (preview) {
      preview.className = 'icon-preview';
      preview.setAttribute('icon', options.value || this._get(path) || 'mdi:help-circle-outline');
      shell.append(preview);
    }
    shell.append(input, dropdown, track);
    const obj = { input, dropdown, path, mode, current: '', active: 0, filtered: [], onChoose: options.onChoose, preview };
    const val = options.value !== undefined ? options.value : (this._get(path) || '');
    obj.current = val;
    input.value = this._display(val, mode);
    this._pickers.push(obj);
    const update = () => {
      const q = input.value.trim().toLocaleLowerCase();
      const all = this._matchingEntities(mode);
      const terms = q.split(/\s+/).filter(Boolean);
      obj.filtered = all.filter(x => terms.every(t => (x.label + ' ' + x.id).toLocaleLowerCase().includes(t)))
        .sort((a, b) => {
          const score = x => (x.id.toLowerCase() === q ? 0 : x.label.toLowerCase().startsWith(q) ? 1 : x.id.toLowerCase().startsWith(q) ? 2 : 3);
          return score(a) - score(b) || a.label.localeCompare(b.label);
        }).slice(0, 35);
      obj.active = 0;
      this._drawSuggestions(obj);
    };
    input.addEventListener('focus', () => { this._closePickers(obj); update(); });
    input.addEventListener('input', () => {
      if (preview) preview.setAttribute('icon', input.value.trim().startsWith('mdi:') ? input.value.trim() : (obj.current || 'mdi:help-circle-outline'));
      this._closePickers(obj); update();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !dropdown.hidden) {
        e.preventDefault(); e.stopPropagation();
        dropdown.hidden = true;
        input.value = this._display(obj.current, mode);
        if (obj.preview) obj.preview.setAttribute('icon', obj.current || 'mdi:help-circle-outline');
      }
      if (e.key === 'ArrowDown' && !dropdown.hidden) { e.preventDefault(); obj.active = Math.min(obj.active + 1, obj.filtered.length - 1); this._drawSuggestions(obj); }
      if (e.key === 'ArrowUp' && !dropdown.hidden) { e.preventDefault(); obj.active = Math.max(0, obj.active - 1); this._drawSuggestions(obj); }
      if (e.key === 'Enter') {
        if (!dropdown.hidden && obj.filtered[obj.active]) { e.preventDefault(); this._choose(obj, obj.filtered[obj.active].id); }
        else if (mode === 'label' || (mode === 'icon' && /^mdi:[a-z0-9-]+$/i.test(input.value.trim()))) {
          e.preventDefault(); this._choose(obj, input.value.trim());
        }
      }
    });
    // focusout is delayed so pointer selection gets processed first.
    input.addEventListener('blur', () => { setTimeout(() => {
      if (!shell.contains(this.shadowRoot.activeElement)) {
        if ((mode === 'label' || mode === 'icon') && input.value.trim() && input.value !== this._display(obj.current, mode) &&
            (mode === 'label' || /^mdi:[a-z0-9-]+$/i.test(input.value.trim()))) this._choose(obj, input.value.trim());
        else input.value = this._display(obj.current, mode);
        dropdown.hidden = true;
      }
    }, 140); });
    this._field(section, title, shell, hint);
    return obj;
  }
  _display(id, mode) {
    if (!id) return '';
    const found = this._matchingEntities(mode).find(x => x.id === id);
    return mode === 'icon' ? id : found ? `${found.label}  ·  ${id}` : id;
  }
  _choose(obj, id) {
    obj.current = id;
    obj.input.value = this._display(id, obj.mode);
    obj.dropdown.hidden = true;
    if (obj.preview) obj.preview.setAttribute('icon', id || 'mdi:help-circle-outline');
    if (obj.onChoose) obj.onChoose(id);
    else if (obj.path[0] === '_new_consumer') this._config._new_consumer = id;
    else this._put(obj.path, id);
  }
  _closePickers(except) { for (const p of this._pickers) if (p !== except) p.dropdown.hidden = true; }
  _drawSuggestions(p) {
    const list = p.dropdown;
    const previousScroll = list.scrollTop;
    list.replaceChildren();
    const empty = document.createElement('button');
    empty.type = 'button'; empty.className = 'option muted'; empty.textContent = '✕  Auswahl entfernen';
    empty.addEventListener('pointerdown', e => { e.preventDefault(); this._choose(p, ''); });
    list.append(empty);
    for (const [index, item] of p.filtered.entries()) {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'option' + (index === p.active ? ' selected' : '');
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(index === p.active));
      const icon = document.createElement('ha-icon'); icon.setAttribute('icon', p.mode === 'icon' ? item.id : item.icon);
      const content = document.createElement('span');
      const name = document.createElement('strong'); name.textContent = item.label;
      const id = document.createElement('small'); id.textContent = item.id + (item.unit ? '  ·  ' + item.unit : '');
      content.append(name, id); b.append(icon, content);
      b.addEventListener('pointerdown', e => { e.preventDefault(); this._choose(p, item.id); });
      list.append(b);
    }
    if (!p.filtered.length) {
      const msg = document.createElement('div'); msg.className = 'nothing';
      msg.textContent = p.mode === 'label' ? 'Kein Label gefunden – mit Enter manuell übernehmen.' : 'Keine passende Entität dieses Sensortyps gefunden.';
      list.append(msg);
    }
    list.hidden = false;
    list.scrollTop = previousScroll;
    requestAnimationFrame(() => list._syncThumb?.());
  }
  _refreshOptions() {
    // Entity registry updates do not need to redraw an already-open result
    // panel. Redrawing would replace the elements under the user's pointer.
    // The next keystroke or focus event picks up the updated entity registry.
    if (this._pickers.some(p => !p.dropdown.hidden)) return;
  }
  _consumerList(section) {
    // All edits are made in the Lovelace editor: _emit persists the
    // complete card configuration, unlike ad-hoc dashboard DOM mutations.
    const wrap = document.createElement('div');
    wrap.className = 'consumer-manager';
    const header = document.createElement('div');
    header.className = 'consumer-manager-header';
    const caption = document.createElement('b'); caption.textContent = 'Verbraucher verwalten';
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'consumer-manager-add';
    add.setAttribute('aria-label', 'Verbraucher hinzufügen');
    add.title = 'Verbraucher hinzufügen';
    const addIcon = document.createElement('ha-icon'); addIcon.setAttribute('icon', 'mdi:plus');
    add.append(addIcon);
    header.append(caption, add);
    const cards = document.createElement('div'); cards.className = 'consumer-manager-cards';
    const help = document.createElement('small');
    help.textContent = 'Plus: Neuen Verbraucher anlegen. Minus: Einstellungen öffnen und bei Bedarf löschen. Änderungen werden mit der Dashboard-Karte gespeichert.';
    wrap.append(header, cards, help);
    section.append(wrap);
    const excluded = () => new Set(this._config.excluded_consumers || []);
    const available = () => {
      const labels = new Set([String(this._config.label || 'verbraucher').toLowerCase()]);
      for (const entry of this._labels()) {
        if (entry.label.toLowerCase() === String(this._config.label || 'verbraucher').toLowerCase() ||
            entry.id.toLowerCase() === String(this._config.label || 'verbraucher').toLowerCase()) {
          labels.add(entry.id.toLowerCase());
          labels.add(entry.label.toLowerCase());
        }
      }
      const labeled = Object.values(this._hass?.entities || {})
        .filter(e => e?.entity_id?.startsWith('sensor.') &&
          (e.labels || []).some(l => labels.has(String(l).toLowerCase())))
        .map(e => e.entity_id)
        .filter(id => this._matchingEntities('power').some(e => e.id === id));
      return [...new Set([...Object.keys(this._config.consumers || {}), ...labeled])]
        .filter(id => !excluded().has(id));
    };
    const render = () => {
      cards.replaceChildren();
      const ids = available();
      if (!ids.length) {
        const empty = document.createElement('small');
        empty.textContent = 'Noch keine Verbraucher konfiguriert.';
        cards.append(empty);
      }
      for (const id of ids) {
        const ov = this._config.consumers?.[id] || {};
        const tile = document.createElement('div'); tile.className = 'consumer-manager-tile';
        const icon = document.createElement('ha-icon'); icon.setAttribute('icon', ov.icon || 'mdi:power-plug');
        const name = document.createElement('span');
        name.textContent = ov.name || this._display(id, 'entity');
        name.title = id;
        const edit = document.createElement('button');
        edit.type = 'button'; edit.className = 'consumer-manager-minus';
        edit.setAttribute('aria-label', name.textContent + ' bearbeiten oder entfernen');
        edit.title = 'Bearbeiten / entfernen';
        const minus = document.createElement('ha-icon'); minus.setAttribute('icon', 'mdi:minus');
        edit.append(minus);
        edit.addEventListener('click', () => open(id));
        tile.append(icon, name, edit); cards.append(tile);
      }
    };
    const open = (id = null) => {
      // Draft fields are kept local until Save is clicked, preventing partial
      // edits or popup cancellation from modifying the dashboard config.
      const original = id && this._config.consumers?.[id] || {};
      const overlay = document.createElement('div'); overlay.className = 'consumer-modal-overlay';
      const dialog = document.createElement('div');
      dialog.className = 'consumer-modal';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', id ? 'Verbraucher bearbeiten' : 'Verbraucher hinzufügen');
      const title = document.createElement('h3');
      title.textContent = id ? 'Verbraucher bearbeiten' : 'Neuen Verbraucher hinzufügen';
      dialog.append(title);
      const options = this._matchingEntities('power');
      const formFields = {};
      const field = (key, title, value, type = 'text', hint = '') => {
        const container = document.createElement('div'); container.className = 'field';
        const lbl = document.createElement('label'); lbl.textContent = title;
        const input = document.createElement('input');
        input.type = type;
        input.value = value || '';
        input.setAttribute('aria-label', title);
        formFields[key] = input;
        container.append(lbl, input);
        if (hint) { const note = document.createElement('small'); note.textContent = hint; container.append(note); }
        dialog.append(container);
        return input;
      };
      // Reuse exactly the same visual HA picker as the main card editor.
      // Popup picker callbacks only edit a local draft; no config-changed
      // event is fired until the user presses Save.
      const staged = [];
      const draftPicker = (key, title, mode, value, hint = '') => {
        let current = value || '';
        const obj = this._picker(dialog, title, ['_consumer_draft', key], mode, hint, {
          value: current,
          onChoose: chosen => { current = chosen; },
        });
        staged.push(obj);
        formFields[key] = { get value() { return current; }, picker: obj };
        return obj;
      };
      const entity = draftPicker('entity', 'Leistungssensor (W/kW/MW)', 'power', id || '',
        'Nur Home-Assistant-Leistungssensoren (W, kW, MW). Suche nach Namen oder Entity-ID.');
      field('name', 'Anzeigename', original.name || '');
      draftPicker('icon', 'Icon (mit Symbolvorschau)', 'icon', original.icon || '',
        'Suchbegriff oder mdi:Iconname eintippen; Symbole erscheinen direkt in der Vorschlagsliste.');
      field('color', 'Gerätefarbe (HEX/CSS)', original.color || '');
      const energy = draftPicker('energy', 'Gesamtenergiezähler (Wh/kWh/MWh, optional)', 'energy', original.energy || '',
        'Nur Home-Assistant-Energiesensoren (Wh, kWh, MWh). Suche nach Namen oder Entity-ID.');
      const error = document.createElement('small'); error.className = 'consumer-modal-error';
      error.setAttribute('role', 'alert');
      dialog.append(error);
      const buttons = document.createElement('div'); buttons.className = 'consumer-modal-actions';
      const cancel = document.createElement('button'); cancel.type = 'button';
      cancel.textContent = 'Abbrechen';
      const save = document.createElement('button'); save.type = 'button';
      save.className = 'consumer-modal-save';
      save.textContent = id ? 'Änderungen speichern' : 'Verbraucher hinzufügen';
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'consumer-modal-remove';
      remove.textContent = 'Verbraucher entfernen';
      remove.hidden = !id;
      const close = () => {
        overlay.remove();
        this._pickers = this._pickers.filter(p => !staged.includes(p));
      };
      const onKey = e => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
      };
      overlay.addEventListener('keydown', onKey);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      cancel.addEventListener('click', close);
      save.addEventListener('click', () => {
        const nextId = formFields.entity.value.trim();
        if (!this._matchingEntities('power').some(option => option.id === nextId)) {
          error.textContent = 'Bitte einen gültigen Home-Assistant-Leistungssensor auswählen.'; return;
        }
        const energyId = formFields.energy.value.trim();
        if (energyId && !this._matchingEntities('energy').some(option => option.id === energyId)) {
          error.textContent = 'Bitte einen gültigen Home-Assistant-Energiesensor auswählen.'; return;
        }
        const iconId = formFields.icon.value.trim();
        if (iconId && !/^mdi:[a-z0-9-]+$/i.test(iconId)) {
          error.textContent = 'Bitte ein gültiges MDI-Icon auswählen oder mdi:iconname eingeben.'; return;
        }
        if (nextId !== id && this._config.consumers?.[nextId]) {
          error.textContent = 'Dieser Verbraucher ist bereits manuell konfiguriert.'; return;
        }
        const next = { ...original };
        for (const key of ['name', 'icon', 'color', 'energy']) {
          const value = formFields[key].value.trim();
          if (value) next[key] = value; else delete next[key];
        }
        this._config.consumers ||= {};
        if (id && id !== nextId) {
          delete this._config.consumers[id];
          // If a label adds the old entity automatically, hide it so a
          // sensor change does not leave a duplicate row.
          this._config.excluded_consumers = [...new Set([...(this._config.excluded_consumers || []), id])];
        }
        this._config.consumers[nextId] = next;
        this._config.excluded_consumers = (this._config.excluded_consumers || []).filter(x => x !== nextId);
        close(); render(); this._emit();
      });
      remove.addEventListener('click', () => {
        if (!id || !window.confirm('Verbraucher „' + (original.name || id) + '“ wirklich aus dieser Karte entfernen?')) return;
        delete this._config.consumers[id];
        this._config.excluded_consumers = [...new Set([...(this._config.excluded_consumers || []), id])];
        close(); render(); this._emit();
      });
      buttons.append(cancel, save);
      if (id) buttons.prepend(remove);
      dialog.append(buttons);
      overlay.append(dialog);
      this.shadowRoot.append(overlay);
      // Focus the dialog heading instead of the power picker: the picker opens
      // suggestions on focus and must stay closed until the user selects it.
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    };
    this._instanceId ||= String(Math.floor(Math.random() * 1e9));
    add.addEventListener('click', () => open());
    render();
  }
  _backupSection() {
    const sec = this._section('Sicherung & Wiederherstellung', 'mdi:content-save-cog-outline');
    const note = document.createElement('p');
    note.className = 'backup-note';
    note.textContent = 'Alle manuell angelegten Geräte, Namen, Farben und Sensoren liegen in der Dashboard-Kartenkonfiguration. Updates der JS-Datei ändern diese nicht. Sichere die Konfiguration zusätzlich hier als JSON.';
    sec.append(note);
    const area = document.createElement('textarea');
    area.className = 'backup-json'; area.rows = 6;
    area.placeholder = 'Hier erscheint die Sicherung bzw. hier eine gespeicherte JSON-Konfiguration einfügen …';
    area.setAttribute('aria-label', 'Sicherung der Kartenkonfiguration als JSON');
    sec.append(area);
    const buttons = document.createElement('div'); buttons.className = 'backup-actions';
    const status = document.createElement('small'); status.className = 'backup-status';
    const addButton = (label, callback) => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = label;
      btn.addEventListener('click', callback); buttons.append(btn); return btn;
    };
    addButton('Sicherung anzeigen', () => {
      area.value = JSON.stringify(this._config, null, 2);
      status.textContent = 'Vollständige Konfiguration im Textfeld. Kopiere sie an einen sicheren Ort.';
    });
    addButton('JSON kopieren', async () => {
      area.value = JSON.stringify(this._config, null, 2);
      try {
        await navigator.clipboard.writeText(area.value);
        status.textContent = 'Konfiguration in die Zwischenablage kopiert.';
      } catch (_) {
        area.focus(); area.select();
        status.textContent = 'Bitte markierten Text mit Strg+C kopieren.';
      }
    });
    addButton('Aus JSON wiederherstellen', () => {
      let data;
      try { data = JSON.parse(area.value); }
      catch (_) { status.textContent = 'Fehler: Ungültiges JSON.'; return; }
      if (!data || typeof data !== 'object' || Array.isArray(data) ||
          data.type !== 'custom:smartify-flow-card' ||
          !data.solar || typeof data.solar !== 'object' ||
          !data.grid || typeof data.grid !== 'object' ||
          (data.consumers != null && (typeof data.consumers !== 'object' || Array.isArray(data.consumers)))) {
        status.textContent = 'Ungültige Flow-Card-Konfiguration: Typ, PV oder Netz fehlen.'; return;
      }
      if (!window.confirm('Die aktuelle Kartenkonfiguration durch diese Sicherung ersetzen?')) return;
      this._config = JSON.parse(JSON.stringify(data));
      delete this._config._new_consumer;
      this._emit(); this._render();
    });
    sec.append(buttons, status);
  }
  _transparencyControl(section) {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const label = document.createElement('label'); label.textContent = 'Hintergrundtransparenz der Karte';
    const row = document.createElement('div'); row.className = 'opacity-control';
    const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.step = '5';
    const number = document.createElement('input'); number.type = 'number'; number.min = '0'; number.max = '100'; number.step = '5';
    const unit = document.createElement('span'); unit.textContent = '%';
    const initial = Math.max(0, Math.min(100, Number(this._get(['background_transparency'])) || 0));
    slider.value = number.value = String(initial);
    const update = (raw) => {
      const value = Math.max(0, Math.min(100, Number(raw) || 0));
      slider.value = number.value = String(value);
      this._put(['background_transparency'], value);
    };
    slider.addEventListener('input', () => update(slider.value));
    number.addEventListener('change', () => update(number.value));
    row.append(slider, number, unit);
    const hint = document.createElement('small');
    hint.textContent = '0 % = undurchsichtig, 100 % = vollständig transparent. Gerätekacheln bleiben für gute Lesbarkeit unverändert.';
    wrap.append(label, row, hint); section.append(wrap);
  }
  _pvPlantControls(section) {
    this._config.solar.plants ||= sfcPvPlants(this._config.solar);
    const plants=this._config.solar.plants;
    const list=document.createElement('div');list.className='pv-plants';section.append(list);
    plants.forEach((plant,index)=>{
      const item=document.createElement('div');item.className='pv-plant';
      const head=document.createElement('div');head.className='pv-plant-head';
      const title=document.createElement('strong');title.textContent='PV-Anlage '+(index+1);
      const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='Entfernen';
      remove.addEventListener('click',()=>{plants.splice(index,1);this._emit();this._render();});
      head.append(title,remove);item.append(head);
      this._input(item,'Name',['solar','plants',index,'name']);
      this._picker(item,'Leistungssensor (W / kW)',['solar','plants',index,'power'],'power');
      this._picker(item,'Gesamtenergiezähler (kWh)',['solar','plants',index,'energy_total'],'energy',
        'Separater fortlaufender Gesamtenergiezähler dieser PV-Anlage.');
      list.append(item);
    });
    const add=document.createElement('button');add.type='button';add.className='add';
    add.textContent='+ PV-Anlage hinzufügen';
    add.addEventListener('click',()=>{
      plants.push({name:'PV-Anlage '+(plants.length+1),power:'',energy_total:''});
      this._emit();this._render();
    });
    section.append(add);
    const hint=document.createElement('small');hint.className='backup-note';
    hint.textContent='Die Leistungen werden live addiert. Historische Erträge werden pro Anlage separat aus den Langzeitstatistiken ermittelt und gemeinsam in einer PV-Kachel dargestellt.';
    section.append(hint);
  }
  _sourceOrderControl(section) {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const label = document.createElement('label');
    label.textContent = 'Reihenfolge der Quellenkacheln (oben → unten)';
    const hint = document.createElement('small');
    hint.textContent = 'Am Griff ziehen (Maus oder Touch) oder mit ↑ / ↓ verschieben. Änderungen gelten im klassischen und radialen Layout und werden mit der Karte gespeichert.';
    const list = document.createElement('div'); list.className = 'source-order-list';
    const names = { _solar: 'PV', _battery: 'Akku', _grid: 'Netz' };
    const icons = {
      _solar: this._config.solar?.icon || 'mdi:solar-power',
      _battery: this._config.battery?.icon || 'mdi:home-battery',
      _grid: this._config.grid?.icon || 'mdi:transmission-tower',
    };
    const hasBattery = !!this._config.battery?.power;
    const available = hasBattery ? SFC_SOURCE_KEYS : SFC_SOURCE_KEYS.filter(key => key !== '_battery');
    let order = sfcSourceOrder(this._config.source_order, available);
    let dragging = null;
    const save = next => {
      const complete = sfcSourceOrder(next);
      const old = sfcSourceOrder(this._config.source_order);
      if (complete.join('|') === old.join('|')) return;
      this._config.source_order = complete;
      this._emit();
    };
    const render = () => {
      list.replaceChildren();
      order.forEach((key, index) => {
        const item = document.createElement('div');
        item.className = 'source-order-row';
        item.dataset.key = key;
        const grip = document.createElement('button');
        grip.type = 'button'; grip.className = 'source-order-grip';
        grip.setAttribute('aria-label', names[key] + ' verschieben');
        grip.setAttribute('title', names[key] + ' ziehen');
        const glyph = document.createElement('ha-icon');
        glyph.setAttribute('icon', 'mdi:drag-vertical');
        grip.append(glyph);
        const sourceIcon = document.createElement('ha-icon');
        sourceIcon.setAttribute('icon', icons[key]);
        const name = document.createElement('span'); name.textContent = names[key];
        const controls = document.createElement('div'); controls.className = 'source-order-actions';
        for (const [direction, caption, icon] of [[-1, 'Nach oben', 'mdi:chevron-up'], [1, 'Nach unten', 'mdi:chevron-down']]) {
          const btn = document.createElement('button'); btn.type = 'button';
          btn.disabled = index + direction < 0 || index + direction >= order.length;
          btn.setAttribute('aria-label', names[key] + ': ' + caption);
          const symbol = document.createElement('ha-icon'); symbol.setAttribute('icon', icon);
          btn.append(symbol);
          btn.addEventListener('click', () => {
            const position = order.indexOf(key), next = position + direction;
            if (next < 0 || next >= order.length) return;
            order = sfcMoveSource(order, key, order[next]);
            render();
            save(order);
            list.querySelector(`[data-key="${key}"] .source-order-grip`)?.focus();
          });
          controls.append(btn);
        }
        // Grip is also keyboard-accessible without depending on HTML5 drag/drop.
        grip.addEventListener('keydown', e => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
          e.preventDefault();
          const position = order.indexOf(key), next = position + (e.key === 'ArrowUp' ? -1 : 1);
          if (next < 0 || next >= order.length) return;
          order = sfcMoveSource(order, key, order[next]);
          render(); save(order);
          list.querySelector(`[data-key="${key}"] .source-order-grip`)?.focus();
        });
        grip.addEventListener('pointerdown', e => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          e.preventDefault();
          dragging = { key, id: e.pointerId, y: e.clientY, moved: false };
          grip.setPointerCapture(e.pointerId);
          item.classList.add('dragging');
        });
        grip.addEventListener('pointermove', e => {
          if (!dragging || dragging.id !== e.pointerId || dragging.key !== key) return;
          if (Math.abs(e.clientY - dragging.y) > 5) dragging.moved = true;
          if (!dragging.moved) return;
          const target = [...list.children].find(row => {
            const rect = row.getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY < rect.bottom;
          });
          for (const row of list.children) row.classList.toggle('drop-target', row === target && row !== item);
        });
        const finish = e => {
          if (!dragging || dragging.id !== e.pointerId || dragging.key !== key) return;
          const wasMoved = dragging.moved;
          const target = wasMoved ? [...list.children].find(row => {
            const rect = row.getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY < rect.bottom;
          }) : null;
          dragging = null;
          item.classList.remove('dragging');
          for (const row of list.children) row.classList.remove('drop-target');
          if (grip.hasPointerCapture?.(e.pointerId)) grip.releasePointerCapture(e.pointerId);
          if (e.type === 'pointercancel' || !target || target === item) return;
          order = sfcMoveSource(order, key, target.dataset.key);
          render(); save(order);
        };
        grip.addEventListener('pointerup', finish);
        grip.addEventListener('pointercancel', finish);
        item.append(grip, sourceIcon, name, controls); list.append(item);
      });
    };
    render();
    wrap.append(label, list, hint); section.append(wrap);
  }

  _fontScaleControl(section) {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const label = document.createElement('label');
    label.textContent = 'Schriftgröße aller Kartentexte (%)';
    const row = document.createElement('div'); row.className = 'opacity-control';
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = '50'; slider.max = '200'; slider.step = '5';
    const number = document.createElement('input');
    number.type = 'number'; number.min = '50'; number.max = '200'; number.step = '5';
    const unit = document.createElement('span'); unit.textContent = '%';
    const stored = Number(this._get(['font_scale']));
    const initial = Math.max(50, Math.min(200, Math.round((Number.isFinite(stored) && stored > 0 ? stored : 1) * 100)));
    slider.value = number.value = String(initial);
    const apply = raw => {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return;
      const value = Math.max(50, Math.min(200, Math.round(parsed)));
      slider.value = number.value = String(value);
      // Keep existing stored configuration compatible (font_scale: 1 = 100%).
      this._put(['font_scale'], value / 100);
    };
    slider.addEventListener('input', () => apply(slider.value));
    number.addEventListener('change', () => apply(number.value));
    row.append(slider, number, unit);
    const hint = document.createElement('small');
    hint.textContent = '100 % = bisherige Standardschrift. Wirkt auf Titel, Namen, Leistungswerte, Einheiten, Quellen-Badges und Statistiken. 50–200 %, auch im Radialmodus.';
    wrap.append(label, row, hint); section.append(wrap);
  }
  _render() {
    if (!this._config || !this._hass) return;
    this._ready = true;
    this._pickers = [];
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:inherit;--sf-editor-radius:var(--ha-card-border-radius,12px)}
      .intro{padding:12px 14px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);margin-bottom:12px;background:var(--secondary-background-color)}
      .intro b{display:block;margin-bottom:2px}.intro small{color:var(--secondary-text-color)}
      section{border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:14px;margin:10px 0;background:var(--card-background-color)}
      h3{display:flex;gap:9px;align-items:center;font-size:15px;margin:0 0 14px;cursor:pointer;user-select:none;outline:none}h3 ha-icon{color:var(--primary-color)}
      h3 .sec-title{flex:1;min-width:0}
      h3 .sec-chevron{color:var(--secondary-text-color);transition:transform .2s}
      h3:focus-visible{outline:2px solid var(--primary-color);outline-offset:4px;border-radius:4px}
      section.collapsed>h3{margin:0}
      section.collapsed>h3 .sec-chevron{transform:rotate(-90deg)}
      section.collapsed>:not(h3){display:none!important}
      .field{margin:0 0 12px;min-width:0}.field>label{display:block;font-size:12px;font-weight:650;margin-bottom:6px;color:var(--secondary-text-color)}
      .field>small{display:block;margin-top:4px;color:var(--secondary-text-color);font-size:11px}
      input:not([type=checkbox]){display:block;box-sizing:border-box;width:100%;min-height:43px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;padding:9px 11px;outline:none}
      input:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 18%,transparent)}
      input[type=checkbox]{accent-color:var(--primary-color);width:20px;height:20px}
      .icon-picker{display:flex;align-items:center}.icon-picker .icon-preview{flex:none;--mdc-icon-size:27px;margin-right:8px;color:var(--primary-text-color)}.icon-picker input{flex:1;min-width:0}.picker{position:relative}.picker:focus-within{z-index:100}.suggestions{position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:30;height:270px;max-height:min(270px,45vh);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:none;border-radius:var(--sf-editor-radius);background:var(--card-background-color);border:1px solid var(--divider-color);box-shadow:0 8px 26px #0003}
      .suggestions::-webkit-scrollbar{display:none}
      .suggestions-track{position:absolute;z-index:31;top:calc(100% + 9px);right:4px;height:calc(min(270px,45vh) - 12px);width:14px;border-radius:var(--sf-editor-radius);background:color-mix(in srgb,var(--divider-color) 35%,transparent);touch-action:none;cursor:pointer;user-select:none}
      .suggestions-track[hidden]{display:none}
      .suggestions-thumb{position:absolute;top:0;left:2px;right:2px;border-radius:8px;background:var(--secondary-text-color);opacity:.7;touch-action:none;cursor:grab}
      .suggestions-track.dragging .suggestions-thumb{cursor:grabbing;opacity:1;background:var(--primary-color)}
      .suggestions[hidden]{display:none}.option{display:flex;align-items:center;gap:9px;text-align:left;width:100%;background:none;border:0;color:var(--primary-text-color);padding:9px 11px;cursor:pointer;font:inherit}
      .option ha-icon{color:var(--secondary-text-color);flex:none;--mdc-icon-size:20px}.option span{min-width:0}.option strong,.option small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.option strong{font-size:13px;font-weight:600}.option small{font-size:11px;color:var(--secondary-text-color)}
      .option:hover,.option.selected{background:var(--secondary-background-color)}.option.muted{color:var(--secondary-text-color);font-size:12px}.nothing{font-size:12px;padding:14px;color:var(--secondary-text-color)}
      .opacity-control{display:flex;align-items:center;gap:10px}.opacity-control input[type=range]{flex:1;min-width:0;accent-color:var(--primary-color)}.opacity-control input[type=number]{width:75px;min-height:36px}.opacity-control span{font-size:13px}
      .toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--divider-color)}
      .consumer{padding:12px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);margin:10px 0;background:var(--secondary-background-color)}
      .consumer-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;overflow-wrap:anywhere}.consumer-head b{font-size:12px}
      .consumer-manager{position:relative;display:grid;gap:8px}
      .consumer-manager-header{display:flex;align-items:center;justify-content:space-between}
      .consumer-manager-cards{display:grid;gap:6px}
      .consumer-manager-tile{display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color);min-width:0}
      .consumer-manager-tile span{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:600}
      .consumer-manager-add,.consumer-manager-minus{display:grid;place-items:center;flex:none;width:32px;height:32px;padding:0;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
      .consumer-manager-add{background:var(--primary-color);color:var(--text-primary-color,#fff)}
      .consumer-modal-overlay{position:fixed;inset:0;z-index:500;background:#0009;display:grid;place-items:center;padding:12px}
      .consumer-modal{box-sizing:border-box;width:min(100%,440px);max-height:90vh;overflow-y:auto;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:18px;box-shadow:0 8px 30px #0004}
      .consumer-modal-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
      .consumer-modal-actions button{border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:9px;cursor:pointer;background:var(--secondary-background-color);color:var(--primary-text-color)}
      .consumer-modal-actions .consumer-modal-save{background:var(--primary-color);color:var(--text-primary-color,#fff)}
      .consumer-modal-actions .consumer-modal-remove{color:var(--error-color,#e53935);margin-right:auto}
      .consumer-modal-error{display:block;color:var(--error-color,#e53935);min-height:1.2em}
      
      .pv-plants{display:flex;flex-direction:column;gap:10px;margin-bottom:10px}.pv-plant{padding:12px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color)}.pv-plant-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.pv-plant-head .remove{min-height:36px;padding:0 8px}
      .source-order-list{display:flex;flex-direction:column;gap:6px}
      .source-order-row{display:flex;align-items:center;gap:9px;padding:5px 8px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color);min-height:42px}
      .source-order-row>span{flex:1;font-weight:600}
      .source-order-row.dragging{border-color:var(--primary-color);opacity:.7}
      .source-order-row.drop-target{outline:2px solid var(--primary-color);outline-offset:-2px}
      .source-order-grip,.source-order-actions button{width:38px;height:38px;border:0;background:transparent;color:var(--primary-text-color);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border-radius:var(--sf-editor-radius);padding:0}
      .source-order-grip{touch-action:none;cursor:grab;user-select:none}
      .source-order-grip:active{cursor:grabbing}
      .source-order-grip:focus-visible,.source-order-actions button:focus-visible{outline:2px solid var(--primary-color)}
      .source-order-actions{display:flex;align-items:center;gap:2px}
      .source-order-actions button:disabled{opacity:.3;cursor:default}
      .backup-note{font-size:12px;color:var(--secondary-text-color);line-height:1.5}
      .backup-json{box-sizing:border-box;width:100%;min-height:125px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:10px;background:var(--secondary-background-color);color:var(--primary-text-color);font:12px monospace;resize:vertical}
      .backup-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
      .backup-actions button{border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:9px 11px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
      .backup-status{display:block;color:var(--secondary-text-color)}
      .remove{border:0;background:transparent;color:var(--error-color,#e53935);cursor:pointer}.add{width:100%;background:var(--primary-color);color:var(--text-primary-color,#fff);border:0;border-radius:var(--sf-editor-radius);min-height:40px;cursor:pointer}
    </style><div class="intro"><b>Smartify Flow Card · Visueller Editor</b><small>Entität suchen: Name oder Entity-ID eintippen, mit ↑ ↓ und Enter auswählen.</small></div><div id="body"></div>`;
    this._body = this.shadowRoot.getElementById('body');
    let sec = this._section('Photovoltaik', 'mdi:solar-power');
    this._pvPlantControls(sec);
    this._picker(sec,'PV-Prognose heute',['solar','forecast_today'],'energy');
    this._picker(sec,'PV-Prognose verbleibend',['solar','forecast_remaining'],'energy');
    this._input(sec,'Name der gemeinsamen PV-Kachel',['solar','name']);
    this._picker(sec,'PV-Icon',['solar','icon'],'icon','Icon nach Namen suchen, Symbol auswählen oder mdi:Iconname eingeben.');
    sec = this._section('Stromnetz', 'mdi:transmission-tower');
    // For existing configs, default to separate sensors unless a saldo sensor exists.
    const gridMode = this._config.grid.mode || (this._config.grid.saldo_power ? 'saldo' : 'separate');
    this._select(sec, 'Leistungssensoren', ['grid','mode'], [
      ['separate','Zwei getrennte Sensoren (Bezug / Einspeisung)'],
      ['saldo','Ein gemeinsamer Netzsaldo-Sensor (+ / −)'],
    ], gridMode);
    if (gridMode === 'saldo') {
      this._picker(sec,'Netzsaldo-Leistung (W / kW)',['grid','saldo_power'],'power');
      this._select(sec,'Vorzeichen des Netzsaldos',['grid','positive_import'], [
        ['true','Positiv (+) = Netzbezug, negativ (−) = Einspeisung'],
        ['false','Positiv (+) = Einspeisung, negativ (−) = Netzbezug'],
      ], true);
    } else {
      this._picker(sec,'Netzbezug (positive Leistung)',['grid','import_power'],'power');
      this._picker(sec,'Einspeisung (positive Leistung)',['grid','export_power'],'power');
    }
    this._picker(sec,'Netzbezug Gesamtenergiezähler (kWh)',['grid','import_total'],'energy');
    this._picker(sec,'Einspeisung Gesamtenergiezähler (kWh)',['grid','export_total'],'energy');
    this._picker(sec,'Netz-Icon (optional)',['grid','icon'],'icon','Ohne eigene Auswahl wechselt das Netzsymbol automatisch mit der Stromrichtung.');
    sec = this._section('Batteriespeicher', 'mdi:home-battery');
    this._picker(sec,'Batterie-Leistung',['battery','power'],'power');
    this._picker(sec,'Ladezustand (SoC)',['battery','soc'],'soc');
    this._picker(sec,'Akku-Ladeenergie Gesamtenergiezähler (kWh)',['battery','charge_total'],'energy',
      'Optional: gesamte in den Akku geladene Energie. Für historische Restverbrauchsberechnung zusammen mit Entladeenergie erforderlich.');
    this._picker(sec,'Akku-Entladeenergie Gesamtenergiezähler (kWh)',['battery','discharge_total'],'energy',
      'Optional: gesamte aus dem Akku entladene Energie. Keine Tageswerte, sondern fortlaufende Gesamtenergie.');
    this._input(sec,'Name',['battery','name']);
    this._picker(sec,'Akku-Icon',['battery','icon'],'icon','Icon nach Namen suchen und aus den Symbolvorschlägen auswählen.');
    this._toggle(sec,'Vorzeichen der Batterieleistung umkehren',['battery','invert']);
    sec = this._section('Verbraucher', 'mdi:power-plug');
    this._picker(sec,'Verbraucher-Label',['label'],'label','Nur mit diesem Label markierte Sensoren werden angezeigt.');
    this._picker(sec,'Gesamtverbrauch (optional)',['load_total'],'power');
    this._input(sec,'Anzeigeleistung (W)',['min_power'],'number',
      'Leistungsschwelle für die optionale Ausblendung. Standard: 10 W.');
    this._toggle(sec,'Geräte unter Anzeigeleistung ausblenden',['hide_below_display_power'],false);
    this._input(sec,'Gerätekacheln ausgrauen bis (W)',['idle_power'],'number',
      'Standard: 5 W. Bis einschließlich diesem Wert werden sichtbare Kacheln mit 45 % Deckkraft angezeigt.');
    this._consumerList(sec);
    sec = this._section('Darstellung & Animation', 'mdi:tune-variant');
    this._input(sec,'Kartentitel',['title']);
    this._select(sec,'Anordnung der Kacheln',['layout'], [['classic','Klassisch – Quellen links, Verbraucher rechts'],['radial','Radial – Quellen in der Mitte, Verbraucher rundherum']], 'classic');
    this._sourceOrderControl(sec);
    this._select(sec, 'Anzeige der Quellenanteile bei Verbrauchern', ['source_display'], [
      ['badge', 'Badge neben dem Leistungswert (Standard)'],
      ['strip', 'Farbiger Streifen unten in der Kachel'],
    ], 'badge');
    this._select(sec, 'Quellenverteilung (Visualisierungsmodell)', ['allocation'], [
      ['smallest_first', 'PV vom kleinsten zum größten Verbraucher (Standard)'],
      ['proportional', 'Proportional – gleicher PV/Akku/Netz-Mix pro Verbraucher'],
    ], 'smallest_first');
    this._select(sec, 'Skalierung der Linienbreite', ['line_scale'], [
      ['sqrt', 'Quadratwurzel – schwache Verbindungen deutlicher'],
      ['linear', 'Linear – proportional zur Leistung'],
    ], 'sqrt');
    this._input(sec, 'Minimale Linienbreite (px)', ['line_width_min'], 'number',
      'Standard 1,5 px. Die untere Breite bei sehr kleinen Energieflüssen (0,5–20 px).');
    this._input(sec, 'Maximale Linienbreite (px)', ['line_width_max'], 'number',
      'Standard 4,5 px. Muss mindestens so groß wie die minimale Linienbreite sein (0,5–20 px).');
    this._transparencyControl(sec);
    this._fontScaleControl(sec);
    for (const [title,key] of [
      ['Maximal sichtbare Verbraucher','max_consumers'],
      ['Mindestleistung für Energieflusslinien (W)','min_flow'],['Max. erwartete Leistung (kW)','max_expected_power_kw'],
      ['Animationsgeschwindigkeit','speed_multiplier'],
      ['Maximale Kartenbreite (px)','max_width'],['Netzbezugsgrenze (kW)','contract_power_limit_kw'],
      ['Warnschwelle (0 bis 1)','contract_warning_pct']]) this._input(sec,title,[key],'number');
    this._toggle(sec,'Statistiken anzeigen',['show_stats'],true);
    this._toggle(sec,'Nicht erfassten Verbrauch anzeigen',['show_rest'],true);
    this._toggle(sec,'Nicht erfasst in Listenansicht immer unten',['rest_always_last'],false);
    this._input(sec,'Name für nicht erfassten Verbrauch',['rest_name']);
    this._backupSection();
  }
}
if (!customElements.get('smartify-flow-card-editor')) customElements.define('smartify-flow-card-editor', SmartifyFlowCardEditor);
