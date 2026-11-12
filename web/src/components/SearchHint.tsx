"use client";

import { useEffect, useState } from "react";

const HINT_EVERY_MS = 2600;

// A search box whose hint keeps changing, such as Search "Swedish", then
// "Hot stone", so people see what they can look for. Searching opens the spa list.
export function SearchHint({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(() => setIndex((current) => (current + 1) % words.length), HINT_EVERY_MS);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <form action="/spas" role="search" className="relative flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3.5 shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-5 shrink-0 text-brand" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        id="home-search"
        type="search"
        name="q"
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label="Search spas or massages"
        className="peer h-full min-w-0 flex-1 bg-transparent text-base outline-none"
      />
      {text === "" && words.length > 0 && (
        <span aria-hidden="true" className="pointer-events-none absolute left-11 overflow-hidden text-base whitespace-nowrap text-muted">
          Search &ldquo;<span key={index} className="hint-in font-medium text-foreground/70">{words[index % words.length]}</span>&rdquo;
        </span>
      )}
    </form>
  );
}
