// Provider selector. Se GOOGLE_MAPS_API_KEY è impostata in env → Google.
// Altrimenti fallback a Nominatim (OpenStreetMap, gratis no key).

import "server-only";
import type { GeocodeResult } from "./nominatim";
import { geocodeAddress as geocodeAddressNominatim } from "./nominatim";
import { geocodeAddressGoogle } from "./google";

export { haversineKm, estimatedRoadKm, type LatLng } from "./haversine";
export type { GeocodeResult } from "./nominatim";

/** Coordinate ristorante hard-coded (sync con restaurant_settings). */
export const RESTAURANT_COORDS = { lat: 41.1207, lng: 16.8693 } as const;

/**
 * Geocodifica indirizzo. Sceglie automaticamente il provider:
 *   - Google se GOOGLE_MAPS_API_KEY è impostata
 *   - Nominatim altrimenti (fallback gratuito)
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    return geocodeAddressGoogle(address, googleKey);
  }
  return geocodeAddressNominatim(address);
}

/** Ritorna il provider attivo (utile per debug/admin). */
export function activeGeocodingProvider(): "google" | "nominatim" {
  return process.env.GOOGLE_MAPS_API_KEY ? "google" : "nominatim";
}
