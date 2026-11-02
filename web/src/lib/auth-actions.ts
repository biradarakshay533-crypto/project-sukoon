"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  success?: string;
};

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function homeFor(role: string) {
  return role === "partner" ? "/partner" : "/account";
}

export async function signUp(_state: FormState, formData: FormData): Promise<FormState> {
  const role = text(formData, "role") === "partner" ? "partner" : "customer";
  const fullName = text(formData, "full_name");
  const phone = text(formData, "phone");
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!fullName) {
    return { error: "Please enter your name." };
  }
  if (!INDIAN_MOBILE.test(phone)) {
    return { error: "Please enter a 10-digit mobile number." };
  }
  if (password.length < 8) {
    return { error: "Your password must have at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name: fullName, phone } },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "This email already has an account. Please log in." };
    }
    if (error.code === "email_address_invalid") {
      return { error: "Please enter a valid email address." };
    }
    return { error: "We could not create your account. Please try again." };
  }

  redirect(homeFor(role));
}

export async function logIn(_state: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(homeFor(profile?.role ?? "customer"));
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const fullName = text(formData, "full_name");
  const phone = text(formData, "phone");

  if (!fullName) {
    return { error: "Please enter your name." };
  }
  if (!INDIAN_MOBILE.test(phone)) {
    return { error: "Please enter a 10-digit mobile number." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  if (!userId) {
    return { error: "Please log in again." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", userId);

  if (error) {
    return { error: "We could not save your changes. Please try again." };
  }

  revalidatePath("/account");
  revalidatePath("/partner");
  return { success: "Your details are saved." };
}
