"use client";

import dynamic from "next/dynamic";

// Maps need the browser, so they load after the page appears.
export const SpaMapLoader = dynamic(() => import("@/components/SpaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line/50" />,
});
