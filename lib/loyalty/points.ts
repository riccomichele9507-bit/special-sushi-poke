// Loyalty system MVP — punti spesa derivati dagli ordini delivered.
// 1€ speso = 1 punto. 100 punti = €10 sconto sul prossimo ordine.
// Calcolato on-the-fly dalla tabella orders, no DB column dedicata
// (semplicità + nessuna migration richiesta in MVP).

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const POINTS_PER_EURO = 1;
export const POINTS_REDEMPTION_THRESHOLD = 100; // 100 punti
export const POINTS_REDEMPTION_VALUE_CENTS = 1000; // €10 sconto

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
    .select("total_cents, status, discount_code, discount_cents")
    .eq("customer_id", customerId)
    .eq("is_test", false);

  let totalSpentCents = 0;
  let totalPointsEarned = 0;
  let totalPointsRedeemed = 0;
  let ordersCount = 0;

  for (const o of orders ?? []) {
    if (o.status === "delivered") {
      // Solo ordini effettivamente consegnati danno punti
      totalSpentCents += o.total_cents;
      totalPointsEarned += Math.floor(o.total_cents / 100) * POINTS_PER_EURO;
      ordersCount += 1;
    }
    // Sconto loyalty: track redemption
    if (o.discount_code?.startsWith("LOYALTY-") && o.discount_cents) {
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
