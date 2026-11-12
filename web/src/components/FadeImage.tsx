"use client";

import Image from "next/image";
import type { ComponentProps } from "react";
import { useState } from "react";

// A photo that fades in once it has loaded, over a shimmering grey box,
// instead of popping in line by line.
export function FadeImage({ className = "", ...props }: ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={props.alt}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
