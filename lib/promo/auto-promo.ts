// Unica promo del locale: 20% automatico sul carrello a partire da €50.
// Si applica da sola, nessun codice. Anti-tamper: il valore reale è ricalcolato
// SEMPRE server-side in createOrder; client solo per display.
// Config v1 hardcoded (volendo, in futuro spostabile in restaurant_settings + admin).

export const AUTO_PROMO = {
  active: true,
  percent: 20,
  /** Soglia minima carrello (centesimi) per attivare la promo. */
  minCents: 5000,
  label: "Promo 20% su tutto",
  /** Marcatore salvato in orders.discount_code quando applicata. */
  code: "PROMO20",
} as const;

/** Sconto in centesimi per il subtotale dato (0 se sotto soglia o promo spenta). */
export function computeAutoPromoCents(subtotalCents: number): number {
  if (!AUTO_PROMO.active || subtotalCents < AUTO_PROMO.minCents) return 0;
  return Math.floor((subtotalCents * AUTO_PROMO.percent) / 100);
}

/** Centesimi che mancano per sbloccare la promo (0 se già attiva / promo spenta). */
export function centsToPromo(subtotalCents: number): number {
  if (!AUTO_PROMO.active || subtotalCents >= AUTO_PROMO.minCents) return 0;
  return AUTO_PROMO.minCents - subtotalCents;
}
