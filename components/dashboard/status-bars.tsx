import type { StatusCount } from "@/lib/stats";
import { BAR } from "./chart-colors";

/** Applications by status: one horizontal bar per status, in pipeline order. */
export function StatusBars({ data }: { data: StatusCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3" aria-hidden>
        {data.map((d) => (
          <li
            key={d.status}
            className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="text-muted-foreground">{d.label}</span>
            <div className="h-4">
              {d.count > 0 && (
                <div
                  className={`${BAR} h-4 rounded-r-[4px]`}
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              )}
            </div>
            <span className="tabular-nums w-16 text-right">
              <span className="font-medium">{d.count}</span>
              <span className="text-muted-foreground"> · {d.pct}%</span>
            </span>
          </li>
        ))}
      </ul>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">View as table</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">Applications by status</caption>
          <thead>
            <tr className="border-b">
              <th className="py-1 font-medium">Status</th>
              <th className="py-1 font-medium text-right">Applications</th>
              <th className="py-1 font-medium text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.status} className="border-b last:border-0">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
                <td className="py-1 text-right tabular-nums">{d.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
