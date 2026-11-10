import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { DUE_SOON_DAYS, type TaskDue } from "@/lib/stats";
import { formatDate } from "@/lib/types";
import { BAR, CRITICAL_ICON, TRACK } from "./chart-colors";

type Props = {
  done: number;
  total: number;
  overdue: TaskDue[];
  dueSoon: TaskDue[];
};

function whenLabel(days: number) {
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function TaskRow({ task }: { task: TaskDue }) {
  const late = task.daysFromToday < 0;
  return (
    // Mobile: "when" + date on one line, task below. Wider screens: one row.
    <li className="grid grid-cols-[1fr_auto] sm:grid-cols-[9rem_1fr_auto] items-baseline gap-x-3 gap-y-0.5 py-2 border-b last:border-0 text-sm">
      <span className="flex items-center gap-1.5 col-start-1 row-start-1">
        {late && <AlertTriangle size={14} className={CRITICAL_ICON} aria-hidden />}
        <span className={late ? "font-medium" : "text-muted-foreground"}>
          {whenLabel(task.daysFromToday)}
        </span>
      </span>
      <span className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {task.title}
        <span className="text-muted-foreground"> · </span>
        <Link
          href={`/applications/${task.application_id}`}
          className="text-muted-foreground underline"
        >
          {task.application}
        </Link>
      </span>
      <span className="text-xs text-muted-foreground tabular-nums col-start-2 row-start-1 sm:col-start-3 text-right">
        {formatDate(task.due_date)}
      </span>
    </li>
  );
}

export function TaskSummary({ done, total, overdue, dueSoon }: Props) {
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          <span className="font-medium tabular-nums">{done}</span>
          <span className="text-muted-foreground"> of {total} tasks done ({pct}%)</span>
        </p>
        <div
          className={`${TRACK} h-2 w-full rounded-full overflow-hidden`}
          role="meter"
          aria-label="Tasks done"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          {done > 0 && <div className={`${BAR} h-full rounded-full`} style={{ width: `${pct}%` }} />}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Overdue</h3>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing overdue.</p>
        ) : (
          <ul>{overdue.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Due in the next {DUE_SOON_DAYS} days</h3>
        {dueSoon.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing due soon.</p>
        ) : (
          <ul>{dueSoon.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
        )}
      </div>
    </div>
  );
}
