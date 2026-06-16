// Generatore comanda di cucina in text/plain per Star CloudPRNT 80mm monospace.
// 48 caratteri per linea. Nessuna dipendenza esterna.

import type { Database } from "@/lib/supabase/database.types";
import { EscPosBuilder } from "./escpos";

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
  const isDelivery = order.order_type === "delivery";

  // Banner GIGANTE DELIVERY o RITIRO - prima cosa che la cucina vede
  lines.push(rule("#"));
  lines.push(rule("#"));
  if (isDelivery) {
    lines.push(center(">>>   D E L I V E R Y   <<<"));
    lines.push(center("CONSEGNA A DOMICILIO"));
  } else {
    lines.push(center(">>>     R I T I R O     <<<"));
    lines.push(center("CLIENTE VIENE A RITIRARE"));
  }
  lines.push(rule("#"));
  lines.push(rule("#"));
  lines.push("");

  // Header ristorante
  lines.push(center("SPECIAL SUSHI POKE"));
  lines.push(center("Via G. Petroni 12/H-i, Bari"));
  lines.push(rule("="));
  lines.push("");

  // Order meta
  lines.push(`Ordine:  ${order.order_number}`);
  lines.push(`Data:    ${formatRomeDate(order.created_at)}`);
  if (isDelivery) {
    lines.push(
      `CONSEGNARE: ${formatRomeTime(order.slot_start)} - ${formatRomeTime(order.slot_end)}`,
    );
  } else {
    lines.push(
      `PRONTO PER:  ${formatRomeTime(order.slot_start)} - ${formatRomeTime(order.slot_end)}`,
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

  // Payment - banner visibile e contestuale
  lines.push("");
  lines.push(rule("*"));
  if (order.payment_method === "card") {
    lines.push(center("*** GIA' PAGATO ONLINE ***"));
    lines.push(center("Carta via Stripe"));
    if (order.stripe_payment_intent_id) {
      lines.push(center(`PI: ${order.stripe_payment_intent_id.slice(0, 18)}...`));
    }
  } else {
    // cash on delivery - accetta sia contanti che POS rider
    if (isDelivery) {
      lines.push(center("*** DA INCASSARE ***"));
      lines.push(center("CONTANTI o CARTA (POS rider)"));
      lines.push(center(`Importo: ${eur(order.total_cents)}`));
    } else {
      lines.push(center("*** DA INCASSARE AL BANCO ***"));
      lines.push(center("CONTANTI o CARTA"));
      lines.push(center(`Importo: ${eur(order.total_cents)}`));
    }
  }
  lines.push(rule("*"));

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

/** URL Google Maps navigazione verso l'indirizzo di consegna (Modo 3 + fallback). */
function mapsNavUrl(order: OrderRow): string | null {
  const geo = order.geo as
    | { lat?: number; lng?: number; placeId?: string }
    | null;
  if (!geo || typeof geo.lat !== "number" || typeof geo.lng !== "number") {
    return null;
  }
  let url = `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`;
  if (geo.placeId) {
    url += `&destination_place_id=${encodeURIComponent(geo.placeId)}`;
  }
  return url;
}

/**
 * Comanda di cucina in ESC/POS (Buffer) stile Glovo: header grande, totali con
 * sconto, stato pagamento, blocco consegna e QR di navigazione (solo delivery).
 * La stampante genera il QR nativamente dalla stringa URL.
 */
export function generateReceiptPayload(order: OrderRow): Buffer {
  const items = (order.items as unknown as OrderItemSnapshot[]) ?? [];
  const isDelivery = order.order_type === "delivery";
  const b = new EscPosBuilder();

  // Header
  b.align(1);
  b.size(2, 2).bold(true).line(isDelivery ? "DELIVERY" : "RITIRO");
  b.size(1, 1).bold(false).line("SPECIAL SUSHI POKE");
  b.feed(1);
  b.size(1, 2).bold(true).line(order.customer_name);
  b.size(1, 1).bold(false);
  b.align(0).line(rule("="));

  // Meta ordine
  b.line(`Ordine #${order.order_number}`);
  b.line(`Data:  ${formatRomeDate(order.created_at)}`);
  b.line(
    `${isDelivery ? "Consegna" : "Pronto"}: ${formatRomeTime(order.slot_start)}-${formatRomeTime(order.slot_end)}`,
  );
  b.line(rule("="));

  // Piatti
  for (const it of items) {
    b.line(pad(`${it.qty}x ${it.name}`, eur(it.lineTotalCents)));
    if (it.variant) b.line(`   ${it.variant}`);
    if (it.extras && it.extras.length > 0) {
      b.line(`   + ${it.extras.join(", ")}`);
    }
  }
  b.line(rule("-"));

  // Totali: prezzo intero - sconto = totale
  b.line(pad("Subtotale", eur(order.subtotal_cents)));
  if (order.discount_cents > 0) {
    const label = order.discount_code
      ? `Sconto (${order.discount_code})`
      : "Sconto";
    b.line(pad(label, `-${eur(order.discount_cents)}`));
  }
  if (order.tip_cents > 0) b.line(pad("Mancia", eur(order.tip_cents)));
  b.line(rule("="));
  b.size(1, 2).bold(true).line(pad("TOTALE", eur(order.total_cents)));
  b.size(1, 1).bold(false).line(rule("="));

  // Stato pagamento
  b.align(1).bold(true);
  if (order.payment_method === "card") {
    b.line("*** GIA' PAGATO ONLINE ***").bold(false).line("Carta - Stripe");
  } else {
    b.line(isDelivery ? "*** DA INCASSARE ***" : "*** DA INCASSARE AL BANCO ***")
      .bold(false)
      .line(`Contanti o carta - ${eur(order.total_cents)}`);
  }
  b.align(0).line(rule("="));

  // Blocco cliente / consegna
  b.bold(true).line(isDelivery ? "CONSEGNA" : "RITIRO AL BANCO").bold(false);
  if (isDelivery) {
    if (order.address_line) b.line(`  ${order.address_line}`);
    if (order.address_notes) b.line(`  Note: ${order.address_notes}`);
  }
  b.line(`  Tel: ${order.customer_phone}`);
  if (isDelivery && order.road_distance_m != null) {
    b.line(`  Distanza: ${(order.road_distance_m / 1000).toFixed(1)} km`);
  }
  if (isDelivery && order.driver_notes) {
    b.line("  Note rider:");
    b.line(`  "${order.driver_notes}"`);
  }
  b.line(rule("="));

  // QR navigazione (solo delivery con coordinate)
  const navUrl = isDelivery ? mapsNavUrl(order) : null;
  if (navUrl) {
    b.feed(1).align(1).qr(navUrl, 8);
    b.feed(1).bold(true).line(">> Scansiona per navigare <<").bold(false);
    b.align(0).line(rule("="));
  }

  // Footer
  b.align(1).line("Questo non e' un documento fiscale");
  if (!order.fiscal_receipt_issued) {
    b.line("Emettere Documento Commerciale (Nexi)");
  }
  b.align(0).cut();

  return b.build();
}
