// Geocoder via Google Maps Geocoding API.
// Più preciso di Nominatim sui civici italiani.
// Free tier: 10.000 chiamate/mese (Essentials SKU, post marzo 2025).
//
// Setup Google Cloud:
//   1) Crea progetto, abilita "Geocoding API"
//   2) Crea API key restricted by IP (server-only)
//   3) Imposta quota giornaliera (es. 500/giorno) + alert billing
//   4) Variabile env: GOOGLE_MAPS_API_KEY (NO prefisso NEXT_PUBLIC)

import "server-only";
import type { GeocodeResult } from "./nominatim";

const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

interface GoogleGeocodeResponse {
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "INVALID_REQUEST"
    | "UNKNOWN_ERROR";
  error_message?: string;
  results: Array<{
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
      location_type: "ROOFTOP" | "RANGE_INTERPOLATED" | "GEOMETRIC_CENTER" | "APPROXIMATE";
    };
    place_id: string;
    types: string[];
  }>;
}

/**
 * Geocodifica indirizzo italiano via Google Maps. API key obbligatoria.
 * Stessa interface di nominatim.geocodeAddress (drop-in replacement).
 */
export async function geocodeAddressGoogle(
  address: string,
  apiKey: string,
): Promise<GeocodeResult | null> {
  if (!address || address.trim().length < 3) return null;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY mancante");

  const url = new URL(GOOGLE_GEOCODE_URL);
  url.searchParams.set("address", address.trim());
  url.searchParams.set("key", apiKey);
  url.searchParams.set("components", "country:IT");
  url.searchParams.set("language", "it");
  url.searchParams.set("region", "it");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Google Geocoding HTTP ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as GoogleGeocodeResponse;

  // Gestione errori Google
  if (data.status === "ZERO_RESULTS") return null;
  if (data.status === "OVER_QUERY_LIMIT") {
    throw new Error(
      "Google Maps quota giornaliera superata. Riprova domani o controlla il billing.",
    );
  }
  if (data.status === "REQUEST_DENIED") {
    throw new Error(
      `Google Maps richiesta negata: ${data.error_message ?? "verificare API key e restrizioni"}`,
    );
  }
  if (data.status !== "OK") {
    throw new Error(`Google Maps status ${data.status}: ${data.error_message ?? ""}`);
  }

  const first = data.results[0];
  if (!first) return null;

  // Penalizza risultati troppo generici (APPROXIMATE = solo città, no civico)
  // Per consegna serve almeno RANGE_INTERPOLATED o ROOFTOP.
  const locationType = first.geometry.location_type;
  if (locationType === "APPROXIMATE") {
    // Ritorna comunque ma il chiamante può decidere di rifiutare
    // se serve precisione maggiore (per ora accettiamo).
  }

  return {
    lat: first.geometry.location.lat,
    lng: first.geometry.location.lng,
    displayName: first.formatted_address,
  };
}
