"""Unit tests without requiring a full Home Assistant installation."""
from __future__ import annotations

import asyncio
import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import AsyncMock

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "custom_components" / "smartify_flow_card"


def import_integration():
    """Supply minimal HA doubles for resource tests."""
    for mod in (
        "homeassistant", "homeassistant.components", "homeassistant.components.http",
        "homeassistant.components.lovelace", "homeassistant.components.lovelace.resources",
        "homeassistant.config_entries", "homeassistant.core", "homeassistant.helpers",
        "homeassistant.helpers.config_validation", "smartify_flow_card",
        "smartify_flow_card.const", "smartify_flow_card.__init__",
        "smartify_flow_card.monthly_peaks", "homeassistant.components.websocket_api",
    ):
        sys.modules.pop(mod, None)

    for name in (
        "homeassistant", "homeassistant.components", "homeassistant.components.http",
        "homeassistant.components.lovelace", "homeassistant.components.lovelace.resources",
        "homeassistant.config_entries", "homeassistant.core", "homeassistant.helpers",
        "homeassistant.helpers.config_validation",
    ):
        mod = types.ModuleType(name)
        if name in {"homeassistant", "homeassistant.components", "homeassistant.helpers"}:
            mod.__path__ = []
        sys.modules[name] = mod

    class ResourceStorageCollection:
        pass

    class StaticPathConfig:
        def __init__(self, path, file, cache_headers):
            self.path, self.file, self.cache_headers = path, file, cache_headers

    sys.modules["homeassistant.components.http"].StaticPathConfig = StaticPathConfig
    sys.modules["homeassistant.components.lovelace.resources"].ResourceStorageCollection = ResourceStorageCollection
    sys.modules["homeassistant.config_entries"].ConfigEntry = type("ConfigEntry", (), {})
    sys.modules["homeassistant.core"].HomeAssistant = type("HomeAssistant", (), {})
    sys.modules["homeassistant.helpers.config_validation"].config_entry_only_config_schema = lambda domain: {}

    # Isolate the new Recorder-backed worker from resource-only tests while
    # retaining start/stop and WebSocket registration behavior.
    websocket_module = types.ModuleType("homeassistant.components.websocket_api")
    websocket_module.async_register_command = lambda _hass, _cmd: None
    sys.modules["homeassistant.components.websocket_api"] = websocket_module
    sys.modules["homeassistant.components"].websocket_api = websocket_module

    peaks_module = types.ModuleType("smartify_flow_card.monthly_peaks")

    class MonthlyPeaks:
        def __init__(self, hass):
            self.hass = hass
            self.started = False
            self.stopped = False

        async def start(self):
            self.started = True

        async def stop(self):
            self.stopped = True

    peaks_module.MonthlyPeaks = MonthlyPeaks
    peaks_module.ws_monthly_peaks = lambda *_args: None
    sys.modules["smartify_flow_card.monthly_peaks"] = peaks_module

    spec = importlib.util.spec_from_file_location(
        "smartify_flow_card", PACKAGE / "__init__.py",
        submodule_search_locations=[str(PACKAGE)],
    )
    mod = importlib.util.module_from_spec(spec)
    sys.modules["smartify_flow_card"] = mod
    spec.loader.exec_module(mod)
    return mod, ResourceStorageCollection


class FlowResourcesTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mod, parent = import_integration()

        class Collection(parent):
            def __init__(self, items=None):
                self.items = list(items or [])
                self.loaded = False
                self.before_loaded = False
                self.next_id = 20

            async def async_get_info(self):
                self.loaded = True

            def async_items(self):
                self.before_loaded |= not self.loaded
                return list(self.items)

            async def async_create_item(self, item):
                self.before_loaded |= not self.loaded
                self.items.append({"id": self.next_id, **item})
                self.next_id += 1

            async def async_update_item(self, item_id, updates):
                self.before_loaded |= not self.loaded
                next(x for x in self.items if x["id"] == item_id).update(updates)

            async def async_delete_item(self, item_id):
                self.items = [x for x in self.items if x["id"] != item_id]

        self.Collection = Collection

    async def test_new_resource_and_idempotence(self):
        c = self.Collection([{"id": 1, "url": "/local/unrelated.js", "res_type": "module"}])
        ha = types.SimpleNamespace(data={"lovelace": types.SimpleNamespace(resource_mode="storage", resources=c)})
        await self.mod._async_register_resource(ha, "0.5.4")
        await self.mod._async_register_resource(ha, "0.5.4")
        self.assertFalse(c.before_loaded)
        self.assertEqual(len(c.items), 2)
        self.assertEqual(c.items[-1]["url"], "/smartify_flow_card/smartify-flow-card.js?v=0.5.4")

    async def test_migrate_legacy_and_update_version(self):
        c = self.Collection([
            {"id": 1, "url": "/local/smartify-flow-card.js?v=0.3.2", "res_type": "js"},
            {"id": 2, "url": "/local/unrelated.js", "res_type": "module"},
        ])
        ha = types.SimpleNamespace(data={"lovelace": types.SimpleNamespace(resource_mode="storage", resources=c)})
        await self.mod._async_register_resource(ha, "0.5.4")
        self.assertEqual(c.items[0]["res_type"], "module")
        self.assertEqual(c.items[0]["url"], "/smartify_flow_card/smartify-flow-card.js?v=0.5.4")
        await self.mod._async_register_resource(ha, "0.5.5")
        self.assertTrue(c.items[0]["url"].endswith("v=0.5.5"))
        self.assertEqual(c.items[1]["url"], "/local/unrelated.js")

    async def test_duplicate_cleanup_only_known_paths(self):
        c = self.Collection([
            {"id": 1, "url": "/smartify_flow_card/smartify-flow-card.js?v=0.5.1", "res_type": "module"},
            {"id": 2, "url": "/local/smartify-flow-card.js", "res_type": "module"},
            {"id": 3, "url": "/hacsfiles/other-card/card.js", "res_type": "module"},
        ])
        ha = types.SimpleNamespace(data={"lovelace": types.SimpleNamespace(resource_mode="storage", resources=c)})
        await self.mod._async_register_resource(ha, "0.5.4")
        self.assertEqual([item["id"] for item in c.items], [1, 3])

    async def test_yaml_mode_untouched(self):
        c = self.Collection([{"id": 2, "url": "/local/other.js", "res_type": "module"}])
        ha = types.SimpleNamespace(data={"lovelace": types.SimpleNamespace(resource_mode="yaml", resources=c)})
        await self.mod._async_register_resource(ha, "0.5.4")
        self.assertFalse(c.loaded)
        self.assertEqual(len(c.items), 1)

    async def test_setup_static_and_resource(self):
        c = self.Collection()
        http = types.SimpleNamespace(async_register_static_paths=AsyncMock())
        ha = types.SimpleNamespace(
            data={"lovelace": types.SimpleNamespace(resource_mode="storage", resources=c)},
            http=http,
            config_entries=types.SimpleNamespace(async_forward_entry_setups=AsyncMock(),async_unload_platforms=AsyncMock()),
        )
        self.assertTrue(await self.mod.async_setup_entry(ha, object()))
        http.async_register_static_paths.assert_awaited_once()
        args = http.async_register_static_paths.await_args.args[0]
        self.assertEqual(args[0].path, "/smartify_flow_card/smartify-flow-card.js")
        # Versioned URL (?v=<version>) => long-lived cache is safe and intended.
        self.assertTrue(args[0].cache_headers)
        self.assertTrue(c.items)


if __name__ == "__main__":
    unittest.main()
