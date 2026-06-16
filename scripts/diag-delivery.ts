// Diagnostica COMPLETA delivery — mirror della logica nuova (findAvailableServices
// + rollover + ultima consegna su ISTANTE reale, gestisce 00:30 oltre mezzanotte).
// Usa le VERE funzioni eta/slot/time del progetto. Nessuna rete.
// Run: node --import tsx scripts/diag-delivery.ts

import {
  weekdayInRome, timeOfDayRome, isTimeBefore, dateInRome, isWeekendRome,
  romeAtTimeOfDay, romeToUtc, addMinutes,
} from "../lib/delivery/time";
import { computeEta } from "../lib/delivery/eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "../lib/delivery/slot";

// settings reali aggiornati (delivery_settings id=1)
const S = {
  prep_minutes: 25, buffer_minutes: 10, baseline_min_minutes: 60,
  slot_duration_minutes: 30,
  service_lunch_start_time: "12:30", service_lunch_last_order_time: "14:30", service_lunch_last_delivery_time: "15:00",
  service_dinner_start_time: "19:00", service_dinner_last_order_time: "23:30", service_dinner_last_delivery_time: "00:30",
  service_dinner_weekend_last_order_time: "23:30", service_dinner_weekend_last_delivery_time: "00:30",
  closed_weekdays: [] as number[],
  max_distance_km: 12, free_delivery_max_km: 5, min_cart_cents_above_free: 3000,
  travel_buckets: [{ min: 10, max_km: 3 }, { min: 18, max_km: 6 }, { min: 28, max_km: 9 }, { min: 40, max_km: 12 }],
};
type Ctx = { service: "lunch" | "dinner"; startsAt: Date; lastDeliveryInstant: Date; isPreorder: boolean; dateRome: string };
const addDaysRome = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);
function deliveryInstant(dayDate: Date, start: string, last: string): Date {
  return romeAtTimeOfDay(dayDate, last, isTimeBefore(last, start) ? 1 : 0);
}

