import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/types";

/** Time zone used to decide what "today" is (overdue / due soon). */
export const STATS_TIME_ZONE = "America/Sao_Paulo";

export const WEEKS_SHOWN = 12;
export const DUE_SOON_DAYS = 7;

export type AppRow = { id: string; status: ApplicationStatus; applied_on: string | null };
export type TaskRow = {
  id: string;
  title: string;
  due_date: string | null;
  done: boolean;
  application_id: string;
  applications: { company: string; position: string } | null;
};

export type StatusCount = { status: ApplicationStatus; label: string; count: number; pct: number };
export type WeekCount = { weekStart: string; count: number };
export type TaskDue = {
  id: string;
  title: string;
  due_date: string;
  daysFromToday: number; // negative = overdue
  application_id: string;
  application: string;
};

export type DashboardStats = {
  totalApplications: number;
  active: number;
  offers: number;
  byStatus: StatusCount[];
  weekly: WeekCount[];
  appsWithoutDate: number;
  tasksTotal: number;
  tasksDone: number;
  overdue: TaskDue[];
  dueSoon: TaskDue[];
};

/** Today's date (YYYY-MM-DD) in the stats time zone. */
export function todayIso(now = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: STATS_TIME_ZONE }).format(now);
}

/** Works on calendar dates only (YYYY-MM-DD), in UTC, so no time-zone drift. */
function toUtc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}
function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}
function daysBetween(fromIso: string, toIsoDate: string): number {
  return Math.round((toUtc(toIsoDate).getTime() - toUtc(fromIso).getTime()) / 86_400_000);
}
/** Monday of the week containing `iso`. */
function weekStart(iso: string): string {
  const day = toUtc(iso).getUTCDay(); // 0 = Sunday
  return addDays(iso, -((day + 6) % 7));
}

export function computeStats(apps: AppRow[], tasks: TaskRow[], today: string): DashboardStats {
  const total = apps.length;

  const counts = new Map<ApplicationStatus, number>();
  for (const a of apps) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);
  const byStatus = APPLICATION_STATUSES.map((status) => {
    const count = counts.get(status) ?? 0;
    return {
      status,
      label: STATUS_LABELS[status],
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    };
  });

  // Last WEEKS_SHOWN weeks, oldest first, ending with the current week.
  const currentWeek = weekStart(today);
  const weekly: WeekCount[] = Array.from({ length: WEEKS_SHOWN }, (_, i) => ({
    weekStart: addDays(currentWeek, -7 * (WEEKS_SHOWN - 1 - i)),
    count: 0,
  }));
  const weekIndex = new Map(weekly.map((w, i) => [w.weekStart, i]));
  let appsWithoutDate = 0;
  for (const a of apps) {
    if (!a.applied_on) {
      appsWithoutDate++;
      continue;
    }
    const i = weekIndex.get(weekStart(a.applied_on));
    if (i !== undefined) weekly[i].count++;
  }

  const open = tasks.filter((t) => !t.done);
  const withDue = open
    .filter((t): t is TaskRow & { due_date: string } => t.due_date !== null)
    .map((t) => ({
      id: t.id,
      title: t.title,
      due_date: t.due_date,
      daysFromToday: daysBetween(today, t.due_date),
      application_id: t.application_id,
      application: t.applications
        ? `${t.applications.company} — ${t.applications.position}`
        : "",
    }))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return {
    totalApplications: total,
    active: (counts.get("applied") ?? 0) + (counts.get("interviewing") ?? 0),
    offers: counts.get("offer") ?? 0,
    byStatus,
    weekly,
    appsWithoutDate,
    tasksTotal: tasks.length,
    tasksDone: tasks.length - open.length,
    overdue: withDue.filter((t) => t.daysFromToday < 0),
    dueSoon: withDue.filter((t) => t.daysFromToday >= 0 && t.daysFromToday <= DUE_SOON_DAYS),
  };
}

export type ApplicationTaskSummary = {
  total: number;
  done: number;
  overdue: number;
  nextDue: string | null; // earliest due date of an open task that is not overdue
};

/** Per-application task counts for the kanban cards, keyed by application id. */
export function summarizeTasksByApplication(
  tasks: Pick<TaskRow, "application_id" | "due_date" | "done">[],
  today: string,
): Record<string, ApplicationTaskSummary> {
  const byApp: Record<string, ApplicationTaskSummary> = {};
  for (const t of tasks) {
    const s = (byApp[t.application_id] ??= { total: 0, done: 0, overdue: 0, nextDue: null });
    s.total++;
    if (t.done) s.done++;
    else if (t.due_date && t.due_date < today) s.overdue++;
    else if (t.due_date && (!s.nextDue || t.due_date < s.nextDue)) s.nextDue = t.due_date;
  }
  return byApp;
}
