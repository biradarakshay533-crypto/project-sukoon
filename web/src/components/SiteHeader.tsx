import Link from "next/link";
import { Logo } from "@/components/Logo";

// The top bar for public pages.
export function SiteHeader({ light = false }: { light?: boolean }) {
  const linkStyle = light ? "text-white/90 hover:text-white" : "text-foreground hover:text-brand";

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <Logo light={light} />
        <span
          className={`hidden items-center gap-1 rounded-full px-3 py-1 text-sm sm:flex ${light ? "bg-white/15 text-white" : "bg-accent-soft text-brand-dark"}`}
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
            />
          </svg>
          Dharwad
        </span>
      </div>
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link href="/partner/signup" className={`hidden sm:block ${linkStyle}`}>
          List your spa
        </Link>
        <Link href="/login" className={linkStyle}>
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-4 py-2 font-semibold text-white transition hover:brightness-110"
        >
          Sign up
        </Link>
      </nav>
    </header>
  );
}
