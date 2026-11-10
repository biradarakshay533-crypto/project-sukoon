import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { logOut } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";

type ProfilePanelProps = {
  role: "customer" | "partner";
  nextUp: ReactNode;
  // An optional card shown above nextUp, such as the notifications switch.
  alerts?: ReactNode;
};

// Shows the signed-in user's details and sends everyone else to the right page.
export async function ProfilePanel({ role, nextUp, alerts }: ProfilePanelProps) {
  // Supabase checks the clock when it reads the login, so this must wait for a real visit.
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name, phone")
    .eq("id", userId)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== role) {
    redirect(profile.role === "partner" ? "/partner" : "/account");
  }

  return (
    <div className="rise-in flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-8">
        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-brand/40 blur-3xl" />
        <p className="relative text-sm text-white/70">{role === "partner" ? "Spa partner" : "Welcome back"}</p>
        <h1 className="relative mt-1 font-display text-3xl font-bold">Hello, {profile.full_name}</h1>
        <p className="relative mt-1 text-white/75">{profile.email}</p>
      </div>

      {alerts}

      <section className="rounded-2xl border border-line bg-white p-5 text-foreground shadow-sm sm:p-6">{nextUp}</section>

      <details className="group rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold">
          Your details
          <span className="text-sm font-normal text-brand group-open:hidden">Edit</span>
        </summary>
        <div className="mt-4">
          <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />
        </div>
      </details>

      <form action={logOut}>
        <button type="submit" className="text-sm text-muted underline-offset-4 hover:text-brand hover:underline">
          Log out
        </button>
      </form>
    </div>
  );
}
