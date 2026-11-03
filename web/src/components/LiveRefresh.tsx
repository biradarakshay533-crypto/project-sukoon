"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const EVERY_SECONDS = 15;

// Reloads the page data every few seconds so new requests and answers show
// up without a manual refresh. With alerts on, it beeps when the number of
// waiting requests goes up.
export function LiveRefresh({ waitingCount, withAlerts = false }: { waitingCount: number; withAlerts?: boolean }) {
  const router = useRouter();
  const lastCount = useRef(waitingCount);
  const audio = useRef<AudioContext | null>(null);
  const [alertsOn, setAlertsOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), EVERY_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (waitingCount > lastCount.current && audio.current) {
      beep(audio.current);
    }
    lastCount.current = waitingCount;
    if (withAlerts) {
      document.title = waitingCount > 0 ? `(${waitingCount}) New requests | Sukoonam` : "Booking requests | Sukoonam";
    }
  }, [waitingCount, withAlerts]);

  // Browsers only allow sound after the person has tapped something.
  function turnOnAlerts() {
    audio.current = new AudioContext();
    beep(audio.current);
    setAlertsOn(true);
  }

  if (!withAlerts) {
    return null;
  }

  return alertsOn ? (
    <p className="text-sm text-muted">Sound alerts are on. Keep this page open.</p>
  ) : (
    <button
      type="button"
      onClick={turnOnAlerts}
      className="self-start border border-night px-5 py-2.5 text-sm font-medium tracking-wider uppercase transition hover:bg-night hover:text-white"
    >
      Turn on sound alerts
    </button>
  );
}

function beep(context: AudioContext) {
  for (const [index, pitch] of [880, 1175].entries()) {
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime + index * 0.2;
    tone.frequency.value = pitch;
    volume.gain.setValueAtTime(0.25, start);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    tone.connect(volume).connect(context.destination);
    tone.start(start);
    tone.stop(start + 0.2);
  }
}
