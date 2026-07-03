// Test logica QR navigazione + generazione PNG completa. NON tocca il DB.
// Run: NODE_OPTIONS=--use-system-ca npx tsx scripts/test-qr.ts
import { mapsNavUrl, generateReceiptPng } from "../lib/print/receipt";

/* eslint-disable @typescript-eslint/no-explicit-any */
const base: any = {
  order_number: "0012",
  order_type: "delivery",
  status: "confirmed",
  payment_method: "card",
  customer_name: "Mario Rossi",
  customer_phone: "3331234567",
  subtotal_cents: 3000,
  discount_cents: 0,
  tip_cents: 0,
  total_cents: 3000,
  road_distance_m: 2400,
  created_at: "2026-07-03T18:00:00Z",
  items: [{ name: "Uramaki Salmone", qty: 2, unitPriceCents: 1500, lineTotalCents: 3000 }],
};

const cases: { name: string; o: any }[] = [
  { name: "1. Google GIA col numero → tengo place_id", o: { ...base, address_line: "Via Roma 12, 70100 Bari", address_notes: "Civico 12 · Interno 3", geo: { lat: 41.1, lng: 16.8, placeId: "PID_ROMA12" } } },
  { name: "2. Google SOLO via + civico a mano → uso civico, NO place_id", o: { ...base, address_line: "Via Giulio Petroni, 70124 Bari", address_notes: "Civico 12/B · scala A", geo: { lat: 41.1, lng: 16.8, placeId: "PID_PETRONI" } } },
  { name: "3. Civico 23 con CAP 70123 → NON deve confondersi", o: { ...base, address_line: "Via Napoli, 70123 Bari", address_notes: "Civico 23", geo: { lat: 41.1, lng: 16.8, placeId: "PID_NAP" } } },
  { name: "4. Nessun civico nelle note → comportamento attuale", o: { ...base, address_line: "Corso Italia, Bari", address_notes: "Interno 2", geo: { lat: 41.1, lng: 16.8, placeId: "PID_ITA" } } },
  { name: "5. Note nulle", o: { ...base, address_line: "Via Test, Bari", address_notes: null, geo: { lat: 41.1, lng: 16.8, placeId: "PID_TEST" } } },
  { name: "6. Solo coordinate (no indirizzo)", o: { ...base, address_line: null, address_notes: null, geo: { lat: 41.11, lng: 16.87 } } },
];

console.log("=== URL QR per ogni scenario ===");
for (const c of cases) {
  console.log("\n" + c.name);
  console.log("   " + mapsNavUrl(c.o));
}

console.log("\n=== GENERAZIONE PNG completa (caso 2) ===");
try {
  const png = generateReceiptPng(cases[1].o);
  console.log(`✅ PNG generato: ${png.length} byte (Buffer valido) — stampa OK`);
} catch (e) {
  console.error("❌ Errore generazione PNG:", e instanceof Error ? e.message : e);
  process.exit(1);
}
