"""Persistent monthly quarter-hour maximum of imported grid energy.

Uses only complete five-minute Recorder SUM samples; never estimates peaks
from hourly averages, and never confuses net export with imported energy.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import logging
import math

import probatio as vol
from homeassistant.components import websocket_api
from homeassistant.components.recorder import get_instance
from homeassistant.components.recorder.statistics import statistics_during_period
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)
STORAGE_KEY = "smartify_flow_card_monthly_peaks"
FIVE = 300
QUARTER = 900


def quarter_peaks(points: dict[int, float], start: int, end: int):
    """Yield (quarter start UTC seconds, average import kW) for full intervals.

    Recorder SUM belongs to the end of the labeled 5-minute bucket.
    """
    for t in range((start + QUARTER - 1) // QUARTER * QUARTER, end - QUARTER + 1, QUARTER):
        vals = [points.get(t + offset) for offset in (-FIVE, 0, FIVE, 2 * FIVE)]
        if any(v is None or not math.isfinite(v) for v in vals):
            continue
        diffs = [vals[i + 1] - vals[i] for i in range(3)]
        if any(v < -1e-7 for v in diffs):
            continue
        yield t, max(0.0, sum(diffs) * 4)


class MonthlyPeaks:
    """Maintain persistent per-statistic monthly maxima independently of cards."""

    def __init__(self, hass: HomeAssistant):
        self.hass = hass
        self.storage = Store(hass, 1, STORAGE_KEY)
        self.sensors = {}
        self.lock = asyncio.Lock()
        self.unsub = None

    async def start(self):
        saved = await self.storage.async_load() or {}
        self.sensors = saved.get("sensors", {})
        self.unsub = async_track_time_interval(self.hass, self.tick, timedelta(minutes=5))
        self.hass.async_create_task(self.refresh())

    async def stop(self):
        if self.unsub:
            self.unsub()
            self.unsub = None

    async def tick(self, _now):
        await self.refresh()

    async def register(self, statistic_id: str):
        if statistic_id not in self.sensors:
            self.sensors[statistic_id] = {"months": {}, "last_scan": 0}
            await self.storage.async_save({"sensors": self.sensors})
        await self.refresh()
        return self.view(statistic_id)

    def view(self, statistic_id):
        return self.sensors.get(statistic_id, {}).get("months", {})

    async def refresh(self):
        async with self.lock:
            if not self.sensors:
                return
            now = dt_util.utcnow()
            # A fresh window reaches back nine days, safely within the
            # default ten-day retention and across a month boundary.
            earliest = now - timedelta(days=9)
            last_scan = min((data.get("last_scan", 0) for data in self.sensors.values()), default=0)
            start = max(earliest, datetime.fromtimestamp(last_scan - 3600, timezone.utc)) if last_scan else earliest
            # Never ask for unfinished five-minute intervals.
            end = now.replace(second=0, microsecond=0)
            end -= timedelta(minutes=end.minute % 5)
            ids = set(self.sensors)
            try:
                rows = await get_instance(self.hass).async_add_executor_job(
                    statistics_during_period, self.hass, start, end, ids,
                    "5minute", {"energy": "kWh"}, {"sum"}
                )
            except Exception:
                _LOGGER.exception("Unable to read short-term grid import statistics")
                return
            changed = False
            for stat_id, samples in rows.items():
                points = {}
                for row in samples:
                    v = row.get("sum")
                    if v is None:
                        continue
                    at = row["start"]
                    if isinstance(at, str):
                        at = datetime.fromisoformat(at)
                    if isinstance(at, (int, float)):
                        t = int(at)
                    else:
                        t = int(at.timestamp())
                    try:
                        value = float(v)
                    except (TypeError, ValueError):
                        continue
                    if math.isfinite(value):
                        points[t] = value
                months = self.sensors[stat_id]["months"]
                for timestamp, kw in quarter_peaks(points, int(start.timestamp()), int(end.timestamp())):
                    local = dt_util.as_local(datetime.fromtimestamp(timestamp, timezone.utc))
                    month = local.strftime("%Y-%m")
                    old = months.get(month)
                    if old is None:
                        months[month] = {"kw": round(kw, 5), "start": timestamp,
                                         "first": timestamp, "last": timestamp}
                        changed = True
                    else:
                        if kw > old["kw"]:
                            old["kw"], old["start"] = round(kw, 5), timestamp
                            changed = True
                        if timestamp < old.get("first", timestamp):
                            old["first"] = timestamp
                            changed = True
                        if timestamp > old.get("last", timestamp):
                            old["last"] = timestamp
                            changed = True
            for data in self.sensors.values():
                if data.get("last_scan") != int(end.timestamp()):
                    data["last_scan"] = int(end.timestamp())
                    changed = True
            if changed:
                await self.storage.async_save({"sensors": self.sensors})


@websocket_api.websocket_command({
    vol.Required("type"): "smartify_flow_card/monthly_peaks",
    vol.Required("statistic_id"): str,
})
@websocket_api.async_response
async def ws_monthly_peaks(hass, connection, msg):
    """Register the import counter and return permanently stored peaks."""
    stat_id = msg["statistic_id"]
    if not stat_id.startswith("sensor.") or len(stat_id) > 255:
        connection.send_error(msg["id"], "invalid_statistic", "Expected sensor statistic ID")
        return
    store = hass.data.get("smartify_flow_card", {}).get("monthly_peaks")
    if store is None:
        connection.send_error(msg["id"], "not_ready", "Monthly peak collection not initialized")
        return
    result = await store.register(stat_id)
    connection.send_result(msg["id"], {"months": result})
