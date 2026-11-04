import Image from "next/image";
import Link from "next/link";
import { LoopVideo } from "@/components/LoopVideo";
import { massageHref } from "@/lib/massage-names";
import { pexelsUrl, pexelsVideo } from "@/lib/stock-photos";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
};

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-semibold text-brand hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

// Outline icons, drawn on a 24 by 24 grid.
export const ICONS = {
  shield:
    "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  refund: "M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3",
  bolt: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
};

export function Icon({ path, className = "size-10" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

// Photo cards with a mood and the massage it leads to.
export function MassageMoods() {
  const moods = [
    { title: "Melt the stress away", type: "Aromatherapy Massage", photo: "3757942", video: "6750888-sd_640_360_25fps" },
    { title: "Ease sore muscles", type: "Deep Tissue Massage", photo: "6560288", video: "6187081-sd_640_360_25fps" },
    { title: "Rooted in tradition", type: "Ayurvedic Massage (Abhyanga)", photo: "32306093", video: "6628412-sd_960_506_25fps" },
    { title: "Relax together", type: "Couples Massage", photo: "7365427", video: "6708105-sd_960_540_25fps" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4">
      <SectionTitle title="Relaxing massage for a better you" subtitle="Pick how you want to feel" />
      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
        {moods.map((mood) => (
          <li key={mood.title} className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
            <Link href={massageHref(mood.type)} className="group block overflow-hidden rounded-xl">
              <div className="relative flex aspect-[4/5] items-end overflow-hidden sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src={pexelsUrl(mood.photo)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 70vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <LoopVideo src={pexelsVideo(mood.video)} className="group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent" />
                <div className="relative flex w-full items-end justify-between gap-2 p-4 text-white">
                  <span>
                    <span className="block font-display text-lg leading-tight font-semibold">{mood.title}</span>
                    <span className="text-sm text-white/80">{mood.type}</span>
                  </span>
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// A wide offer banner for couples bookings.
export function PromoBanner() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <Link
        href={massageHref("Couples Massage")}
        className="group grid overflow-hidden rounded-2xl bg-night text-white sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
      >
        <div className="relative aspect-[3/2] overflow-hidden sm:order-last sm:aspect-auto sm:min-h-72">
          <Image
            src={pexelsUrl("7365442", 1400)}
            alt=""
            fill
            sizes="(min-width: 640px) 55vw, 100vw"
            className="object-cover transition duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent sm:bg-gradient-to-r sm:from-night sm:via-night/20 sm:to-transparent" />
        </div>
        <div className="flex flex-col justify-center gap-2 p-6 sm:p-10">
          <p className="font-display text-3xl leading-tight font-bold sm:text-4xl">Spa day for two</p>
          <p className="max-w-sm text-white/85">Book side-by-side couples massages at spas across Dharwad.</p>
          <span className="mt-2 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold transition group-hover:bg-brand-dark">
            Book together →
          </span>
        </div>
      </Link>
    </div>
  );
}

// A row of promises, on a soft pink band.
export function WhyChoose({ refundPercent, cutoffHours }: { refundPercent: number; cutoffHours: number }) {
  const reasons = [
    { title: "Pay only if accepted", text: "Held until the spa says yes", icon: ICONS.bolt },
    { title: "Approved spas", text: "Every spa is checked first", icon: ICONS.shield },
    { title: `${refundPercent}% refundable*`, text: `*Cancel ${cutoffHours}+ hours before`, icon: ICONS.refund },
    { title: "Secure payment", text: "UPI and cards", icon: ICONS.lock },
  ];

  return (
    <section className="bg-accent-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Why choose Sukoonam?</h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {reasons.map((reason) => (
            <li key={reason.title} className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                <Icon path={reason.icon} className="size-6" />
              </span>
              <span>
                <span className="block font-semibold leading-tight">{reason.title}</span>
                <span className="text-sm text-muted">{reason.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
