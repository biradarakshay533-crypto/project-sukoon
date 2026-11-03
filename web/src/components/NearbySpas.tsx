"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SpaCard } from "@/components/SpaCard";
import { DHARWAD, distanceKm } from "@/lib/distance";
import type { Point } from "@/lib/distance";
import type { SpaSummary } from "@/lib/spas";

const SHOWN = 4;

// Spas sorted by distance: from the city centre at first, then from the
// visitor once they tap "Near me".
export function NearbySpas({ spas }: { spas: SpaSummary[] }) {
  const [you, setYou] = useState<Point | null>(null);
  const [note, setNote] = useState("");

  const sorted = useMemo(() => {
    const from = you ?? DHARWAD;
    return spas
      .map((spa) => ({
        spa,
        km:
          spa.latitude !== null && spa.longitude !== null
            ? distanceKm(from, { latitude: spa.latitude, longitude: spa.longitude })
            : null,
      }))
      .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
      .slice(0, SHOWN);
  }, [spas, you]);

  function findNearMe() {
    if (!navigator.geolocation) {
      setNote("Your browser cannot share its location.");
      return;
    }
    setNote("Finding spas near you...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setYou({ latitude: coords.latitude, longitude: coords.longitude });
        setNote("");
      },
      () => setNote("We could not get your location, so we are showing distance from Dharwad centre."),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Spas near you</h2>
          <p className="mt-1 text-muted">
            {you ? "Closest to you first" : "Closest to Dharwad centre. Tap Near me for your spot."}
          </p>
        </div>
        <button
          type="button"
          onClick={findNearMe}
          className="flex items-center gap-2 rounded-full border-2 border-brand px-5 py-2.5 font-semibold text-brand transition hover:bg-brand hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 3h-2.07A7 7 0 0 0 13 5.07V3h-2v2.07A7 7 0 0 0 5.07 11H3v2h2.07A7 7 0 0 0 11 18.93V21h2v-2.07A7 7 0 0 0 18.93 13H21v-2Zm-9 6a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
            />
          </svg>
          Near me
        </button>
      </div>
      {note && <p className="-mt-2 text-sm text-muted">{note}</p>}

      {sorted.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-muted">
          New spas are joining soon. Check back shortly.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {sorted.map(({ spa, km }) => (
            <li key={spa.id}>
              <SpaCard spa={spa} distanceLabel={km !== null ? `${km.toFixed(1)} km` : null} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/spas"
        className="self-center rounded-full bg-foreground px-7 py-3 font-semibold text-white transition hover:bg-brand"
      >
        See all spas
      </Link>
    </div>
  );
}
