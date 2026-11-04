import { connection } from "next/server";
import { RequestAlert } from "@/components/RequestAlert";
import { currentTime } from "@/lib/booking-time";
import { BOOKING_COLUMNS } from "@/lib/booking-status";
import type { BookingRow } from "@/lib/booking-status";
import { createClient } from "@/lib/supabase/server";

// Loads the requests still waiting for the signed-in spa owner. Shows
// nothing for visitors and customers, such as on the partner sign-up page.
export async function PartnerAlerts() {
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;

  if (!userId) {
    return null;
  }

  const { data: spa } = await supabase
    .from("spas")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!spa) {
    return null;
  }

  const now = currentTime();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("spa_id", spa.id)
    .eq("status", "requested")
    .gt("respond_by", now.toISOString())
    .order("respond_by");

  return <RequestAlert requests={(data ?? []) as BookingRow[]} nowIso={now.toISOString()} />;
}
