// Generatore comanda di cucina in text/plain per Star CloudPRNT 80mm monospace.
// 48 caratteri per linea. Nessuna dipendenza esterna.

import type { Database } from "@/lib/supabase/database.types";
import {
  printer as ThermalPrinter,
  types as PrinterTypes,
  characterSet as CharacterSet,
} from "node-thermal-printer";
import zlib from "node:zlib";
import { createCanvas, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import QRCode from "qrcode";
import { MONO_REGULAR_B64, MONO_BOLD_B64 } from "./font-data";

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

// ============================================================
// COMANDA PNG (image/png) — formato definitivo per Star TSP143IV
// La TSP100IV/143IV via CloudPRNT NON decodifica vnd.star.line né il markup:
// rendiamo l'intera comanda come immagine PNG (supportata nativamente), che
// permette QR di navigazione + grassetto + simbolo € reale, in un'unica striscia.
// Font JetBrains Mono incorporati (font-data.ts) → rendering identico su Vercel.
// ============================================================

const PNG_FONT_REG = "ReceiptMono";
const PNG_FONT_BOLD = "ReceiptMonoBold";
let pngFontsRegistered = false;

function ensurePngFonts(): void {
  if (pngFontsRegistered) return;
  GlobalFonts.register(Buffer.from(MONO_REGULAR_B64, "base64"), PNG_FONT_REG);
  GlobalFonts.register(Buffer.from(MONO_BOLD_B64, "base64"), PNG_FONT_BOLD);
  pngFontsRegistered = true;
}

const PNG_W = 576; // 80mm @ 203dpi
const PNG_PAD = 22;
const PNG_INNER = PNG_W - PNG_PAD * 2;

type PngOp =
  | { k: "txt"; s: string; size: number; bold: boolean; align: "l" | "c" | "r" }
  | { k: "row"; l: string; r: string; size: number; bold: boolean }
  | { k: "hr"; heavy: boolean }
  | { k: "gap"; h: number }
  | { k: "qr"; matrix: boolean[][]; box: number };

// Ingrandimento globale dei caratteri (richiesta: testo leggermente più grande).
const PNG_SIZE_SCALE = 1.12;

function pngLineHeight(size: number): number {
  return Math.round(size * PNG_SIZE_SCALE * 1.34);
}

// ---- Encoder PNG monocromatico 1-bit (formato accettato dalla TSP100IV) ----
function pngCrc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(pngCrc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/**
 * Codifica un PNG grayscale 1-bit (bit depth 1, color type 0, non interlacciato):
 * il formato "Monochrome (1 bit per pixel)" che la TSP143IV decodifica, con
 * altezze molto maggiori del 24bpp. bit=1 → bianco, bit=0 → nero.
 */
function encodeMonoPng(
  width: number,
  height: number,
  isWhite: (x: number, y: number) => boolean,
): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(1, 8); // bit depth
  ihdr.writeUInt8(0, 9); // color type 0 = grayscale
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  const rowBytes = Math.ceil(width / 8);
  const raw = Buffer.alloc((rowBytes + 1) * height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filtro: none
    for (let bx = 0; bx < rowBytes; bx++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = bx * 8 + bit;
        if (x >= width || isWhite(x, y)) byte |= 0x80 >> bit;
      }
      raw[p++] = byte;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Spezza una stringa su più righe entro maxWidth px (word-wrap + hard-split). */
function wrapByWidth(
  ctx: SKRSContext2D,
  font: string,
  text: string,
  maxWidth: number,
): string[] {
  ctx.font = font;
  const out: string[] = [];
  const hardSplit = (word: string): string => {
    let chunk = "";
    for (const ch of word) {
      if (chunk && ctx.measureText(chunk + ch).width > maxWidth) {
        out.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    return chunk;
  };
  for (const rawLine of String(text).split("\n")) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else if (!cur) {
        cur = hardSplit(w);
      } else {
        out.push(cur);
        cur = ctx.measureText(w).width > maxWidth ? hardSplit(w) : w;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

/**
 * Comanda di cucina come PNG (Buffer) per CloudPRNT `image/png`.
 * Layout: banner DELIVERY/RITIRO, dati ordine, cliente, indirizzo (delivery),
 * piatti con varianti/extra (a capo automatico), totali con sconto, stato
 * pagamento, QR di navigazione (solo delivery con coordinate), footer fiscale.
 */
export function generateReceiptPng(order: OrderRow): Buffer {
  ensurePngFonts();
  const items = (order.items as unknown as OrderItemSnapshot[]) ?? [];
  const isDelivery = order.order_type === "delivery";

  const measure = createCanvas(10, 10).getContext("2d");
  // Tutto in GRASSETTO + ingrandito: in PNG 1-bit i tratti sottili a peso
  // normale si assottigliano e appaiono "chiari"; il bold pieno resta nitido.
  const fontStr = (size: number, _bold: boolean) =>
    `${Math.round(size * PNG_SIZE_SCALE)}px ${PNG_FONT_BOLD}`;
  const widthOf = (s: string, size: number, bold: boolean) => {
    measure.font = fontStr(size, bold);
    return measure.measureText(s).width;
  };

  const ops: PngOp[] = [];
  const txt = (
    s: string,
    size: number,
    bold = false,
    align: "l" | "c" | "r" = "l",
  ) => ops.push({ k: "txt", s, size, bold, align });
  const wrapTxt = (s: string, size: number, bold = false) => {
    for (const line of wrapByWidth(measure, fontStr(size, bold), s, PNG_INNER)) {
      txt(line, size, bold, "l");
    }
  };
  const gap = (h: number) => ops.push({ k: "gap", h });
  const hr = (heavy = false) => ops.push({ k: "hr", heavy });
  const row = (l: string, r: string, size: number, bold = false) => {
    const avail = PNG_INNER - widthOf(r, size, bold) - widthOf("  ", size, bold);
    let left = l;
    if (widthOf(left, size, bold) > avail) {
      while (left.length > 1 && widthOf(`${left}…`, size, bold) > avail) {
        left = left.slice(0, -1);
      }
      left = `${left}…`;
    }
    ops.push({ k: "row", l: left, r, size, bold });
  };

  // ---- contenuto ----
  txt(isDelivery ? "DELIVERY" : "RITIRO", 36, true, "c");
  txt(
    isDelivery ? "CONSEGNA A DOMICILIO" : "CLIENTE VIENE A RITIRARE",
    18,
    true,
    "c",
  );
  hr(true);
  txt("SPECIAL SUSHI POKE", 23, true, "c");
  txt("Via G. Petroni 12/H-i, Bari", 17, false, "c");
  hr(true);
  gap(4);
  txt(`Ordine:  ${order.order_number}`, 22, false, "l");
  txt(`Data:    ${formatRomeDate(order.created_at)}`, 19, false, "l");
  txt(
    `${isDelivery ? "CONSEGNARE" : "PRONTO PER"}: ${formatRomeTime(order.slot_start)} - ${formatRomeTime(order.slot_end)}`,
    20,
    true,
    "l",
  );
  hr(false);
  txt("CLIENTE", 17, true, "l");
  wrapTxt(order.customer_name ?? "", 25, true);
  txt(`Tel: ${order.customer_phone ?? ""}`, 20, false, "l");
  if (isDelivery) {
    gap(4);
    txt("INDIRIZZO", 17, true, "l");
    if (order.address_line) wrapTxt(order.address_line, 20, false);
    if (order.address_notes) wrapTxt(`Note: ${order.address_notes}`, 19, false);
    if (order.road_distance_m != null) {
      txt(`Distanza: ${(order.road_distance_m / 1000).toFixed(1)} km`, 19, false, "l");
    }
    if (order.driver_notes) {
      gap(2);
      txt("NOTE RIDER", 17, true, "l");
      wrapTxt(order.driver_notes, 19, false);
    }
  }
  hr(false);
  txt("PIATTI", 17, true, "l");
  gap(2);
  for (const it of items) {
    row(`${it.qty}x ${it.name}`, eur(it.lineTotalCents), 22, false);
    if (it.variant) wrapTxt(`   ${it.variant}`, 17, false);
    if (it.extras && it.extras.length > 0) {
      wrapTxt(`   + ${it.extras.join(", ")}`, 17, false);
    }
  }
  hr(false);
  row("Subtotale", eur(order.subtotal_cents), 21, false);
  if (order.discount_cents > 0) {
    const label = order.discount_code
      ? `Sconto (${order.discount_code})`
      : "Sconto";
    row(label, `-${eur(order.discount_cents)}`, 21, false);
  }
  if (order.tip_cents > 0) row("Mancia", eur(order.tip_cents), 21, false);
  hr(true);
  row("TOTALE", eur(order.total_cents), 31, true);
  hr(true);
  gap(6);
  if (order.payment_method === "card") {
    txt("*** GIÀ PAGATO ONLINE ***", 20, true, "c");
    txt("Carta - Stripe", 17, false, "c");
  } else {
    txt(
      isDelivery ? "*** DA INCASSARE ***" : "*** DA INCASSARE AL BANCO ***",
      20,
      true,
      "c",
    );
    txt(
      isDelivery ? "CONTANTI o CARTA (POS rider)" : "CONTANTI o CARTA",
      17,
      false,
      "c",
    );
    txt(`Importo: ${eur(order.total_cents)}`, 18, true, "c");
  }

  // QR navigazione (solo delivery con coordinate)
  const navUrl = isDelivery ? mapsNavUrl(order) : null;
  if (navUrl) {
    const qr = QRCode.create(navUrl, { errorCorrectionLevel: "M" });
    const n = qr.modules.size;
    const data = qr.modules.data;
    const matrix: boolean[][] = [];
    for (let r = 0; r < n; r++) {
      const rowArr: boolean[] = [];
      for (let c = 0; c < n; c++) rowArr.push(Boolean(data[r * n + c]));
      matrix.push(rowArr);
    }
    const box = Math.max(3, Math.floor(232 / (n + 8))); // +8 = quiet zone 4/lato
    gap(12);
    ops.push({ k: "qr", matrix, box });
    txt(">> Scansiona per navigare <<", 18, true, "c");
  }
  gap(10);
  txt("Non è un documento fiscale", 16, false, "c");
  if (!order.fiscal_receipt_issued) {
    txt("Emettere Documento Commerciale (Nexi)", 16, false, "c");
  }
  gap(28); // margine per lo strappo/taglio

  // ---- calcolo altezza ----
  let height = PNG_PAD;
  for (const op of ops) {
    if (op.k === "txt" || op.k === "row") height += pngLineHeight(op.size);
    else if (op.k === "hr") height += op.heavy ? 14 : 12;
    else if (op.k === "gap") height += op.h;
    else if (op.k === "qr") height += (op.matrix.length + 8) * op.box;
  }
  height += PNG_PAD;

  // ---- rendering ----
  const canvas = createCanvas(PNG_W, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PNG_W, height);
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";

  let y = PNG_PAD;
  for (const op of ops) {
    if (op.k === "txt") {
      ctx.font = fontStr(op.size, op.bold);
      const w = ctx.measureText(op.s).width;
      const x =
        op.align === "c"
          ? Math.round((PNG_W - w) / 2)
          : op.align === "r"
            ? Math.round(PNG_W - PNG_PAD - w)
            : PNG_PAD;
      ctx.fillText(op.s, x, y);
      y += pngLineHeight(op.size);
    } else if (op.k === "row") {
      ctx.font = fontStr(op.size, op.bold);
      ctx.fillText(op.l, PNG_PAD, y);
      const rw = ctx.measureText(op.r).width;
      ctx.fillText(op.r, Math.round(PNG_W - PNG_PAD - rw), y);
      y += pngLineHeight(op.size);
    } else if (op.k === "hr") {
      ctx.fillRect(PNG_PAD, y + 5, PNG_INNER, op.heavy ? 2 : 1);
      y += op.heavy ? 14 : 12;
    } else if (op.k === "gap") {
      y += op.h;
    } else if (op.k === "qr") {
      const n = op.matrix.length;
      const dim = (n + 8) * op.box;
      const ox = Math.round((PNG_W - dim) / 2) + 4 * op.box;
      const oy = y + 4 * op.box;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (op.matrix[r][c]) {
            ctx.fillRect(ox + c * op.box, oy + r * op.box, op.box, op.box);
          }
        }
      }
      y += dim;
    }
  }

  // La TSP100IV accetta PNG monocromatico 1-bit o 24-bit; il 24-bit ha un limite
  // di altezza basso (memoria) → comanda alta = 511. Codifichiamo 1-bit dai pixel
  // del canvas con soglia di luminanza (anti-alias → bianco/nero netto).
  const img = ctx.getImageData(0, 0, PNG_W, height);
  const px = img.data;
  const isWhite = (x: number, y: number): boolean => {
    const i = (y * PNG_W + x) * 4;
    const lum = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
    // soglia alzata: più pixel grigi (anti-alias) diventano neri → resa più scura
    return lum >= 150;
  };
  return encodeMonoPng(PNG_W, height, isWhite);
}
