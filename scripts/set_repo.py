"""Set the future GitHub repository URL in the manifest (run once)."""

import json
import sys
from pathlib import Path

if len(sys.argv) != 2 or "/" not in sys.argv[1]:
    raise SystemExit("Usage: python scripts/set_repo.py OWNER/REPO")
owner_repo = sys.argv[1].strip().strip("/")
if len(owner_repo.split("/")) != 2 or " " in owner_repo:
    raise SystemExit("Expected OWNER/REPO")
manifest = Path(__file__).resolve().parents[1] / "custom_components/smartify_flow_card/manifest.json"
data = json.loads(manifest.read_text(encoding="utf-8"))
data["documentation"] = f"https://github.com/{owner_repo}"
data["issue_tracker"] = f"https://github.com/{owner_repo}/issues"
manifest.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Repository set to https://github.com/{owner_repo}")
