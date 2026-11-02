import { redirect } from "next/navigation";
import { connection } from "next/server";
import { logOut } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";

type ProfilePanelProps = {
  role: "customer" | "partner";
  nextUp: string;
};

// Shows the signed-in user's details and sends everyone else to the right page.
export async function ProfilePanel({ role, nextUp }: ProfilePanelProps) {
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hello, {profile.full_name}
        </h1>
        <p className="mt-1 text-muted">{profile.email}</p>
      </div>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Your details</h2>
        <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />
      </section>

      <section className="rounded-3xl border border-dashed border-line p-6 text-muted">
        {nextUp}
      </section>

      <form action={logOut}>
        <button type="submit" className="text-brand underline-offset-4 hover:underline">
          Log out
        </button>
      </form>
    </div>
  );
}
