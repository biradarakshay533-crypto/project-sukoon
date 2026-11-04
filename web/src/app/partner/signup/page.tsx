import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = { title: "Partner sign up | Sukoonam" };

export default function PartnerSignupPage() {
  return (
    <AuthCard
      title="List your spa"
      subtitle="Create your spa partner account."
      photo="19641830"
      tagline="Grow your spa with Sukoonam"
      points={["Free to list your spa", "Paid booking requests from nearby customers", "Accept or decline in one tap"]}
    >
      <SignupForm role="partner" />
      <p className="mt-6 text-sm text-muted">
        Already a partner?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted">
        Looking to book a spa?{" "}
        <Link href="/signup" className="text-brand hover:underline">
          Sign up as a customer
        </Link>
      </p>
    </AuthCard>
  );
}
