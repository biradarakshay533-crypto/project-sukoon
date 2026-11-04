"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const EVERY_SECONDS = 15;

// Reloads the page data every few seconds so the spa's answer shows up
// without a manual refresh.
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), EVERY_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
