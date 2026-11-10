import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Returns a Supabase client for the logged-in user, or sends them to login. */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");
  return supabase;
}
