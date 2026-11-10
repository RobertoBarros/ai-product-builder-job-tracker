import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "text-sm rounded-md px-3 py-2",
        state.status === "success"
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-red-500/10 text-red-700 dark:text-red-400",
      )}
    >
      {state.message}
    </p>
  );
}
