import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MASSAGE_NAMES, massageHref } from "@/lib/massage-names";

const OFFERS = [
  "Pay only when the spa accepts",
  "100% refundable* (*if cancelled 6+ hours before)",
  "Approved spas only",
  "Now booking across Dharwad",
];

function OfferBar() {
  // The list is repeated so the scroll loops without a gap.
  const items = [...OFFERS, ...OFFERS];

  return (
    <div className="overflow-hidden bg-night py-2 text-sm text-white">
      <div className="marquee flex w-max gap-16 whitespace-nowrap">
        {items.map((offer, index) => (
          <span key={index} aria-hidden={index >= OFFERS.length}>
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}

const navLink =
  "text-[13px] font-medium tracking-wide uppercase transition hover:text-accent";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  );
}

// The offer bar and the sticky top bar shared by every public page.
export function SiteHeader() {
  return (
    <>
      <OfferBar />
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Logo />
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link href="/spas" className={navLink}>
              Find a spa
            </Link>
            <div className="group relative">
              <Link href="/#massages" className={`${navLink} flex items-center gap-1`}>
                Massages
                <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth={1.6} fill="none" />
                </svg>
              </Link>
              <div className="invisible absolute top-full left-1/2 w-64 -translate-x-1/2 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="flex flex-col border border-line bg-white py-2 shadow-xl">
                  {MASSAGE_NAMES.map((name) => (
                    <Link
                      key={name}
                      href={massageHref(name)}
                      className="px-5 py-2 text-sm transition hover:bg-accent-soft"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/#nearby" className={navLink}>
              Near me
            </Link>
            <Link href="/partner/signup" className={navLink}>
              List your spa
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/spas" aria-label="Search spas" className="transition hover:text-accent">
              <SearchIcon />
            </Link>
            <Link href="/account" aria-label="My account" className="transition hover:text-accent">
              <UserIcon />
            </Link>
            <Link
              href="/login"
              className="hidden bg-night px-5 py-2 text-sm font-medium text-white transition hover:bg-accent sm:block"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

// A tap-to-open menu for phones and tablets.
function MobileMenu() {
  return (
    <details className="group relative lg:hidden">
      <summary className="flex cursor-pointer list-none items-center" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-6" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="absolute top-full left-0 z-40 mt-3 flex max-h-[75vh] w-72 flex-col overflow-y-auto border border-line bg-white py-3 shadow-xl">
        <Link href="/spas" className="px-5 py-2.5 font-medium uppercase">
          Find a spa
        </Link>
        <Link href="/#nearby" className="px-5 py-2.5 font-medium uppercase">
          Near me
        </Link>
        <p className="px-5 pt-3 pb-1 text-xs font-semibold tracking-widest text-muted uppercase">Massages</p>
        {MASSAGE_NAMES.map((name) => (
          <Link key={name} href={massageHref(name)} className="px-5 py-2 text-sm">
            {name}
          </Link>
        ))}
        <div className="mt-3 border-t border-line pt-3">
          <Link href="/partner/signup" className="block px-5 py-2.5 font-medium uppercase">
            List your spa
          </Link>
          <Link href="/login" className="block px-5 py-2.5 font-medium uppercase">
            Sign in
          </Link>
        </div>
      </div>
    </details>
  );
}
