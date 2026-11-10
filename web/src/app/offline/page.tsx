import type { Metadata } from "next";

export const metadata: Metadata = { title: "You are offline | Sukoonam" };

// Shown by the app when the phone has no internet. It cannot load anything
// else, so everything it needs is on this page.
export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-night px-6 py-20 text-center text-white">
      <svg viewBox="0 0 32 32" className="size-16 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M16 6c3 3.5 3 9 0 13-3-4-3-9.5 0-13Z" />
        <path d="M16 19c-2.5-4-7-6-11-5.5 1 4.5 5.5 6.5 11 5.5Z" />
        <path d="M16 19c2.5-4 7-6 11-5.5-1 4.5-5.5 6.5-11 5.5Z" />
        <path d="M6 24h20" strokeLinecap="round" />
      </svg>
      <h1 className="font-display text-3xl font-bold">You are offline</h1>
      <p className="max-w-sm text-white/80">
        Sukoonam needs the internet to show spas and bookings. Check your mobile data or Wi-Fi, then try again.
      </p>
      {/* A plain link that reloads the page fully, so it works without the app's scripts. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="rounded-lg bg-brand px-6 py-3 font-semibold transition hover:bg-brand-dark">
        Try again
      </a>
    </main>
  );
}
