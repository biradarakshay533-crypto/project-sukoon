// Google Maps settings. The key is public by design (Google limits it to our
// website), but it still lives in .env.local and on Vercel, not in the code.
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Google's custom pins need a Map ID from the Cloud console. DEMO_MAP_ID works
// while testing.
export const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// Until the client adds a key, maps fall back to free OpenStreetMap.
export const USE_GOOGLE_MAPS = GOOGLE_MAPS_KEY !== "";

export const PIN_RED = "#dc1f32";
export const PIN_YOU = "#2563eb";
