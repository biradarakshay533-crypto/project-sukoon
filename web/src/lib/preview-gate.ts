// A simple password in front of the whole site while it is a private preview.
// Set PREVIEW_PASSWORD (in Vercel, not in Git) to turn it on; leave it empty
// to turn it off. Changing the password signs everyone out.

export const PREVIEW_COOKIE = "sukoonam-preview";
export const PREVIEW_PAGE = "/preview-login";

// Files phones fetch without the visitor's cookie, so they must stay open
// for the app to install and work offline.
const ALWAYS_OPEN = [PREVIEW_PAGE, "/manifest.webmanifest", "/sw.js", "/offline", "/robots.txt", "/icon.png", "/apple-icon.png"];

export function previewPassword() {
  return process.env.PREVIEW_PASSWORD ?? "";
}

export function isAlwaysOpen(path: string) {
  return ALWAYS_OPEN.includes(path) || path.startsWith("/icons/");
}

// What the cookie holds: a fingerprint of the password, never the password.
export async function previewToken(password: string) {
  const bytes = new TextEncoder().encode(`sukoonam-preview:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
