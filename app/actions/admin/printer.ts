"use server";

import { adminAction, type AdminActionResult } from "./helpers";
import { reprintOrder } from "@/lib/print/queue";

export async function reprint(orderId: string): Promise<AdminActionResult> {
  return adminAction(async () => {
    const ok = await reprintOrder(orderId);
    if (!ok) throw new Error("Reprint fallito");
  }, { revalidate: ["/admin/printer", "/admin/orders"] });
}

/**
 * Cancellazione ordini test. Safety multipla:
 * - Solo ordini con is_test=true
 * - Solo ordini più vecchi di 24h (no swipe accidentale di test in corso)
 * - Solo status non-finali (received/confirmed/cancelled) — mai delivered o in_delivery
 * - Magic word di conferma per evitare click accidentali
 */
export async function clearTestOrders(
  confirmWord?: string,
): Promise<AdminActionResult & { deletedCount?: number }> {
  if (confirmWord !== "CANCELLA-TEST") {
    return {
      ok: false,
      error: 'Conferma con la parola esatta "CANCELLA-TEST"',
    };
  }
  return adminAction(
    async (sb) => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { error, count } = await sb
        .from("orders")
        .delete({ count: "exact" })
        .eq("is_test", true)
        .lt("created_at", cutoff)
        .in("status", ["received", "confirmed", "cancelled"]);
      if (error) throw new Error(error.message);
      console.log(`[clearTestOrders] Eliminati ${count ?? 0} ordini test`);
    },
    { revalidate: ["/admin/orders"] },
  );
}
