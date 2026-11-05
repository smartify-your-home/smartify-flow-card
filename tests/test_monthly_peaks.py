"""Pure tests for monthly quarter-hour aggregation without a running HA core."""
import ast
import math
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "custom_components/smartify_flow_card/monthly_peaks.py"
module = ast.parse(SOURCE.read_text(encoding="utf-8"))
fn = next(node for node in module.body if isinstance(node, ast.FunctionDef) and node.name == "quarter_peaks")
scope = {"math": math}
exec(compile(ast.Module(body=[fn], type_ignores=[]), str(SOURCE), "exec"), scope)
peaks = scope["quarter_peaks"]


class TestMonthlyPeaks(unittest.TestCase):
    def test_full_quarter_and_energy_to_kw(self):
        at = 1762362000  # UTC quarter boundary
        at = at // 900 * 900
        samples = {at - 300: 20.0, at: 20.1, at + 300: 20.3, at + 600: 20.5}
        self.assertEqual(list(peaks(samples, at, at + 900)), [(at, 2.0)])

    def test_absent_samples_do_not_invent_monthly_peak(self):
        at = 1762362000 // 900 * 900
        self.assertEqual(list(peaks({at - 300: 10, at: 11, at + 600: 12}, at, at + 900)), [])

    def test_counter_reset_is_not_peak(self):
        at = 1762362000 // 900 * 900
        samples = {at - 300: 10, at: 11, at + 300: 0.2, at + 600: 0.4}
        self.assertEqual(list(peaks(samples, at, at + 900)), [])

    def test_unfinished_quarter_not_included(self):
        at = 1762362000 // 900 * 900
        samples = {at - 300: 10, at: 11, at + 300: 12, at + 600: 13}
        self.assertEqual(list(peaks(samples, at, at + 600)), [])

    def test_only_import_kwh_not_signed_net_approximation(self):
        at = 1762362000 // 900 * 900
        samples = {at - 300: 2.0, at: 2.0, at + 300: 2.0, at + 600: 2.0}
        self.assertEqual(list(peaks(samples, at, at + 900)), [(at, 0.0)])


if __name__ == "__main__":
    unittest.main()
