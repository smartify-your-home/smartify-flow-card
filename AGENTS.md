# Contributor instructions

- Never modify user dashboard YAML, Lovelace storage, device names, labels or consumer configuration when updating JavaScript.
- Bundle `frontend/smartify-flow-card.js` with the integration. `manifest.json` version and `SFC_VERSION` must match.
- Use async `StaticPathConfig` registration and idempotent storage resource sync. Load resource storage *before* calling `async_items`/create/update/delete.
- Never overwrite or directly edit `.storage/lovelace_resources`; use the collection API.
- Preserve the legacy `/local/smartify-flow-card.js` migration logic and do not touch unrelated Lovelace resources.
- Maintain translations, README, CHANGELOG and tests for every release.
- No unexpected UI regressions: entity picker scroll handle, PV priority flow, radial layout and theme colors.
- Test with `python -m unittest discover -s tests -v`, `python -m compileall -q custom_components`, `node --check custom_components/smartify_flow_card/frontend/smartify-flow-card.js`.
- Report whether a real HA integration test has been performed; never infer success from syntax tests.
