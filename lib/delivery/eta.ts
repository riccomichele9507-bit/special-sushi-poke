// Calcolo ETA puro (no side effect). Riceve i parametri letti da delivery_settings.

import { addMinutes } from "./time";

export interface TravelBucket {
  max_km: number;
  min: number;
}

export interface EtaParams {
  prepMinutes: number;
  bufferMinutes: number;
  baselineMinMinutes: number;
  travelBuckets: TravelBucket[];
}

export interface EtaResult {
  minutes: number;
  t1: Date; // istante UTC stimato consegna
  travelMinutes: number;
}

/** Trova i minuti di viaggio per la distanza data. */
export function travelMinutesForKm(km: number, buckets: TravelBucket[]): number {
  // Cerca il primo bucket con max_km >= km
  for (const b of buckets) {
    if (km <= b.max_km) return b.min;
  }
  // Se km > max_km dell'ultimo bucket → ritorna l'ultimo (cap)
  return buckets[buckets.length - 1]?.min ?? 0;
}

/**
 * Formula ETA:
 *   ETA = max(baseline_min, prep + travel + buffer)
 *   T1 = now + ETA
 */
export function computeEta(
  km: number,
  now: Date,
  params: EtaParams,
): EtaResult {
  const travel = travelMinutesForKm(km, params.travelBuckets);
  const formula = params.prepMinutes + travel + params.bufferMinutes;
  const minutes = Math.max(formula, params.baselineMinMinutes);
  const t1 = addMinutes(now, minutes);
  return { minutes, t1, travelMinutes: travel };
}

/** Variante pickup: niente travel time, solo prep + buffer con baseline. */
export interface PickupEtaParams {
  prepMinutes: number;
  bufferMinutes: number;
  baselinePickupMin: number;
}

export function computePickupEta(now: Date, params: PickupEtaParams): EtaResult {
  const formula = params.prepMinutes + params.bufferMinutes;
  const minutes = Math.max(formula, params.baselinePickupMin);
  const t1 = addMinutes(now, minutes);
  return { minutes, t1, travelMinutes: 0 };
}
