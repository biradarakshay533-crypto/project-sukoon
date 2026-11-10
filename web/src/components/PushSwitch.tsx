"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/booking-actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type State = "checking" | "off" | "on" | "blocked" | "iphone-home-screen" | "unsupported" | "working";

// The key comes as text; phones want it as raw bytes.
function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function helper() {
  return (await navigator.serviceWorker.getRegistration()) ?? navigator.serviceWorker.register("/sw.js");
}

function readyHelper() {
  return helper().then(() => navigator.serviceWorker.ready);
}

function supported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function needsHomeScreen() {
  const iphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iphone && !installed;
}

// Lets a spa owner get booking requests as phone notifications, even when
// Sukoonam is closed or the phone is locked.
export function PushSwitch() {
  const [state, setState] = useState<State>("checking");
  const [note, setNote] = useState("");

  // Find out where this phone stands, and keep its address up to date.
  useEffect(() => {
    let cancelled = false;
    async function check(): Promise<State> {
      if (!supported()) {
        return needsHomeScreen() ? "iphone-home-screen" : "unsupported";
      }
      if (Notification.permission === "denied") {
        return "blocked";
      }
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (Notification.permission === "granted" && subscription) {
        await savePushSubscription(subscription.toJSON() as Parameters<typeof savePushSubscription>[0]);
        return "on";
      }
      return "off";
    }
    check()
      .catch((): State => "off")
      .then((result) => {
        if (!cancelled) {
          setState(result);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!PUBLIC_KEY) {
    return null;
  }

  async function turnOn() {
    setState("working");
    setNote("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await readyHelper();
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY) }));
      const result = await savePushSubscription(subscription.toJSON() as Parameters<typeof savePushSubscription>[0]);
      if (result.error) {
        setNote(result.error);
        setState("off");
        return;
      }
      setState("on");
    } catch {
      setNote("We could not turn on notifications on this phone. Please try again.");
      setState("off");
    }
  }

  async function test() {
    const registration = await readyHelper();
    await registration.showNotification("Test: new booking request", {
      body: "This is how a booking request will look on this phone.",
      icon: "/icons/icon-192.png",
      tag: "sukoonam-test",
      data: { url: "/partner/bookings" },
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${state === "on" ? "bg-green-100 text-green-700" : "bg-accent-soft text-brand"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden="true">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z" strokeLinejoin="round" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="font-display font-semibold">Booking notifications on this phone</p>
          <p className="text-sm text-muted">
            {state === "on" && "On. Your phone will ring for new requests, even when Sukoonam is closed."}
            {(state === "off" || state === "working" || state === "checking") &&
              "Get every booking request as a notification, even when the app is closed or the phone is locked."}
            {state === "blocked" &&
              "Notifications are blocked. Open your phone's Settings, find Sukoonam (or Chrome), and allow notifications."}
            {state === "iphone-home-screen" &&
              "On iPhone, first add Sukoonam to your Home Screen (Share, then Add to Home Screen), then open it from there and come back here."}
            {state === "unsupported" && "This browser cannot show notifications. Use Chrome on Android, or the Home Screen app on iPhone."}
          </p>
        </div>
      </div>

      {(state === "off" || state === "working") && (
        <button
          type="button"
          onClick={turnOn}
          disabled={state === "working"}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {state === "working" ? "Turning on..." : "Allow notifications"}
        </button>
      )}
      {state === "on" && (
        <button
          type="button"
          onClick={test}
          className="self-start rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand"
        >
          Send a test notification
        </button>
      )}
      {note && <p className="text-sm text-red-700">{note}</p>}
    </section>
  );
}
