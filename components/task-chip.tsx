"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CRITICAL_ICON } from "@/components/dashboard/chart-colors";
import { TaskItem } from "@/components/task-item";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  application: { id: string; company: string; position: string } | null;
  overdue: boolean;
};

/** A task on the calendar; opens the full task item (done, edit, delete) in a modal. */
export function TaskChip({ task, application, overdue }: Props) {
  const label = `${task.title}${application ? ` — ${application.company}` : ""}`;

  return (
    <Dialog>
      <DialogTrigger
        title={label}
        aria-label={`${label}${task.done ? " (done)" : overdue ? " (overdue)" : ""}`}
        className={cn(
          "w-full flex items-center gap-1 rounded px-1 py-0.5 text-left text-xs min-h-2 sm:min-h-0",
          task.done
            ? "bg-muted-foreground/15 text-muted-foreground line-through"
            : overdue
              ? "bg-red-500/15 text-foreground"
              : "bg-primary/15 text-foreground",
        )}
      >
        {overdue && (
          <AlertTriangle size={12} className={cn(CRITICAL_ICON, "hidden sm:block shrink-0")} aria-hidden />
        )}
        <span className="hidden sm:block truncate">{task.title}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Task</DialogTitle>
        </DialogHeader>
        <ul>
          <TaskItem task={task} application={application} />
        </ul>
      </DialogContent>
    </Dialog>
  );
}
