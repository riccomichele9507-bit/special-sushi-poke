"use server";

import { adminAction, type AdminActionResult } from "./helpers";
import { reprintOrder } from "@/lib/print/queue";

export async function reprint(orderId: string): Promise<AdminActionResult> {
  return adminAction(async () => {
    const ok = await reprintOrder(orderId);
    if (!ok) throw new Error("Reprint fallito");
  }, { revalidate: ["/admin/printer", "/admin/orders"] });
}

export async function clearTestOrders(): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb.from("orders").delete().eq("is_test", true);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/orders"] },
  );
}
