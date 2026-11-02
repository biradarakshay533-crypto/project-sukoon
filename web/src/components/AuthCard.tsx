import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// The centred card shared by the signup and login pages.
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="rise-in w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
