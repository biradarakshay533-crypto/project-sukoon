"use client";

import Link from "next/link";
import { useState } from "react";
import { SpaCard } from "@/components/SpaCard";
import type { MassageType, SpaSummary } from "@/lib/spas";

const SHOWN = 8;

// A spa grid with massage tabs, in the style of a "new arrivals" shelf.
export function FeaturedSpas({
  spas,
  massageTypes,
  title,
}: {
  spas: SpaSummary[];
  massageTypes: MassageType[];
  title: string;
}) {
  const [typeId, setTypeId] = useState<string | null>(null);

  if (spas.length === 0) {
    return null;
  }

  // Only offer tabs that would show at least one spa.
  const tabs = massageTypes.filter((type) => spas.some((spa) => spa.massageTypeIds.includes(type.id)));
  const shown = spas.filter((spa) => !typeId || spa.massageTypeIds.includes(typeId)).slice(0, SHOWN);
  const tabStyle = "shrink-0 border px-4 py-1.5 text-sm transition";

  return (
    <section className="flex flex-col items-center gap-6">
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      <div className="no-scrollbar -mx-4 flex max-w-full items-center gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => setTypeId(null)}
          className={`${tabStyle} ${!typeId ? "border-night bg-night text-white" : "border-line text-muted hover:text-foreground"}`}
        >
          All
        </button>
        {tabs.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setTypeId(type.id)}
            className={`${tabStyle} ${type.id === typeId ? "border-night bg-night text-white" : "border-line text-muted hover:text-foreground"}`}
          >
            {type.name.replace(" Massage", "")}
          </button>
        ))}
        <Link
          href="/spas"
          className="ml-2 shrink-0 border-b-2 border-night text-sm font-semibold tracking-wider uppercase"
        >
          View all
        </Link>
      </div>
      <ul className="grid w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {shown.map((spa, index) => (
          <li key={spa.id}>
            <SpaCard spa={spa} priority={index < 2} />
          </li>
        ))}
      </ul>
    </section>
  );
}
