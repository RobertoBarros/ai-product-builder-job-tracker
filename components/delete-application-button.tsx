"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { deleteApplication } from "@/app/(tracker)/applications/actions";
import { initialFormState } from "@/lib/types";

export function DeleteApplicationButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteApplication,
    initialFormState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Delete this application and all of its tasks?")) {
          event.preventDefault();
        }
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Deleting..." : "Delete application"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
