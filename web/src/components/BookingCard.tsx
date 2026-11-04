import type { ReactNode } from "react";
import { Countdown } from "@/components/Countdown";
import { formatBookingTime } from "@/lib/booking-time";
import { STAGE_LABELS } from "@/lib/booking-status";
import type { BookingRow } from "@/lib/booking-status";
import { formatRupees } from "@/lib/format";

type BookingCardProps = {
  booking: BookingRow;
  stage: string;
  nowIso: string;
  title: ReactNode;
  children?: ReactNode;
};

// One booking: what, when, how much and where it stands.
export function BookingCard({ booking, stage, nowIso, title, children }: BookingCardProps) {
  const label = STAGE_LABELS[stage] ?? STAGE_LABELS.expired;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted">
            {booking.service_name} · {booking.duration_minutes} min · {formatRupees(booking.price_paise)}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${label.style}`}>{label.label}</span>
      </div>
      <p className="font-display text-lg font-semibold text-foreground">{formatBookingTime(booking.starts_at)}</p>
      {stage === "waiting" && booking.respond_by && (
        <p className="text-sm text-amber-900">
          Answer due: <Countdown deadline={booking.respond_by} startedAt={nowIso} />
        </p>
      )}
      {children}
    </li>
  );
}
