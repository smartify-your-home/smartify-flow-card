#!/usr/bin/env bash
# Pflicht vor jedem Push / "Ready for review": dieselben Prüfungen wie die CI
# (Validate integration / Publish versioned release). Aufruf: bash scripts/precheck.sh
set -euo pipefail
cd "$(dirname "$0")/.."
# CI läuft in UTC; einige Verlaufstests sind zeitzonenabhängig.
export TZ=UTC

echo ">> unittest";      python -m unittest discover -s tests
echo ">> check_version"; python scripts/check_version.py
echo ">> compileall";    python -m compileall -q custom_components
echo ">> node --check";  node --check custom_components/smartify_flow_card/frontend/smartify-flow-card.js

fail=0
for t in tests/*.cjs; do
  if ! node "$t" >/tmp/precheck-node.log 2>&1; then
    echo "FAIL $t"; tail -20 /tmp/precheck-node.log; fail=1
  fi
done
# Jeder JS-Test muss auch in beiden Workflows laufen.
for t in tests/*.cjs; do
  for wf in .github/workflows/validate.yml .github/workflows/release.yml; do
    grep -q "node $t" "$wf" || { echo "FEHLT in $wf: node $t"; fail=1; }
  done
done
[[ $fail -eq 0 ]] || { echo "Precheck ROT – nicht pushen."; exit 1; }
echo "OK – alle lokalen Prüfungen grün."
