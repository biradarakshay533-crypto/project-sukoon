import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-display text-2xl font-semibold tracking-tight ${light ? "text-white" : "text-brand"}`}
    >
      Sukoonam
    </Link>
  );
}
