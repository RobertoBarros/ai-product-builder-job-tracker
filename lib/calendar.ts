// Month calendar math on plain strings: months are "YYYY-MM", days "YYYY-MM-DD".
// Everything runs in UTC on calendar dates, so there is no time-zone drift.
// No "@/" imports here: scripts/calendar.test.mjs imports this file directly.

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Returns `value` if it is a valid "YYYY-MM", otherwise `fallback`. */
export function parseMonthParam(value: string | undefined, fallback: string): string {
  return value && MONTH_RE.test(value) ? value : fallback;
}

function toMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/** The month `delta` months after `month` (negative = before). */
export function shiftMonth(month: string, delta: number): string {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return toMonth(d);
}

/** Weeks (Monday first) of ISO dates covering the whole month. */
export function monthGrid(month: string): string[][] {
  const first = new Date(`${month}-01T00:00:00Z`);
  const day = new Date(first);
  day.setUTCDate(1 - ((first.getUTCDay() + 6) % 7)); // back to Monday

  const weeks: string[][] = [];
  while (weeks.length === 0 || toMonth(day) === month) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day.toISOString().slice(0, 10));
      day.setUTCDate(day.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}
