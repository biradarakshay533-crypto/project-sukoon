import { Suspense } from "react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

// Page frame for signed-in users. The login check streams in behind Suspense.
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
      <Logo />
      <Suspense fallback={<p className="text-muted">Loading your account...</p>}>
        {children}
      </Suspense>
    </main>
  );
}
