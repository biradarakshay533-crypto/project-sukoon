import { createClient } from "@/lib/supabase/server";

// Who is looking at a public page: a customer, a spa partner, or a visitor
// who has not logged in.
export async function getViewerRole() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  if (!userId) {
    return "guest";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "partner" ? "partner" : "customer";
}
