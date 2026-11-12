import { useSyncExternalStore } from "react";

// Spas a visitor saved with the heart button, remembered in this browser.
const KEY = "sukoonam-saved-spas";
const EVENT = "sukoonam-saved-change";
let memory = "[]";

function read() {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function parse(raw: string): string[] {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedSpas() {
  // The raw text is the snapshot, so React only re-renders when it changes.
  return parse(useSyncExternalStore(subscribe, read, () => "[]"));
}

export function toggleSavedSpa(id: string) {
  const list = parse(read());
  const next = list.includes(id) ? list.filter((saved) => saved !== id) : [id, ...list];
  memory = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, memory);
  } catch {
    // Storage blocked: saved for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}
