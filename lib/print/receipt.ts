// Generatore comanda di cucina in text/plain per Star CloudPRNT 80mm monospace.
// 48 caratteri per linea. Nessuna dipendenza esterna.

import type { Database } from "@/lib/supabase/database.types";
import {
  printer as ThermalPrinter,
  types as PrinterTypes,
  characterSet as CharacterSet,
} from "node-thermal-printer";

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

/**
 * Sanitizza in ASCII puro (0x20-0x7E): rimuove i diacritici (à→a, è→e),
 * converte € → "E" (1 char, preserva l'allineamento delle colonne) e scarta
 * ogni altro carattere non-ASCII. I byte ASCII bassi stampano IDENTICI in
 * qualsiasi code page Star (CP437/CP858/CP1252...), quindi la comanda è leggibile
 * a prescindere dalla configurazione della stampante. Zero rischio "caratteri strani".
 */
function sanitizeAscii(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining diacritics
    .replace(/€/g, "E")
    .replace(/[^\x20-\x7E\n]/g, ""); // tutto il resto non-ASCII (tranne newline)
}

/**
 * Comanda di cucina come TESTO ASCII per CloudPRNT `text/plain` — il formato
 * nativo e universalmente supportato dalla TSP143IV (TSP100IV). Niente byte
 * Star Line/StarPRNT (incompatibili su questo firmware → errore 510), niente
 * QR (richiederebbe `image/png`). Riusa il layout di generateReceiptText().
 */
export function generateReceiptPlainText(order: OrderRow): string {
  return sanitizeAscii(generateReceiptText(order));
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
 * Comanda di cucina (Buffer StarLine) stile Glovo: header grande, totali con
 * sconto, stato pagamento, blocco consegna e QR di navigazione (solo delivery).
 * Usa node-thermal-printer in modalità STAR (StarLine nativo, default della
 * TSP143IV): la stampante disegna il QR nativamente dalla stringa URL. NIENTE
 * ESC/POS emulation (eviterebbe il "Print Job Routing" e rischi di QR spezzato).
 */
export function generateReceiptPayload(order: OrderRow): Buffer {
  const items = (order.items as unknown as OrderItemSnapshot[]) ?? [];
  const isDelivery = order.order_type === "delivery";

  const p = new ThermalPrinter({
    type: PrinterTypes.STAR,
    interface: "tcp://0.0.0.0", // non usato: generiamo il buffer, invio via CloudPRNT
    characterSet: CharacterSet.PC858_EURO, // accentate IT + simbolo €
    removeSpecialCharacters: false,
  });

  // Header
  p.alignCenter();
  p.setTextDoubleHeight();
  p.bold(true);
  p.println(isDelivery ? "DELIVERY" : "RITIRO");
  p.bold(false);
  p.setTextNormal();
  p.println("SPECIAL SUSHI POKE");
  p.newLine();
  p.setTextDoubleHeight();
  p.bold(true);
  p.println(order.customer_name);
  p.bold(false);
  p.setTextNormal();
  p.println(rule("="));

  // Meta ordine
  p.alignLeft();
  p.println(`Ordine #${order.order_number}`);
  p.println(`Data:  ${formatRomeDate(order.created_at)}`);
  p.println(
    `${isDelivery ? "Consegna" : "Pronto"}: ${formatRomeTime(order.slot_start)}-${formatRomeTime(order.slot_end)}`,
  );
  p.println(rule("="));

  // Piatti
  for (const it of items) {
    p.println(pad(`${it.qty}x ${it.name}`, eur(it.lineTotalCents)));
    if (it.variant) p.println(`   ${it.variant}`);
    if (it.extras && it.extras.length > 0) {
      p.println(`   + ${it.extras.join(", ")}`);
    }
  }
  p.println(rule("-"));

  // Totali: prezzo intero - sconto = totale
  p.println(pad("Subtotale", eur(order.subtotal_cents)));
  if (order.discount_cents > 0) {
    const label = order.discount_code
      ? `Sconto (${order.discount_code})`
      : "Sconto";
    p.println(pad(label, `-${eur(order.discount_cents)}`));
  }
  if (order.tip_cents > 0) p.println(pad("Mancia", eur(order.tip_cents)));
  p.println(rule("="));
  p.setTextDoubleHeight();
  p.bold(true);
  p.println(pad("TOTALE", eur(order.total_cents)));
  p.bold(false);
  p.setTextNormal();
  p.println(rule("="));

  // Stato pagamento
  p.alignCenter();
  p.bold(true);
  if (order.payment_method === "card") {
    p.println("*** GIA' PAGATO ONLINE ***");
    p.bold(false);
    p.println("Carta - Stripe");
  } else {
    p.println(
      isDelivery ? "*** DA INCASSARE ***" : "*** DA INCASSARE AL BANCO ***",
    );
    p.bold(false);
    p.println(`Contanti o carta - ${eur(order.total_cents)}`);
  }
  p.println(rule("="));

  // Blocco cliente / consegna
  p.alignLeft();
  p.bold(true);
  p.println(isDelivery ? "CONSEGNA" : "RITIRO AL BANCO");
  p.bold(false);
  if (isDelivery && order.address_line) p.println(`  ${order.address_line}`);
  if (isDelivery && order.address_notes) p.println(`  Note: ${order.address_notes}`);
  p.println(`  Tel: ${order.customer_phone}`);
  if (isDelivery && order.road_distance_m != null) {
    p.println(`  Distanza: ${(order.road_distance_m / 1000).toFixed(1)} km`);
  }
  if (isDelivery && order.driver_notes) {
    p.println("  Note rider:");
    p.println(`  "${order.driver_notes}"`);
  }
  p.println(rule("="));

  // QR navigazione (solo delivery con coordinate). La stampante disegna il QR.
  const navUrl = isDelivery ? mapsNavUrl(order) : null;
  if (navUrl) {
    p.newLine();
    p.alignCenter();
    p.printQR(navUrl, { cellSize: 6, correction: "M", model: 2 });
    p.newLine();
    p.bold(true);
    p.println(">> Scansiona per navigare <<");
    p.bold(false);
    p.println(rule("="));
  }

  // Footer
  p.alignCenter();
  p.println("Questo non e' un documento fiscale");
  if (!order.fiscal_receipt_issued) {
    p.println("Emettere Documento Commerciale (Nexi)");
  }
  p.cut();

  return p.getBuffer();
}
