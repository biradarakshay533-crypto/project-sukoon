import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FeaturedSpas } from "@/components/FeaturedSpas";
import { MassageMoods, WhyChoose } from "@/components/HomeSections";
import { MassageTile } from "@/components/MassageTile";
import { NearbySpas } from "@/components/NearbySpas";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getApprovedSpas } from "@/lib/spas";
import { pexelsUrl } from "@/lib/stock-photos";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col pb-24 sm:pb-0">
      <AnnouncementBar />
      <Hero />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
      <HowItWorks />
      <PartnerBand />
      <SiteFooter />
      <Link
        href="/spas"
        className="fixed inset-x-4 bottom-4 z-20 rounded-full bg-accent py-4 text-center font-semibold text-white shadow-[0_10px_30px_rgba(255,111,97,0.45)] sm:hidden"
      >
        Find a spa near me
      </Link>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-accent px-4 py-2 text-center text-sm font-medium text-white">
      Now booking spas across Dharwad · Pay only when your spa accepts
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-brand/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-40 size-[30rem] rounded-full bg-accent/40 blur-3xl" />
      <SiteHeader light />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-8 pb-16 sm:pt-16 sm:pb-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-7">
          <p className="rise-in text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Spa booking in Dharwad
          </p>
          <h1 className="rise-in max-w-3xl font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl">
            Your hour of calm is closer than you think
          </h1>
          <p className="rise-in max-w-xl text-lg text-white/80">
            Compare spas near you, pick your massage and send a booking request in under a minute.
          </p>
          <form
            action="/spas"
            className="rise-in flex w-full max-w-2xl flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl sm:flex-row sm:rounded-full"
          >
            <input
              type="search"
              name="q"
              placeholder="Search for a spa or area"
              aria-label="Search spas"
              className="min-w-0 flex-1 rounded-full px-5 py-3 text-foreground outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-7 py-3 font-semibold text-white transition hover:brightness-110"
            >
              Find spas
            </button>
          </form>
        </div>
        <HeroCollage />
      </div>
    </section>
  );
}

const HERO_PHOTOS = [
  { id: "6629530", alt: "Hot stone massage", className: "row-span-2" },
  { id: "6186753", alt: "Thai massage", className: "" },
  { id: "6629612", alt: "Aromatherapy massage", className: "" },
];

function HeroCollage() {
  return (
    <div className="rise-in hidden h-[30rem] grid-cols-2 grid-rows-2 gap-4 lg:grid">
      {HERO_PHOTOS.map((photo, index) => (
        <div
          key={photo.id}
          className={`relative overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 ${photo.className}`}
        >
          <Image
            src={pexelsUrl(photo.id)}
            alt={photo.alt}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 25vw, 0px"
            className="drift object-cover"
            style={{ animationDelay: `-${index * 4}s` }}
          />
        </div>
      ))}
    </div>
  );
}

async function HomeContent() {
  const { spas, massageTypes, refund } = await getApprovedSpas();
  const featured = spas.filter((spa) => spa.isFeatured);

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-12">
        <section id="massages" className="flex scroll-mt-6 flex-col gap-5">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              What would you like today?
            </h2>
            <p className="mt-1 text-muted">Tap a massage to see spas that offer it</p>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:gap-y-6 sm:overflow-visible sm:px-0">
            {massageTypes.map((type, index) => (
              <MassageTile key={type.id} type={type} index={index} />
            ))}
          </div>
        </section>

        <FeaturedSpas
          spas={featured.length > 0 ? featured : spas.slice(0, 6)}
          title={featured.length > 0 ? "Featured spas" : "Spas to try"}
        />

        <div id="nearby" className="scroll-mt-6">
          <NearbySpas spas={spas} />
        </div>
      </div>

      <MassageMoods massageTypes={massageTypes} />

      <WhyChoose refundPercent={refund.percent} cutoffHours={refund.cutoffHours} />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12">
      <div className="h-8 w-64 animate-pulse rounded-full bg-line" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="size-24 shrink-0 animate-pulse rounded-full bg-line sm:size-28" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[2rem] bg-line" />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Pick your massage", text: "Browse spas near you, their services and prices." },
    { title: "Request a time", text: "Choose a slot and approve the payment. It is only collected if the spa accepts." },
    { title: "Relax", text: "The spa confirms your booking. Just turn up and unwind." },
  ];

  return (
    <section className="bg-accent-soft/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14">
        <h2 className="font-display text-3xl font-semibold tracking-tight">How Sukoonam works</h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-card p-6 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-white">
                {index + 1}
              </span>
              <p className="mt-4 text-lg font-semibold">{step.title}</p>
              <p className="mt-1 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PartnerBand() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14">
      <div className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-10 text-white sm:px-12">
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-accent/50 blur-3xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Own a spa?</h2>
            <p className="mt-1 max-w-md text-white/85">
              List your spa on Sukoonam for free and receive paid booking requests from customers nearby.
            </p>
          </div>
          <Link
            href="/partner/signup"
            className="rounded-full bg-white px-6 py-3 font-semibold text-brand transition hover:bg-accent hover:text-white"
          >
            List your spa
          </Link>
        </div>
      </div>
    </section>
  );
}
