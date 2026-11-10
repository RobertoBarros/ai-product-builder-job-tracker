import { Suspense } from "react";
import { ApplicationBoard } from "@/components/application-board";
import { FormMessage } from "@/components/form-message";
import { NewApplicationDialog } from "@/components/new-application-dialog";
import { requireUser } from "@/lib/auth";
import { summarizeTasksByApplication, todayIso } from "@/lib/stats";
import type { Application } from "@/lib/types";

async function ApplicationList() {
  const supabase = await requireUser();
  // RLS limits this to the logged-in user's rows.
  const [{ data, error }, tasksResult] = await Promise.all([
    supabase.from("applications").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("application_id, due_date, done"),
  ]);

  if (error) {
    return (
      <FormMessage
        state={{ status: "error", message: `Could not load applications: ${error.message}` }}
      />
    );
  }

  const applications = (data ?? []) as Application[];
  if (applications.length === 0) {
    return <p className="text-muted-foreground">No applications yet. Add your first one with the button above.</p>;
  }

  return (
    <>
      {tasksResult.error && (
        <FormMessage
          state={{ status: "error", message: `Could not load tasks: ${tasksResult.error.message}` }}
        />
      )}
      <ApplicationBoard
        applications={applications}
        taskSummaries={summarizeTasksByApplication(tasksResult.data ?? [], todayIso())}
      />
    </>
  );
}

export default function ApplicationsPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Applications</h1>
        <NewApplicationDialog />
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Your applications</h2>
        <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
          <ApplicationList />
        </Suspense>
      </section>
    </>
  );
}
