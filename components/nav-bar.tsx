import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ColorThemeSwitcher } from "@/components/color-theme-switcher";

export function NavBar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 min-h-16">
      <div className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-y-2 p-3 px-5 text-sm">
        <div className="flex gap-4 sm:gap-6 items-center">
          <Link href="/applications" className="font-semibold">
            Job Tracker
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/applications" className="hover:underline">
            Applications
          </Link>
          <Link href="/tasks" className="hover:underline">
            Tasks
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ColorThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
