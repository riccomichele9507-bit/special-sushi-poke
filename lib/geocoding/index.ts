// Provider selector. Se GOOGLE_MAPS_API_KEY è impostata in env → Google.
// Altrimenti fallback a Nominatim (OpenStreetMap, gratis no key).

import "server-only";
import type { GeocodeResult } from "./nominatim";
import { geocodeAddress as geocodeAddressNominatim } from "./nominatim";
import { geocodeAddressGoogle } from "./google";

export { haversineKm, estimatedRoadKm, type LatLng } from "./haversine";
export type { GeocodeResult } from "./nominatim";

/**
 * Coordinate ristorante: hardcoded come fallback, ma la fonte di verità è
 * restaurant_settings.lat/lng (modificabile dal dashboard admin).
 * Vedi getRestaurantCoords() in lib/delivery/validate.ts.
 */
export const RESTAURANT_COORDS_FALLBACK = {
  lat: 41.0967058,
  lng: 16.8676296,
} as const;

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
