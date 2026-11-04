import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { logOut } from "@/lib/auth-actions";

// Page frame for signed-in users. The login check streams in behind Suspense.
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-[#faf7f6]">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/spas" className="hidden transition hover:text-brand sm:inline">
              Find a spa
            </Link>
            <form action={logOut}>
              <button type="submit" className="rounded-lg border border-line px-3.5 py-2 transition hover:border-brand hover:text-brand">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <Suspense fallback={<p className="text-muted">Loading your account...</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
