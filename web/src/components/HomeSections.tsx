import Image from "next/image";
import Link from "next/link";
import { massageHref } from "@/lib/massage-names";
import { pexelsUrl } from "@/lib/stock-photos";

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">{title}</h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
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
  tag: "M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z",
  pin: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
};

export function Icon({ path, className = "size-10" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

// The pale strip of promises under the banners.
export function ServiceStrip({ refundPercent, cutoffHours }: { refundPercent: number; cutoffHours: number }) {
  const points = [
    { title: "Secure online payment", text: "UPI and cards", icon: ICONS.lock },
    { title: "Pay only if accepted", text: "Held until the spa says yes", icon: ICONS.check },
    { title: `${refundPercent}% refundable*`, text: `*If cancelled ${cutoffHours}+ hours before`, icon: ICONS.refund },
  ];

  return (
    <div className="bg-accent-soft">
      <ul className="no-scrollbar mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-5 sm:grid sm:grid-cols-3 sm:justify-items-center">
        {points.map((point) => (
          <li key={point.title} className="flex min-w-56 items-center gap-3">
            <Icon path={point.icon} className="size-9 shrink-0" />
            <span>
              <span className="block font-display text-lg leading-tight font-medium">{point.title}</span>
              <span className="text-sm text-muted">{point.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Collection cards: a photo with a label, and a dark bar with an arrow.
export function MassageMoods() {
  const moods = [
    { title: "Melt the stress away", type: "Aromatherapy Massage", photo: "6629612" },
    { title: "Ease sore muscles", type: "Deep Tissue Massage", photo: "6188042" },
    { title: "Rooted in tradition", type: "Ayurvedic Massage (Abhyanga)", photo: "6187852" },
    { title: "Relax together", type: "Couples Massage", photo: "7365434" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4">
      <SectionTitle title="How do you want to feel?" subtitle="Massages for every mood" />
      <ul className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
        {moods.map((mood) => (
          <li key={mood.title} className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
            <Link href={massageHref(mood.type)} className="group block">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden">
                <Image
                  src={pexelsUrl(mood.photo)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 70vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30" />
                <p className="relative px-4 text-center font-display text-2xl font-medium text-white">
                  {mood.title}
                </p>
              </div>
              <div className="flex items-center justify-between bg-accent px-4 py-3 text-sm text-white">
                <span>{mood.type}</span>
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// A full-width promotional banner.
export function PromoBanner() {
  return (
    <Link href={massageHref("Couples Massage")} className="group relative block h-80 overflow-hidden sm:h-96">
      <Image
        src={pexelsUrl("19695981", 1920)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover transition duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center gap-3 px-4 text-white">
        <p className="text-sm tracking-[0.3em] uppercase">Plan a day out</p>
        <p className="font-display text-5xl leading-none font-bold sm:text-7xl">Spa day for two</p>
        <p className="max-w-md text-white/85">Book side-by-side couples massages at spas across Dharwad.</p>
        <span className="mt-2 self-start bg-white px-7 py-3 text-sm font-medium tracking-wider text-night uppercase">
          Book together
        </span>
      </div>
    </Link>
  );
}

// Photo tiles with an icon, like a "why choose us" band.
export function WhyChoose({ refundPercent, cutoffHours }: { refundPercent: number; cutoffHours: number }) {
  const reasons = [
    { title: "Approved spas only", text: "Every spa is checked before it is listed", icon: ICONS.shield, photo: "6188042" },
    { title: "Secure online payment", text: "Pay safely with UPI or card", icon: ICONS.lock, photo: "6629612" },
    { title: "Pay only if accepted", text: "Your money is held until the spa says yes", icon: ICONS.check, photo: "6628689" },
    {
      title: `${refundPercent}% refundable*`,
      text: `*If cancelled at least ${cutoffHours} hours before`,
      icon: ICONS.refund,
      photo: "6188032",
    },
    { title: "Prices shown upfront", text: "Compare services before you book", icon: ICONS.tag, photo: "6186753" },
    { title: "Spas near you", text: "Find the closest spa on the map", icon: ICONS.pin, photo: "5266479" },
  ];

  return (
    <section className="flex flex-col gap-8">
      <SectionTitle title="Wellness you can trust" subtitle="Why book with Sukoonam" />
      <ul className="grid grid-cols-2 lg:grid-cols-6">
        {reasons.map((reason) => (
          <li key={reason.title} className="group relative aspect-square overflow-hidden lg:aspect-[3/4]">
            <Image
              src={pexelsUrl(reason.photo, 600)}
              alt=""
              fill
              sizes="(min-width: 1024px) 17vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-night/75 transition duration-500 group-hover:bg-night/60" />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-white">
              <Icon path={reason.icon} className="size-12" />
              <p className="font-display text-lg leading-tight font-medium sm:text-xl">{reason.title}</p>
              <p className="text-xs text-white/80 sm:text-sm">{reason.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
