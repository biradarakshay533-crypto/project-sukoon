// Sukoonam's service worker: a small helper the phone keeps for the app.
// It only does one thing: when there is no internet, it shows a friendly
// "You are offline" page instead of the browser's error. Every other page and
// all login and booking data always come fresh from the internet, never from here.

const CACHE = "sukoonam-v1";
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
