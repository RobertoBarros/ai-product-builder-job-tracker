"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/csv";
import { APPLICATION_STATUSES, isUuid, type FormState } from "@/lib/types";

const CSV_COLUMNS = ["company", "position", "status", "applied_on", "notes"];
const MAX_CSV_BYTES = 1024 * 1024; // 1 MB
const MAX_CSV_ROWS = 500;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Validates one application, from the form or from a CSV row. */
function validateApplication(input: {
  company?: string;
  position?: string;
  status?: string;
  applied_on?: string;
  notes?: string;
}) {
  const company = (input.company ?? "").trim();
  const position = (input.position ?? "").trim();
  const status = (input.status ?? "").trim();
  const appliedOn = (input.applied_on ?? "").trim();
  const notes = (input.notes ?? "").trim();

  if (!company) return { error: "Company is required." } as const;
  if (!position) return { error: "Position is required." } as const;
  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return {
      error: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}.`,
    } as const;
  }
  if (appliedOn && !isValidDate(appliedOn)) {
    return { error: "Application date must be a valid date (YYYY-MM-DD)." } as const;
  }

  return {
    values: {
      company,
      position,
      status,
      applied_on: appliedOn || null,
      notes: notes || null,
    },
  } as const;
}

function readApplicationFields(formData: FormData) {
  const get = (name: string) => String(formData.get(name) ?? "");
  return validateApplication({
    company: get("company"),
    position: get("position"),
    status: get("status"),
    applied_on: get("applied_on"),
    notes: get("notes"),
  });
}

export async function importApplications(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please choose a CSV file." };
  }
  if (file.size > MAX_CSV_BYTES) {
    return { status: "error", message: "The file is too large (max 1 MB)." };
  }

  let records: string[][];
  try {
    records = parseCsv(await file.text());
  } catch (err) {
    return {
      status: "error",
      message: `Could not read the CSV: ${err instanceof Error ? err.message : "invalid file"}`,
    };
  }

  const [header, ...rows] = records;
  const headerNames = (header ?? []).map((h) => h.trim().toLowerCase());
  if (headerNames.join(",") !== CSV_COLUMNS.join(",")) {
    return {
      status: "error",
      message: `The first line must be exactly: ${CSV_COLUMNS.join(",")}`,
    };
  }
  if (rows.length === 0) {
    return { status: "error", message: "The CSV has no applications to import." };
  }
  if (rows.length > MAX_CSV_ROWS) {
    return {
      status: "error",
      message: `Too many rows (${rows.length}). The limit is ${MAX_CSV_ROWS} per file.`,
    };
  }

  // Check every row first; import nothing if any row is invalid.
  type ApplicationValues = Extract<
    ReturnType<typeof validateApplication>,
    { values: unknown }
  >["values"];
  const values: ApplicationValues[] = [];
  const problems: string[] = [];
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for the header, +1 to count from 1
    if (row.length !== CSV_COLUMNS.length) {
      problems.push(
        `Row ${rowNumber}: expected ${CSV_COLUMNS.length} columns, found ${row.length}.`,
      );
      return;
    }
    const [company, position, status, applied_on, notes] = row;
    const result = validateApplication({ company, position, status, applied_on, notes });
    if ("error" in result) problems.push(`Row ${rowNumber}: ${result.error}`);
    else values.push(result.values);
  });

  if (problems.length) {
    const shown = problems.slice(0, 5).join(" ");
    const more = problems.length > 5 ? ` (and ${problems.length - 5} more)` : "";
    return {
      status: "error",
      message: `Nothing was imported. ${shown}${more}`,
    };
  }

  const supabase = await createClient();
  // One insert for all rows: either every row is saved or none are.
  const { error } = await supabase.from("applications").insert(values);
  if (error) {
    return { status: "error", message: `Nothing was imported: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return {
    status: "success",
    message: `Imported ${values.length} application${values.length === 1 ? "" : "s"}.`,
  };
}

export async function createApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields = readApplicationFields(formData);
  if ("error" in fields) return { status: "error", message: fields.error! };

  const supabase = await createClient();
  // user_id is filled in by the database from the logged-in user.
  const { error } = await supabase.from("applications").insert(fields.values);
  if (error) {
    return { status: "error", message: `Could not save: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Application saved." };
}

export async function updateApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  if (!isUuid(id)) return { status: "error", message: "Invalid application." };

  const fields = readApplicationFields(formData);
  if ("error" in fields) return { status: "error", message: fields.error! };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update(fields.values)
    .eq("id", id)
    .select("id");
  if (error) {
    return { status: "error", message: `Could not save: ${error.message}` };
  }
  if (!data?.length) {
    return { status: "error", message: "Application not found." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Changes saved." };
}

export async function deleteApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  if (!isUuid(id)) return { status: "error", message: "Invalid application." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    return { status: "error", message: `Could not delete: ${error.message}` };
  }
  if (!data?.length) {
    return { status: "error", message: "Application not found." };
  }

  revalidatePath("/", "layout");
  redirect("/applications");
}
