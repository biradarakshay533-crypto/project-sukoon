"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { logIn } from "@/lib/auth-actions";
import { FormField, FormMessage, SubmitButton } from "@/components/FormField";

export function LoginForm() {
  const [state, action, pending] = useActionState(logIn, {});
  // The page to return to after logging in, such as the spa being booked.
  const next = useSearchParams().get("next") ?? "";

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormMessage error={state.error} />
      <SubmitButton pending={pending} label="Log in" pendingLabel="Logging in..." />
    </form>
  );
}
