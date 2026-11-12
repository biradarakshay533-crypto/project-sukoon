"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/auth-actions";
import { PREVIEW_COOKIE, previewPassword, previewToken } from "@/lib/preview-gate";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

// Checks the preview password and remembers this browser for 30 days.
export async function enterPreview(_state: FormState, formData: FormData): Promise<FormState> {
  const password = previewPassword();
  const typed = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (password) {
    const [wanted, given] = await Promise.all([previewToken(password), previewToken(typed)]);
    if (wanted !== given) {
      // A short pause makes guessing many passwords slow.
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { error: "That password is not right. Please check it and try again." };
    }

    (await cookies()).set(PREVIEW_COOKIE, wanted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
  }

  // Only go back to a page on this site.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
