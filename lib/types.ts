export const APPLICATION_STATUSES = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly unknown[]).includes(value);
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export type Application = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applied_on: string | null;
  notes: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  application_id: string;
  title: string;
  due_date: string | null;
  done: boolean;
  created_at: string;
};

/** Result returned by every server action, shown to the user by the form. */
export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialFormState: FormState = { status: "idle", message: "" };

/** Formats a "YYYY-MM-DD" date column without shifting it across time zones. */
export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
