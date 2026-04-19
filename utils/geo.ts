import type { City } from '@/types/user';

/**
 * City-centre coordinates for each of the five Apéros Filles cities.
 * Used as a fallback when an event doesn't ship explicit coordinates —
 * a small deterministic offset (per event id) is then applied so every
 * event in the same city doesn't pin at the exact same spot, which
 * would feel visibly fake on the preview.
 *
 * In production the venue's real coordinates would come from a
 * geocoding step (Mapbox / Google) at content-creation time.
 */
export const CITY_COORDS: Record<City, { lat: number; lng: number }> = {
  Lyon: { lat: 45.764, lng: 4.8357 },
  Marseille: { lat: 43.2965, lng: 5.3698 },
  Toulouse: { lat: 43.6047, lng: 1.4442 },
  Montpellier: { lat: 43.6108, lng: 3.8767 },
  Rennes: { lat: 48.1173, lng: -1.6778 },
};

/** Cheap deterministic hash so the offset is stable per event id. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Pseudo-coordinate for an event : city centre + a small offset derived
 * from the event id. Returns the same value across renders.
 *
 * `±0.01°` ≈ ~1 km in France, which is realistic for a venue inside a
 * dense city centre.
 */
export function deriveEventCoords(
  eventId: string,
  city: City,
): { lat: number; lng: number } {
  const base = CITY_COORDS[city];
  const hash = hashString(eventId);
  const latOffset = (((hash >>> 0) % 21) - 10) / 1000;
  const lngOffset = (((hash >>> 8) % 21) - 10) / 1000;
  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset,
  };
}

/**
 * URL for an unbranded street-style static map at the given coordinates.
 * Uses the community OSM static-map service — free, no API key, fine for
 * a prototype. Production would swap to Mapbox / MapTiler with a token.
 */
export function staticMapUrl(
  coords: { lat: number; lng: number },
  options: { zoom?: number; width?: number; height?: number } = {},
): string {
  const { zoom = 15, width = 640, height = 360 } = options;
  const { lat, lng } = coords;
  // `staticmap.openstreetmap.de` exposes the same endpoint signature as
  // most static-map services (center / zoom / size). We deliberately
  // omit the built-in marker — we overlay our own Airbnb-style pin in
  // React Native so it matches the app's design language.
  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${width}x${height}` +
    `&maptype=mapnik`
  );
}
