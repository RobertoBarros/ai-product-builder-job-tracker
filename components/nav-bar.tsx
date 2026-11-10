import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export function NavBar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-6 items-center">
          <Link href="/applications" className="font-semibold">
            Job Tracker
          </Link>
          <Link href="/applications" className="hover:underline">
            Applications
          </Link>
          <Link href="/tasks" className="hover:underline">
            Tasks
          </Link>
        </div>
        <Suspense>
          <AuthButton />
        </Suspense>
      </div>
    </nav>
  );
}
