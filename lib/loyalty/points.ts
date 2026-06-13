// Loyalty system MVP — punti spesa derivati dagli ordini.
// 1€ speso (sui piatti, mancia esclusa) = 1 punto. 100 punti = €5 sconto.
// Calcolato on-the-fly dalla tabella orders, no DB column dedicata
// (semplicità + nessuna migration richiesta in MVP).

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const POINTS_PER_EURO = 1;
export const POINTS_REDEMPTION_THRESHOLD = 100; // 100 punti
export const POINTS_REDEMPTION_VALUE_CENTS = 500; // €5 sconto

/** Prefisso codice usato per marcare un ordine che ha riscattato lo sconto fedeltà. */
export const LOYALTY_CODE_PREFIX = "LOYALTY-";

export interface LoyaltyStatus {
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  balance: number;
  pointsToNextReward: number;
  euroNextReward: number;
  ordersCount: number;
  totalSpentCents: number;
}

/**
 * Calcola lo stato fedeltà di un cliente.
 * Punti guadagnati = somma totali ordini delivered (in cents) / 100.
 * Punti riscattati = totale sconti applicati con code "LOYALTY-*" (futuro).
 */
export async function getLoyaltyStatus(customerId: string): Promise<LoyaltyStatus> {
  const sb = createAdminClient();
  const { data: orders } = await sb
    .from("orders")
    .select("subtotal_cents, total_cents, status, discount_code, discount_cents")
    .eq("customer_id", customerId)
    .eq("is_test", false);

  let totalSpentCents = 0;
  let totalPointsEarned = 0;
  let totalPointsRedeemed = 0;
  let ordersCount = 0;

  // Punti maturati: ordini confermati o consegnati (cliente li vede subito post-pagamento).
  // I confermati non-delivered restano contabilizzati: appena admin segna come
  // delivered, niente cambia (sono già conteggiati). Cancellati/refunded esclusi.
  const POINT_EARNING_STATUSES = new Set([
    "confirmed",
    "preparing",
    "ready",
    "in_delivery",
    "delivered",
  ]);
  for (const o of orders ?? []) {
    if (POINT_EARNING_STATUSES.has(o.status)) {
      // Punti maturati sulla spesa REALE dei piatti: subtotale meno eventuale
      // sconto, mancia esclusa. (subtotal_cents è il valore piatti pre-sconto.)
      const eligibleCents = Math.max(0, o.subtotal_cents - (o.discount_cents ?? 0));
      totalSpentCents += o.total_cents;
      totalPointsEarned += Math.floor(eligibleCents / 100) * POINTS_PER_EURO;
      ordersCount += 1;
    }
    // Sconto loyalty: track redemption (il codice può essere combinato con uno manuale)
    if (o.discount_code?.includes(LOYALTY_CODE_PREFIX) && o.discount_cents) {
      totalPointsRedeemed += POINTS_REDEMPTION_THRESHOLD;
    }
  }

  const balance = totalPointsEarned - totalPointsRedeemed;
  const pointsToNextReward = Math.max(0, POINTS_REDEMPTION_THRESHOLD - (balance % POINTS_REDEMPTION_THRESHOLD));

  return {
    totalPointsEarned,
    totalPointsRedeemed,
    balance,
    pointsToNextReward,
    euroNextReward: POINTS_REDEMPTION_VALUE_CENTS / 100,
    ordersCount,
    totalSpentCents,
  };
}

export interface LoyaltyRedemption {
  /** Sconto fedeltà da applicare a QUESTO ordine (cents). 0 se non idoneo. */
  discountCents: number;
  /** Codice da scrivere su orders.discount_code (marca la redemption). */
  code: string | null;
}

/**
 * Calcola il riscatto fedeltà automatico per un nuovo ordine.
 * Idoneo se il saldo punti corrente ≥ soglia (100). Applica €5 e consuma 100 punti.
 * Va chiamato SERVER-SIDE in createOrder (anti-tamper): il client non decide nulla.
 */
export async function computeLoyaltyRedemption(
  customerId: string,
): Promise<LoyaltyRedemption> {
  const status = await getLoyaltyStatus(customerId);
  if (status.balance >= POINTS_REDEMPTION_THRESHOLD) {
    return {
      discountCents: POINTS_REDEMPTION_VALUE_CENTS,
      code: `${LOYALTY_CODE_PREFIX}${Date.now()}`,
    };
  }
  return { discountCents: 0, code: null };
}
