"""Home Assistant sensor for persisted 15-minute monthly import maxima.

The compact entity attributes expose the CURRENT calendar year; the complete
archive remains in the integration Store and can be queried via WebSocket.
"""
from __future__ import annotations

from datetime import datetime, timezone

from homeassistant.components.sensor import SensorEntity, SensorDeviceClass
from homeassistant.const import UnitOfPower
from homeassistant.util import dt as dt_util

from .const import DOMAIN


def current_year_months(stored, now):
    """Return a bounded copy of current-year months without mutating storage."""
    year = now.strftime("%Y")
    return {
        month: {
            "kw": round(float(value["kw"]), 3),
            "zeitpunkt": datetime.fromtimestamp(value["start"], timezone.utc).isoformat(),
            "teilzeitraum": value.get("first", 0) > dt_util.as_local(datetime.strptime(month + "-01", "%Y-%m-%d").replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)).timestamp() + 900,
        }
        for month, value in sorted(stored.items())
        if month.startswith(year + "-") and isinstance(value, dict)
        and value.get("kw") is not None and value.get("start") is not None
    }


class SmartifyMonthlyPeakSensor(SensorEntity):
    """Current-month maximum, with current-year values as attributes."""

    _attr_has_entity_name = True
    _attr_name = "Max. 15-Min.-Netzbezug"
    _attr_native_unit_of_measurement = UnitOfPower.KILO_WATT
    _attr_device_class = SensorDeviceClass.POWER
    _attr_icon = "mdi:gauge"

    def __init__(self, store, statistic_id):
        self.store = store
        self.statistic_id = statistic_id
        self._attr_unique_id = "monthly_peak_" + statistic_id

    @property
    def native_value(self):
        now = dt_util.now()
        month = now.strftime("%Y-%m")
        item = self.store.view(self.statistic_id).get(month)
        return round(float(item["kw"]), 3) if item and item.get("kw") is not None else None

    @property
    def extra_state_attributes(self):
        now = dt_util.now()
        months = current_year_months(self.store.view(self.statistic_id), now)
        current = months.get(now.strftime("%Y-%m"))
        return {
            "netzbezugszaehler": self.statistic_id,
            "jahr": now.year,
            "zeitpunkt": current["zeitpunkt"] if current else None,
            "monatswerte": months,
        }


async def async_setup_entry(hass, entry, async_add_entities):
    """Add an entity for every registered counter, including future counters."""
    store = hass.data[DOMAIN]["monthly_peaks"]

    sensors = {}

    def on_change(stat_id):
        if stat_id not in sensors:
            sensors[stat_id] = SmartifyMonthlyPeakSensor(store, stat_id)
            async_add_entities([sensors[stat_id]])
        elif sensors[stat_id].hass is not None:
            sensors[stat_id].async_write_ha_state()

    remove = store.subscribe(on_change)
    entry.async_on_unload(remove)
    for stat_id in store.sensors:
        on_change(stat_id)
