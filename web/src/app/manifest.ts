import type { MetadataRoute } from "next";

// Tells phones how to install Sukoonam as an app: its name, icon and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sukoonam: spa bookings in Hubballi and Dharwad",
    short_name: "Sukoonam",
    description: "Find spas near you and book a massage in a few taps.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#dc1f32",
    lang: "en-IN",
    categories: ["lifestyle", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Spas near me", url: "/spas?near=1", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My bookings", url: "/account", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
