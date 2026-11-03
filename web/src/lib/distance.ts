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
