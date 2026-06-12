"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderOutForFulfillmentEmail } from "@/lib/email/send";
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

  // Fire-and-forget: invio email "Il tuo ordine è partito" / "Pronto al ritiro"
  // Recupera ordine completo + invia. Errori loggati ma non bloccano la transizione.
  const { data: fullOrder } = await sb
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (fullOrder) {
    sendOrderOutForFulfillmentEmail(fullOrder).catch((err) =>
      console.error("[email] sendOrderOutForFulfillment failed:", err),
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  return { ok: true, newStatus };
}

/**
 * Chiude l'ordine come consegnato/ritirato.
 * Solo da stato in_delivery (delivery) o ready (pickup).
 */
export async function markOrderDelivered(orderId: string) {
  await requireAdmin();
  const sb = createAdminClient();

  const { data: order } = await sb
    .from("orders")
    .select("status, order_type")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Ordine non trovato" };
  const validPrevStatus =
    order.order_type === "delivery" ? ["in_delivery"] : ["ready"];
  if (!validPrevStatus.includes(order.status)) {
    return {
      ok: false,
      error: `Non puoi marcare consegnato un ordine in stato "${order.status}". Prima clicca "${order.order_type === "delivery" ? "Affidato al rider" : "Pronto al ritiro"}".`,
    };
  }

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
  revalidatePath("/account");
  return { ok: true };
}

/**
 * Inizio preparazione manuale (anticipa la transizione auto).
 * Solo da confirmed.
 */
export async function markOrderPreparing(orderId: string) {
  await requireAdmin();
  const sb = createAdminClient();

  const { data: order } = await sb
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Ordine non trovato" };
  if (!["received", "confirmed"].includes(order.status)) {
    return {
      ok: false,
      error: `Impossibile: ordine già in stato "${order.status}".`,
    };
  }

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
  revalidatePath("/account");
  return { ok: true };
}
