"use client";

import { useMemo, useState } from "react";
import { SpaCard } from "@/components/SpaCard";
import { SpaMapLoader } from "@/components/SpaMapLoader";
import { DHARWAD, distanceKm } from "@/lib/distance";
import type { Point } from "@/lib/distance";
import { formatRupees } from "@/lib/format";
import type { MassageType, SpaSummary } from "@/lib/spas";

type SpaBrowserProps = {
  spas: SpaSummary[];
  massageTypes: MassageType[];
  initialQuery?: string;
  initialTypeId?: string | null;
};

const chipStyle = "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition";

export function SpaBrowser({
  spas,
  massageTypes,
  initialQuery = "",
  initialTypeId = null,
}: SpaBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [typeId, setTypeId] = useState<string | null>(initialTypeId);
  const [view, setView] = useState<"list" | "map">("list");
  const [you, setYou] = useState<Point | null>(null);
  const [locationNote, setLocationNote] = useState("");

  const results = useMemo(() => {
    const words = query.trim().toLowerCase();
    const matches = spas
      .filter((spa) => !typeId || spa.massageTypeIds.includes(typeId))
      .filter(
        (spa) =>
          !words ||
          `${spa.name} ${spa.address} ${spa.city}`.toLowerCase().includes(words),
      )
      .map((spa) => ({
        ...spa,
        distance:
          you && spa.latitude !== null && spa.longitude !== null
            ? distanceKm(you, { latitude: spa.latitude, longitude: spa.longitude })
            : null,
      }));

    return you
      ? matches.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      : matches;
  }, [spas, query, typeId, you]);

  function findNearMe() {
    if (!navigator.geolocation) {
      setLocationNote("Your browser cannot share its location.");
      return;
    }

    setLocationNote("Finding spas near you...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setYou({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationNote("Showing the nearest spas first.");
      },
      () => setLocationNote("We could not get your location, so spas are shown by name."),
    );
  }

  const mappable = results.filter(
    (spa): spa is typeof spa & { latitude: number; longitude: number } =>
      spa.latitude !== null && spa.longitude !== null,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by spa name or area"
          aria-label="Search spas"
          className="flex-1 rounded-full border border-line bg-white px-5 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={findNearMe}
          className="rounded-full border-2 border-brand bg-card px-5 py-3 font-semibold text-brand transition hover:bg-brand hover:text-white"
        >
          Near me
        </button>
      </div>
      {locationNote && <p className="-mt-2 text-sm text-muted">{locationNote}</p>}

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button
          type="button"
          onClick={() => setTypeId(null)}
          className={`${chipStyle} ${!typeId ? "border-brand bg-brand text-white" : "border-line bg-card"}`}
        >
          All massages
        </button>
        {massageTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setTypeId(type.id === typeId ? null : type.id)}
            className={`${chipStyle} ${type.id === typeId ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand"}`}
          >
            {type.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {results.length} {results.length === 1 ? "spa" : "spas"}
        </p>
        <div className="flex rounded-full border border-line bg-card p-1 text-sm font-medium">
          {(["list", "map"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`rounded-full px-4 py-1.5 capitalize transition ${view === option ? "bg-brand text-white" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="h-[65vh] overflow-hidden rounded-3xl border border-line">
          <SpaMapLoader
            center={you ?? mappable[0] ?? DHARWAD}
            you={you}
            spas={mappable.map((spa) => ({
              ...spa,
              label: spa.lowestPricePaise ? `From ${formatRupees(spa.lowestPricePaise)}` : undefined,
            }))}
          />
        </div>
      ) : results.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-muted">
          No spas match your search yet.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((spa, index) => (
            <li
              key={spa.id}
              className="rise-in"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <SpaCard
                spa={spa}
                priority={index === 0}
                distanceLabel={spa.distance !== null ? `${spa.distance.toFixed(1)} km` : null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
