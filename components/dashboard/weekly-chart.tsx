"use client";

import { useState } from "react";
import type { WeekCount } from "@/lib/stats";
import { BAR, GRID } from "./chart-colors";

function weekLabel(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function plural(n: number) {
  return `${n} application${n === 1 ? "" : "s"}`;
}

/** Applications per week: one column per week, hover or focus for details. */
export function WeeklyChart({ data }: { data: WeekCount[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const hovered = active !== null ? data[active] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[1.5rem_1fr] gap-2">
        {/* Y axis: only the top value and zero */}
        <div className="relative h-40 text-xs text-muted-foreground tabular-nums" aria-hidden>
          <span className="absolute right-0 -top-2">{max}</span>
          <span className="absolute right-0 -bottom-2">0</span>
        </div>

        <div className="relative h-40">
          {/* Gridlines: top value and baseline */}
          <div className={`absolute inset-x-0 top-0 border-t ${GRID}`} aria-hidden />
          <div className={`absolute inset-x-0 bottom-0 border-t ${GRID}`} aria-hidden />

          {/* Tooltip */}
          {hovered && active !== null && (
            <div
              role="status"
              className="absolute z-10 -top-14 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm whitespace-nowrap pointer-events-none"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <p className="font-semibold">{plural(hovered.count)}</p>
              <p className="text-muted-foreground">Week of {weekLabel(hovered.weekStart)}</p>
            </div>
          )}

          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.weekStart}
                tabIndex={0}
                aria-label={`Week of ${weekLabel(d.weekStart)}: ${plural(d.count)}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="flex-1 h-full flex items-end justify-center px-[1px] outline-none focus-visible:bg-accent rounded-sm"
              >
                {d.count > 0 && (
                  <div
                    className={`${BAR} w-full max-w-6 rounded-t-[4px] ${
                      active !== null && active !== i ? "opacity-60" : ""
                    }`}
                    style={{ height: `${(d.count / max) * 100}%` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* X axis: label every third week to avoid crowding */}
        <div aria-hidden />
        <div className="flex text-xs text-muted-foreground" aria-hidden>
          {data.map((d, i) => (
            <span key={d.weekStart} className="flex-1 text-center whitespace-nowrap">
              {(data.length - 1 - i) % 3 === 0 ? weekLabel(d.weekStart) : ""}
            </span>
          ))}
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">View as table</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">Applications per week</caption>
          <thead>
            <tr className="border-b">
              <th className="py-1 font-medium">Week of</th>
              <th className="py-1 font-medium text-right">Applications</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.weekStart} className="border-b last:border-0">
                <td className="py-1">{weekLabel(d.weekStart)}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
