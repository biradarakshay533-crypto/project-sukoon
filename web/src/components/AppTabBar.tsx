"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: "M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5",
    active: (path: string) => path === "/",
  },
  {
    href: "/spas",
    label: "Spas",
    icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4",
    active: (path: string) => path === "/spas" || path.startsWith("/spas/"),
  },
  {
    href: "/spas?view=map",
    label: "Map",
    icon: "M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11v13.5",
    active: () => false,
  },
  {
    href: "/account",
    label: "Bookings",
    icon: "M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10ZM4 10h16M8.5 3v4m7-4v4",
    active: (path: string) => path.startsWith("/account"),
  },
];

// A floating tab bar for phones, like a native app, with the visitor's live
// booking (if any) shown just above it.
export function AppTabBar({ pill }: { pill?: ReactNode }) {
  return <TabBarView path={usePathname()} pill={pill} />;
}

// The same bar before the page address is known, with no tab highlighted.
export function TabBarView({ path, pill }: { path: string; pill?: ReactNode }) {
  return (
    <div className="app-tabbar pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] md:hidden">
      {pill}
      <nav aria-label="Main" className="pointer-events-auto mx-auto flex w-full max-w-md items-stretch justify-around rounded-2xl border border-line bg-white/95 p-1.5 shadow-[0_8px_28px_rgb(28_18_16/0.18)] backdrop-blur">
        {TABS.map((tab) => {
          const on = tab.active(path);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={on ? "page" : undefined}
              className={`press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition ${on ? "bg-accent-soft text-brand" : "text-muted"}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.8} className="size-6" aria-hidden="true">
                <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
