import { useSyncExternalStore } from "react";
import type { Point } from "@/lib/distance";

// The cities Sukoonam works in. Distances start from the chosen city's
// centre until the visitor shares their own location.
export const CITIES = [
  { id: "hubballi", name: "Hubballi", centre: { latitude: 15.3647, longitude: 75.124 } },
  { id: "dharwad", name: "Dharwad", centre: { latitude: 15.4589, longitude: 75.0078 } },
] as const satisfies readonly { id: string; name: string; centre: Point }[];

export type City = (typeof CITIES)[number];
export type CityId = City["id"];

const DEFAULT_CITY: City = CITIES[1];
const STORAGE_KEY = "sukoonam-city";
const CHANGE_EVENT = "sukoonam-city-change";

export function findCity(id: string | null | undefined): City {
  return CITIES.find((city) => city.id === id) ?? DEFAULT_CITY;
}

// The city name a spa owner typed, matched to one of ours (or Dharwad).
export function cityByName(name: string | null | undefined): City {
  const wanted = (name ?? "").trim().toLowerCase();
  return CITIES.find((city) => city.name.toLowerCase() === wanted || (city.id === "hubballi" && wanted === "hubli")) ?? DEFAULT_CITY;
}

// Kept in memory too, for browsers that block storage.
let chosenId: string | null = null;

function readStoredId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? chosenId;
  } catch {
    return chosenId;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// The visitor's chosen city, remembered in this browser. Pages render with
// Dharwad first, then switch once the browser has loaded.
export function useCity(): City {
  const id = useSyncExternalStore(subscribe, readStoredId, () => null);
  return findCity(id);
}

export function chooseCity(id: CityId) {
  chosenId = id;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Private windows may block storage; the choice then lasts for this page only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
