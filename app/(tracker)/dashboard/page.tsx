import Link from "next/link";
import { Suspense } from "react";
import { FormMessage } from "@/components/form-message";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusBars } from "@/components/dashboard/status-bars";
import { TaskSummary } from "@/components/dashboard/task-summary";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { requireUser } from "@/lib/auth";
import { WEEKS_SHOWN, computeStats, todayIso, type AppRow, type TaskRow } from "@/lib/stats";

async function Dashboard() {
  const supabase = await requireUser();
  // RLS limits both queries to the logged-in user's rows.
  const [appsResult, tasksResult] = await Promise.all([
    supabase.from("applications").select("id, status, applied_on"),
    supabase
      .from("tasks")
      .select("id, title, due_date, done, application_id, applications(company, position)"),
  ]);

  const error = appsResult.error ?? tasksResult.error;
  if (error) {
    return (
      <FormMessage
        state={{ status: "error", message: `Could not load dashboard: ${error.message}` }}
      />
    );
  }

  const stats = computeStats(
    (appsResult.data ?? []) as AppRow[],
    (tasksResult.data ?? []) as unknown as TaskRow[],
    todayIso(),
  );

  if (stats.totalApplications === 0) {
    return (
      <p className="text-muted-foreground">
        No applications yet.{" "}
        <Link href="/applications" className="underline">
          Add your first one
        </Link>{" "}
        to see your stats.
      </p>
    );
  }

  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Key numbers">
        <StatTile label="Total applications" value={stats.totalApplications} />
        <StatTile label="Active" value={stats.active} hint="Applied or interviewing" />
        <StatTile label="Offers" value={stats.offers} />
        <StatTile
          label="Overdue tasks"
          value={stats.overdue.length}
          hint={`${stats.tasksTotal - stats.tasksDone} open tasks`}
          critical
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border rounded-md p-4 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold">Applications by status</h2>
            <p className="text-xs text-muted-foreground">Current status of each application</p>
          </div>
          <StatusBars data={stats.byStatus} />
        </section>

        <section className="border rounded-md p-4 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold">Applications per week</h2>
            <p className="text-xs text-muted-foreground">
              By application date, last {WEEKS_SHOWN} weeks
              {stats.appsWithoutDate > 0 &&
                ` · ${stats.appsWithoutDate} without a date not shown`}
            </p>
          </div>
          <WeeklyChart data={stats.weekly} />
        </section>
      </div>

      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Tasks</h2>
        <TaskSummary
          done={stats.tasksDone}
          total={stats.tasksTotal}
          overdue={stats.overdue}
          dueSoon={stats.dueSoon}
        />
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <Dashboard />
      </Suspense>
    </>
  );
}
