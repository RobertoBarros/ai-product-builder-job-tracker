"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/form-message";
import { TaskForm } from "@/components/task-form";
import { deleteTask, setTaskDone } from "@/app/(tracker)/tasks/actions";
import { formatDate, initialFormState, type FormState, type Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  /** Shown on the tasks page so each task links back to its application. */
  application?: { id: string; company: string; position: string } | null;
};

export function TaskItem({ task, application }: Props) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<FormState>(initialFormState);
  const [pending, startTransition] = useTransition();

  const handleSaved = useCallback(() => {
    setEditing(false);
    setMessage({ status: "success", message: "Task saved." });
  }, []);

  function toggleDone(checked: boolean) {
    setMessage(initialFormState);
    startTransition(async () => {
      const result = await setTaskDone(task.id, checked);
      if (result.status === "error") setMessage(result);
    });
  }

  function remove() {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    setMessage(initialFormState);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.status === "error") setMessage(result);
    });
  }

  return (
    <li className="border rounded-md p-3 flex flex-col gap-2">
      {editing ? (
        <>
          <TaskForm task={task} onSaved={handleSaved} />
          <div>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.done}
            disabled={pending}
            onCheckedChange={(checked) => toggleDone(checked === true)}
            aria-label={task.done ? "Mark as not done" : "Mark as done"}
          />
          <div className="flex-1 min-w-0">
            <p className={cn("font-medium", task.done && "line-through text-muted-foreground")}>
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Due {formatDate(task.due_date)}
              {application && (
                <>
                  {" · "}
                  <Link href={`/applications/${application.id}`} className="underline">
                    {application.company} — {application.position}
                  </Link>
                </>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => {
              setMessage(initialFormState);
              setEditing(true);
            }}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" disabled={pending} onClick={remove}>
            Delete
          </Button>
        </div>
      )}
      <FormMessage state={message} />
    </li>
  );
}
