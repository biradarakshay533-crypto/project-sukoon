import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Log in | Sukoonam" };

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Log in to your Sukoonam account.">
      <LoginForm />
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
