/* smartify-flow-card – Energiefluss Quellen -> Verbraucher (Label-basiert), E-Paper-Design
 * Inspiriert von ChromaFlow (Aresitoo/chromaflow, MIT) */
const SFC_VERSION = '0.5.9';
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
function sfcSortLoadTiles(tiles) {
  return [...tiles].sort((a, b) =>
    (b.w - a.w) || String(a.key).localeCompare(String(b.key))
  );
}

function sfcAllocateSources(candidates, supply) {
  const allocations = new Map();
  const remaining = {
    pv: Math.max(0, Number(supply.pv) || 0),
    battery: Math.max(0, Number(supply.battery) || 0),
    grid: Math.max(0, Number(supply.grid) || 0),
  };
  const sorted = [...candidates].sort((a, b) => b.w - a.w || a.key.localeCompare(b.key));
  for (const candidate of sorted) {
    let need = Math.max(0, Number(candidate.w) || 0);
    const shares = { pv: 0, battery: 0, grid: 0, unassigned: 0 };
    for (const source of ['pv', 'battery', 'grid']) {
      const assigned = Math.min(need, remaining[source]);
      shares[source] = assigned;
      remaining[source] -= assigned;
      need -= assigned;
    }
    shares.unassigned = Math.max(0, need);
    allocations.set(candidate.key, shares);
  }
  return allocations;
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
      show_stats: true, show_rest: true, rest_name: 'Nicht erfasst',
      max_expected_power_kw: 10, speed_multiplier: 1, font_scale: 1, background_transparency: 0,
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
    this._paths = new Map();
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._build();
  }

  set hass(h) {
    this._h = h;
    if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = null; this._update(); });
    this._maybeEnergy();
  }

  getCardSize() { return 8; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  connectedCallback() {
    if (!this._ro) this._ro = new ResizeObserver(() => this._drawLines());
    if (this._flowEl) this._ro.observe(this._flowEl);
  }
  disconnectedCallback() { if (this._ro) this._ro.disconnect(); }

  /* ---------- helpers ---------- */
  _st(id) { return id && this._h ? this._h.states[id] : undefined; }
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
    return [...new Set([...explicit, ...this._labelEntities()])];
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
      for (const id of [c.solar.energy_total, c.grid.import_total, c.grid.export_total]) {
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

  _today(totalId, legacyDayId) {
    if (totalId) return this._energy[totalId] ?? null;
    // Abwärtskompatibilität mit bereits konfigurierten Tagessensoren.
    return legacyDayId ? this._kwh(legacyDayId) : null;
  }

  /* ---------- model ---------- */
  _compute() {
    const c = this._c, s = c.solar, g = c.grid, b = c.battery;
    const P = Math.max(this._num(s.power), 0);
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
    if (b && b.power) left.push({ key: '_battery', kind: 'battery', name: b.name || 'Speicher', icon: 'mdi:home-battery', color: SFC_COL.battery, w: Bd || Bc, charging: Bc > 0, soc, entity: b.power });
    // One network tile: name, symbol, live power and flow follow the actual direction.
    // Swap the former import/export tower glyphs to match the requested visual direction.
    const gridState = I > c.min_flow ? 'import' : E > c.min_flow ? 'export' : 'neutral';
    left.push({ key: '_grid', kind: 'grid', gridState,
      name: gridState === 'import' ? (g.import_name || 'Netzbezug') : gridState === 'export' ? (g.export_name || 'Netzbelieferung') : 'Netz',
      icon: gridState === 'import' ? 'mdi:transmission-tower-export' : gridState === 'export' ? 'mdi:transmission-tower-import' : 'mdi:transmission-tower',
      color: SFC_COL.grid, w: gridState === 'import' ? I : gridState === 'export' ? E : 0,
      entity: hasBalance ? g.saldo_power : (gridState === 'export' ? g.export_power : g.import_power) });

    const right = shown.map((x) => {
      const name = this._name(x.id), ov = this._ov(x.id);
      return { key: x.id, kind: 'consumer', entity: x.id, name, icon: this._icon(x.id, name), color: this._color(x.id), w: x.w, energy: this._energy[this._energyId(x.id)], activeBadge: ov.active_badge };
    });
    if (overflow.length) right.push({ key: '_other', kind: 'load', name: `Sonstige (${overflow.length})`, icon: 'mdi:dots-horizontal-circle-outline', color: SFC_COL.other, w: overflow.reduce((a, x) => a + x.w, 0) });
    const rest = Math.max(total - measured, 0);
    if (c.show_rest && (rest > mp || (keepRest && rest > mp * 0.5))) { right.push({ key: '_rest', kind: 'load', name: c.rest_name, icon: 'mdi:home-outline', color: SFC_COL.rest, w: rest, entity: c.load_total }); this._shown.add('_rest'); }
    // Alle Stromquellen teilen sich ein jeweils begrenztes Wattbudget.
    // Größte Einzelverbraucher zuerst; keine Quelle darf doppelt vergeben werden.
    const candidates = list.map(x => ({ key: x.id, w: x.w }));
    if (c.show_rest && right.some(n => n.key === '_rest') && rest > 0) {
      candidates.push({ key: '_rest', w: rest });
    }
    const allocations = sfcAllocateSources(candidates, {
      pv: Math.min(pvL, total), battery: Bd, grid: I,
    });
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

    // Sonstige and Nicht erfasst compete equally with named consumers.
    // Preserve radial layout's ring ordering; only classic list is re-sorted.
    if (c.layout !== 'radial') {
      right.splice(0, right.length, ...sfcSortLoadTiles(right));
    }

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
      pvT: this._today(s.energy_total, s.energy_today), impT: this._today(g.import_total, g.import_today), expT: this._today(g.export_total, g.export_today),
      fc: this._kwh(s.forecast_today), fcRem: this._kwh(s.forecast_remaining),
    };
  }

  /* ---------- DOM ---------- */
  _build() {
    const scale = Math.max(0.7, Math.min(1.4, Number(this._c.font_scale) || 1));
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
ha-card{font-family:inherit;border-radius:var(--ha-card-border-radius,12px);padding:16px;overflow:hidden;font-size:${scale}em;background:color-mix(in srgb, var(--ha-card-background, var(--card-background-color, #fff)) ${100 - transparency}%, transparent);}
.title{font-weight:800;font-size:1.05em;margin:0 0 12px 2px;color:var(--sf-txt);text-transform:uppercase;letter-spacing:.06em}
.wrap{max-width:${maxW}px;margin:0 auto}
.flow{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(64px,.75fr) minmax(0,1fr);grid-template-rows:auto}
.col{display:flex;flex-direction:column;justify-content:space-around;gap:var(--sf-gap);position:relative;z-index:1;grid-row:1;min-width:0}
.col.left{grid-column:1}
.col.right{grid-column:3}
/* Radial: Quellen zentral, Verbraucher umlaufend; schmale Karten fallen auf Klassisch zurück. */
.flow.radial{display:block;min-height:560px}
.flow.radial .col{display:block;position:absolute;inset:0;pointer-events:none}
.flow.radial .col.left,.flow.radial .col.right{grid-column:auto}
.flow.radial .node{position:absolute;box-sizing:border-box;width:148px;max-width:148px;pointer-events:auto;padding:7px 8px calc(8px + var(--sf-accent-h))}
.flow.radial .node .val{font-size:1.15em}
.flow.radial .node .nm{font-size:.66em}
.flow.radial .node .bd{font-size:calc(.53em + 2px)}
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
.node.pv-striped::after{background:linear-gradient(to right,var(--smartify-flow-pv-stripe-color,#e3a600) 0%,var(--smartify-flow-pv-stripe-color,#e3a600) var(--pv-pct,0%),var(--c) var(--pv-pct,0%),var(--c) 100%)}
.node.idle{opacity:.45}
.node.warn{background:var(--sf-txt)} .node.warn *{color:var(--sf-bg)!important}
.hd{display:flex;align-items:center;gap:6px;min-width:0}
.hd ha-icon{--mdc-icon-size:18px;color:var(--sf-txt);flex:none}
.nm{font-weight:800;color:var(--sf-txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.72em;letter-spacing:.06em;text-transform:uppercase;flex:1;min-width:0}
.bd{flex:none;box-sizing:border-box;width:auto;max-width:56%;margin:0;text-align:left;align-self:center;font-family:inherit;font-size:calc(.6em + 2px);font-weight:600;letter-spacing:0;padding:2px 6px;border-radius:var(--sf-r);color:var(--sf-txt);
  background:var(--sf-pill-bg);border:var(--sf-pill-bd);white-space:pre;line-height:1.25}
.bd:empty{display:none}
.val .unit{font-size:.8em;font-weight:650;color:var(--sf-txt)}
.val{font-size:1.55em;font-weight:800;line-height:1.15;margin-top:4px;color:var(--sf-txt);white-space:nowrap;font-variant-numeric:tabular-nums}
.sub,.sub2{font-family:inherit;font-size:.76em;font-weight:400;color:var(--sf-sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;display:block}

.sub:empty,.sub2:empty{display:none}
.bar{height:6px;border-radius:var(--sf-r);background:var(--sf-track);border:var(--sf-pill-bd);margin-top:7px;overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--c);transition:width .6s}
.bar.hide{display:none}
.stats{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;margin-top:20px;padding:16px;
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
.row .rt{font-size:.7em;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--sf-txt);display:flex;align-items:center;gap:6px}
.row .rt::before{content:'';width:10px;height:10px;background:var(--c);border:1px solid var(--sf-bc);flex:none}
.row .rp{font-size:1.15em;font-weight:800;color:var(--sf-txt);text-align:right;grid-row:span 2;line-height:1}
.row .rp small{display:block;font-size:.48em;color:var(--sf-sub);font-weight:700;letter-spacing:.05em}
.row .rs{font-size:.76em;color:var(--sf-sub)}
.row .rs b{color:var(--sf-txt)}
.row .bar{grid-column:1 / -1}
@media (max-width:480px){.flow{grid-template-columns:minmax(0,1fr) minmax(36px,.4fr) minmax(0,1fr)}.val{font-size:1.2em}.stats{grid-template-columns:1fr}.ring{margin:0 auto}}
</style>
<ha-card>
  <div class="wrap">
  <div class="title" hidden></div>
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
  </div>
  </div>
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
    if (this._ro) this._ro.observe(this._flowEl);
  }

  _nodeHtml(n) {
    return `<div class="node" data-key="${this._esc(n.key)}" style="--c:${n.color}">
      <div class="hd"><ha-icon icon="${this._esc(n.icon)}"></ha-icon><span class="nm">${this._esc(n.name)}</span><span class="bd"></span></div>
      <div class="val"></div><div class="sub"></div><div class="sub2"></div><div class="bar hide"><i></i></div></div>`;
  }

  _update() {
    if (!this._h || !this._c || !this._flowEl) return;
    const m = this._compute(); this._m = m;
    const sig = m.left.map((n) => n.key + ':' + n.name + ':' + n.icon).join('|') + '#' + m.right.map((n) => n.key + ':' + n.name + ':' + n.icon).join('|');
    if (sig !== this._sig) {
      this._sig = sig;
      this._leftEl.innerHTML = m.left.map((n) => this._nodeHtml(n)).join('');
      this._rightEl.innerHTML = m.right.map((n) => this._nodeHtml(n)).join('');
      for (const el of this.shadowRoot.querySelectorAll('.node')) {
        el.addEventListener('click', () => {
          const n = [...this._m.left, ...this._m.right].find((x) => x.key === el.dataset.key);
          if (n && n.entity) { const ev = new Event('hass-more-info', { bubbles: true, composed: true }); ev.detail = { entityId: n.entity }; this.dispatchEvent(ev); }
        });
      }
    }
    const mf = Number(this._c.idle_power ?? this._c.min_flow ?? 5);
    const set = (n, val, sub, sub2, badge, bar, warn) => {
      const el = this.shadowRoot.querySelector(`.node[data-key="${CSS.escape(n.key)}"]`); if (!el) return;
      // Zahlen bleiben groß, die Einheit wird 20 % kleiner dargestellt.
      const valueEl = el.querySelector('.val');
      const match = String(val).match(/^(.*?)(\s+)(kWh|MWh|Wh|kW|MW|W)$/i);
      if (match) {
        valueEl.replaceChildren(document.createTextNode(match[1] + match[2]));
        const unit = document.createElement('span');
        unit.className = 'unit';
        unit.textContent = match[3];
        valueEl.appendChild(unit);
      } else valueEl.textContent = val;
      el.querySelector('.sub').textContent = sub || '';
      el.querySelector('.sub2').textContent = sub2 || '';
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

      el.querySelector('.bd').textContent = badge || '';
      const b = el.querySelector('.bar'); b.classList.toggle('hide', bar == null);
      if (bar != null) b.firstElementChild.style.width = Math.max(0, Math.min(100, bar)) + '%';
      el.classList.toggle('idle', n.w <= mf);
      // Anteil gelb = priorisiert zugeteilte PV-Leistung, Rest = Gerätefarbe.
      const isLoad = n.kind === 'consumer' || n.key === '_rest' || n.key === '_other';
      el.classList.toggle('pv-striped', isLoad);
      if (isLoad) {
        const percent = Math.max(0, Math.min(100, n.pvPct || 0));
        el.style.setProperty('--pv-pct', percent.toFixed(2) + '%');
        el.title = `Modellierte Zuordnung: PV ${this._fmtW(n.pvW || 0)}, Akku ${this._fmtW(n.batteryW || 0)}, Netz ${this._fmtW(n.gridW || 0)}; Gesamt ${this._fmtW(n.w)} (größte Verbraucher zuerst)`;
      }
      el.classList.toggle('warn', !!warn);
    };
    // Bestehendes kleines Badge rechts im Kopf behalten; Quellenanteile nur untereinander schreiben.
    const percentText = (w, total) => {
      const pct = total > 0 ? 100 * w / total : 0;
      return `${Math.round(pct)} %`;
    };
    const consumerBadge = n => {
      if (n.w <= 0) return '';
      const parts = [];
      if (n.pvW > 0.01) parts.push(`${percentText(n.pvW, n.w)} PV`);
      if (n.batteryW > 0.01) parts.push(`${percentText(n.batteryW, n.w)} Akku`);
      if (n.gridW > 0.01) parts.push(`${percentText(n.gridW, n.w)} Netz`);
      if (n.unassignedW > 0.01) parts.push(`${percentText(n.unassignedW, n.w)} offen`);
      return parts.join('\n');
    };
    for (const n of m.left) {
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
      set(n, this._fmtW(n.w), n.energy != null ? `${this._fmtKwh(n.energy)} kWh heute` : '', '', consumerBadge(n), null);
    }
    this._updateStats(m);
    requestAnimationFrame(() => this._drawLines());
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
    r.querySelector('.ring .pc').innerHTML = `${pctText(autApprox)}<span class="unit">${autApprox == null ? '' : '%'}</span>`;
    r.querySelector('.ring .lb').textContent = hasStorage ? 'AUTARKIE CA.' : 'AUTARKIE';
    r.querySelector('.ring').title = hasStorage
      ? 'Autarkie-Näherung: Für eine genaue Berechnung mit Speicher werden zusätzliche Energiezähler benötigt.'
      : 'Näherung aus PV-Eigenverbrauch und Netzbezug.';
    const row = (i, pct, sub, small) => {
      r.querySelector(`.r${i}p`).innerHTML = `${pctText(pct)}<span class="unit">${pct == null ? '' : '%'}</span><small>${small}</small>`;
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
      hasExp ? `${exp.toFixed(2)} kWh · eingespeist` : 'Einspeisezähler erforderlich',
      'DES PV-ERTRAGS');
  }

  _layoutRadial() {
    if (this._c.layout !== 'radial' || !this._flowEl || !this._m) return;
    const flow = this._flowEl, width = flow.clientWidth;
    const narrow = width < 560;
    flow.classList.toggle('radial-narrow', narrow);
    const nodes = [...flow.querySelectorAll('.node')];
    if (narrow) {
      flow.style.height = '';
      for (const el of nodes) { el.style.left = ''; el.style.top = ''; }
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
    srcNodes.forEach(el => { if (!el) return; el.style.left = `${cx - nodeWidth / 2}px`; el.style.top = `${sy}px`; sy += el.offsetHeight + srcGap; });
    outer.forEach((n, i) => {
      const el = [...this._rightEl.children].find(x => x.dataset.key === n.key);
      if (!el) return;
      const angle = -Math.PI / 2 + 2 * Math.PI * (i / outer.length);
      el.style.left = `${cx + rx * Math.cos(angle) - nodeWidth / 2}px`;
      el.style.top = `${cy + ry * Math.sin(angle) - el.offsetHeight / 2}px`;
    });
  }

  _drawLines() {
    const m = this._m; if (!m || !this._flowEl) return;
    this._layoutRadial();
    const box = this._flowEl.getBoundingClientRect(); if (!box.width) return;
    this._svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
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
      if (!p) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', dash.k);
        this._pg.appendChild(path);
        p = { path, dur: null }; this._paths.set(id, p);
      }
      // Nur PV -> Verbraucher wird dunkelgelb; alle anderen Linien bleiben themebasiert.
      p.path.style.stroke = f.from === '_solar' && !f.gridExport && !f.loop
        ? 'var(--smartify-flow-solar-line-color, #d4a000)'
        : 'var(--smartify-flow-line-color, var(--primary-text-color))';
      p.path.setAttribute('d', d);
      p.path.setAttribute('stroke-width', (1.5 + Math.min(f.w / maxW, 1) * 3).toFixed(2));
      const tgt = f.to.replace(/^_/, '').replace(/^sensor\./, '');
      const ls = this._c.line_speeds || {};
      const mult = (Number(this._c.speed_multiplier) || 1) * (Number(ls[`${f.from.replace(/^_/, '')}_${tgt}`]) || 1);
      const speed = (14 + Math.min(f.w, maxW) / 40) * mult; // px/s
      const dur = Math.max(0.1, Math.round((dash.p / speed) * 10) / 10);
      if (dur !== p.dur) { p.dur = dur; p.path.style.animationDuration = dur + 's'; }
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
    const all = this._entities();
    if (mode === 'power') return all.filter(x =>
      x.id.startsWith('sensor.') &&
      (x.device_class === 'power' || ['w', 'kw', 'mw'].includes(x.unit.trim().toLowerCase())));
    if (mode === 'energy') return all.filter(x =>
      x.id.startsWith('sensor.') &&
      (x.device_class === 'energy' || ['wh', 'kwh', 'mwh'].includes(x.unit.trim().toLowerCase())));
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
    const h = document.createElement('h3');
    const ic = document.createElement('ha-icon'); ic.setAttribute('icon', icon);
    h.append(ic, document.createTextNode(name)); section.append(h);
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
  _picker(section, title, path, mode = 'entity', hint = '') {
    const shell = document.createElement('div'); shell.className = 'picker';
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
    shell.append(input, dropdown, track);
    const obj = { input, dropdown, path, mode, current: '', active: 0, filtered: [] };
    const val = this._get(path) || '';
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
    input.addEventListener('input', () => { this._closePickers(obj); update(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.hidden = true; input.value = this._display(obj.current, mode); }
      if (e.key === 'ArrowDown' && !dropdown.hidden) { e.preventDefault(); obj.active = Math.min(obj.active + 1, obj.filtered.length - 1); this._drawSuggestions(obj); }
      if (e.key === 'ArrowUp' && !dropdown.hidden) { e.preventDefault(); obj.active = Math.max(0, obj.active - 1); this._drawSuggestions(obj); }
      if (e.key === 'Enter') {
        if (!dropdown.hidden && obj.filtered[obj.active]) { e.preventDefault(); this._choose(obj, obj.filtered[obj.active].id); }
        else if (mode === 'label') { e.preventDefault(); this._choose(obj, input.value.trim()); }
      }
    });
    // focusout is delayed so pointer selection gets processed first.
    input.addEventListener('blur', () => { setTimeout(() => {
      if (!shell.contains(this.shadowRoot.activeElement)) {
        if (mode === 'label' && input.value.trim() && input.value !== this._display(obj.current, mode)) this._choose(obj, input.value.trim());
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
    return found ? `${found.label}  ·  ${id}` : id;
  }
  _choose(obj, id) {
    obj.current = id;
    obj.input.value = this._display(id, obj.mode);
    obj.dropdown.hidden = true;
    if (obj.path[0] === '_new_consumer') this._config._new_consumer = id;
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
      const icon = document.createElement('ha-icon'); icon.setAttribute('icon', item.icon);
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
    const box = document.createElement('div'); box.className = 'consumers'; section.append(box);
    const make = () => {
      box.replaceChildren();
      for (const id of Object.keys(this._config.consumers || {})) {
        const card = document.createElement('div'); card.className = 'consumer'; box.append(card);
        const heading = document.createElement('div'); heading.className = 'consumer-head';
        const name = document.createElement('b'); name.textContent = this._display(id, 'entity');
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = 'Entfernen';
        remove.addEventListener('click', () => { delete this._config.consumers[id]; this._emit(); this._render(); });
        heading.append(name, remove); card.append(heading);
        for (const prop of ['name', 'icon', 'color', 'energy', 'active_badge']) {
          if (prop === 'energy') this._picker(card, 'Gesamtenergiezähler (kWh, heute automatisch berechnet)', ['consumers', id, prop], 'energy');
          else this._input(card, ({ name:'Anzeigename', icon:'MDI-Icon', color:'Farbe (CSS / HEX)', active_badge:'Aktiv-Badge' })[prop], ['consumers', id, prop]);
        }
      }
    };
    make();
    const row = document.createElement('div'); row.className = 'addrow'; section.append(row);
    this._picker(row, 'Verbraucher hinzufügen (auch ohne Label)', ['_new_consumer'], 'power');
    const add = document.createElement('button'); add.type = 'button'; add.className = 'add'; add.textContent = '+ Verbraucher anpassen';
    add.addEventListener('click', () => {
      const id = this._config._new_consumer;
      if (!id || !id.startsWith('sensor.')) return;
      this._config.consumers[id] ||= {};
      delete this._config._new_consumer;
      this._emit(); this._render();
    });
    section.append(add);
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
  _render() {
    if (!this._config || !this._hass) return;
    this._ready = true;
    this._pickers = [];
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:inherit;--sf-editor-radius:var(--ha-card-border-radius,12px)}
      .intro{padding:12px 14px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);margin-bottom:12px;background:var(--secondary-background-color)}
      .intro b{display:block;margin-bottom:2px}.intro small{color:var(--secondary-text-color)}
      section{border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:14px;margin:10px 0;background:var(--card-background-color)}
      h3{display:flex;gap:9px;align-items:center;font-size:15px;margin:0 0 14px}h3 ha-icon{color:var(--primary-color)}
      .field{margin:0 0 12px;min-width:0}.field>label{display:block;font-size:12px;font-weight:650;margin-bottom:6px;color:var(--secondary-text-color)}
      .field>small{display:block;margin-top:4px;color:var(--secondary-text-color);font-size:11px}
      input:not([type=checkbox]){display:block;box-sizing:border-box;width:100%;min-height:43px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;padding:9px 11px;outline:none}
      input:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 18%,transparent)}
      input[type=checkbox]{accent-color:var(--primary-color);width:20px;height:20px}
      .picker{position:relative}.picker:focus-within{z-index:100}.suggestions{position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:30;height:270px;max-height:min(270px,45vh);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:none;border-radius:var(--sf-editor-radius);background:var(--card-background-color);border:1px solid var(--divider-color);box-shadow:0 8px 26px #0003}
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
      .backup-note{font-size:12px;color:var(--secondary-text-color);line-height:1.5}
      .backup-json{box-sizing:border-box;width:100%;min-height:125px;border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:10px;background:var(--secondary-background-color);color:var(--primary-text-color);font:12px monospace;resize:vertical}
      .backup-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
      .backup-actions button{border:1px solid var(--divider-color);border-radius:var(--sf-editor-radius);padding:9px 11px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
      .backup-status{display:block;color:var(--secondary-text-color)}
      .remove{border:0;background:transparent;color:var(--error-color,#e53935);cursor:pointer}.add{width:100%;background:var(--primary-color);color:var(--text-primary-color,#fff);border:0;border-radius:var(--sf-editor-radius);min-height:40px;cursor:pointer}
    </style><div class="intro"><b>Smartify Flow Card · Visueller Editor</b><small>Entität suchen: Name oder Entity-ID eintippen, mit ↑ ↓ und Enter auswählen.</small></div><div id="body"></div>`;
    this._body = this.shadowRoot.getElementById('body');
    let sec = this._section('Photovoltaik', 'mdi:solar-power');
    this._picker(sec,'PV-Leistung',['solar','power'],'power');
    this._picker(sec,'PV-Gesamtenergiezähler (kWh)',['solar','energy_total'],'energy');
    this._picker(sec,'PV-Prognose heute',['solar','forecast_today'],'energy');
    this._picker(sec,'PV-Prognose verbleibend',['solar','forecast_remaining'],'energy');
    this._input(sec,'Name',['solar','name']);
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
    sec = this._section('Batteriespeicher', 'mdi:home-battery');
    this._picker(sec,'Batterie-Leistung',['battery','power'],'power');
    this._picker(sec,'Ladezustand (SoC)',['battery','soc'],'soc');
    this._input(sec,'Name',['battery','name']);
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
    this._transparencyControl(sec);
    for (const [title,key] of [
      ['Maximal sichtbare Verbraucher','max_consumers'],
      ['Mindestleistung für Energieflusslinien (W)','min_flow'],['Max. erwartete Leistung (kW)','max_expected_power_kw'],
      ['Animationsgeschwindigkeit','speed_multiplier'],['Schriftgröße / Skalierung','font_scale'],
      ['Maximale Kartenbreite (px)','max_width'],['Netzbezugsgrenze (kW)','contract_power_limit_kw'],
      ['Warnschwelle (0 bis 1)','contract_warning_pct']]) this._input(sec,title,[key],'number');
    this._toggle(sec,'Statistiken anzeigen',['show_stats'],true);
    this._toggle(sec,'Nicht erfassten Verbrauch anzeigen',['show_rest'],true);
    this._input(sec,'Name für nicht erfassten Verbrauch',['rest_name']);
    this._backupSection();
  }
}
if (!customElements.get('smartify-flow-card-editor')) customElements.define('smartify-flow-card-editor', SmartifyFlowCardEditor);
