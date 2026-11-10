import { AlertTriangle } from "lucide-react";
import { CRITICAL_ICON } from "./chart-colors";

type Props = {
  label: string;
  value: number;
  hint?: string;
  /** Shows a warning icon when the value is above zero. */
  critical?: boolean;
};

export function StatTile({ label, value, hint, critical }: Props) {
  const warn = critical && value > 0;
  return (
    <div className="border rounded-md p-4 flex flex-col gap-1">
      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
        {warn && <AlertTriangle size={14} className={CRITICAL_ICON} aria-hidden />}
        {label}
      </p>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
