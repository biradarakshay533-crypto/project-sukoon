"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { massageHref } from "@/lib/massage-names";
import { pexelsUrl } from "@/lib/stock-photos";

const SLIDES = [
  {
    photo: "6629530",
    eyebrow: "Hot stone therapy",
    title: "Deep relaxation",
    text: "Warm stones and slow hands to melt the week away.",
    href: massageHref("Hot Stone Massage"),
  },
  {
    photo: "7365434",
    eyebrow: "For two",
    title: "Couples spa day",
    text: "Side by side, at the best spas in Dharwad.",
    href: massageHref("Couples Massage"),
  },
  {
    photo: "6187852",
    eyebrow: "Rooted in tradition",
    title: "Ayurvedic healing",
    text: "Warm herbal oils and Abhyanga by trained therapists.",
    href: massageHref("Ayurvedic Massage (Abhyanga)"),
  },
];

const SLIDE_SECONDS = 6;

// Full-width photo banners that change by themselves.
export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(
      () => setCurrent((index) => (index + 1) % SLIDES.length),
      SLIDE_SECONDS * 1000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[68vh] min-h-[420px] max-h-[720px] overflow-hidden bg-night">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.title}
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Image
            src={pexelsUrl(slide.photo, 1920)}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="drift object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center gap-4 px-4 text-white">
            <p className="text-sm font-medium tracking-[0.3em] uppercase">{slide.eyebrow}</p>
            <h2 className="max-w-2xl font-display text-6xl leading-none font-bold sm:text-8xl">{slide.title}</h2>
            <p className="max-w-md text-lg text-white/85">{slide.text}</p>
            <Link
              href={slide.href}
              tabIndex={index === current ? 0 : -1}
              className="mt-2 self-start border border-white px-7 py-3 text-sm font-medium tracking-wider uppercase transition hover:bg-white hover:text-night"
            >
              Explore now
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show ${slide.title}`}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all ${index === current ? "w-10 bg-white" : "w-3 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
