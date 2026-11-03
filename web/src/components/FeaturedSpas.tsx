import Image from "next/image";
import Link from "next/link";
import { formatRupees } from "@/lib/format";
import type { SpaSummary } from "@/lib/spas";

// Large moving photo cards for the spas the client has featured.
export function FeaturedSpas({ spas, title }: { spas: SpaSummary[]; title: string }) {
  if (spas.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-muted">Hand-picked places to unwind this week</p>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {spas.map((spa, index) => (
          <Link
            key={spa.id}
            href={`/spas/${spa.id}`}
            className="group relative aspect-[4/3] w-[72%] shrink-0 snap-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-accent sm:aspect-[16/10] sm:w-[44%] lg:w-[31%]"
          >
            {spa.photoUrl && (
              <Image
                src={spa.photoUrl}
                alt={spa.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 44vw, 72vw"
                className="drift object-cover"
                style={{ animationDelay: `-${index * 3}s` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5">
              <div>
                <p className="font-display text-xl font-semibold sm:text-2xl">{spa.name}</p>
                <p className="text-sm text-white/80">
                  {spa.city}
                  {spa.lowestPricePaise && ` · From ${formatRupees(spa.lowestPricePaise)}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand transition group-hover:bg-accent group-hover:text-white">
                View spa
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
