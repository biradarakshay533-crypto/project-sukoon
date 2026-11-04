"use client";

import { useEffect, useRef, useState } from "react";

// A silent looping clip laid over a photo. It only loads and plays while
// it is on screen, and stays a still photo for people who prefer less motion.
export function LoopVideo({ src, className = "" }: { src: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!element.src) {
            element.src = src;
          }
          element.play().catch(() => {});
        } else {
          element.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={video}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
