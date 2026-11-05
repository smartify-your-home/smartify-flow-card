"""Serve the Smartify Flow Card and manage its Lovelace resource.

The Lovelace card configuration remains in the dashboard storage; this
integration NEVER changes consumer/entity configurations or dashboards.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.components import websocket_api
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, LEGACY_RESOURCE_PATH, RESOURCE_PATH
from .monthly_peaks import MonthlyPeaks, ws_monthly_peaks

_LOGGER = logging.getLogger(__name__)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
CARD_FILE = Path(__file__).parent / "frontend" / "smartify-flow-card.js"


def _card_version() -> str:
    """Read the shipped manifest version (which must match the card version)."""
    import json

    with (Path(__file__).parent / "manifest.json").open(encoding="utf-8") as file:
        return json.load(file)["version"]


def _is_own_resource(url: str) -> bool:
    """Match only our known paths; do not touch other cards' resources."""
    return url.split("?", 1)[0] in {RESOURCE_PATH, LEGACY_RESOURCE_PATH}


async def _async_register_resource(hass: HomeAssistant, version: str) -> None:
    """Idempotently install or update our module resource in storage mode."""
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        _LOGGER.warning("Lovelace is unavailable; could not register Flow Card")
        return

    mode = getattr(lovelace, "resource_mode", None)
    resources = getattr(lovelace, "resources", None)
    if isinstance(lovelace, dict):
        mode = lovelace.get("resource_mode", mode)
        resources = lovelace.get("resources", resources)

    if mode == "yaml" or not isinstance(resources, ResourceStorageCollection):
        _LOGGER.warning(
            "Lovelace resources use YAML mode. Add this module manually "
            "to lovelace.resources: %s?v=%s (type: module)",
            RESOURCE_PATH,
            version,
        )
        return

    # REQUIRED: resource storage can be lazy-loaded. Calling async_items() or
    # async_create_item() before loading may overwrite existing resources.
    # async_get_info() ensures the storage is loaded on supported HA versions.
    await resources.async_get_info()

    desired = f"{RESOURCE_PATH}?v={version}"
    matches = [
        item
        for item in resources.async_items()
        if _is_own_resource(str(item.get("url", "")))
    ]

    # Prefer our current URL; otherwise migrate a single legacy /local/ entry.
    primary = next(
        (item for item in matches if str(item.get("url", "")).split("?", 1)[0] == RESOURCE_PATH),
        matches[0] if matches else None,
    )
    if primary is None:
        await resources.async_create_item({"res_type": "module", "url": desired})
        _LOGGER.info("Registered Smartify Flow Card resource %s", desired)
        return

    if primary.get("url") != desired or primary.get("res_type") != "module":
        await resources.async_update_item(
            primary["id"], {"res_type": "module", "url": desired}
        )
        _LOGGER.info("Updated Smartify Flow Card resource to %s", desired)

    # Clean up duplicate known Smartify entries, not unrelated resources.
    for item in matches:
        if item["id"] != primary["id"]:
            await resources.async_delete_item(item["id"])
            _LOGGER.info("Removed duplicate Flow Card resource %s", item["url"])


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register a versioned frontend resource when the integration loads."""
    if not CARD_FILE.is_file():
        _LOGGER.error("Missing Smartify Flow Card JavaScript: %s", CARD_FILE)
        return False

    version = _card_version()
    if DOMAIN not in hass.data:
        # False => no long-lived cache. Version query changes on each release.
        await hass.http.async_register_static_paths(
            [StaticPathConfig(RESOURCE_PATH, str(CARD_FILE), False)]
        )
        peaks = MonthlyPeaks(hass)
        await peaks.start()
        hass.data[DOMAIN] = {"monthly_peaks": peaks}
        websocket_api.async_register_command(hass, ws_monthly_peaks)

    try:
        await _async_register_resource(hass, version)
    except Exception:
        # HA remains operational; report failure rather than overwriting storage.
        _LOGGER.exception(
            "Could not automatically register Flow Card. "
            "Please check Lovelace resources; expected URL: %s?v=%s",
            RESOURCE_PATH,
            version,
        )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry without removing resource or dashboard settings."""
    # Static routes cannot be unregistered by this integration. Leaving the
    # resource intact avoids breaking cards during temporary reloads.
    return True
