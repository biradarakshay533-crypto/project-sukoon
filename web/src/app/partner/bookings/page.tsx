import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BookingCard } from "@/components/BookingCard";
import { AnswerButtons } from "@/components/BookingButtons";
import { DashboardShell } from "@/components/DashboardShell";
import { currentTime } from "@/lib/booking-time";
import { BOOKING_COLUMNS, bookingStage } from "@/lib/booking-status";
import type { BookingRow } from "@/lib/booking-status";
import { getPartnerContext } from "@/lib/partner";

export const metadata: Metadata = { title: "Booking requests | Sukoonam" };

export default function PartnerBookingsPage() {
  return (
    <DashboardShell>
      <BookingRequests />
    </DashboardShell>
  );
}

async function BookingRequests() {
  const { supabase, spa } = await getPartnerContext();

  if (!spa) {
    redirect("/partner/spa");
  }

  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("spa_id", spa.id)
    .order("starts_at")
    .limit(200);

  const now = currentTime();
  const nowIso = now.toISOString();
  const all = ((data ?? []) as BookingRow[]).map((booking) => ({ booking, stage: bookingStage(booking, now) }));

  const waiting = all.filter((item) => item.stage === "waiting");
  const upcoming = all.filter(
    (item) =>
      item.stage === "accepted" &&
      new Date(item.booking.starts_at).getTime() + item.booking.duration_minutes * 60_000 > now.getTime(),
  );
  const closed = all
    .filter((item) => !waiting.includes(item) && !upcoming.includes(item))
    .reverse()
    .slice(0, 30);

  return (
    <div className="rise-in flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/partner" className="text-sm text-brand hover:underline">
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Booking requests</h1>
        <p className="text-muted">
          Answer each request before its timer runs out. While any partner page is open, new
          requests pop up and ring until you answer them.
        </p>
      </div>

      <Section title={`New requests (${waiting.length})`} empty="No requests waiting right now.">
        {waiting.map(({ booking, stage }) => (
          <BookingCard key={booking.id} booking={booking} stage={stage} nowIso={nowIso} title={booking.customer_name ?? "Customer"}>
            <CustomerContact booking={booking} />
            <AnswerButtons bookingId={booking.id} />
          </BookingCard>
        ))}
      </Section>

      <Section title={`Upcoming visits (${upcoming.length})`} empty="No confirmed visits coming up.">
        {upcoming.map(({ booking, stage }) => (
          <BookingCard key={booking.id} booking={booking} stage={stage} nowIso={nowIso} title={booking.customer_name ?? "Customer"}>
            <CustomerContact booking={booking} />
          </BookingCard>
        ))}
      </Section>

      <Section title="Past and closed" empty="Nothing here yet.">
        {closed.map(({ booking, stage }) => (
          <BookingCard key={booking.id} booking={booking} stage={stage} nowIso={nowIso} title={booking.customer_name ?? "Customer"} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children.length === 0 ? <p className="text-muted">{empty}</p> : <ul className="flex flex-col gap-3">{children}</ul>}
    </section>
  );
}

function CustomerContact({ booking }: { booking: BookingRow }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {booking.customer_phone && (
        <a href={`tel:${booking.customer_phone}`} className="text-brand hover:underline">
          Call {booking.customer_phone}
        </a>
      )}
      {booking.customer_note && <p className="bg-accent-soft px-3 py-2">“{booking.customer_note}”</p>}
    </div>
  );
}
