// Calcolo "status effettivo" cliente-vista combinando lo stato DB col tempo corrente.
// Smart 1-click: il titolare clicca SOLO "Affidato al rider" o "Pronto al ritiro".
// Le transizioni intermedie (preparing → ready) sono calcolate dinamicamente.

import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderType = Database["public"]["Enums"]["order_type"];

export type EffectiveStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "in_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

interface MinimalOrder {
  status: OrderStatus;
  order_type: OrderType;
  slot_start: string; // ISO
  created_at: string; // ISO
}

/**
 * Calcola lo stato che il CLIENTE deve vedere sulla timeline.
 * Stati "finali" del DB (in_delivery, ready, delivered, cancelled, refunded)
 * sono sempre rispettati. Per gli stati intermedi (confirmed → preparing → ready)
 * deduce in base al tempo restante allo slot.
 */
export function getEffectiveStatus(
  order: MinimalOrder,
  _now: Date = new Date(),
): EffectiveStatus {
  const dbStatus = order.status;

  // Modello SEMPLIFICATO a 2 stati visibili: "Ordine ricevuto" → "Affidato al
  // rider / Pronto al ritiro". Nessuno stato intermedio o auto-calcolato.
  if (dbStatus === "cancelled" || dbStatus === "refunded") return dbStatus;

  if (order.order_type === "pickup") {
    if (dbStatus === "ready" || dbStatus === "delivered") return "ready";
    return "received"; // received/confirmed/preparing
  }
  // delivery
  if (dbStatus === "in_delivery" || dbStatus === "delivered") return "in_delivery";
  return "received";
}

/**
 * Label italiano user-friendly per ogni stato.
 */
export function statusLabel(
  status: EffectiveStatus,
  orderType: OrderType,
): string {
  switch (status) {
    case "received":
    case "confirmed":
    case "preparing":
      return "Ordine ricevuto";
    case "ready":
      return "Pronto al ritiro 🏪";
    case "in_delivery":
      return "Affidato al rider, in arrivo 🛵";
    case "delivered":
      return orderType === "pickup" ? "Ritirato" : "Consegnato";
    case "cancelled":
      return "Annullato";
    case "refunded":
      return "Rimborsato";
  }
}

/**
 * Steps timeline mostrati al cliente nell'ordine giusto.
 */
export function timelineSteps(
  orderType: OrderType,
): { key: EffectiveStatus; label: string }[] {
  // Solo 2 step: ricevuto → affidato al rider / pronto al ritiro.
  return [
    { key: "received", label: "Ordine ricevuto" },
    orderType === "pickup"
      ? { key: "ready", label: "Pronto al ritiro" }
      : { key: "in_delivery", label: "Affidato al rider" },
  ];
}

/**
 * Indice dello step corrente nella timeline (per progress UI).
 */
export function timelineIndex(
  effective: EffectiveStatus,
  orderType: OrderType,
): number {
  const steps = timelineSteps(orderType);
  const idx = steps.findIndex((s) => s.key === effective);
  return idx === -1 ? 0 : idx;
}
