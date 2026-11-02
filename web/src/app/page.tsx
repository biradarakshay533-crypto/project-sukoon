import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rise-in flex max-w-xl flex-col items-center gap-6">
        <Logo />
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find your calm at a spa near you
        </h1>
        <p className="text-lg text-muted">
          Browse massages, compare spas and book your visit in minutes.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-brand px-7 py-3 font-medium text-white transition hover:bg-brand-dark"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-line bg-card px-7 py-3 font-medium transition hover:border-brand"
          >
            Log in
          </Link>
        </div>
        <Link href="/partner/signup" className="text-brand underline-offset-4 hover:underline">
          Own a spa? List it on Sukoonam
        </Link>
      </div>
    </main>
  );
}
