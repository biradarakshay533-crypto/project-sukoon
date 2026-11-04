"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DHARWAD, distanceKm, distanceLabel } from "@/lib/distance";
import type { Point } from "@/lib/distance";
import { formatRupees } from "@/lib/format";
import type { SpaSummary } from "@/lib/spas";
import { pexelsUrl } from "@/lib/stock-photos";

const SHOWN = 5;

type NearbySpasProps = {
  spas: SpaSummary[];
  refundPercent: number;
  cutoffHours: number;
};

// The closest spas as rows, with distance and travel time. Distances start
// from the city centre, then from the visitor once they share their location.
export function NearbySpas({ spas, refundPercent, cutoffHours }: NearbySpasProps) {
  const [you, setYou] = useState<Point | null>(null);
  const [note, setNote] = useState("");

  // If the visitor already allowed location before, use it straight away.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") {
          navigator.geolocation.getCurrentPosition(({ coords }) =>
            setYou({ latitude: coords.latitude, longitude: coords.longitude }),
          );
        }
      })
      .catch(() => {});
  }, []);

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
      () => setNote("We could not get your location, so distances are from Dharwad centre."),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-brand" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              Spas near you
            </h2>
            <p className="mt-1 text-sm text-muted">
              {you ? "Closest to you first. Times are approximate." : "Distances from Dharwad centre."}
              {!you && (
                <button type="button" onClick={findNearMe} className="ml-1 font-semibold text-brand hover:underline">
                  Use my location
                </button>
              )}
            </p>
            {note && <p className="mt-1 text-sm text-muted">{note}</p>}
          </div>
          <Link href="/spas" className="text-sm font-semibold text-brand hover:underline">
            See all →
          </Link>
        </div>

        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
            New spas are joining soon. Check back shortly.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map(({ spa, km }, index) => (
              <li
                key={spa.id}
                className="rise-in flex gap-3 rounded-xl border border-line bg-white p-2.5 shadow-sm transition hover:shadow-md sm:gap-4"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link
                  href={`/spas/${spa.id}`}
                  className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-line sm:w-44"
                >
                  {spa.photoUrl && (
                    <Image src={spa.photoUrl} alt={spa.name} fill sizes="176px" className="object-cover" />
                  )}
                  {spa.isFeatured && (
                    <span className="absolute top-1.5 left-1.5 rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                      Featured
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
                  <Link href={`/spas/${spa.id}`} className="truncate font-display text-base font-semibold hover:text-brand sm:text-lg">
                    {spa.name}
                  </Link>
                  {km !== null && (
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 shrink-0 text-brand" aria-hidden="true">
                        <path d="M3 13h2l2-5h10l2 5h2v5h-2M3 13v5h2m0 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m0 0h6m0 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" strokeLinejoin="round" />
                      </svg>
                      {distanceLabel(km)}
                    </p>
                  )}
                  {spa.massageTypeNames.length > 0 && (
                    <p className="truncate text-xs text-muted sm:text-sm">
                      {spa.massageTypeNames.map((name) => name.replace(" Massage", "")).slice(0, 3).join(" · ")}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    {spa.lowestPricePaise ? (
                      <p className="leading-tight">
                        <span className="block text-[11px] text-muted">From</span>
                        <span className="text-lg font-bold text-brand">{formatRupees(spa.lowestPricePaise)}</span>
                      </p>
                    ) : (
                      <span />
                    )}
                    <Link
                      href={`/spas/${spa.id}#book`}
                      className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark sm:px-5"
                    >
                      Book now
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="relative hidden overflow-hidden rounded-2xl bg-night text-white lg:block">
        <Image src={pexelsUrl("19641830", 900)} alt="" fill sizes="360px" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/90 via-night/60 to-night/30" />
        <div className="relative flex h-full flex-col gap-4 p-7">
          <p className="text-sm text-white/80 italic">Relax · Restore · Unwind</p>
          <p className="font-display text-3xl leading-tight font-bold text-[#f2c14e]">Premium spa experience</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              "Approved spas only",
              "Pay only if the spa accepts",
              `${refundPercent}% refundable* (*cancel ${cutoffHours}+ hours before)`,
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#f2c14e] text-[10px] font-bold text-night">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/spas"
            className="mt-auto self-start rounded-full bg-[#f2c14e] px-6 py-2.5 font-semibold text-night transition hover:bg-[#ffd36b]"
          >
            Book now →
          </Link>
        </div>
      </aside>
    </div>
  );
}
