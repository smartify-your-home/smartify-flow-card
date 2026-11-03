"""Validate that release metadata and user-facing documentation agree.

Run before every GitHub release. Never use a commit SHA as a user-visible
version number: HACS should discover a SemVer GitHub release/tag.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "custom_components/smartify_flow_card/manifest.json"
JS = ROOT / "custom_components/smartify_flow_card/frontend/smartify-flow-card.js"
README = ROOT / "README.md"
CHANGELOG = ROOT / "CHANGELOG.md"


def validate() -> str:
    version = json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
        raise ValueError(f"Invalid SemVer (expected X.Y.Z): {version!r}")
    code = JS.read_text(encoding="utf-8")
    match = re.search(r"\bconst SFC_VERSION\s*=\s*['\"]([^'\"]+)['\"]", code)
    if not match or match.group(1) != version:
        raise ValueError(f"JS SFC_VERSION differs from manifest version {version}")
    readme = README.read_text(encoding="utf-8")
    changelog = CHANGELOG.read_text(encoding="utf-8")
    if f"Integration v{version}" not in readme or f"Karte v{version}" not in readme:
        raise ValueError("README integration/card version is stale")
    if f"/smartify_flow_card/smartify-flow-card.js?v={version}" not in readme:
        raise ValueError("README resource version URL is stale")
    if not re.search(rf"(?m)^##\s+(?:v)?{re.escape(version)}(?:\s|$)", changelog):
        raise ValueError("CHANGELOG lacks a section for current version")
    return version


if __name__ == "__main__":
    print("Version metadata consistent:", validate())
