"""Isolated unit coverage for HA sensor's bounded year archive."""
import ast
from datetime import datetime, timezone
from pathlib import Path
import unittest

source = Path(__file__).resolve().parents[1] / "custom_components/smartify_flow_card/sensor.py"
module = ast.parse(source.read_text(encoding="utf-8"))
fn = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == "current_year_months")

class Dt:
    DEFAULT_TIME_ZONE = timezone.utc
    @staticmethod
    def as_local(value):
        return value

scope = {"datetime": datetime, "timezone": timezone, "dt_util": Dt}
exec(compile(ast.Module(body=[fn], type_ignores=[]), str(source), "exec"), scope)
current_year_months = scope["current_year_months"]

class MonthlyEntityTests(unittest.TestCase):
    def test_archive_only_exposes_current_year(self):
        months = {
            "2025-12": {"kw": 9.5, "start": 1764500000, "first": 1764500000},
            "2026-01": {"kw": 7.21897, "start": 1767500000, "first": 1767500000},
            "2026-11": {"kw": 6.42, "start": 1793900000, "first": 1793900000},
        }
        result = current_year_months(months, datetime(2026, 11, 5, tzinfo=timezone.utc))
        self.assertEqual(set(result), {"2026-01", "2026-11"})
        self.assertEqual(result["2026-01"]["kw"], 7.219)
        self.assertIn("zeitpunkt", result["2026-11"])
        self.assertEqual(len(months), 3, "do not modify the persistent archive")

    def test_empty_and_invalid_entries(self):
        self.assertEqual(current_year_months({}, datetime(2026, 11, 5, tzinfo=timezone.utc)), {})
        self.assertEqual(current_year_months({"2026-10": {}}, datetime(2026, 11, 5, tzinfo=timezone.utc)), {})

if __name__ == "__main__":
    unittest.main()
