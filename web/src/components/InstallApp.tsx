"use client";

import { useEffect, useState } from "react";

// Chrome's install offer, which it gives us when the site can be installed.
type InstallOffer = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const HIDE_KEY = "sukoonam-install-hidden-until";
const HIDE_DAYS = 14;

function hiddenForNow() {
  try {
    return Number(window.localStorage.getItem(HIDE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

function hideForTwoWeeks() {
  try {
    window.localStorage.setItem(HIDE_KEY, String(Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    // Storage blocked: the card just comes back next visit.
  }
}

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIphone() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Registers the offline helper and, on phones, offers to install Sukoonam
// as an app. Android gets an Install button; iPhones get the Share steps,
// because Safari has no install button for websites.
export function InstallApp() {
  const [offer, setOffer] = useState<InstallOffer | null>(null);
  const [showIphoneSteps, setShowIphoneSteps] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isInstalled() || hiddenForNow()) {
      return;
    }

    const onOffer = (event: Event) => {
      event.preventDefault();
      setOffer(event as InstallOffer);
    };
    const onInstalled = () => setOffer(null);
    window.addEventListener("beforeinstallprompt", onOffer);
    window.addEventListener("appinstalled", onInstalled);

    // Safari on iPhone never sends an offer, so show the steps after a short pause.
    const timer = isIphone() ? window.setTimeout(() => setShowIphoneSteps(true), 4000) : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onOffer);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  if (!offer && !showIphoneSteps) {
    return null;
  }

  function close() {
    hideForTwoWeeks();
    setOffer(null);
    setShowIphoneSteps(false);
  }

  async function install() {
    if (!offer) {
      return;
    }
    await offer.prompt();
    const { outcome } = await offer.userChoice;
    if (outcome === "dismissed") {
      hideForTwoWeeks();
    }
    setOffer(null);
  }

  return (
    <div
      role="dialog"
      aria-label="Install the Sukoonam app"
      className="rise-in fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-2xl sm:bottom-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a tiny local icon */}
      <img src="/icons/icon-192.png" alt="" className="size-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold">Get the Sukoonam app</p>
        {offer ? (
          <p className="text-sm text-muted">Book spas faster, right from your home screen.</p>
        ) : (
          <p className="text-sm text-muted">
            Tap <strong>Share</strong>{" "}
            <svg viewBox="0 0 24 24" className="inline size-4 align-[-3px]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>{" "}
            then <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>
      {offer && (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Install
        </button>
      )}
      <button type="button" onClick={close} aria-label="Not now" className="shrink-0 p-1 text-muted transition hover:text-foreground">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
