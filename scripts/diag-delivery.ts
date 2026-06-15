// Diagnostica delivery con la NUOVA logica (findAvailableServices + rollover) e
// le VERE funzioni ETA/slot del progetto (eta.ts, slot.ts, time.ts). Nessuna
// rete: simula la finestra slot (senza capacità). Run: node --import tsx scripts/diag-delivery.ts

import {
  weekdayInRome, timeOfDayRome, isTimeBefore, dateInRome, isWeekendRome,
  romeAtTimeOfDay, romeToUtc, addMinutes,
} from "../lib/delivery/time";
import { computeEta, computePickupEta } from "../lib/delivery/eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "../lib/delivery/slot";

// settings reali (delivery_settings id=1) — closed_weekdays ora = [] (lunedì aperto)
const settings = {
  prep_minutes: 25, buffer_minutes: 10, baseline_min_minutes: 45, baseline_pickup_min: 30,
  slot_duration_minutes: 30,
  service_lunch_start_time: "12:30", service_lunch_last_order_time: "14:30", service_lunch_last_delivery_time: "15:00",
  service_dinner_start_time: "19:00", service_dinner_last_order_time: "23:00", service_dinner_last_delivery_time: "23:30",
  service_dinner_weekend_last_order_time: "23:30", service_dinner_weekend_last_delivery_time: "00:00",
  closed_weekdays: [] as number[],
  travel_buckets: [{ min: 10, max_km: 3 }, { min: 18, max_km: 6 }, { min: 28, max_km: 9 }, { min: 40, max_km: 12 }],
};
const MAX_LOOKAHEAD_DAYS = 7;
type Ctx = { service: "lunch" | "dinner"; startsAt: Date; lastDeliveryTime: string; isPreorder: boolean; dateRome: string };

const addDaysRome = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);

function findAvailableServices(now: Date): Ctx[] {
  const out: Ctx[] = [];
  for (let off = 0; off <= MAX_LOOKAHEAD_DAYS; off++) {
    const day = addDaysRome(now, off);
    const dStr = dateInRome(day);
    if (settings.closed_weekdays.includes(weekdayInRome(day))) continue;
    const wknd = isWeekendRome(day);
    const dLastDel = wknd ? settings.service_dinner_weekend_last_delivery_time : settings.service_dinner_last_delivery_time;
    const dLastOrd = wknd ? settings.service_dinner_weekend_last_order_time : settings.service_dinner_last_order_time;
    const isToday = off === 0;
    const nowHH = isToday ? timeOfDayRome(now) : "00:00";
    // lunch
    if (!isToday) out.push({ service: "lunch", startsAt: romeAtTimeOfDay(day, settings.service_lunch_start_time, 0), lastDeliveryTime: settings.service_lunch_last_delivery_time, isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, settings.service_lunch_last_order_time) || nowHH === settings.service_lunch_start_time) {
      const s = isTimeBefore(nowHH, settings.service_lunch_start_time) ? romeAtTimeOfDay(day, settings.service_lunch_start_time, 0) : now;
      out.push({ service: "lunch", startsAt: s, lastDeliveryTime: settings.service_lunch_last_delivery_time, isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    // dinner
    if (!isToday) out.push({ service: "dinner", startsAt: romeAtTimeOfDay(day, settings.service_dinner_start_time, 0), lastDeliveryTime: dLastDel, isPreorder: true, dateRome: dStr });
    else if (isTimeBefore(nowHH, dLastOrd) || nowHH === settings.service_dinner_start_time) {
      const s = isTimeBefore(nowHH, settings.service_dinner_start_time) ? romeAtTimeOfDay(day, settings.service_dinner_start_time, 0) : now;
      out.push({ service: "dinner", startsAt: s, lastDeliveryTime: dLastDel, isPreorder: s.getTime() > now.getTime(), dateRome: dStr });
    }
    if (out.length >= 6) break;
  }
  return out;
}

function buildWindow(ctx: Ctx, km: number): SlotResult[] {
  let eta;
  if (ctx.isPreorder) {
    const m = settings.prep_minutes + settings.buffer_minutes;
    eta = { minutes: m, t1: addMinutes(ctx.startsAt, m) };
  } else {
    eta = computeEta(km, ctx.startsAt, { prepMinutes: settings.prep_minutes, bufferMinutes: settings.buffer_minutes, baselineMinMinutes: settings.baseline_min_minutes, travelBuckets: settings.travel_buckets });
  }
  const cands: SlotResult[] = [];
  let slot = computeSlot(eta.t1, settings.slot_duration_minutes);
  const lastDel = ctx.lastDeliveryTime; const mid = lastDel === "00:00";
  for (let i = 0; i < 20; i++) {
    const end = timeOfDayRome(slot.end); const diff = dateInRome(slot.end) !== ctx.dateRome;
    if (mid) { if (diff && end !== "00:00") break; } else { if (diff) break; if (end > lastDel) break; }
    cands.push(slot); slot = shiftSlotForward(slot, settings.slot_duration_minutes);
  }
  return cands;
}

const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
function scn(label: string, y: number, mo: number, d: number, h: number, mi: number) {
  const now = romeToUtc(y, mo, d, h, mi);
  const services = findAvailableServices(now);
  let chosen: Ctx | null = null; let win: SlotResult[] = [];
  for (const c of services) { const w = buildWindow(c, 5); if (w.length) { chosen = c; win = w; break; } }
  let out = `${label.padEnd(34)} now=${days[weekdayInRome(now)]} ${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")} -> `;
  if (!chosen) out += "NESSUNO SLOT";
  else out += `${chosen.service} ${days[weekdayInRome(chosen.startsAt)]} ${chosen.dateRome} 1oslot ${timeOfDayRome(win[0].start)}-${timeOfDayRome(win[0].end)} preorder=${chosen.isPreorder} (#slot=${win.length})`;
  console.log(out);
}

console.log("closed_weekdays = [] (lunedi aperto)\n");
scn("Lun 15/6 21:30 (oggi)", 2026, 6, 15, 21, 30);
scn("Lun 15/6 13:00", 2026, 6, 15, 13, 0);
scn("Mar 16/6 21:30", 2026, 6, 16, 21, 30);
scn("Mar 16/6 22:50 ZONA MORTA", 2026, 6, 16, 22, 50);
scn("Mar 16/6 23:10 post-lastorder", 2026, 6, 16, 23, 10);
scn("Ven 19/6 20:00", 2026, 6, 19, 20, 0);
scn("Sab 20/6 23:15", 2026, 6, 20, 23, 15);
scn("Sab 20/6 23:40 ZONA MORTA wknd", 2026, 6, 20, 23, 40);
