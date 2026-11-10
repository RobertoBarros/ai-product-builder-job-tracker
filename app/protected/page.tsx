import { redirect } from "next/navigation";

// The login form sends users here; forward them to the Job Tracker.
export default function ProtectedPage() {
  redirect("/applications");
}
