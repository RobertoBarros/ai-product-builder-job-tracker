import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { createClient } from "@/lib/supabase/server";

async function HomeActions() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/applications">Go to applications</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tasks">View tasks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button asChild>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <NavBar />
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center gap-6 p-5 text-center">
        <h1 className="text-4xl font-bold">Job Tracker</h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Keep track of your job applications and the tasks for each one, all
          in one place.
        </p>
        <Suspense fallback={<div className="h-9" />}>
          <HomeActions />
        </Suspense>
      </div>
    </main>
  );
}
