// Sukoonam's service worker: a small helper the phone keeps for the app.
// It does two things:
// 1. With no internet, it shows a friendly "You are offline" page instead of
//    the browser's error. Every other page and all login and booking data
//    always come fresh from the internet, never from here.
// 2. It shows booking request notifications for spa owners, even when the
//    app is closed, and opens the requests page when one is tapped.

const CACHE = "sukoonam-v2";
const OFFLINE_PAGE = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_PAGE, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Only full page loads; images, data and logins are left alone.
  if (event.request.mode !== "navigate") {
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_PAGE)));
});

self.addEventListener("push", (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(message.title || "New booking request", {
      body: message.body || "Open Sukoonam to accept or decline.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: message.tag || "booking",
      renotify: true,
      // Stays on screen until the owner taps or swipes it away.
      requireInteraction: true,
      vibrate: [400, 150, 400, 150, 400],
      data: { url: message.url || "/partner/bookings" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/partner/bookings", self.location.origin).href;

  // Use an open Sukoonam window if there is one, otherwise open the app.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (open) {
        return open.focus().then(() => open.navigate(url));
      }
      return self.clients.openWindow(url);
    }),
  );
});
