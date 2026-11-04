import Image from "next/image";
import Link from "next/link";
import { formatRupees } from "@/lib/format";
import type { SpaSummary } from "@/lib/spas";

type SpaCardProps = {
  spa: SpaSummary;
  distanceLabel?: string | null;
  priority?: boolean;
};

// The photo card used wherever a spa is listed.
export function SpaCard({ spa, distanceLabel, priority = false }: SpaCardProps) {
  return (
    <Link href={`/spas/${spa.id}`} className="group block overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {spa.photoUrl && (
          <Image
            src={spa.photoUrl}
            alt={spa.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        {spa.isFeatured && (
          <span className="absolute top-2 left-2 rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p className="truncate font-display text-sm font-semibold group-hover:text-brand sm:text-base">{spa.name}</p>
        {distanceLabel && <p className="truncate text-xs font-semibold text-brand sm:text-sm">{distanceLabel}</p>}
        <p className="truncate text-xs text-muted sm:text-sm">
          {spa.city}
          {spa.shortestMinutes && ` · ${spa.shortestMinutes} min+`}
        </p>
        {spa.lowestPricePaise && (
          <p className="text-sm sm:text-base">
            <span className="text-xs text-muted">From </span>
            <span className="font-bold text-brand">{formatRupees(spa.lowestPricePaise)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
