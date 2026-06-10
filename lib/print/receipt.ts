// Generatore comanda di cucina in text/plain per Star CloudPRNT 80mm monospace.
// 48 caratteri per linea. Nessuna dipendenza esterna.

import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

type OrderItemSnapshot = {
  dishId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
  variant?: string;
  extras?: string[];
};

const WIDTH = 48; // 80mm Star TSP143IV monospace = 48 char per riga

function center(text: string): string {
  if (text.length >= WIDTH) return text;
  const pad = Math.floor((WIDTH - text.length) / 2);
  return " ".repeat(pad) + text;
}

function rule(char = "-"): string {
  return char.repeat(WIDTH);
}

function pad(left: string, right: string): string {
  const max = WIDTH - right.length - 1;
  const l = left.length > max ? left.slice(0, max - 1) + "…" : left;
  const space = Math.max(1, WIDTH - l.length - right.length);
  return l + " ".repeat(space) + right;
}

function eur(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatRomeDate(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRomeTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateReceiptText(order: OrderRow): string {
  const items = (order.items as unknown as OrderItemSnapshot[]) ?? [];
  const lines: string[] = [];

  // Header
  lines.push(rule("="));
  lines.push(center("SPECIAL SUSHI POKE"));
  lines.push(center("via G. Petroni, Bari"));
  lines.push(rule("="));
  lines.push("");

  // Order meta
  lines.push(`Ordine:  ${order.order_number}`);
  lines.push(`Data:    ${formatRomeDate(order.created_at)}`);
  lines.push(
    `Tipo:    ${order.order_type === "delivery" ? "CONSEGNA A DOMICILIO" : "RITIRO AL LOCALE"}`,
  );
  if (order.order_type === "delivery") {
    lines.push(
      `Slot:    ${formatRomeTime(order.slot_start)} - ${formatRomeTime(order.slot_end)}`,
    );
  } else {
    lines.push(
      `Pronto:  ${formatRomeTime(order.slot_start)} - ${formatRomeTime(order.slot_end)}`,
    );
  }
  lines.push("");
  lines.push(rule());

  // Customer
  lines.push("CLIENTE");
  lines.push(`  ${order.customer_name}`);
  lines.push(`  Tel: ${order.customer_phone}`);

  // Address (delivery only)
  if (order.order_type === "delivery") {
    lines.push("");
    lines.push("INDIRIZZO");
    if (order.address_line) lines.push(`  ${order.address_line}`);
    if (order.address_notes) lines.push(`  Note: ${order.address_notes}`);
    if (order.road_distance_m != null) {
      lines.push(`  Distanza: ${(order.road_distance_m / 1000).toFixed(1)} km`);
    }
    if (order.driver_notes) {
      lines.push("");
      lines.push("NOTE RIDER");
      lines.push(`  ${order.driver_notes}`);
    }
  }
  lines.push(rule());

  // Items
  lines.push("PIATTI");
  lines.push("");
  for (const item of items) {
    const left = `${item.qty}x ${item.name}`;
    lines.push(pad(left, eur(item.lineTotalCents)));
    if (item.variant) lines.push(`    variante: ${item.variant}`);
    if (item.extras && item.extras.length > 0) {
      lines.push(`    extra: ${item.extras.join(", ")}`);
    }
  }
  lines.push("");
  lines.push(rule());

  // Totals
  lines.push(pad("Subtotale", eur(order.subtotal_cents)));
  if (order.discount_cents > 0) {
    const label = order.discount_code
      ? `Sconto (${order.discount_code})`
      : "Sconto";
    lines.push(pad(label, `-${eur(order.discount_cents)}`));
  }
  if (order.tip_cents > 0) {
    lines.push(pad("Mancia", eur(order.tip_cents)));
  }
  lines.push(rule("="));
  lines.push(pad("TOTALE", eur(order.total_cents)));
  lines.push(rule("="));

  // Payment
  lines.push("");
  lines.push(
    `Pagamento: ${order.payment_method === "cash" ? "CONTANTI ALLA CONSEGNA" : "CARTA (Stripe) - GIA' PAGATO"}`,
  );

  // Reminder fiscale per il titolare
  if (!order.fiscal_receipt_issued) {
    lines.push("");
    lines.push(rule("!"));
    lines.push(center("EMETTERE DOCUMENTO COMMERCIALE"));
    lines.push(center("dalla Cassa Fiscale del SmartPOS Nexi"));
    lines.push(rule("!"));
  }

  // Padding finale per lo strappo
  lines.push("");
  lines.push("");
  lines.push("");

  return lines.join("\n");
}
