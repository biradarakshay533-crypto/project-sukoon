import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Loads the signed-in partner's spa and turns everyone else away.
export async function getPartnerContext() {
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "partner") {
    redirect("/account");
  }

  const { data: spa } = await supabase
    .from("spas")
    .select()
    .eq("owner_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return { supabase, spa };
}
