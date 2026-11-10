import Link from "next/link";
import { Suspense } from "react";
import { FormMessage } from "@/components/form-message";
import { TaskForm } from "@/components/task-form";
import { TaskItem } from "@/components/task-item";
import { requireUser } from "@/lib/auth";
import type { Task } from "@/lib/types";

type ApplicationRef = { id: string; company: string; position: string };
type TaskWithApplication = Task & { applications: ApplicationRef | null };

async function TaskList() {
  const supabase = await requireUser();
  // RLS limits both queries to the logged-in user's rows.
  const [tasksResult, appsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, applications(id, company, position)")
      .order("done")
      .order("due_date", { nullsFirst: false }),
    supabase
      .from("applications")
      .select("id, company, position")
      .order("company"),
  ]);

  const error = tasksResult.error ?? appsResult.error;
  if (error) {
    return (
      <FormMessage state={{ status: "error", message: `Could not load tasks: ${error.message}` }} />
    );
  }

  const tasks = (tasksResult.data ?? []) as TaskWithApplication[];
  const applications = (appsResult.data ?? []) as ApplicationRef[];

  return (
    <>
      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Add task</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tasks belong to an application.{" "}
            <Link href="/applications" className="underline">
              Add an application
            </Link>{" "}
            first.
          </p>
        ) : (
          <TaskForm applications={applications} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Your tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} application={t.applications} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function TasksPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Tasks</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <TaskList />
      </Suspense>
    </>
  );
}
