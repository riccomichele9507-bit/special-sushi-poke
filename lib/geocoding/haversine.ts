// Distanza in linea d'aria via formula di Haversine. Gratis, matematica pura.
// Per uso come "distanza stradale" si moltiplica per ROAD_MULTIPLIER (≈ 1.3 per Bari).

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
const ROAD_MULTIPLIER = 1.3; // empirico per città italiane: 1.2-1.4

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Distanza geodetica (linea d'aria) tra 2 punti in chilometri. */
export function haversineKm(from: LatLng, to: LatLng): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Stima della distanza stradale a partire dalla linea d'aria.
 * Approssimazione ma sufficiente in attesa di una vera API distance matrix.
 */
export function estimatedRoadKm(from: LatLng, to: LatLng): number {
  return haversineKm(from, to) * ROAD_MULTIPLIER;
}
