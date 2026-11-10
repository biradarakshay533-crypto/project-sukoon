import Link from "next/link";
import { Suspense } from "react";
import { CityChoice, CityPicker } from "@/components/CityPicker";
import { GuestLinks, HeaderAccount } from "@/components/HeaderAccount";
import { Logo } from "@/components/Logo";
import { MASSAGE_NAMES, massageHref } from "@/lib/massage-names";

const navLink = "text-[15px] font-medium transition hover:text-brand";

// The sticky top bar shared by every public page.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5 lg:gap-6">
          <MobileMenu />
          <Logo />
          <CityPicker />
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className={navLink}>
            Home
          </Link>
          <Link href="/spas" className={navLink}>
            Spas
          </Link>
          <div className="group relative">
            <Link href="/#massages" className={`${navLink} flex items-center gap-1`}>
              Massages
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
                <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth={1.6} fill="none" />
              </svg>
            </Link>
            <div className="invisible absolute top-full left-1/2 w-64 -translate-x-1/2 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col rounded-xl border border-line bg-white py-2 shadow-xl">
                {MASSAGE_NAMES.map((name) => (
                  <Link key={name} href={massageHref(name)} className="px-5 py-2 text-sm transition hover:bg-accent-soft hover:text-brand">
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/about" className={navLink}>
            About
          </Link>
          <Link href="/contact" className={navLink}>
            Help
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-5">
          <Suspense fallback={<GuestLinks />}>
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
    </header>
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
      <div className="absolute top-full left-0 z-40 mt-3 flex max-h-[75vh] w-72 flex-col overflow-y-auto rounded-xl border border-line bg-white py-3 shadow-xl">
        <p className="px-5 pb-2 text-xs font-semibold tracking-widest text-muted uppercase">Your city</p>
        <CityChoice />
        <Link href="/spas" className="px-5 py-2.5 font-medium">
          Find a spa
        </Link>
        <Link href="/spas?near=1" className="px-5 py-2.5 font-medium">
          Spas near me
        </Link>
        <p className="px-5 pt-3 pb-1 text-xs font-semibold tracking-widest text-muted uppercase">Massages</p>
        {MASSAGE_NAMES.map((name) => (
          <Link key={name} href={massageHref(name)} className="px-5 py-2 text-sm">
            {name}
          </Link>
        ))}
        <div className="mt-3 border-t border-line pt-3">
          <Link href="/about" className="block px-5 py-2.5 font-medium">
            About
          </Link>
          <Link href="/contact" className="block px-5 py-2.5 font-medium">
            Help
          </Link>
          <Link href="/partner/signup" className="block px-5 py-2.5 font-medium text-brand">
            List your spa
          </Link>
        </div>
      </div>
    </details>
  );
}
