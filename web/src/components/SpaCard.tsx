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
    <Link href={`/spas/${spa.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
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
          <span className="absolute top-0 left-0 bg-accent px-2.5 py-1 text-[11px] font-medium tracking-wider text-white uppercase">
            Featured
          </span>
        )}
        {distanceLabel && (
          <span className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 text-xs font-medium">
            {distanceLabel}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 pt-3">
        <p className="truncate text-sm font-medium sm:text-base">{spa.name}</p>
        <p className="truncate text-xs text-muted sm:text-sm">
          {spa.city}
          {spa.shortestMinutes && ` · ${spa.shortestMinutes} min+`}
        </p>
        {spa.lowestPricePaise && (
          <p className="text-sm font-semibold sm:text-base">From {formatRupees(spa.lowestPricePaise)}</p>
        )}
      </div>
    </Link>
  );
}
