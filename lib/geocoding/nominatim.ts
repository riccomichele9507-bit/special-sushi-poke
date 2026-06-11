// Geocoder via OpenStreetMap Nominatim (gratis, no API key).
// Rate limit: 1 req/sec, User-Agent obbligatorio.
// Accuratezza: sufficiente per Bari/Italia (talvolta meno preciso di Google su civici).
//
// Quando si vorrà passare a Google Maps: sostituire l'export di geocodeAddress
// con la versione google in `./google.ts`.

import "server-only";
import type { LatLng } from "./haversine";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "SpecialSushiPoke/1.0 (https://special-sushi-poke.vercel.app)";

export interface GeocodeResult extends LatLng {
  displayName: string;
}

/**
 * Geocodifica un indirizzo testuale in Italia → lat/lng.
 * Ritorna null se nessun risultato. Throw se errore network/timeout.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  if (!address || address.trim().length < 3) return null;

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("q", address.trim());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "it,en",
    },
    // Nominatim può essere lentino, alziamo timeout via signal
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data.length) return null;

  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    displayName: first.display_name,
  };
}
