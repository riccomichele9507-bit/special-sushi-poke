// Verifica ESAUSTIVA consegne — mirror fedele della logica nuova (validate.ts):
// findAvailableServices + rollover + ultima consegna su ISTANTE reale (00:30).
// Usa le VERE funzioni eta/slot/time. Nessuna rete.
// Run: node --import tsx scripts/diag-delivery.ts

import {
  weekdayInRome, timeOfDayRome, isTimeBefore, dateInRome, isWeekendRome,
  romeAtTimeOfDay, romeToUtc, addMinutes,
} from "../lib/delivery/time";
import { computeEta, computePickupEta } from "../lib/delivery/eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "../lib/delivery/slot";

const S = {
  prep_minutes: 25, buffer_minutes: 10, baseline_min_minutes: 60, baseline_pickup_min: 30,
  slot_duration_minutes: 30,
  service_lunch_start_time: "12:30", service_lunch_last_order_time: "14:30", service_lunch_last_delivery_time: "15:00",
  service_dinner_start_time: "19:00", service_dinner_last_order_time: "23:30", service_dinner_last_delivery_time: "00:30",
  service_dinner_weekend_last_order_time: "23:30", service_dinner_weekend_last_delivery_time: "00:30",
  closed_weekdays: [] as number[],
  max_distance_km: 12, free_delivery_max_km: 5, min_cart_cents_above_free: 3000,
  travel_buckets: [{ min: 10, max_km: 3 }, { min: 18, max_km: 6 }, { min: 28, max_km: 9 }, { min: 40, max_km: 12 }],
};
type Closure = { date: string; lunch: boolean; dinner: boolean };
type Ctx = { service: "lunch" | "dinner"; startsAt: Date; lastDeliveryInstant: Date; isPreorder: boolean; dateRome: string };
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);
const instant = (day: Date, start: string, last: string) => romeAtTimeOfDay(day, last, isTimeBefore(last, start) ? 1 : 0);

