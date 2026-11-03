"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/auth-actions";
import { FormField, FormMessage, SubmitButton } from "@/components/FormField";

type ProfileFormProps = {
  fullName: string;
  phone: string;
};

export function ProfileForm({ fullName, phone }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField label="Your name" name="full_name" defaultValue={fullName} required />
      <FormField
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        pattern="[6-9][0-9]{9}"
        title="A 10-digit mobile number"
        defaultValue={phone}
        required
      />
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton pending={pending} label="Save changes" pendingLabel="Saving..." />
    </form>
  );
}
