import Link from "next/link";
import { BookingCard } from "@/components/BookingCard";
import { CancelRequestButton } from "@/components/BookingButtons";
import { LiveRefresh } from "@/components/LiveRefresh";
import { currentTime } from "@/lib/booking-time";
import { BOOKING_COLUMNS, bookingStage } from "@/lib/booking-status";
import type { BookingRow } from "@/lib/booking-status";
import { createClient } from "@/lib/supabase/server";

// The signed-in customer's booking history, newest first.
export async function CustomerBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);

  const bookings = (data ?? []) as BookingRow[];
  const now = currentTime();
  const nowIso = now.toISOString();
  const withStage = bookings.map((booking) => ({ booking, stage: bookingStage(booking, now) }));
  const waiting = withStage.filter((item) => item.stage === "waiting").length;

  return (
    <div id="bookings" className="flex scroll-mt-24 flex-col gap-4 text-foreground">
      <h2 className="font-display text-xl font-bold">My bookings</h2>
      {waiting > 0 && <LiveRefresh />}

      {bookings.length === 0 ? (
        <div className="flex flex-col items-start gap-3 text-muted">
          <p>You have no bookings yet.</p>
          <Link
            href="/spas"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
          >
            Find a spa
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {withStage.map(({ booking, stage }) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              stage={stage}
              nowIso={nowIso}
              title={
                <Link href={`/spas/${booking.spa_id}`} className="hover:underline">
                  {booking.spa_name}
                </Link>
              }
            >
              {stage === "waiting" && <CancelRequestButton bookingId={booking.id} />}
              {stage === "accepted" && (
                <p className="text-sm text-green-900">The spa is expecting you. Please arrive a few minutes early.</p>
              )}
            </BookingCard>
          ))}
        </ul>
      )}
    </div>
  );
}
