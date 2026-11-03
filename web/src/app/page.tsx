import Link from "next/link";
import { Suspense } from "react";
import { FeaturedSpas } from "@/components/FeaturedSpas";
import { HeroCarousel } from "@/components/HeroCarousel";
import {
  MassageMoods,
  PromoBanner,
  SectionTitle,
  ServiceStrip,
  WhyChoose,
} from "@/components/HomeSections";
import { MassageTile } from "@/components/MassageTile";
import { NearbySpas } from "@/components/NearbySpas";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getApprovedSpas } from "@/lib/spas";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col pb-20 sm:pb-0">
      <SiteHeader />
      <HeroCarousel />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
      <HowItWorks />
      <PartnerBand />
      <SiteFooter />
      <Link
        href="/spas"
        className="fixed inset-x-0 bottom-0 z-20 bg-night py-4 text-center text-sm font-medium tracking-wider text-white uppercase sm:hidden"
      >
        Find a spa near me
      </Link>
    </div>
  );
}

async function HomeContent() {
  const { spas, massageTypes, refund } = await getApprovedSpas();
  const featured = spas.filter((spa) => spa.isFeatured);

  return (
    <>
      <ServiceStrip refundPercent={refund.percent} cutoffHours={refund.cutoffHours} />

      <div className="flex flex-col gap-20 py-16">
        <section id="massages" className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col gap-8 px-4">
          <SectionTitle title="Popular massages" subtitle="Tap a massage to see spas that offer it" />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:gap-y-6 sm:overflow-visible sm:px-0">
            {massageTypes.map((type) => (
              <MassageTile key={type.id} type={type} />
            ))}
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4">
          <FeaturedSpas
            spas={featured.length > 0 ? featured : spas}
            massageTypes={massageTypes}
            title={featured.length > 0 ? "Featured spas" : "Spas to try"}
          />
        </div>

        <div id="nearby" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4">
          <NearbySpas spas={spas} />
        </div>

        <PromoBanner />

        <MassageMoods />

        <WhyChoose refundPercent={refund.percent} cutoffHours={refund.cutoffHours} />
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-16">
      <div className="h-8 w-64 animate-pulse bg-line" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="size-24 shrink-0 animate-pulse rounded-full bg-line sm:size-28" />
        ))}
      </div>
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
    <section className="border-t border-line bg-[#f7f5f2]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16">
        <SectionTitle title="How Sukoonam works" />
        <ol className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center gap-2 text-center">
              <span className="font-display text-5xl font-bold text-accent">0{index + 1}</span>
              <p className="font-display text-xl font-medium">{step.title}</p>
              <p className="max-w-xs text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PartnerBand() {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-4xl font-semibold">Own a spa?</h2>
          <p className="mt-2 max-w-md text-white/80">
            List your spa on Sukoonam for free and receive paid booking requests from customers nearby.
          </p>
        </div>
        <Link
          href="/partner/signup"
          className="border border-white px-8 py-3 text-sm font-medium tracking-wider uppercase transition hover:bg-white hover:text-night"
        >
          List your spa
        </Link>
      </div>
    </section>
  );
}
