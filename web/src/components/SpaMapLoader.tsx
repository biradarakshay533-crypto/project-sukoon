"use client";

import dynamic from "next/dynamic";
import { USE_GOOGLE_MAPS } from "@/lib/maps";

const loading = () => <div className="h-full w-full animate-pulse bg-line/50" />;

// Maps need the browser, so they load after the page appears. Google Maps is
// used once its key is set; until then the free OpenStreetMap version.
export const SpaMapLoader = USE_GOOGLE_MAPS
  ? dynamic(() => import("@/components/GoogleSpaMap"), { ssr: false, loading })
  : dynamic(() => import("@/components/SpaMap"), { ssr: false, loading });

export const LocationPickerLoader = USE_GOOGLE_MAPS
  ? dynamic(() => import("@/components/GoogleLocationPicker"), { ssr: false, loading })
  : dynamic(() => import("@/components/LocationPicker"), { ssr: false, loading });
