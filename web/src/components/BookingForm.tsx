"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { FormMessage } from "@/components/FormField";
import { requestBooking } from "@/lib/booking-actions";
import { bookingDays, timeSlots } from "@/lib/booking-time";
import { formatRupees } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  typeName: string | null;
  description: string | null;
  durationMinutes: number;
  pricePaise: number;
};

type BookingFormProps = {
  services: Service[];
  hours: { open?: string; close?: string } | null;
  nowIso: string;
  viewer: "customer" | "partner" | "guest";
  loginHref: string;
  responseMinutes: number;
};

const chip =
  "border px-4 py-2.5 text-sm font-medium transition has-checked:border-night has-checked:bg-night has-checked:text-white";

// Pick a service, a day and a time, then send the request to the spa.
export function BookingForm({ services, hours, nowIso, viewer, loginHref, responseMinutes }: BookingFormProps) {
  const [state, action, pending] = useActionState(requestBooking, {});
  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const days = useMemo(() => bookingDays(now), [now]);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(days[0].value);
  const [time, setTime] = useState("");

  const service = services.find((item) => item.id === serviceId);
  const slots = useMemo(
    () => (service ? timeSlots(date, hours, service.durationMinutes, now) : []),
    [date, hours, service, now],
  );
  const chosenTime = slots.some((slot) => slot.value === time) ? time : "";

  if (services.length === 0) {
    return <p className="text-muted">This spa has not listed its services yet.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-display text-xl font-medium">1. Choose a service</legend>
        {services.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start justify-between gap-4 border border-line p-5 transition has-checked:border-night has-checked:ring-1 has-checked:ring-night"
          >
            <span className="flex gap-3">
              <input
                type="radio"
                name="service_id"
                value={item.id}
                checked={item.id === serviceId}
                onChange={() => setServiceId(item.id)}
                className="mt-1 accent-night"
              />
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="text-sm text-muted">
                  {[item.typeName, `${item.durationMinutes} min`].filter(Boolean).join(" · ")}
                </span>
                {item.description && <span className="mt-2 block text-sm">{item.description}</span>}
              </span>
            </span>
            <span className="shrink-0 font-semibold">{formatRupees(item.pricePaise)}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-display text-xl font-medium">2. Pick a day</legend>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {days.map((day) => (
            <label key={day.value} className={`${chip} shrink-0 cursor-pointer border-line`}>
              <input
                type="radio"
                name="date"
                value={day.value}
                checked={day.value === date}
                onChange={() => setDate(day.value)}
                className="sr-only"
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-display text-xl font-medium">3. Pick a time</legend>
        {slots.length === 0 ? (
          <p className="text-muted">No times left on this day. Please pick another day.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((slot) => (
              <label key={slot.value} className={`${chip} cursor-pointer border-line text-center`}>
                <input
                  type="radio"
                  name="time"
                  value={slot.value}
                  checked={slot.value === chosenTime}
                  onChange={() => setTime(slot.value)}
                  className="sr-only"
                  required
                />
                {slot.label}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Anything the spa should know? (optional)
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          className="border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-night"
        />
      </label>

      <div className="flex flex-col gap-3 bg-accent-soft p-5">
        <p className="text-sm">
          The spa answers within <strong>{responseMinutes} minutes</strong>, or before your time if
          that is sooner. If it does not answer, the request closes on its own.
        </p>
        <FormMessage error={state.error} success={state.success} />
        {state.success ? (
          <Link
            href="/account"
            className="bg-night px-8 py-4 text-center text-sm font-medium tracking-wider text-white uppercase transition hover:bg-accent"
          >
            Go to my bookings
          </Link>
        ) : viewer === "customer" ? (
          <button
            type="submit"
            disabled={pending || !chosenTime}
            className="bg-night px-8 py-4 text-sm font-medium tracking-wider text-white uppercase transition hover:bg-accent disabled:opacity-50"
          >
            {pending ? "Sending request..." : service ? `Request booking · ${formatRupees(service.pricePaise)}` : "Request booking"}
          </button>
        ) : viewer === "guest" ? (
          <Link
            href={loginHref}
            className="bg-night px-8 py-4 text-center text-sm font-medium tracking-wider text-white uppercase transition hover:bg-accent"
          >
            Log in to request a booking
          </Link>
        ) : (
          <p className="text-sm text-muted">
            You are signed in as a spa partner. Use a customer account to book.
          </p>
        )}
      </div>
    </form>
  );
}
