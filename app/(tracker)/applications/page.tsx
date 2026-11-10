import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { ApplicationForm } from "@/components/application-form";
import { FormMessage } from "@/components/form-message";
import { ImportApplicationsForm } from "@/components/import-applications-form";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, formatDate, type Application } from "@/lib/types";
import { createApplication } from "./actions";

async function ApplicationList() {
  const supabase = await requireUser();
  // RLS limits this to the logged-in user's rows.
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <FormMessage
        state={{ status: "error", message: `Could not load applications: ${error.message}` }}
      />
    );
  }

  const applications = (data ?? []) as Application[];
  if (applications.length === 0) {
    return <p className="text-muted-foreground">No applications yet. Add your first one above.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {applications.map((a) => (
        <li key={a.id}>
          <Link
            href={`/applications/${a.id}`}
            className="border rounded-md p-3 flex flex-wrap items-center gap-3 hover:bg-accent"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium">{a.company}</p>
              <p className="text-sm text-muted-foreground">{a.position}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(a.applied_on)}
            </span>
            <Badge variant="secondary">{STATUS_LABELS[a.status]}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ApplicationsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Applications</h1>
      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Add application</h2>
        <ApplicationForm action={createApplication} submitLabel="Add application" />
      </section>
      <section className="border rounded-md p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Import from CSV</h2>
        <ImportApplicationsForm />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Your applications</h2>
        <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
          <ApplicationList />
        </Suspense>
      </section>
    </>
  );
}
