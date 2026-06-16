// Verifica il payload ESC/POS dello scontrino: QR con URL corretto + layout.
// Run: node --import tsx scripts/diag-receipt.ts
import { generateReceiptPayload } from "../lib/print/receipt";
import type { Database } from "../lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const order = {
  order_number: "0042",
  created_at: "2026-06-16T17:20:00.000Z",
  order_type: "delivery",
  customer_name: "Mario Rossi",
  customer_phone: "333 1234567",
  address_line: "Via Esempio 10, Bari",
  address_notes: "Citofono Rossi",
  road_distance_m: 2300,
  driver_notes: "Il prima possibile, grazie!",
  slot_start: "2026-06-16T18:00:00.000Z",
  slot_end: "2026-06-16T18:30:00.000Z",
  items: [
    { qty: 2, name: "Uramaki California", lineTotalCents: 2600, variant: undefined, extras: [] },
    { qty: 1, name: "Poke Tuna Bowl", lineTotalCents: 3900, extras: ["avocado", "salmone"] },
  ],
  subtotal_cents: 6500,
  discount_cents: 1300,
  discount_code: "PROMO20",
  tip_cents: 100,
  total_cents: 5300,
  payment_method: "card",
  fiscal_receipt_issued: false,
  geo: { lat: 41.0892, lng: 16.7956, placeId: "ChIJTestPlaceId123" },
} as unknown as OrderRow;

const buf = generateReceiptPayload(order);
const latin = buf.toString("latin1");

const expectedUrl =
  "https://www.google.com/maps/dir/?api=1&destination=41.0892,16.7956&destination_place_id=ChIJTestPlaceId123";

function check(name: string, cond: boolean) {
  console.log(`${cond ? "OK  " : "FAIL"} ${name}`);
  if (!cond) process.exitCode = 1;
}

console.log("=== ASSERZIONI ===");
check("init ESC @", buf[0] === 0x1b && buf[1] === 0x40);
check("QR contiene URL Google Maps (place_id)", latin.includes(expectedUrl));
check("header DELIVERY", latin.includes("DELIVERY"));
check("nome cliente", latin.includes("Mario Rossi"));
check("riga sconto PROMO20", latin.includes("Sconto (PROMO20)"));
check("TOTALE presente", latin.includes("TOTALE"));
check("blocco CONSEGNA", latin.includes("CONSEGNA"));
check("gia' pagato online", latin.includes("GIA' PAGATO ONLINE"));
check("scansiona per navigare", latin.includes("Scansiona per navigare"));
check("taglio carta (GS V)", buf.includes(Buffer.from([0x1d, 0x56])));
check("byte totali > 200", buf.length > 200);

// anteprima testuale (solo ASCII stampabile + newline)
console.log("\n=== ANTEPRIMA SCONTRINO (testo, senza comandi/QR binario) ===");
let preview = "";
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c === 0x0a) preview += "\n";
  else if (c >= 0x20 && c <= 0x7e) preview += String.fromCharCode(c);
}
// togli la stringa URL del QR dall'anteprima (è dato comando, non testo stampato)
console.log(preview.replace(expectedUrl, "[QR -> " + expectedUrl + "]"));
console.log(`\n(payload: ${buf.length} byte ESC/POS, base64 ${buf.toString("base64").length} char)`);
