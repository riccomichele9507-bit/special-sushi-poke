// Diagnostica locale: genera PNG comanda per più scenari e li salva su disco.
// Uso: npx tsx scripts/diag-receipt-png.ts
import { writeFileSync } from "node:fs";
import { generateReceiptPng } from "../lib/print/receipt";
import type { Database } from "../lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function base(): OrderRow {
  // Campi minimi usati dal generatore; il resto castato per comodità di test.
  return {
    order_number: "0025",
    created_at: "2026-06-29T17:22:00.000Z",
    slot_start: "2026-06-29T18:00:00.000Z",
    slot_end: "2026-06-29T18:30:00.000Z",
    customer_name: "Michele Ricco",
    customer_phone: "3462482556",
    order_type: "delivery",
    address_line: "Viale Unità d'Italia 15, 70125 Bari BA",
    address_notes: "Interno 3, citofono Ricco",
    road_distance_m: 2700,
    driver_notes: "Suonare due volte, cancello verde",
    items: [
      { dishId: "1", name: "Uramaki Sakura", qty: 1, unitPriceCents: 1000, lineTotalCents: 1000 },
      { dishId: "2", name: "Box 50 pezzi misto sushi sashimi nigiri", qty: 1, unitPriceCents: 3000, lineTotalCents: 3000 },
      { dishId: "3", name: "Poke Fresh", qty: 2, unitPriceCents: 800, lineTotalCents: 1600 },
      {
        dishId: "4", name: "La tua poke", qty: 1, unitPriceCents: 1300, lineTotalCents: 1300,
        extras: ["Riso bianco giapponese", "Salmone crudo", "Tonno crudo", "Gamberi in tempura", "Pollo panato fritto", "Wakame", "Carote", "Funghi", "Cipolla croccante", "Anacardi", "Tobiko", "Soia", "Maionese spicy"],
      },
      { dishId: "5", name: "Uramaki Tiger", qty: 1, unitPriceCents: 800, lineTotalCents: 800, variant: "senza sesamo" },
    ],
    subtotal_cents: 13200,
    discount_cents: 2640,
    discount_code: "PROMO020",
    tip_cents: 200,
    total_cents: 10760,
    payment_method: "card",
    stripe_payment_intent_id: "pi_3Test123",
    fiscal_receipt_issued: false,
    geo: { lat: 41.1187, lng: 16.8719, placeId: "ChIJtest" },
  } as unknown as OrderRow;
}

function pickupCash(): OrderRow {
  return {
    ...base(),
    order_number: "0026",
    order_type: "pickup",
    address_line: null,
    address_notes: null,
    road_distance_m: null,
    driver_notes: null,
    discount_cents: 0,
    discount_code: null,
    tip_cents: 0,
    payment_method: "cash",
    total_cents: 13200,
    geo: null,
    items: [
      { dishId: "1", name: "Nigiri Salmone", qty: 6, unitPriceCents: 200, lineTotalCents: 1200 },
      { dishId: "2", name: "Temaki", qty: 1, unitPriceCents: 500, lineTotalCents: 500 },
    ],
  } as unknown as OrderRow;
}

const cases: [string, OrderRow][] = [
  ["diag-png-delivery-card.png", base()],
  ["diag-png-pickup-cash.png", pickupCash()],
];

(async () => {
  for (const [file, order] of cases) {
    const buf = await generateReceiptPng(order);
    const out = `marketing/${file}`;
    writeFileSync(out, buf);
    console.log(`OK ${out} (${Math.round(buf.length / 1024)}KB)`);
  }
})();
