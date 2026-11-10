import { NavBar } from "@/components/nav-bar";

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <NavBar />
      <div className="w-full max-w-5xl flex-1 flex flex-col gap-8 p-5">
        {children}
      </div>
    </main>
  );
}
