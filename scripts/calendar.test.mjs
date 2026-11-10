import assert from "node:assert/strict";
import { test } from "node:test";
import { monthGrid, parseMonthParam, shiftMonth } from "../lib/calendar.ts";

test("parseMonthParam accepts YYYY-MM and falls back otherwise", () => {
  assert.equal(parseMonthParam("2026-02", "2026-11"), "2026-02");
  assert.equal(parseMonthParam(undefined, "2026-11"), "2026-11");
  assert.equal(parseMonthParam("2026-13", "2026-11"), "2026-11");
  assert.equal(parseMonthParam("2026-00", "2026-11"), "2026-11");
  assert.equal(parseMonthParam("26-02", "2026-11"), "2026-11");
  assert.equal(parseMonthParam("2026-02-01", "2026-11"), "2026-11");
});

test("shiftMonth moves across year boundaries", () => {
  assert.equal(shiftMonth("2026-11", 1), "2026-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-11", 12), "2027-11");
  assert.equal(shiftMonth("2026-11", -12), "2025-11");
});

test("monthGrid returns full Monday-first weeks covering the month", () => {
  // November 2026 starts on a Sunday and ends on a Monday.
  const weeks = monthGrid("2026-11");
  assert.equal(weeks.length, 6);
  assert.ok(weeks.every((w) => w.length === 7));
  assert.equal(weeks[0][0], "2026-10-26"); // Monday before Nov 1
  assert.equal(weeks[0][6], "2026-11-01");
  assert.equal(weeks[5][0], "2026-11-30");
  assert.equal(weeks[5][6], "2026-12-06");
});

test("monthGrid has no extra week when the month fits exactly", () => {
  // February 2027 starts on a Monday and has 28 days: exactly 4 weeks.
  const weeks = monthGrid("2027-02");
  assert.equal(weeks.length, 4);
  assert.equal(weeks[0][0], "2027-02-01");
  assert.equal(weeks[3][6], "2027-02-28");
});
