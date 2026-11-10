import webpush from "web-push";
import { formatBookingTime } from "@/lib/booking-time";
import { formatRupees } from "@/lib/format";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT || "https://sukoonam.in";

// Rings the spa owner's phones for a booking request the customer just sent.
// Runs on our server with the private key, so only Sukoonam can send these.
// A failure here never stops the booking itself.
export async function sendBookingAlert(supabase: Supabase, bookingId: string) {
  if (!PUBLIC_KEY || !PRIVATE_KEY) {
    return;
  }

  try {
    const [{ data: booking }, { data: phones }] = await Promise.all([
      supabase
        .from("bookings")
        .select("service_name, starts_at, price_paise, customer_name")
        .eq("id", bookingId)
        .single(),
      supabase.rpc("booking_alert_targets", { target_booking: bookingId }),
    ]);

    if (!booking || !phones?.length) {
      return;
    }

    const message = JSON.stringify({
      title: "New booking request",
      body: `${booking.service_name} · ${formatBookingTime(booking.starts_at)} · ${formatRupees(booking.price_paise)}\nTap to accept or decline.`,
      url: "/partner/bookings",
      tag: `booking-${bookingId}`,
    });

    webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
    await Promise.allSettled(
      phones.map(async (phone: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            { endpoint: phone.endpoint, keys: { p256dh: phone.p256dh, auth: phone.auth } },
            message,
            // Keep trying for up to 30 minutes, the time the spa has to answer.
            { TTL: 30 * 60, urgency: "high" },
          );
        } catch (error) {
          // 404 or 410: the phone turned alerts off or removed the app.
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await supabase.rpc("forget_push_subscription", { old_endpoint: phone.endpoint });
          }
        }
      }),
    );
  } catch {
    // Push is a bonus: the in-app popup still shows the request.
  }
}
