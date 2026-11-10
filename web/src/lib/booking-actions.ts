"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth-actions";
import { toStartsAt } from "@/lib/booking-time";
import { sendBookingAlert } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// Our database rules raise plain sentences (code P0001), safe to show as they are.
function friendlyError(error: { code?: string; message: string }, fallback: string) {
  return error.code === "P0001" ? `${error.message}.` : fallback;
}

export async function requestBooking(_state: FormState, formData: FormData): Promise<FormState> {
  const serviceId = text(formData, "service_id");
  const date = text(formData, "date");
  const time = text(formData, "time");

  if (!serviceId) {
    return { error: "Please choose a service." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { error: "Please choose a day and a time." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims.sub) {
    return { error: "Please log in to send a booking request." };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      service_id: serviceId,
      starts_at: toStartsAt(date, time),
      customer_note: text(formData, "note") || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: friendlyError(error, "We could not send your request. Please try again.") };
  }

  // Ring the spa owner's phone, even if their app is closed.
  await sendBookingAlert(supabase, booking.id);

  revalidatePath("/account");
  return { success: "Request sent! Follow the spa's answer in My bookings." };
}

export async function respondToBooking(_state: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("respond_to_booking", {
    target_booking: text(formData, "booking_id"),
    accept: text(formData, "answer") === "accept",
  });

  revalidatePath("/partner", "layout");

  if (error) {
    return { error: friendlyError(error, "We could not save your answer. Please try again.") };
  }
  if (data === "expired") {
    return { error: "Too late: the time to answer this request has passed." };
  }
  return {};
}

// A spa owner's phone allowed notifications: remember where to send them.
export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<FormState> {
  const { endpoint, keys } = subscription ?? {};
  if (typeof endpoint !== "string" || typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") {
    return { error: "This phone did not give a notification address. Please try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    new_endpoint: subscription.endpoint,
    new_p256dh: subscription.keys.p256dh,
    new_auth: subscription.keys.auth,
  });
  if (error) {
    return { error: friendlyError(error, "We could not turn on notifications. Please try again.") };
  }
  return { success: "Notifications are on for this phone." };
}

export async function cancelBooking(_state: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", {
    target_booking: text(formData, "booking_id"),
  });

  revalidatePath("/account");

  if (error) {
    return { error: friendlyError(error, "We could not cancel this request. Please try again.") };
  }
  return {};
}
