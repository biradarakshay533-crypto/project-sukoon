import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { pexelsUrl } from "@/lib/stock-photos";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  // The photo side, shown on wide screens.
  photo?: string;
  tagline?: string;
  points?: string[];
};

const CUSTOMER_POINTS = ["Approved spas across Dharwad", "Pay only if the spa accepts", "100% refundable* if plans change"];

// The split-screen frame shared by the sign-up and login pages.
export function AuthCard({
  title,
  subtitle,
  children,
  photo = "7432859",
  tagline = "Your calm is a few minutes away",
  points = CUSTOMER_POINTS,
}: AuthCardProps) {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-night text-white lg:block">
        <Image src={pexelsUrl(photo, 1400)} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo light />
          <div className="flex flex-col gap-4">
            <p className="max-w-md font-display text-4xl leading-tight font-bold">{tagline}</p>
            <ul className="flex flex-col gap-2 text-white/90">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand text-xs">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center bg-[#faf7f6] px-4 py-10">
        <div className="rise-in w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold lg:mt-0">{title}</h1>
          <p className="mt-1 text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-brand">
            ← Back to Sukoonam
          </Link>
        </div>
      </div>
    </main>
  );
}
