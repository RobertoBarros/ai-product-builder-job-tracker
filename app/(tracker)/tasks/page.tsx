import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { TaskCalendar, type CalendarTask } from "@/components/task-calendar";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskItem } from "@/components/task-item";
import { requireUser } from "@/lib/auth";
import { monthGrid, parseMonthParam } from "@/lib/calendar";
import { todayIso } from "@/lib/stats";
import type { Task } from "@/lib/types";

type ApplicationRef = { id: string; company: string; position: string };
type TaskWithApplication = Task & { applications: ApplicationRef | null };

type SearchParams = Promise<{ month?: string | string[] }>;

async function TaskList({ searchParams }: { searchParams: SearchParams }) {
  const { month: monthParam } = await searchParams;
  const today = todayIso();
  const month = parseMonthParam(
    typeof monthParam === "string" ? monthParam : undefined,
    today.slice(0, 7),
  );
  const weeks = monthGrid(month);
  const firstDay = weeks[0][0];
  const lastDay = weeks[weeks.length - 1][6];

  const supabase = await requireUser();
  const taskColumns = "*, applications(id, company, position)";
  // RLS limits every query to the logged-in user's rows.
  const [calendarResult, undatedResult, appsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(taskColumns)
      .gte("due_date", firstDay)
      .lte("due_date", lastDay)
      .order("done")
      .order("created_at"),
    supabase.from("tasks").select(taskColumns).is("due_date", null).order("done").order("created_at"),
    supabase
      .from("applications")
      .select("id, company, position")
      .order("company"),
  ]);

  const error = calendarResult.error ?? undatedResult.error ?? appsResult.error;
  if (error) {
    return (
      <FormMessage state={{ status: "error", message: `Could not load tasks: ${error.message}` }} />
    );
  }

  const calendarTasks = (calendarResult.data ?? []) as CalendarTask[];
  const undatedTasks = (undatedResult.data ?? []) as TaskWithApplication[];
  const applications = (appsResult.data ?? []) as ApplicationRef[];

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Your tasks</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tasks belong to an application.{" "}
              <Link href="/applications" className="underline">
                Add an application
              </Link>{" "}
              first.
            </p>
          ) : (
            <AddTaskDialog applications={applications}>
              <Button>Add task</Button>
            </AddTaskDialog>
          )}
        </div>
        <TaskCalendar
          month={month}
          today={today}
          tasks={calendarTasks}
          applications={applications}
        />
      </section>

      {undatedTasks.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold">No due date</h2>
          <ul className="flex flex-col gap-2">
            {undatedTasks.map((t) => (
              <TaskItem key={t.id} task={t} application={t.applications} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <h1 className="text-2xl font-bold">Tasks</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <TaskList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
