// Diagnostica COMPLETA delivery con la logica nuova (findAvailableServices +
// rollover) e le VERE funzioni ETA/slot del progetto. Due matrici:
//  1) giorni x orari -> quale slot viene proposto
//  2) distanze x carrello -> free / minimo / fuori zona
// Nessuna rete. Run: node --import tsx scripts/diag-delivery.ts

import {
  weekdayInRome, timeOfDayRome, isTimeBefore, dateInRome, isWeekendRome,
  romeAtTimeOfDay, romeToUtc, addMinutes,
} from "../lib/delivery/time";
import { computeEta } from "../lib/delivery/eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "../lib/delivery/slot";

// settings reali (delivery_settings id=1), closed_weekdays ora = []
const S = {
  prep_minutes: 25, buffer_minutes: 10, baseline_min_minutes: 45,
  slot_duration_minutes: 30,
  service_lunch_start_time: "12:30", service_lunch_last_order_time: "14:30", service_lunch_last_delivery_time: "15:00",
  service_dinner_start_time: "19:00", service_dinner_last_order_time: "23:00", service_dinner_last_delivery_time: "23:30",
  service_dinner_weekend_last_order_time: "23:30", service_dinner_weekend_last_delivery_time: "00:00",
  closed_weekdays: [] as number[],
  max_distance_km: 12, free_delivery_max_km: 6, min_cart_cents_above_free: 3000,
  travel_buckets: [{ min: 10, max_km: 3 }, { min: 18, max_km: 6 }, { min: 28, max_km: 9 }, { min: 40, max_km: 12 }],
};
type Ctx = { service: "lunch" | "dinner"; startsAt: Date; lastDeliveryTime: string; isPreorder: boolean; dateRome: string };
const addDaysRome = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);

function findAvailableServices(now: Date): Ctx[] {
  const out: Ctx[] = [];
  for (let off = 0; off <= 7; off++) {
    const day = addDaysRome(now, off); const dStr = dateInRome(day);
    if (S.closed_weekdays.includes(weekdayInRome(day))) continue;
    const wknd = isWeekendRome(day);
    const dDel = wknd ? S.service_dinner_weekend_last_delivery_time : S.service_dinner_last_delivery_time;
    const dOrd = wknd ? S.service_dinner_weekend_last_order_time : S.service_dinner_last_order_time;
    const today = off === 0; const nowHH = today ? timeOfDayRome(now) : "00:00";
    if (!today) out.push({ service: "lunch", startsAt: romeAtTimeOfDay(day, S.service_lunch_start_time, 0), lastDeliveryTime: S.service_lunch_last_delivery_time, isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, S.service_lunch_last_order_time) || nowHH === S.service_lunch_start_time) {
      const s = isTimeBefore(nowHH, S.service_lunch_start_time) ? romeAtTimeOfDay(day, S.service_lunch_start_time, 0) : now;
      out.push({ service: "lunch", startsAt: s, lastDeliveryTime: S.service_lunch_last_delivery_time, isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    if (!today) out.push({ service: "dinner", startsAt: romeAtTimeOfDay(day, S.service_dinner_start_time, 0), lastDeliveryTime: dDel, isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, dOrd) || nowHH === S.service_dinner_start_time) {
      const s = isTimeBefore(nowHH, S.service_dinner_start_time) ? romeAtTimeOfDay(day, S.service_dinner_start_time, 0) : now;
      out.push({ service: "dinner", startsAt: s, lastDeliveryTime: dDel, isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    if (out.length >= 6) break;
  }
  return out;
}
function buildWindow(ctx: Ctx, km: number): SlotResult[] {
  let t1: Date;
  if (ctx.isPreorder) t1 = addMinutes(ctx.startsAt, S.prep_minutes + S.buffer_minutes);
  else t1 = computeEta(km, ctx.startsAt, { prepMinutes: S.prep_minutes, bufferMinutes: S.buffer_minutes, baselineMinMinutes: S.baseline_min_minutes, travelBuckets: S.travel_buckets }).t1;
  const cands: SlotResult[] = []; let slot = computeSlot(t1, S.slot_duration_minutes);
  const last = ctx.lastDeliveryTime; const mid = last === "00:00";
  for (let i = 0; i < 20; i++) {
    const end = timeOfDayRome(slot.end); const diff = dateInRome(slot.end) !== ctx.dateRome;
    if (mid) { if (diff && end !== "00:00") break; } else { if (diff) break; if (end > last) break; }
    cands.push(slot); slot = shiftSlotForward(slot, S.slot_duration_minutes);
  }
  return cands;
}
const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
function decide(now: Date, km = 5) {
  for (const c of findAvailableServices(now)) { const w = buildWindow(c, km); if (w.length) return { c, w }; }
  return null;
}

// ===== MATRICE 1: GIORNI x ORARI =====
console.log("=== MATRICE GIORNI x ORARI (indirizzo 5km) ===");
console.log("oggi=lun 15/6. closed_weekdays=[] (aperto tutti i giorni)\n");
const dayList: [string, number][] = [["lun", 15], ["mar", 16], ["mer", 17], ["gio", 18], ["ven", 19], ["sab", 20], ["dom", 21]];
const timeList: [number, number][] = [[11, 0], [13, 0], [16, 0], [19, 30], [21, 30], [22, 50], [23, 40]];
process.stdout.write("        " + timeList.map(([h, m]) => `${h}:${String(m).padStart(2, "0")}`.padEnd(13)).join("") + "\n");
for (const [dn, dd] of dayList) {
  let row = `${dn} ${dd}/6 `.padEnd(8);
  for (const [h, m] of timeList) {
    const r = decide(romeToUtc(2026, 6, dd, h, m));
    if (!r) row += "—".padEnd(13);
    else {
      const sameDay = dateInRome(r.c.startsAt) === dateInRome(romeToUtc(2026, 6, dd, h, m));
      const tag = sameDay ? "OGGI" : days[weekdayInRome(r.c.startsAt)];
      row += `${tag} ${timeOfDayRome(r.w[0].start)}`.padEnd(13);
    }
  }
  console.log(row);
}

// ===== MATRICE 2: DISTANZE x CARRELLO =====
console.log("\n=== MATRICE DISTANZE x CARRELLO ===");
console.log("consegna SEMPRE gratis entro 12km; da 6 a 12km serve EUR30 minimo carrello; niente oltre 12km\n");
function distDecision(km: number, cartCents: number): string {
  if (km > S.max_distance_km) return "FUORI ZONA";
  const free = km <= S.free_delivery_max_km;
  if (!free && cartCents < S.min_cart_cents_above_free) {
    const miss = (S.min_cart_cents_above_free - cartCents) / 100;
    return `min EUR30 (mancano EUR${miss.toFixed(2)})`;
  }
  return free ? "OK gratis" : "OK gratis (min EUR30)";
}
const kmList = [2, 5, 6, 6.5, 9, 12, 12.5, 14];
const cartList: [string, number][] = [["EUR20", 2000], ["EUR30", 3000], ["EUR45", 4500]];
process.stdout.write("        " + cartList.map(([l]) => l.padEnd(22)).join("") + "\n");
for (const km of kmList) {
  let row = `${km}km`.padEnd(8);
  for (const [, c] of cartList) row += distDecision(km, c).padEnd(22);
  console.log(row);
}
