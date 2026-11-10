import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerRole } from "@/lib/viewer";

function UserIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M6.5 18.5a6.5 6.5 0 0 1 11 0" strokeLinecap="round" />
    </svg>
  );
}

const redButton =
  "shrink-0 whitespace-nowrap rounded-lg bg-brand px-2.5 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-dark sm:px-3.5 sm:text-sm";

// The right side of the header for visitors who have not logged in. Also shown
// for a moment while we check whether someone is logged in.
export function GuestLinks() {
  return (
    <>
      <Link href="/login" className="flex items-center gap-2 text-sm font-medium transition hover:text-brand">
        <UserIcon />
        <span className="hidden xl:inline">Log in / Sign up</span>
      </Link>
      <Link href="/partner/signup" className={redButton}>
        <span className="sm:hidden">Spa owner?</span>
        <span className="hidden sm:inline">For spa owners</span>
      </Link>
    </>
  );
}

// The right side of the header: account links once someone has logged in.
export async function HeaderAccount() {
  const role = await getViewerRole();

  if (role === "guest") {
    return <GuestLinks />;
  }

  if (role === "partner") {
    return (
      <Link href="/partner" className={`${redButton} flex items-center gap-1.5`}>
        <UserIcon className="size-4" />
        My spa
      </Link>
    );
  }

  return (
    <Link href="/account" className="flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-dark">
      <UserIcon />
      <span>My account</span>
    </Link>
  );
}

// Logged-in visitors who open a login or sign-up page go to their own page instead.
export async function RedirectIfLoggedIn() {
  const role = await getViewerRole();
  if (role === "partner") {
    redirect("/partner");
  }
  if (role === "customer") {
    redirect("/account");
  }
  return null;
}
