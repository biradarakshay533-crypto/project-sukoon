"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CITIES, chooseCity, useCity } from "@/lib/cities";

function PinIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

// The city pill in the header: pick Hubballi or Dharwad, or jump to spas near you.
export function CityPicker() {
  const city = useCity();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close when tapping outside the menu or pressing Escape.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onTap = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onTap);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onTap);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium transition hover:border-brand hover:text-brand"
      >
        <PinIcon className="size-4 text-brand" />
        {city.name}
        <svg viewBox="0 0 20 20" className={`size-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth={1.6} fill="none" />
        </svg>
      </button>

      {open && (
        <div className="rise-in absolute top-full left-0 z-40 mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-xl">
          <Link
            href="/spas?near=1"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand transition hover:bg-accent-soft"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
            </svg>
            Spas near me
          </Link>
          <p className="mt-1 border-t border-line px-3 pt-3 pb-1 text-xs font-semibold tracking-widest text-muted uppercase">
            Choose your city
          </p>
          {CITIES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                chooseCity(option.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-accent-soft ${option.id === city.id ? "font-semibold text-brand" : ""}`}
            >
              {option.name}
              {option.id === city.id && <span aria-label="chosen">✓</span>}
            </button>
          ))}
          <p className="px-3 pt-1 pb-1.5 text-xs text-muted">More cities coming soon.</p>
        </div>
      )}
    </div>
  );
}

// Two city buttons for the phone menu.
export function CityChoice() {
  const city = useCity();
  return (
    <div className="flex gap-2 px-5 pb-2">
      {CITIES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => chooseCity(option.id)}
          className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${option.id === city.id ? "border-brand bg-brand text-white" : "border-line"}`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}

// Just the chosen city's name, for labels such as the search bar.
export function CityName() {
  return <>{useCity().name}</>;
}
