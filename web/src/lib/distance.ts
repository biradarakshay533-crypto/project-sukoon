export type Point = { latitude: number; longitude: number };

// Straight-line distance between two places on Earth, in kilometres.
export function distanceKm(a: Point, b: Point) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// The centre of Dharwad, used when we do not know where the visitor is.
export const DHARWAD: Point = { latitude: 15.4589, longitude: 75.0078 };

// A rough time to get there in city traffic. Roads are about 1.3 times
// longer than a straight line, at around 25 km/h, plus a few minutes to park.
export function travelMinutes(km: number) {
  return Math.max(3, Math.round(km * 3.1 + 3));
}

// "1.2 km · ~7 min", for showing how far a spa is.
export function distanceLabel(km: number) {
  const distance = km < 0.1 ? "Under 100 m" : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
  return `${distance} · ~${travelMinutes(km)} min`;
}
