"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { createTask, updateTask } from "@/app/(tracker)/tasks/actions";
import { initialFormState, type Task } from "@/lib/types";

type Props = {
  /** Editing an existing task. */
  task?: Task;
  /** Adding a task to this application (detail page). */
  applicationId?: string;
  /** Adding a task with an application dropdown (tasks page). */
  applications?: { id: string; company: string; position: string }[];
  onSaved?: () => void;
};

export function TaskForm({ task, applicationId, applications, onSaved }: Props) {
  const [state, formAction, pending] = useActionState(
    task ? updateTask : createTask,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    if (task) onSaved?.();
    else formRef.current?.reset();
  }, [state, task, onSaved]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const prefix = task ? `task-${task.id}` : "new-task";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      {task && <input type="hidden" name="id" value={task.id} />}
      {applicationId && (
        <input type="hidden" name="application_id" value={applicationId} />
      )}

      <div className="flex flex-wrap items-end gap-3">
        {applications && (
          <div className="grid gap-2">
            <Label htmlFor={`${prefix}-application`}>Application</Label>
            <select
              id={`${prefix}-application`}
              name="application_id"
              required
              defaultValue=""
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            >
              <option value="" disabled>
                Choose...
              </option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} — {a.position}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid gap-2 flex-1 min-w-48">
          <Label htmlFor={`${prefix}-title`}>Title</Label>
          <Input
            id={`${prefix}-title`}
            name="title"
            required
            defaultValue={task?.title}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-due`}>Due date</Label>
          <Input
            id={`${prefix}-due`}
            name="due_date"
            type="date"
            defaultValue={task?.due_date ?? ""}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : task ? "Save" : "Add task"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
