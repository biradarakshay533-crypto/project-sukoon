"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/auth-actions";
import { FormField, FormMessage, SubmitButton } from "@/components/FormField";

export function SignupForm({ role }: { role: "customer" | "partner" }) {
  const [state, action, pending] = useActionState(signUp, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="role" value={role} />
      <FormField label="Your name" name="full_name" autoComplete="name" required />
      <FormField
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        pattern="[6-9][0-9]{9}"
        title="A 10-digit mobile number"
        required
      />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField
        label="Password (at least 8 characters)"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <FormMessage error={state.error} />
      <SubmitButton pending={pending} label="Create account" pendingLabel="Creating..." />
    </form>
  );
}