function findAvailableServices(now: Date): Ctx[] {
  const out: Ctx[] = [];
  for (let off = 0; off <= 7; off++) {
    const day = addDaysRome(now, off); const dStr = dateInRome(day);
    if (S.closed_weekdays.includes(weekdayInRome(day))) continue;
    const wknd = isWeekendRome(day);
    const dDel = wknd ? S.service_dinner_weekend_last_delivery_time : S.service_dinner_last_delivery_time;
    const dOrd = wknd ? S.service_dinner_weekend_last_order_time : S.service_dinner_last_order_time;
    const today = off === 0; const nowHH = today ? timeOfDayRome(now) : "00:00";
    if (!today) out.push({ service: "lunch", startsAt: romeAtTimeOfDay(day, S.service_lunch_start_time, 0), lastDeliveryInstant: deliveryInstant(day, S.service_lunch_start_time, S.service_lunch_last_delivery_time), isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, S.service_lunch_last_order_time) || nowHH === S.service_lunch_start_time) {
      const s = isTimeBefore(nowHH, S.service_lunch_start_time) ? romeAtTimeOfDay(day, S.service_lunch_start_time, 0) : now;
      out.push({ service: "lunch", startsAt: s, lastDeliveryInstant: deliveryInstant(day, S.service_lunch_start_time, S.service_lunch_last_delivery_time), isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    if (!today) out.push({ service: "dinner", startsAt: romeAtTimeOfDay(day, S.service_dinner_start_time, 0), lastDeliveryInstant: deliveryInstant(day, S.service_dinner_start_time, dDel), isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, dOrd) || nowHH === S.service_dinner_start_time) {
      const s = isTimeBefore(nowHH, S.service_dinner_start_time) ? romeAtTimeOfDay(day, S.service_dinner_start_time, 0) : now;
      out.push({ service: "dinner", startsAt: s, lastDeliveryInstant: deliveryInstant(day, S.service_dinner_start_time, dDel), isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    if (out.length >= 6) break;
  }
  return out;
}
function buildWindow(ctx: Ctx, km: number): SlotResult[] {
  const t1 = ctx.isPreorder
    ? addMinutes(ctx.startsAt, S.prep_minutes + S.buffer_minutes)
    : computeEta(km, ctx.startsAt, { prepMinutes: S.prep_minutes, bufferMinutes: S.buffer_minutes, baselineMinMinutes: S.baseline_min_minutes, travelBuckets: S.travel_buckets }).t1;
  const cands: SlotResult[] = []; let slot = computeSlot(t1, S.slot_duration_minutes);
  const lastMs = ctx.lastDeliveryInstant.getTime();
  for (let i = 0; i < 20; i++) { if (slot.end.getTime() > lastMs) break; cands.push(slot); slot = shiftSlotForward(slot, S.slot_duration_minutes); }
  return cands;
}
const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
function decide(now: Date, km = 4) {
  for (const c of findAvailableServices(now)) { const w = buildWindow(c, km); if (w.length) return { c, w }; }
  return null;
}

console.log("=== MATRICE GIORNI x ORARI (indirizzo 4km) — baseline 60, sera fino 00:30 ===\n");
const dayList: [string, number][] = [["lun", 15], ["mar", 16], ["mer", 17], ["gio", 18], ["ven", 19], ["sab", 20], ["dom", 21]];
const timeList: [number, number][] = [[13, 0], [20, 0], [22, 0], [23, 0], [23, 30], [23, 45]];
process.stdout.write("        " + timeList.map(([h, m]) => `${h}:${String(m).padStart(2, "0")}`.padEnd(14)).join("") + "\n");
for (const [dn, dd] of dayList) {
  let row = `${dn} ${dd}/6 `.padEnd(8);
  for (const [h, m] of timeList) {
    const r = decide(romeToUtc(2026, 6, dd, h, m));
    if (!r) { row += "—".padEnd(14); continue; }
    const sameDay = dateInRome(r.c.startsAt) === dateInRome(romeToUtc(2026, 6, dd, h, m));
    const tag = sameDay ? "OGGI" : days[weekdayInRome(r.c.startsAt)];
    row += `${tag} ${timeOfDayRome(r.w[0].start)}-${timeOfDayRome(r.w[0].end)}`.padEnd(14);
  }
  console.log(row);
}

console.log("\n=== ESEMPIO CLIENTE: ordine ore 20:00 (4km) ===");
const ex = decide(romeToUtc(2026, 6, 16, 20, 0));
console.log("primo slot:", ex ? `${timeOfDayRome(ex.w[0].start)}-${timeOfDayRome(ex.w[0].end)}` : "—", "(atteso 21:00-21:30)");

console.log("\n=== ULTIME FASCE SERA (mar 16, 4km), ordine 23:15 ===");
const late = decide(romeToUtc(2026, 6, 16, 23, 15));
console.log("slot proposti:", late ? late.w.map((s) => `${timeOfDayRome(s.start)}-${timeOfDayRome(s.end)}`).join(", ") : "—", "(atteso ...fino a 00:00-00:30)");

console.log("\n=== MATRICE DISTANZE x CARRELLO (free<=5km, min EUR30 5-12km, no >12) ===");
function distDecision(km: number, cart: number): string {
  if (km > S.max_distance_km) return "FUORI ZONA";
  const free = km <= S.free_delivery_max_km;
  if (!free && cart < S.min_cart_cents_above_free) return `min EUR30 (mancano ${((S.min_cart_cents_above_free - cart) / 100).toFixed(2)})`;
  return free ? "OK gratis" : "OK gratis (min EUR30 ok)";
}
const kmList = [3, 5, 5.5, 8, 12, 12.5];
const cartList: [string, number][] = [["EUR20", 2000], ["EUR30", 3000]];
process.stdout.write("        " + cartList.map(([l]) => l.padEnd(30)).join("") + "\n");
for (const km of kmList) { let row = `${km}km`.padEnd(8); for (const [, c] of cartList) row += distDecision(km, c).padEnd(30); console.log(row); }
