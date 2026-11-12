"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CityChoice } from "@/components/CityPicker";
import { FadeImage } from "@/components/FadeImage";
import { SearchHint } from "@/components/SearchHint";
import { SpaFeedCard } from "@/components/SpaFeedCard";
import { useCity } from "@/lib/cities";
import { distanceKm, distanceLabel, travelMinutes } from "@/lib/distance";
import type { Point } from "@/lib/distance";
import { formatRupees } from "@/lib/format";
import type { MassageType, SpaSummary } from "@/lib/spas";
import { pexelsUrl } from "@/lib/stock-photos";

type MobileHomeProps = {
  spas: SpaSummary[];
  massageTypes: MassageType[];
  refundPercent: number;
  cutoffHours: number;
  // The massage video cards, shown between the recommendations and the spa list.
  moods?: ReactNode;
};

type Chip = "near" | "within3" | "open" | "budget";
const BUDGET_PAISE = 150000;

// The time in India as "HH:MM", to compare with opening hours.
function indiaTime() {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
}

function isOpen(spa: SpaSummary, now: string) {
  const { open, close } = spa.openingHours ?? {};
  return !open || !close || (now >= open && now < close);
}

// The phone home screen, laid out like a food-delivery app: city and search
// at the top, massage circles and filter chips pinned while scrolling, then
// big swipeable spa cards.
export function MobileHome({ spas, massageTypes, refundPercent, cutoffHours, moods }: MobileHomeProps) {
  const city = useCity();
  const [you, setYou] = useState<Point | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [chips, setChips] = useState<Set<Chip>>(new Set());
  const [note, setNote] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const feed = useRef<HTMLDivElement>(null);

  // If location was allowed before, use it straight away.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") {
          navigator.geolocation.getCurrentPosition(({ coords }) => setYou({ latitude: coords.latitude, longitude: coords.longitude }));
        }
      })
      .catch(() => {});
  }, []);

  function findMe(then?: () => void) {
    if (!navigator.geolocation) {
      setNote("Your browser cannot share its location.");
      return;
    }
    setNote("Finding spas near you...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setYou({ latitude: coords.latitude, longitude: coords.longitude });
        setNote("");
        then?.();
      },
      () => setNote(`We could not get your location, so distances are from ${city.name} centre.`),
    );
  }

  function toggle(chip: Chip) {
    const next = new Set(chips);
    if (next.has(chip)) {
      next.delete(chip);
    } else {
      next.add(chip);
      if ((chip === "near" || chip === "within3") && !you) {
        findMe();
      }
    }
    setChips(next);
  }

  function pickType(id: string | null) {
    setTypeId(id);
    // Bring the list into view under the pinned bar, like Zomato's categories.
    feed.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const results = useMemo(() => {
    const from = you ?? city.centre;
    const now = indiaTime();
    return spas
      .filter((spa) => !typeId || spa.massageTypeIds.includes(typeId))
      .filter((spa) => !chips.has("open") || isOpen(spa, now))
      .filter((spa) => !chips.has("budget") || (spa.lowestPricePaise !== null && spa.lowestPricePaise <= BUDGET_PAISE))
      .map((spa) => ({
        spa,
        km: spa.latitude !== null && spa.longitude !== null ? distanceKm(from, { latitude: spa.latitude, longitude: spa.longitude }) : null,
      }))
      .filter(({ km }) => !chips.has("within3") || (km !== null && km <= 3))
      .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
  }, [spas, typeId, chips, you, city]);

  const recommended = useMemo(() => {
    const featured = results.filter(({ spa }) => spa.isFeatured);
    return (featured.length >= 2 ? featured : results).slice(0, 8);
  }, [results]);

  const hintWords = useMemo(
    () => massageTypes.map((type) => type.name.replace(" Massage", "")).filter((name) => name.length <= 18),
    [massageTypes],
  );
  const typeName = massageTypes.find((type) => type.id === typeId)?.name;
  const chipStyle = (on: boolean) =>
    `press flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${on ? "border-brand bg-accent-soft text-brand" : "border-line bg-white"}`;

  return (
    <div className="md:hidden">
      {/* City */}
      <div className="relative px-4 pt-3">
        <button type="button" onClick={() => setCityOpen(!cityOpen)} aria-expanded={cityOpen} className="flex items-center gap-1.5 text-left">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-brand" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          <span className="font-display text-lg font-bold">{you ? "Near you" : city.name}</span>
          <svg viewBox="0 0 20 20" className={`size-4 transition ${cityOpen ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth={2} fill="none" />
          </svg>
        </button>
        <p className="ml-6.5 text-sm text-muted">{you ? `Distances from where you are, in ${city.name}` : "Spas in Hubballi and Dharwad"}</p>
        {cityOpen && (
          <div className="rise-in absolute inset-x-4 top-full z-40 mt-2 rounded-xl border border-line bg-white py-3 shadow-xl">
            <p className="px-5 pb-2 text-xs font-semibold tracking-widest text-muted uppercase">Choose your city</p>
            <div onClick={() => setCityOpen(false)}>
              <CityChoice />
            </div>
            <button
              type="button"
              onClick={() => {
                setCityOpen(false);
                findMe();
              }}
              className="mx-5 mt-1 flex items-center gap-2 text-sm font-semibold text-brand"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
              </svg>
              Use my current location
            </button>
          </div>
        )}
      </div>

      {/* Search stays pinned at the top while scrolling. */}
      <div className="sticky top-0 z-30 bg-white px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2">
        <SearchHint words={hintWords} />
      </div>
      {note && <p className="px-4 pb-1 text-sm text-muted">{note}</p>}

      {/* A small offer-style banner instead of the big desktop video. */}
      <div className="px-4 pt-2 pb-4">
        <Link href="/spas?near=1" className="press relative flex h-36 overflow-hidden rounded-2xl bg-night text-white">
          <Image src={pexelsUrl("7432859", 700)} alt="" fill priority sizes="100vw" className="object-cover object-[70%_center] opacity-70" />
          <span className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-transparent" />
          <span className="relative flex flex-col justify-center gap-1.5 p-4">
            <span className="text-[11px] font-semibold tracking-widest text-white/70 uppercase">Relax · Restore · Unwind</span>
            <span className="font-display text-xl leading-tight font-bold">
              Book a massage <span className="text-brand">near you</span>
            </span>
            <span className="text-xs text-white/80">Pay only if the spa accepts</span>
            <span className="mt-1 w-fit rounded-md bg-white px-3 py-1 text-xs font-semibold text-night">Find spas →</span>
          </span>
        </Link>
      </div>

      {/* Massage circles and filter chips stay pinned under the search. */}
      <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-20 border-b border-line bg-white shadow-[0_6px_10px_-8px_rgb(28_18_16/0.25)]">
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pt-1">
          <CircleButton label="All" active={typeId === null} onClick={() => pickType(null)}>
            <span className="flex size-full items-center justify-center bg-accent-soft text-brand">
              <svg viewBox="0 0 32 32" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path d="M16 6c3 3.5 3 9 0 13-3-4-3-9.5 0-13Z" />
                <path d="M16 19c-2.5-4-7-6-11-5.5 1 4.5 5.5 6.5 11 5.5Z" />
                <path d="M16 19c2.5-4 7-6 11-5.5-1 4.5-5.5 6.5-11 5.5Z" />
              </svg>
            </span>
          </CircleButton>
          {massageTypes.map((type) => (
            <CircleButton key={type.id} label={type.name.replace(" Massage", "").replace(" (Abhyanga)", "")} active={typeId === type.id} onClick={() => pickType(type.id)}>
              {type.imageUrl && <FadeImage src={type.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
            </CircleButton>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
          <Link href="/spas" className={chipStyle(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            Filters
          </Link>
          <button type="button" onClick={() => toggle("near")} aria-pressed={chips.has("near")} className={chipStyle(chips.has("near"))}>
            Near me
          </button>
          <button type="button" onClick={() => toggle("within3")} aria-pressed={chips.has("within3")} className={chipStyle(chips.has("within3"))}>
            Within 3 km
          </button>
          <button type="button" onClick={() => toggle("open")} aria-pressed={chips.has("open")} className={chipStyle(chips.has("open"))}>
            Open now
          </button>
          <button type="button" onClick={() => toggle("budget")} aria-pressed={chips.has("budget")} className={chipStyle(chips.has("budget"))}>
            Under {formatRupees(BUDGET_PAISE)}
          </button>
        </div>
      </div>

      <div ref={feed} className="flex scroll-mt-[calc(13rem+env(safe-area-inset-top,0px))] flex-col gap-7 px-4 pt-5 pb-10">
        {recommended.length > 1 && !typeId && chips.size === 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Recommended for you</h2>
            <div className="no-scrollbar snap-x-strict -mx-4 grid auto-cols-[40%] grid-flow-col grid-rows-2 gap-3 overflow-x-auto px-4 [scroll-padding-inline:1rem]">
              {recommended.map(({ spa, km }) => (
                <Link key={spa.id} href={`/spas/${spa.id}`} className="press flex flex-col gap-1">
                  <span className="shimmer relative block aspect-[4/3] overflow-hidden rounded-xl">
                    {spa.photoUrl && <FadeImage src={spa.photoUrl} alt="" fill sizes="40vw" className="object-cover" />}
                    {spa.lowestPricePaise !== null && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-night/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        From {formatRupees(spa.lowestPricePaise)}
                      </span>
                    )}
                  </span>
                  <span className="truncate text-sm font-semibold">{spa.name}</span>
                  {km !== null && <span className="-mt-1 text-xs text-muted">~{travelMinutes(km)} min · {km < 10 ? km.toFixed(1) : Math.round(km)} km</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {moods && !typeId && chips.size === 0 && <div className="-mx-4">{moods}</div>}

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            {results.length} {results.length === 1 ? "spa" : "spas"} {typeName ? `for ${typeName.replace(" Massage", "")}` : you ? "near you" : `around ${city.name}`}
          </h2>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
              <p className="font-display font-semibold">No spas match these filters yet</p>
              <button
                type="button"
                onClick={() => {
                  setTypeId(null);
                  setChips(new Set());
                }}
                className="press rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            results.map(({ spa, km }, index) => (
              <div key={spa.id} className="rise-in" style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}>
                <SpaFeedCard spa={spa} distance={km !== null ? distanceLabel(km) : null} refundPercent={refundPercent} priority={index === 0} />
              </div>
            ))
          )}
          {results.length > 0 && (
            <p className="text-xs text-muted">
              *{refundPercent}% refund if you cancel at least {cutoffHours} hours before your booking.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CircleButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="press flex w-16 shrink-0 flex-col items-center gap-1 pb-1.5">
      <span className={`shimmer relative block size-14 overflow-hidden rounded-full ring-2 transition ${active ? "ring-brand" : "ring-transparent"}`}>{children}</span>
      <span className={`w-full truncate text-center text-xs ${active ? "font-semibold text-foreground" : "text-muted"}`}>{label}</span>
      <span className={`h-[3px] w-8 rounded-full transition ${active ? "bg-brand" : "bg-transparent"}`} />
    </button>
  );
}
