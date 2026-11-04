import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Sukoonam home">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M16 6c3 3.5 3 9 0 13-3-4-3-9.5 0-13Z" />
        <path d="M16 19c-2.5-4-7-6-11-5.5 1 4.5 5.5 6.5 11 5.5Z" />
        <path d="M16 19c2.5-4 7-6 11-5.5-1 4.5-5.5 6.5-11 5.5Z" />
        <path d="M6 24h20" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-2xl font-bold tracking-tight ${light ? "text-white" : "text-brand"}`}>
        Sukoonam
      </span>
    </Link>
  );
}
