"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  initialFormState,
  type Application,
  type FormState,
} from "@/lib/types";

const fieldClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  application?: Application;
  submitLabel: string;
  onSuccess: () => void;
};

export function ApplicationForm({ action, application, submitLabel, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  useEffect(() => {
    if (state.status === "success") onSuccess();
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {application && <input type="hidden" name="id" value={application.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            required
            defaultValue={application?.company}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            required
            defaultValue={application?.position}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={application?.status ?? "applied"}
            className={`${fieldClass} h-9`}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="applied_on">Application date</Label>
          <Input
            id="applied_on"
            name="applied_on"
            type="date"
            defaultValue={application?.applied_on ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={application?.notes ?? ""}
          className={`${fieldClass} py-2`}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
