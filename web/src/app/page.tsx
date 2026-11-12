import Link from "next/link";
import { Suspense } from "react";
import { FeaturedSpas } from "@/components/FeaturedSpas";
import { HomeHero } from "@/components/HomeHero";
import { MassageMoods, PromoBanner, SectionTitle, WhyChoose } from "@/components/HomeSections";
import { MassageTile } from "@/components/MassageTile";
import { MobileHome } from "@/components/MobileHome";
import { NearbySpas } from "@/components/NearbySpas";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getApprovedSpas } from "@/lib/spas";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader stickyOnPhone={false} />
      {/* Phones get the app-style home inside HomeContent instead of the big hero. */}
      <div className="hidden md:block">
        <HomeHero />
      </div>
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
      <HowItWorks />
      <PartnerBand />
      <SiteFooter />
    </div>
  );
}

async function HomeContent() {
  const { spas, massageTypes, refund } = await getApprovedSpas();
  const featured = spas.filter((spa) => spa.isFeatured);

  return (
    <>
    <MobileHome
      spas={spas}
      massageTypes={massageTypes}
      refundPercent={refund.percent}
      cutoffHours={refund.cutoffHours}
      moods={<MassageMoods />}
    />
    <div className="hidden flex-col gap-12 pt-8 pb-14 md:flex">
      <section id="massages" className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col gap-4 px-4">
        <SectionTitle title="Popular massages" action={{ label: "View all", href: "/spas" }} />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] sm:gap-y-5 sm:overflow-visible sm:px-0">
          {massageTypes.map((type) => (
            <MassageTile key={type.id} type={type} />
          ))}
        </div>
      </section>

      <div id="nearby" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4">
        <NearbySpas spas={spas} refundPercent={refund.percent} cutoffHours={refund.cutoffHours} />
      </div>

      <PromoBanner />

      <div className="mx-auto w-full max-w-7xl px-4">
        <FeaturedSpas
          spas={featured.length > 0 ? featured : spas}
          massageTypes={massageTypes}
          title={featured.length > 0 ? "Featured spas" : "Spas to try"}
        />
      </div>

      <MassageMoods />

      <WhyChoose refundPercent={refund.percent} cutoffHours={refund.cutoffHours} />
    </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10">
      <div className="h-8 w-56 shimmer rounded" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="size-20 shrink-0 shimmer rounded-full sm:size-24" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-28 shimmer rounded-xl" />
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Pick your massage", text: "Browse spas near you, their services and prices." },
    { title: "Request a time", text: "Choose a slot and approve the payment. It is only collected if the spa accepts." },
    { title: "Relax", text: "The spa confirms within minutes. Just turn up and unwind." },
  ];

  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14">
        <SectionTitle title="How Sukoonam works" />
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4 rounded-xl border border-line p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">{step.title}</span>
                <span className="text-muted">{step.text}</span>
              </span>
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
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Own a spa?</h2>
          <p className="mt-2 max-w-md text-white/80">
            List your spa on Sukoonam for free and receive paid booking requests from customers nearby.
          </p>
        </div>
        <Link
          href="/partner/signup"
          className="rounded-lg bg-brand px-7 py-3 font-semibold transition hover:bg-brand-dark"
        >
          List your spa
        </Link>
      </div>
    </section>
  );
}
