"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid, type FormState } from "@/lib/types";

export async function createTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const applicationId = formData.get("application_id");
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "");

  if (!isUuid(applicationId)) {
    return { status: "error", message: "Please choose an application." };
  }
  if (!title) return { status: "error", message: "Title is required." };

  const supabase = await createClient();
  // user_id is filled in by the database; the database also rejects
  // applications that belong to someone else.
  const { error } = await supabase.from("tasks").insert({
    application_id: applicationId,
    title,
    due_date: dueDate || null,
  });
  if (error) {
    return { status: "error", message: `Could not save: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Task saved." };
}

export async function updateTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "");

  if (!isUuid(id)) return { status: "error", message: "Invalid task." };
  if (!title) return { status: "error", message: "Title is required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ title, due_date: dueDate || null })
    .eq("id", id)
    .select("id");
  if (error) {
    return { status: "error", message: `Could not save: ${error.message}` };
  }
  if (!data?.length) return { status: "error", message: "Task not found." };

  revalidatePath("/", "layout");
  return { status: "success", message: "Task saved." };
}

export async function setTaskDone(
  id: string,
  done: boolean,
): Promise<FormState> {
  if (!isUuid(id)) return { status: "error", message: "Invalid task." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .select("id");
  if (error) {
    return { status: "error", message: `Could not update: ${error.message}` };
  }
  if (!data?.length) return { status: "error", message: "Task not found." };

  revalidatePath("/", "layout");
  return { status: "success", message: "" };
}

export async function deleteTask(id: string): Promise<FormState> {
  if (!isUuid(id)) return { status: "error", message: "Invalid task." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    return { status: "error", message: `Could not delete: ${error.message}` };
  }
  if (!data?.length) return { status: "error", message: "Task not found." };

  revalidatePath("/", "layout");
  return { status: "success", message: "" };
}
