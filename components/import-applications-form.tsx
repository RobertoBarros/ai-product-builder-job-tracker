"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { importApplications } from "@/app/(tracker)/applications/actions";
import { initialFormState } from "@/lib/types";

export function ImportApplicationsForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    importApplications,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") onSuccess();
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        First line must be{" "}
        <code className="text-xs">company,position,status,applied_on,notes</code>.
        Status is one of applied, interviewing, offer, rejected, withdrawn. Dates
        use YYYY-MM-DD.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="csv-file">CSV file</Label>
          <Input
            id="csv-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="max-w-xs"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Importing..." : "Import"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
