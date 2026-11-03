import Image from "next/image";
import Link from "next/link";
import type { MassageType } from "@/lib/spas";
import { pexelsUrl } from "@/lib/stock-photos";

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-accent uppercase">
        <span className="h-px w-10 bg-accent/60" />
        {eyebrow}
        <span className="h-px w-10 bg-accent/60" />
      </p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

// Outline icons, drawn on a 24 by 24 grid.
const ICONS = {
  shield:
    "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  refund: "M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3",
  tag: "M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z",
  pin: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-14"
    >
      <path d={path} />
    </svg>
  );
}

// Photo tiles with an icon, like a "why choose us" band.
export function WhyChoose({ refundPercent, cutoffHours }: { refundPercent: number; cutoffHours: number }) {
  const reasons = [
    { title: "Approved spas only", text: "Every spa is checked before it is listed", icon: ICONS.shield, photo: "6188042" },
    { title: "Secure online payment", text: "Pay safely with UPI or card", icon: ICONS.lock, photo: "6629612" },
    { title: "Pay only if accepted", text: "Your money is held until the spa says yes", icon: ICONS.check, photo: "6628689" },
    {
      title: `${refundPercent}% back if plans change`,
      text: `Cancel at least ${cutoffHours} hours before`,
      icon: ICONS.refund,
      photo: "6188032",
    },
    { title: "Prices shown upfront", text: "Compare services before you book", icon: ICONS.tag, photo: "6186753" },
    { title: "Spas near you", text: "Find the closest spa on the map", icon: ICONS.pin, photo: "5266479" },
  ];

  return (
    <section className="flex flex-col gap-8 py-16">
      <SectionTitle eyebrow="Why book with Sukoonam" title="Wellness you can trust" />
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
            <div className="absolute inset-0 bg-brand-dark/75 transition duration-500 group-hover:bg-brand-dark/60" />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-white">
              <Icon path={reason.icon} />
              <p className="font-display text-lg leading-tight font-semibold sm:text-xl">{reason.title}</p>
              <p className="text-xs text-white/80 sm:text-sm">{reason.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Big photo tiles that open the spa list filtered to a massage type.
export function MassageMoods({ massageTypes }: { massageTypes: MassageType[] }) {
  const moods = [
    { title: "Melt the stress away", type: "Aromatherapy Massage", photo: "6629612" },
    { title: "Ease sore muscles", type: "Deep Tissue Massage", photo: "6188042" },
    { title: "Rooted in tradition", type: "Ayurvedic Massage (Abhyanga)", photo: "6187852" },
    { title: "Relax together", type: "Couples Massage", photo: "7365434" },
  ];

  return (
    <section className="flex flex-col gap-8 pb-16">
      <SectionTitle eyebrow="Massages for every mood" title="How do you want to feel?" />
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
        {moods.map((mood) => {
          const typeId = massageTypes.find((type) => type.name === mood.type)?.id;
          return (
            <li key={mood.title}>
              <Link
                href={typeId ? `/spas?type=${typeId}` : "/spas"}
                className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden lg:aspect-[3/4]"
              >
                <Image
                  src={pexelsUrl(mood.photo)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-brand-dark/40 to-brand-dark/30" />
                <div className="relative flex flex-col items-center gap-3 p-6 text-center text-white">
                  <p className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{mood.title}</p>
                  <p className="text-sm text-white/85">{mood.type}</p>
                  <span className="mt-2 rounded-full border border-white/70 px-5 py-2 text-sm font-semibold transition group-hover:bg-white group-hover:text-brand">
                    Find spas
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
