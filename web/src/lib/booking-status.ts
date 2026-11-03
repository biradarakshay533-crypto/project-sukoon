// The columns both booking lists read.
export const BOOKING_COLUMNS =
  "id, spa_id, spa_name, service_name, duration_minutes, price_paise, starts_at, status, respond_by, customer_name, customer_phone, customer_email, customer_note";

export type BookingRow = {
  id: string;
  spa_id: string;
  spa_name: string;
  service_name: string;
  duration_minutes: number;
  price_paise: number;
  starts_at: string;
  status: string;
  respond_by: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_note: string | null;
};

// A request the spa did not answer in time still says "requested" in the
// database, so the deadline decides whether it is still waiting.
export function bookingStage(booking: BookingRow, now: Date) {
  if (booking.status === "requested") {
    const deadline = booking.respond_by ? new Date(booking.respond_by) : null;
    return deadline && deadline > now ? "waiting" : "expired";
  }
  return booking.status;
}

export const STAGE_LABELS: Record<string, { label: string; style: string }> = {
  waiting: { label: "Waiting for the spa", style: "bg-amber-100 text-amber-900" },
  accepted: { label: "Confirmed", style: "bg-green-100 text-green-900" },
  declined: { label: "Declined by the spa", style: "bg-red-50 text-red-800" },
  expired: { label: "No answer in time", style: "bg-line text-muted" },
  cancelled: { label: "Cancelled", style: "bg-line text-muted" },
  awaiting_payment: { label: "Payment not finished", style: "bg-line text-muted" },
};