function findServices(now: Date, closures: Closure[] = []): Ctx[] {
  const out: Ctx[] = [];
  for (let off = 0; off <= 7; off++) {
    const day = addDays(now, off); const dStr = dateInRome(day);
    if (S.closed_weekdays.includes(weekdayInRome(day))) continue;
    const cl = closures.filter((c) => c.date === dStr);
    const lunchClosed = cl.some((c) => c.lunch);
    const dinnerClosed = cl.some((c) => c.dinner);
    const wknd = isWeekendRome(day);
    const dDel = wknd ? S.service_dinner_weekend_last_delivery_time : S.service_dinner_last_delivery_time;
    const dOrd = wknd ? S.service_dinner_weekend_last_order_time : S.service_dinner_last_order_time;
    const today = off === 0; const nowHH = today ? timeOfDayRome(now) : "00:00";
    if (!lunchClosed) {
      if (!today) out.push({ service: "lunch", startsAt: romeAtTimeOfDay(day, S.service_lunch_start_time, 0), lastDeliveryInstant: instant(day, S.service_lunch_start_time, S.service_lunch_last_delivery_time), isPreorder: true, dateRome: dStr });
      else if (isTimeBefore(nowHH, S.service_lunch_last_order_time) || nowHH === S.service_lunch_start_time) {
        const s = isTimeBefore(nowHH, S.service_lunch_start_time) ? romeAtTimeOfDay(day, S.service_lunch_start_time, 0) : now;
        out.push({ service: "lunch", startsAt: s, lastDeliveryInstant: instant(day, S.service_lunch_start_time, S.service_lunch_last_delivery_time), isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
      }
    }
    if (!dinnerClosed) {
      if (!today) out.push({ service: "dinner", startsAt: romeAtTimeOfDay(day, S.service_dinner_start_time, 0), lastDeliveryInstant: instant(day, S.service_dinner_start_time, dDel), isPreorder: true, dateRome: dStr });
      else if (isTimeBefore(nowHH, dOrd) || nowHH === S.service_dinner_start_time) {
        const s = isTimeBefore(nowHH, S.service_dinner_start_time) ? romeAtTimeOfDay(day, S.service_dinner_start_time, 0) : now;
        out.push({ service: "dinner", startsAt: s, lastDeliveryInstant: instant(day, S.service_dinner_start_time, dDel), isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
      }
    }
    if (out.length >= 6) break;
  }
  return out;
}
function etaMin(ctx: Ctx, km: number, pickup: boolean): number {
  if (pickup) return computePickupEta(ctx.startsAt, { prepMinutes: S.prep_minutes, bufferMinutes: S.buffer_minutes, baselinePickupMin: S.baseline_pickup_min }).minutes;
  if (ctx.isPreorder) return S.prep_minutes + S.buffer_minutes;
  return computeEta(km, ctx.startsAt, { prepMinutes: S.prep_minutes, bufferMinutes: S.buffer_minutes, baselineMinMinutes: S.baseline_min_minutes, travelBuckets: S.travel_buckets }).minutes;
}
function windowFor(ctx: Ctx, km: number, pickup: boolean): SlotResult[] {
  const t1 = addMinutes(ctx.startsAt, etaMin(ctx, km, pickup));
  const cands: SlotResult[] = []; let slot = computeSlot(t1, S.slot_duration_minutes);
  const lastMs = ctx.lastDeliveryInstant.getTime();
  for (let i = 0; i < 20; i++) { if (slot.end.getTime() > lastMs) break; cands.push(slot); slot = shiftSlotForward(slot, S.slot_duration_minutes); }
  return cands;
}
function decide(now: Date, km: number, pickup: boolean, closures: Closure[] = []) {
  for (const c of findServices(now, closures)) { const w = windowFor(c, km, pickup); if (w.length) return { c, w }; }
  return null;
}
const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const fmt = (r: ReturnType<typeof decide>, now: Date) => {
  if (!r) return "NESSUNO SLOT";
  const same = dateInRome(r.c.startsAt) === dateInRome(now);
  return `${same ? "OGGI" : days[weekdayInRome(r.c.startsAt)]} ${timeOfDayRome(r.w[0].start)}-${timeOfDayRome(r.w[0].end)}${r.c.isPreorder ? " (preord)" : ""}`;
};

// ===== A) TIMELINE: martedì, consegna 4km, ogni 30 min dalle 11:00 alle 00:30 =====
console.log("=== A) TIMELINE CONSEGNA (mar 16/6, 4km) — primo slot proposto ===");
for (let h = 11; h <= 24; h++) {
  for (const m of [0, 30]) {
    const hh = h % 24, dayShift = h >= 24 ? 1 : 0;
    const now = romeToUtc(2026, 6, 16 + dayShift, hh, m);
    const r = decide(now, 4, false);
    console.log(`  ${String(hh).padStart(2,"0")}:${String(m).padStart(2,"0")}  -> ${fmt(r, now)}`);
  }
}

// ===== B) DISTANZE: ETA + slot + costo (ordine mar 20:00) =====
console.log("\n=== B) DISTANZE (ordine mar 16/6 20:00) — ETA, slot, regola spesa ===");
const now20 = romeToUtc(2026, 6, 16, 20, 0);
for (const km of [1, 3, 5, 5.1, 8, 12, 12.1, 15]) {
  let rule: string;
  if (km > S.max_distance_km) rule = "FUORI ZONA";
  else if (km <= S.free_delivery_max_km) rule = "gratis, nessun minimo";
  else rule = "gratis, minimo EUR30";
  const r = km <= S.max_distance_km ? decide(now20, km, false) : null;
  const eta = r ? etaMin(r.c, km, false) : 0;
  console.log(`  ${String(km).padStart(4)}km  ${rule.padEnd(24)} ${km <= S.max_distance_km ? `ETA ${eta}min  slot ${fmt(r, now20)}` : ""}`);
}

// ===== C) RITIRO vs CONSEGNA (stesse ore) =====
console.log("\n=== C) RITIRO (no distanza) vs CONSEGNA 4km — mar 16/6 ===");
for (const [h, m] of [[13,0],[20,0],[23,0],[23,30]] as [number,number][]) {
  const now = romeToUtc(2026, 6, 16, h, m);
  console.log(`  ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}  ritiro: ${fmt(decide(now, 0, true), now).padEnd(22)}  consegna: ${fmt(decide(now, 4, false), now)}`);
}

// ===== D) CHIUSURE / FERIE =====
console.log("\n=== D) CHIUSURA (es. mer 17/6 chiuso tutto) — ordine mer 13:00 ===");
const wedClosed: Closure[] = [{ date: "2026-06-17", lunch: true, dinner: true }];
const wed13 = romeToUtc(2026, 6, 17, 13, 0);
console.log("  con chiusura mer -> ", fmt(decide(wed13, 4, false, wedClosed), wed13), "(atteso: salta a gio)");
console.log("  senza chiusura   -> ", fmt(decide(wed13, 4, false), wed13));

// ===== E) WEEKEND (sab) vs FERIALE (mar) a fine serata =====
console.log("\n=== E) FINE SERATA feriale vs weekend (4km) ===");
for (const [lbl, dd] of [["mar", 16], ["sab", 20]] as [string,number][]) {
  for (const [h,m] of [[23,15],[23,30],[23,45]] as [number,number][]) {
    const now = romeToUtc(2026, 6, dd, h, m);
    console.log(`  ${lbl} ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}  -> ${fmt(decide(now, 4, false), now)}`);
  }
}
