import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewLoginForm } from "@/components/PreviewLoginForm";

export const metadata: Metadata = { title: "Private preview | Sukoonam" };

// The page in front of the whole site while it is a private preview.
export default function PreviewLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-night px-4 py-16">
      <div className="rise-in flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-7 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <svg viewBox="0 0 32 32" className="size-12 text-brand" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path d="M16 6c3 3.5 3 9 0 13-3-4-3-9.5 0-13Z" />
            <path d="M16 19c-2.5-4-7-6-11-5.5 1 4.5 5.5 6.5 11 5.5Z" />
            <path d="M16 19c2.5-4 7-6 11-5.5-1 4.5-5.5 6.5-11 5.5Z" />
            <path d="M6 24h20" strokeLinecap="round" />
          </svg>
          <h1 className="font-display text-2xl font-bold">Sukoonam preview</h1>
          <p className="text-sm text-muted">This is a private preview. Enter the password you were given to continue.</p>
        </div>
        <Suspense>
          <PreviewLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
