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
    <Link
      href={`/spas/${spa.id}`}
      className="group block overflow-hidden rounded-3xl bg-card shadow-[0_2px_14px_rgba(36,26,43,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(36,26,43,0.16)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand to-accent">
        {spa.photoUrl && (
          <Image
            src={spa.photoUrl}
            alt={spa.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
        {spa.isFeatured && (
          <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-brand sm:top-3 sm:left-3 sm:text-xs">
            Featured
          </span>
        )}
        {spa.lowestPricePaise && (
          <span className="absolute bottom-2 left-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-white sm:bottom-3 sm:left-3 sm:text-sm">
            From {formatRupees(spa.lowestPricePaise)}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="truncate font-semibold">{spa.name}</p>
          <p className="truncate text-sm text-muted">{spa.city}</p>
        </div>
        <div className="shrink-0 text-right text-sm text-muted">
          {distanceLabel && <p className="font-medium text-foreground">{distanceLabel}</p>}
          {spa.shortestMinutes && <p>{spa.shortestMinutes} min+</p>}
        </div>
      </div>
    </Link>
  );
}
