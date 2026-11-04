"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnswerButtons } from "@/components/BookingButtons";
import { Countdown } from "@/components/Countdown";
import { formatBookingTime } from "@/lib/booking-time";
import type { BookingRow } from "@/lib/booking-status";
import { formatRupees } from "@/lib/format";

const CHECK_EVERY_SECONDS = 10;
const RING_EVERY_MS = 2000;

// Like a ride app: while a request is waiting, a popup covers the page and
// keeps ringing until the spa accepts or declines it.
export function RequestAlert({ requests, nowIso }: { requests: BookingRow[]; nowIso: string }) {
  const router = useRouter();
  const audio = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const request = requests[0];

  // Check for new requests every few seconds.
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), CHECK_EVERY_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [router]);

  // Ring, vibrate and flash the tab title until the request is answered.
  useEffect(() => {
    if (!request) {
      return;
    }
    const ringOnce = () => {
      if (audio.current) {
        ring(audio.current);
      }
      navigator.vibrate?.([400, 150, 400]);
    };
    ringOnce();
    const timer = setInterval(ringOnce, RING_EVERY_MS);
    const title = document.title;
    document.title = `(${requests.length}) New booking request`;
    return () => {
      clearInterval(timer);
      document.title = title;
    };
  }, [request, requests.length, soundOn]);

  // Browsers only allow sound after the person has tapped something.
  function turnOnSound() {
    audio.current ??= new AudioContext();
    void audio.current.resume();
    ring(audio.current);
    setSoundOn(true);
  }

  if (!request) {
    return soundOn ? (
      <p className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-night px-4 py-2 text-sm text-white shadow-lg">
        <span className="size-2 rounded-full bg-green-400" />
        Booking alerts on
      </p>
    ) : (
      <button
        type="button"
        onClick={turnOnSound}
        className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white shadow-lg sm:inset-x-auto sm:right-4"
      >
        <BellIcon />
        Turn on booking alerts
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="new-request-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-night/70 p-3 backdrop-blur-sm sm:items-center"
    >
      <div key={request.id} className="rise-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-4 bg-brand p-5 text-white">
          <span className="alert-pulse flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <BellIcon className="size-6" />
          </span>
          <div className="flex-1">
            <p id="new-request-title" className="font-display text-xl font-bold">
              New booking request
            </p>
            <p className="text-sm text-white/85">
              {requests.length > 1 ? `1 of ${requests.length} waiting · ` : ""}
              {request.respond_by && (
                <>
                  Answer in <Countdown deadline={request.respond_by} startedAt={nowIso} />
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold">{request.customer_name ?? "Customer"}</p>
              {request.customer_phone && (
                <a href={`tel:${request.customer_phone}`} className="text-sm font-medium text-brand">
                  Call {request.customer_phone}
                </a>
              )}
            </div>
            <p className="text-lg font-bold text-brand">{formatRupees(request.price_paise)}</p>
          </div>
          <div className="rounded-xl bg-accent-soft px-4 py-3">
            <p className="font-semibold">{formatBookingTime(request.starts_at)}</p>
            <p className="text-sm text-muted">
              {request.service_name} · {request.duration_minutes} min
            </p>
          </div>
          {request.customer_note && <p className="text-sm text-muted">“{request.customer_note}”</p>}

          <AnswerButtons bookingId={request.id} />

          {!soundOn && (
            <button type="button" onClick={turnOnSound} className="text-sm font-semibold text-brand hover:underline">
              Tap here to turn on the alert sound
            </button>
          )}
          <Link href="/partner/bookings" className="text-center text-sm text-muted hover:text-foreground">
            See all requests
          </Link>
        </div>
      </div>
    </div>
  );
}

function BellIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
    </svg>
  );
}

// A two-tone chime, like a ride request.
function ring(context: AudioContext) {
  for (const [index, pitch] of [988, 1319, 988, 1319].entries()) {
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime + index * 0.16;
    tone.type = "triangle";
    tone.frequency.value = pitch;
    volume.gain.setValueAtTime(0.35, start);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
    tone.connect(volume).connect(context.destination);
    tone.start(start);
    tone.stop(start + 0.16);
  }
}
