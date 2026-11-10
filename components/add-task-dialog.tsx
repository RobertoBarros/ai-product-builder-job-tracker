"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";
import { formatDate } from "@/lib/types";

type Props = {
  applications: { id: string; company: string; position: string }[];
  /** Due date filled in on the form (calendar day); omitted for an empty date. */
  date?: string;
  /** The button that opens the modal. */
  children: React.ReactNode;
};

/** Opens the new-task form in a modal and closes it after a successful save. */
export function AddTaskDialog({ applications, date, children }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          {date && <DialogDescription>Due {formatDate(date)}</DialogDescription>}
        </DialogHeader>
        <TaskForm applications={applications} dueDate={date} onSaved={close} />
      </DialogContent>
    </Dialog>
  );
}
