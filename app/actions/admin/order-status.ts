"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

/**
 * Smart 1-click: porta l'ordine allo step finale prima della consegna.
 * - delivery → 'in_delivery' (il rider è partito)
 * - pickup → 'ready' (il cliente può venire)
 */
export async function markOrderOutForFulfillment(orderId: string) {
  await requireAdmin();
  const sb = createAdminClient();

  const { data: order } = await sb
    .from("orders")
    .select("id, order_type, status, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "Ordine non trovato" };
  if (
    order.status === "delivered" ||
    order.status === "cancelled" ||
    order.status === "refunded"
  ) {
    return { ok: false, error: `Ordine già in stato "${order.status}"` };
  }

  const newStatus: OrderStatus =
    order.order_type === "delivery" ? "in_delivery" : "ready";

  const { error } = await sb
    .from("orders")
    .update({ status: newStatus, status_updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  await sb.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    changed_by: "admin",
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, newStatus };
}

/**
 * Chiude l'ordine come consegnato/ritirato.
 */
export async function markOrderDelivered(orderId: string) {
  await requireAdmin();
  const sb = createAdminClient();

  const { error } = await sb
    .from("orders")
    .update({
      status: "delivered",
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  await sb.from("order_status_history").insert({
    order_id: orderId,
    status: "delivered",
    changed_by: "admin",
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Inizio preparazione (opzionale, ma utile per tracking esplicito).
 */
export async function markOrderPreparing(orderId: string) {
  await requireAdmin();
  const sb = createAdminClient();

  const { error } = await sb
    .from("orders")
    .update({
      status: "preparing",
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  await sb.from("order_status_history").insert({
    order_id: orderId,
    status: "preparing",
    changed_by: "admin",
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
