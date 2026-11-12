import Link from "next/link";
import { connection } from "next/server";
import { Countdown } from "@/components/Countdown";
import { formatBookingTime } from "@/lib/booking-time";
import { createClient } from "@/lib/supabase/server";

// The customer's live booking as a pill above the tab bar, like a food app's
// "arriving in 19 mins": waiting for the spa with a countdown, or confirmed
// with the time. Shows nothing when there is no live booking.
export async function LiveBookingPill() {
  // Supabase checks the clock when it reads the login, so this must wait for a real visit.
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) {
    return null;
  }

  const now = new Date();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, spa_name, service_name, starts_at, status, respond_by")
    .eq("customer_id", userId)
    .in("status", ["requested", "accepted"])
    .gt("starts_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())
    .order("starts_at")
    .limit(5);

  const waiting = bookings?.find((booking) => booking.status === "requested" && booking.respond_by && new Date(booking.respond_by) > now);
  const confirmed = bookings?.find((booking) => booking.status === "accepted");
  const booking = waiting ?? confirmed;
  if (!booking) {
    return null;
  }

  return (
    <Link
      href="/account"
      className="press rise-in pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-white p-2 pr-3 shadow-[0_8px_28px_rgb(28_18_16/0.18)]"
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${waiting ? "alert-pulse bg-accent-soft text-brand" : "bg-green-100 text-green-700"}`}>
        {waiting ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="size-5" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-semibold">{booking.spa_name}</span>
        <span className="block truncate text-xs text-muted">
          {waiting ? "Waiting for the spa to accept" : `${booking.service_name} · ${formatBookingTime(booking.starts_at)}`}
        </span>
      </span>
      <span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-center text-xs leading-tight font-semibold ${waiting ? "bg-brand text-white" : "bg-green-600 text-white"}`}>
        {waiting && booking.respond_by ? <Countdown deadline={booking.respond_by} startedAt={now.toISOString()} /> : "Confirmed"}
      </span>
    </Link>
  );
}
