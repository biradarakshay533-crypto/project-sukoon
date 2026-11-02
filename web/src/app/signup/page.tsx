import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = { title: "Sign up | Sukoonam" };

export default function SignupPage() {
  return (
    <AuthCard title="Create your account" subtitle="Book spa visits near you.">
      <SignupForm role="customer" />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted">
        Own a spa?{" "}
        <Link href="/partner/signup" className="text-brand hover:underline">
          Sign up as a partner
        </Link>
      </p>
    </AuthCard>
  );
}
