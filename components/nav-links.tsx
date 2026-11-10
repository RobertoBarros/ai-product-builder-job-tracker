"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/tasks", label: "Tasks" },
];

// The current path is only known at request time, so the links render first
// without a highlight and stream in with it.
export function NavLinks() {
  return (
    <Suspense fallback={<Links pathname={null} />}>
      <CurrentLinks />
    </Suspense>
  );
}

function CurrentLinks() {
  return <Links pathname={usePathname()} />;
}

function Links({ pathname }: { pathname: string | null }) {
  return LINKS.map(({ href, label }) => {
    // /applications/[id] still counts as the Applications page.
    const current =
      pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
    return (
      <Link
        key={href}
        href={href}
        aria-current={current ? "page" : undefined}
        className={cn(
          "rounded-md px-3 py-1.5 transition-colors",
          current
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  });
}
