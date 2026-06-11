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
  now: Date = new Date(),
): EffectiveStatus {
  const dbStatus = order.status;

  // Stati finali/manuali: sempre rispettati
  if (
    dbStatus === "delivered" ||
    dbStatus === "cancelled" ||
    dbStatus === "refunded" ||
    dbStatus === "in_delivery"
  ) {
    return dbStatus;
  }

  // Per pickup, "ready" = pronto da ritirare
  if (dbStatus === "ready") return "ready";

  // Stati intermedi → calcolo da tempo
  const slotStartMs = new Date(order.slot_start).getTime();
  const minutesToSlotStart = (slotStartMs - now.getTime()) / 60_000;

  if (dbStatus === "received") {
    // Appena ricevuto, in attesa pagamento o conferma
    return "received";
  }

  if (dbStatus === "confirmed") {
    // Confermato: a 30min dallo slot promuovi a preparing, a 10min a ready
    if (minutesToSlotStart < 10) return "ready";
    if (minutesToSlotStart < 30) return "preparing";
    return "confirmed";
  }

  if (dbStatus === "preparing") {
    if (minutesToSlotStart < 10) return "ready";
    return "preparing";
  }

  return dbStatus;
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
      return "Ordine ricevuto";
    case "confirmed":
      return "Pagamento confermato";
    case "preparing":
      return "In preparazione";
    case "ready":
      return orderType === "pickup"
        ? "Pronto al ritiro!"
        : "Pronto, in attesa del rider";
    case "in_delivery":
      return "In consegna";
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
  const base: { key: EffectiveStatus; label: string }[] = [
    { key: "received", label: "Ricevuto" },
    { key: "confirmed", label: "Confermato" },
    { key: "preparing", label: "In preparazione" },
    {
      key: "ready",
      label: orderType === "pickup" ? "Pronto al ritiro" : "Pronto",
    },
  ];
  if (orderType === "delivery") {
    base.push({ key: "in_delivery", label: "In consegna" });
  }
  base.push({
    key: "delivered",
    label: orderType === "pickup" ? "Ritirato" : "Consegnato",
  });
  return base;
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
