// Promo automatica del locale — ora CONFIGURABILE da /admin → Dati ristorante
// (prima era hardcoded). Anti-tamper: il valore reale è ricalcolato server-side
// in createOrder leggendo la config dal DB (lib/promo/server.ts). Il client usa
// la config idratata dall'RSC nel layout (fallback al default).

export interface PromoConfig {
  active: boolean;
  /** Percentuale di sconto 1..100 */
  percent: number;
  /** Soglia minima carrello in centesimi */
  minCents: number;
}

/** Marcatore salvato in orders.discount_code quando la promo è applicata. */
export const PROMO_CODE = "PROMO20";

export const DEFAULT_PROMO: PromoConfig = {
  active: true,
  percent: 20,
  minCents: 5000,
};

// Config corrente lato client (singleton idratato dal layout, come menu-registry).
let current: PromoConfig = DEFAULT_PROMO;

/** Idratazione client con la config dal DB (chiamata dal provider nel layout). */
export function hydratePromoConfig(cfg: PromoConfig | null | undefined): void {
  if (cfg) current = cfg;
}

/** Config promo corrente lato client (fallback al default finché non idratata). */
export function promoConfig(): PromoConfig {
  return current;
}

/** Sconto in centesimi per il subtotale dato (0 se sotto soglia o promo spenta). */
export function computeAutoPromoCents(
  subtotalCents: number,
  cfg: PromoConfig = current,
): number {
  if (!cfg.active || subtotalCents < cfg.minCents) return 0;
  return Math.floor((subtotalCents * cfg.percent) / 100);
}

/** Centesimi mancanti per sbloccare la promo (0 se già attiva / promo spenta). */
export function centsToPromo(
  subtotalCents: number,
  cfg: PromoConfig = current,
): number {
  if (!cfg.active || subtotalCents >= cfg.minCents) return 0;
  return cfg.minCents - subtotalCents;
}
