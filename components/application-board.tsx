"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, ListChecks } from "lucide-react";
import { startTransition, useOptimistic, useState } from "react";
import { FormMessage } from "@/components/form-message";
import { CRITICAL_ICON } from "@/components/dashboard/chart-colors";
import { updateApplicationStatus } from "@/app/(tracker)/applications/actions";
import type { ApplicationTaskSummary } from "@/lib/stats";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  formatDate,
  type Application,
  type ApplicationStatus,
  type FormState,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const DRAG_TYPE = "application/x-application-id";

function TaskLine({ summary }: { summary: ApplicationTaskSummary }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1" aria-label={`${summary.done} of ${summary.total} tasks done`}>
        <ListChecks size={14} aria-hidden />
        <span className="tabular-nums">
          {summary.done}/{summary.total}
        </span>
      </span>
      {summary.overdue > 0 ? (
        <span className="flex items-center gap-1 font-medium text-foreground">
          <AlertTriangle size={14} className={CRITICAL_ICON} aria-hidden />
          {summary.overdue} overdue
        </span>
      ) : (
        summary.nextDue && (
          <span className="flex items-center gap-1">
            <CalendarClock size={14} aria-hidden />
            Next {formatDate(summary.nextDue)}
          </span>
        )
      )}
    </p>
  );
}

type Props = {
  applications: Application[];
  taskSummaries: Record<string, ApplicationTaskSummary>;
};

export function ApplicationBoard({ applications, taskSummaries }: Props) {
  // Shows the card in its new column right away; falls back to the server
  // data when the move finishes (or fails).
  const [shown, moveShown] = useOptimistic(
    applications,
    (state, move: { id: string; status: ApplicationStatus }) =>
      state.map((a) => (a.id === move.id ? { ...a, status: move.status } : a)),
  );
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [result, setResult] = useState<FormState>({ status: "idle", message: "" });

  function handleDrop(event: React.DragEvent, status: ApplicationStatus) {
    event.preventDefault();
    setDropTarget(null);
    const id = event.dataTransfer.getData(DRAG_TYPE);
    const card = shown.find((a) => a.id === id);
    if (!card || card.status === status) return;

    startTransition(async () => {
      moveShown({ id, status });
      const moved = await updateApplicationStatus(id, status);
      setResult(moved.status === "error" ? moved : { status: "idle", message: "" });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <FormMessage state={result} />
      <div className="grid grid-flow-col auto-cols-[minmax(11rem,1fr)] gap-3 overflow-x-auto pb-2">
        {APPLICATION_STATUSES.map((status) => {
          const cards = shown.filter((a) => a.status === status);
          return (
            <section
              key={status}
              aria-label={STATUS_LABELS[status]}
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
                event.preventDefault();
                setDropTarget(status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDropTarget(null);
                }
              }}
              onDrop={(event) => handleDrop(event, status)}
              className={cn(
                "rounded-md bg-muted p-2 flex flex-col gap-2 transition-shadow",
                dropTarget === status && "ring-2 ring-inset ring-primary",
              )}
            >
              <h3 className="px-1 text-sm font-semibold flex items-center justify-between">
                {STATUS_LABELS[status]}
                <span className="text-muted-foreground font-normal">{cards.length}</span>
              </h3>
              <ul className="flex flex-col gap-2 min-h-16">
                {cards.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/applications/${a.id}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(DRAG_TYPE, a.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      className="block rounded-md border bg-card text-card-foreground p-3 shadow-sm hover:border-primary cursor-grab active:cursor-grabbing"
                    >
                      <p className="font-medium text-sm">{a.company}</p>
                      <p className="text-sm text-muted-foreground">{a.position}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(a.applied_on)}
                      </p>
                      {taskSummaries[a.id] && <TaskLine summary={taskSummaries[a.id]} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
