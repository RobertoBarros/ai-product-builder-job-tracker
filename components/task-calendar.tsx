import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskChip } from "@/components/task-chip";
import { monthGrid, shiftMonth } from "@/lib/calendar";
import { formatDate, type Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type ApplicationRef = { id: string; company: string; position: string };
export type CalendarTask = Task & { due_date: string; applications: ApplicationRef | null };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function NavButton({ month, label, children }: { month: string; label: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/tasks?month=${month}`} aria-label={label} title={label}>
        {children}
      </Link>
    </Button>
  );
}

type Props = {
  month: string; // "YYYY-MM"
  today: string; // "YYYY-MM-DD"
  tasks: CalendarTask[];
  /** Choices for the per-day "+" form; the button is hidden when empty. */
  applications: ApplicationRef[];
};

export function TaskCalendar({ month, today, tasks, applications }: Props) {
  const weeks = monthGrid(month);
  const byDay = new Map<string, CalendarTask[]>();
  for (const t of tasks) byDay.set(t.due_date, [...(byDay.get(t.due_date) ?? []), t]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{monthLabel(month)}</h3>
        <div className="flex items-center gap-1">
          <NavButton month={shiftMonth(month, -12)} label="Previous year">
            <ChevronsLeft />
          </NavButton>
          <NavButton month={shiftMonth(month, -1)} label="Previous month">
            <ChevronLeft />
          </NavButton>
          <NavButton month={today.slice(0, 7)} label="Current month">
            Today
          </NavButton>
          <NavButton month={shiftMonth(month, 1)} label="Next month">
            <ChevronRight />
          </NavButton>
          <NavButton month={shiftMonth(month, 12)} label="Next year">
            <ChevronsRight />
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 rounded-md border overflow-hidden" role="grid" aria-label={monthLabel(month)}>
        {WEEKDAYS.map((d) => (
          <div key={d} role="columnheader" className="bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {weeks.flat().map((day) => {
          const inMonth = day.startsWith(month);
          const dayTasks = byDay.get(day) ?? [];
          return (
            <div
              key={day}
              role="gridcell"
              aria-label={day}
              className={cn(
                "group min-h-16 sm:min-h-24 border-t border-l [&:nth-child(7n+1)]:border-l-0 p-1 flex flex-col gap-1",
                !inMonth && "bg-muted/40",
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                    day === today
                      ? "bg-primary text-primary-foreground font-semibold"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {Number(day.slice(8))}
                </span>
                {applications.length > 0 && (
                  <AddTaskDialog date={day} applications={applications}>
                    <button
                      type="button"
                      aria-label={`Add task on ${formatDate(day)}`}
                      title={`Add task on ${formatDate(day)}`}
                      // Hidden until the day is hovered, on devices that can hover; always shown on touch.
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                    >
                      <Plus size={14} />
                    </button>
                  </AddTaskDialog>
                )}
              </div>
              {dayTasks.map((t) => (
                <TaskChip
                  key={t.id}
                  task={t}
                  application={t.applications}
                  overdue={!t.done && t.due_date < today}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
