"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FadeImage } from "@/components/FadeImage";
import { formatRupees } from "@/lib/format";
import { toggleSavedSpa, useSavedSpas } from "@/lib/saved-spas";
import type { SpaSummary } from "@/lib/spas";

type SpaFeedCardProps = {
  spa: SpaSummary;
  distance: string | null;
  refundPercent: number;
  priority?: boolean;
};

// A big, full-width spa card for phones: swipe through the spa's photos,
// save it with the heart, tap anywhere else to open the spa.
export function SpaFeedCard({ spa, distance, refundPercent, priority = false }: SpaFeedCardProps) {
  const saved = useSavedSpas().includes(spa.id);
  const [photo, setPhoto] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const photos = spa.photoUrls.length > 0 ? spa.photoUrls : spa.photoUrl ? [spa.photoUrl] : [];
  const tag = spa.isFeatured ? "Featured" : spa.massageTypeNames[0]?.replace(" Massage", "");

  function onSwipe() {
    const element = strip.current;
    if (element) {
      setPhoto(Math.round(element.scrollLeft / element.clientWidth));
    }
  }

  return (
    <article className="press overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_14px_rgb(28_18_16/0.07)]">
      <div className="relative">
        <div ref={strip} onScroll={onSwipe} className="no-scrollbar snap-x-strict flex aspect-[16/10] overflow-x-auto">
          {photos.length === 0 && <div className="shimmer h-full w-full shrink-0" />}
          {photos.map((url, index) => (
            <Link key={url} href={`/spas/${spa.id}`} className="shimmer relative h-full w-full shrink-0" tabIndex={index === 0 ? 0 : -1}>
              <FadeImage
                src={url}
                alt={index === 0 ? spa.name : ""}
                fill
                priority={priority && index === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </Link>
          ))}
        </div>

        {tag && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-night/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            {tag}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleSavedSpa(spa.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${spa.name} from saved` : `Save ${spa.name}`}
          className="press absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className={`size-5 ${saved ? "fill-brand text-brand" : "fill-none text-foreground"}`} stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" strokeLinejoin="round" />
          </svg>
        </button>
        {photos.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
            {photos.map((url, index) => (
              <span key={url} className={`h-1.5 rounded-full bg-white shadow transition-all ${index === photo ? "w-4" : "w-1.5 opacity-60"}`} />
            ))}
          </div>
        )}
      </div>

      <Link href={`/spas/${spa.id}`} className="flex flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-display text-lg leading-tight font-semibold">{spa.name}</h3>
          {spa.lowestPricePaise !== null && (
            <p className="shrink-0 text-right leading-tight">
              <span className="block text-[11px] text-muted">From</span>
              <span className="font-display font-bold text-brand">{formatRupees(spa.lowestPricePaise)}</span>
            </p>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
          {distance && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-brand" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Z" strokeLinejoin="round" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {distance}
            </span>
          )}
          <span>{spa.city}</span>
        </p>
        {spa.massageTypeNames.length > 0 && (
          <p className="truncate text-sm text-muted">
            {spa.massageTypeNames.map((name) => name.replace(" Massage", "")).slice(0, 4).join(" · ")}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 border-t border-dashed border-line pt-2.5 text-xs font-medium">
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-800">{refundPercent}% refundable*</span>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-brand">Pay only if the spa accepts</span>
        </div>
      </Link>
    </article>
  );
}
