import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { ApplicationForm } from "@/components/application-form";
import { DeleteApplicationButton } from "@/components/delete-application-button";
import { FormMessage } from "@/components/form-message";
import { TaskForm } from "@/components/task-form";
import { TaskItem } from "@/components/task-item";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, formatDate, isUuid, type Application, type Task } from "@/lib/types";
import { updateApplication } from "../actions";

async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await requireUser();
  const [appResult, tasksResult] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("tasks")
      .select("*")
      .eq("application_id", id)
      .order("done")
      .order("due_date", { nullsFirst: false }),
  ]);

  if (appResult.error) {
    return (
      <FormMessage
        state={{ status: "error", message: `Could not load application: ${appResult.error.message}` }}
      />
    );
  }
  // Missing, or owned by someone else (RLS hides it).
  if (!appResult.data) notFound();

  const application = appResult.data as Application;
  const tasks = (tasksResult.data ?? []) as Task[];

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/applications" className="text-sm text-muted-foreground hover:underline">
          ← All applications
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{application.company}</h1>
          <Badge variant="secondary">{STATUS_LABELS[application.status]}</Badge>
        </div>
        <p className="text-muted-foreground">
          {application.position} · Applied {formatDate(application.applied_on)}
        </p>
        {application.notes && <p className="whitespace-pre-wrap">{application.notes}</p>}
      </div>

      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Tasks</h2>
        <TaskForm applicationId={application.id} />
        {tasksResult.error ? (
          <FormMessage
            state={{ status: "error", message: `Could not load tasks: ${tasksResult.error.message}` }}
          />
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tasks for this application yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </ul>
        )}
      </section>

      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Edit application</h2>
        <ApplicationForm
          key={`${application.id}`}
          action={updateApplication}
          application={application}
          submitLabel="Save changes"
        />
      </section>

      <section className="flex flex-col gap-2">
        <DeleteApplicationButton id={application.id} />
      </section>
    </>
  );
}

export default function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <ApplicationDetail params={params} />
    </Suspense>
  );
}
