import Image from "next/image";
import Link from "next/link";
import { LoopVideo } from "@/components/LoopVideo";
import { SITE } from "@/lib/site-info";
import { pexelsUrl, pexelsVideo } from "@/lib/stock-photos";

const DISTANCES = [1, 3, 5, 10];
const HERO_VIDEO = pexelsVideo("6629858-sd_960_506_25fps");

// A short photo banner with the search bar and "near me" shortcuts.
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      {/* Phones: the video sits on top, with the text below it. Wide screens: the
          video fills the right side at a natural shape, so it is not cut into a strip. */}
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/7] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[60%]">
        <Image
          src={pexelsUrl("7432859", 1600)}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[60%_center]"
        />
        <LoopVideo src={HERO_VIDEO} />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent lg:hidden" />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-night via-night/90 via-40% to-night/0 lg:block" />

      <div className="relative mx-auto -mt-6 flex max-w-7xl flex-col justify-center gap-4 px-4 pb-8 sm:-mt-10 lg:mt-0 lg:min-h-[440px] lg:py-12">
        <h1 className="rise-in max-w-2xl font-display text-[2.1rem] leading-[1.05] font-extrabold sm:text-5xl">
          Find the best <span className="text-brand">spa</span> near you
        </h1>
        <p className="rise-in max-w-md text-white/85 [animation-delay:80ms]">
          Book a massage at approved spas across Dharwad. Pay only if the spa accepts.
        </p>

        <form
          action="/spas"
          className="rise-in flex w-full max-w-xl items-center rounded-xl bg-white p-1.5 text-foreground shadow-lg [animation-delay:160ms]"
        >
          <span className="hidden items-center gap-1.5 border-r border-line px-3 text-sm font-medium sm:flex">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-brand" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            {SITE.city.split(",")[0]}
          </span>
          <input
            type="search"
            name="q"
            placeholder="Search spas or areas"
            aria-label="Search spas or areas"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-dark"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <div className="rise-in no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 [animation-delay:240ms] sm:mx-0 sm:px-0">
          <Link
            href="/spas?near=1"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold transition hover:bg-brand-dark"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
              <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
            </svg>
            Near me
          </Link>
          {DISTANCES.map((km) => (
            <Link
              key={km}
              href={`/spas?within=${km}`}
              className="shrink-0 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/20"
            >
              Within {km} km
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
