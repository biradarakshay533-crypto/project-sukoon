"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { FormMessage, SubmitButton } from "@/components/FormField";
import { enterPreview } from "@/lib/preview-actions";

export function PreviewLoginForm() {
  const [state, action, pending] = useActionState(enterPreview, {});
  const next = useSearchParams().get("next") ?? "/";

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Preview password
        <input
          id="preview-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="rounded-xl border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <FormMessage error={state.error} />
      <SubmitButton pending={pending} label="Open preview" pendingLabel="Checking..." />
    </form>
  );
}
