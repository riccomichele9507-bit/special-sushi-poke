// Catena di validazione delivery: distanza/minimo HARD prima del fuori orario.
// Se il servizio corrente è chiuso, cerca lo slot successivo disponibile
// (lunch → dinner → giorno dopo, fino a 7 giorni avanti). Modello pre-order.

import "server-only";
import { computeEta, computePickupEta } from "./eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "./slot";
import {
  weekdayInRome,
  timeOfDayRome,
  isTimeBefore,
  dateInRome,
  isWeekendRome,
  romeAtTimeOfDay,
} from "./time";
import { estimatedRoadKm, RESTAURANT_COORDS_FALLBACK, type LatLng } from "@/lib/geocoding";
import { createAdminClient } from "@/lib/supabase/admin";

export type ValidationError = {
  ok: false;
  code:
    | "out_of_zone"
    | "below_minimum"
    | "outside_service_hours"
    | "after_last_order"
    | "all_slots_full"
    | "restaurant_paused"
    | "closure"
    | "no_coords"
    | "system";
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationSuccess = {
  ok: true;
  distanceKm: number;
  freeDelivery: boolean;
  minCartCents: number;
  etaMinutes: number;
  slot: SlotResult;
  service: "lunch" | "dinner";
  /** True se lo slot è oltre il "ora corrente + ETA" → pre-ordine */
  isPreorder: boolean;
};

export type ValidationResult = ValidationError | ValidationSuccess;

export interface ValidationInput {
  orderType: "delivery" | "pickup";
  customerCoords?: LatLng;
  cartTotalCents: number;
  now?: Date;
}

interface DeliverySettingsRow {
  prep_minutes: number;
  buffer_minutes: number;
  baseline_min_minutes: number;
  baseline_pickup_min: number;
  max_orders_per_slot: number;
  slot_duration_minutes: number;
  service_lunch_start_time: string;
  service_lunch_last_order_time: string;
  service_lunch_last_delivery_time: string;
  service_dinner_start_time: string;
  service_dinner_last_order_time: string;
  service_dinner_last_delivery_time: string;
  service_dinner_weekend_last_order_time: string;
  service_dinner_weekend_last_delivery_time: string;
  closed_weekdays: number[];
  max_distance_km: number;
  free_delivery_max_km: number;
  min_cart_cents_above_free: number;
  travel_buckets: unknown;
}

interface ClosureRow {
  start_date: string;
  end_date: string;
  closes_lunch: boolean;
  closes_dinner: boolean;
}

interface ServiceContext {
  service: "lunch" | "dinner";
  /** Quando "parte" il calcolo ETA (now se siamo già nel servizio, else inizio servizio futuro) */
  startsAt: Date;
  lastOrderTime: string;
  lastDeliveryTime: string;
  isPreorder: boolean;
  /** Data Roma YYYY-MM-DD a cui appartiene il servizio (per matching closures) */
  dateRome: string;
}

const MAX_LOOKAHEAD_DAYS = 7;

export async function validateDelivery(
  input: ValidationInput,
): Promise<ValidationResult> {
  const sb = createAdminClient();

  const [settingsRes, restaurantRes] = await Promise.all([
    sb.from("delivery_settings").select("*").eq("id", 1).maybeSingle(),
    sb
      .from("restaurant_settings")
      .select("manual_pause, lat, lng")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (!settingsRes.data || !restaurantRes.data) {
    return {
      ok: false,
      code: "system",
      message: "Impostazioni consegna non disponibili. Riprova tra qualche minuto.",
    };
  }
  const settings = settingsRes.data as DeliverySettingsRow;
  const manualPause = restaurantRes.data.manual_pause;

  // CHECK #1: pausa manuale
  if (manualPause) {
    return {
      ok: false,
      code: "restaurant_paused",
      message:
        "Il ristorante è temporaneamente in pausa, riapriamo presto. Riprova tra poco.",
    };
  }

  const restaurantCoords: LatLng = {
    lat: restaurantRes.data.lat ?? RESTAURANT_COORDS_FALLBACK.lat,
    lng: restaurantRes.data.lng ?? RESTAURANT_COORDS_FALLBACK.lng,
  };

  const now = input.now ?? new Date();

  // CHECK #2 + #3: distanza + minimo (HARD, indipendenti dall'orario)
  let distanceKm = 0;
  let freeDelivery = true;
  let minCartCents = 0;

  if (input.orderType === "delivery") {
    if (!input.customerCoords) {
      return {
        ok: false,
        code: "no_coords",
        message:
          "Indirizzo non riconosciuto. Riprova con un indirizzo più specifico (via, civico, città).",
      };
    }

    distanceKm = estimatedRoadKm(restaurantCoords, input.customerCoords);

    if (distanceKm > settings.max_distance_km) {
      return {
        ok: false,
        code: "out_of_zone",
        message: `Siamo spiacenti, non consegniamo oltre i ${settings.max_distance_km} km dal ristorante. Distanza stimata: ${distanceKm.toFixed(1)} km.`,
        details: { distanceKm, max: settings.max_distance_km },
      };
    }

    freeDelivery = distanceKm <= settings.free_delivery_max_km;
    if (
      !freeDelivery &&
      input.cartTotalCents < settings.min_cart_cents_above_free
    ) {
      const missingCents =
        settings.min_cart_cents_above_free - input.cartTotalCents;
      return {
        ok: false,
        code: "below_minimum",
        message: `Per consegne oltre ${settings.free_delivery_max_km} km serve un minimo d'ordine di €${(settings.min_cart_cents_above_free / 100).toFixed(0)}. Ti mancano €${(missingCents / 100).toFixed(2).replace(".", ",")} — aggiungi qualcosa al carrello? 🍣`,
        details: {
          distanceKm,
          minCartCents: settings.min_cart_cents_above_free,
          missingCents,
        },
      };
    }
    if (!freeDelivery) minCartCents = settings.min_cart_cents_above_free;
  }

  // CHECK #4: trova service slot disponibile (oggi o nei prossimi 7 giorni)
  const today = dateInRome(now);
  const allClosures = await loadClosures(sb, today, MAX_LOOKAHEAD_DAYS);

  const serviceCtx = findNextAvailableService(now, settings, allClosures);
  if (!serviceCtx) {
    return {
      ok: false,
      code: "outside_service_hours",
      message:
        "Servizio non disponibile nei prossimi giorni. Controlla i nostri orari o riprova più tardi.",
    };
  }

  // CHECK #5: calcola ETA (partendo da serviceCtx.startsAt, NON da now)
  const buckets = (settings.travel_buckets as Array<{
    max_km: number;
    min: number;
  }>) ?? [];

  const eta =
    input.orderType === "delivery"
      ? computeEta(distanceKm, serviceCtx.startsAt, {
          prepMinutes: settings.prep_minutes,
          bufferMinutes: settings.buffer_minutes,
          baselineMinMinutes: settings.baseline_min_minutes,
          travelBuckets: buckets,
        })
      : computePickupEta(serviceCtx.startsAt, {
          prepMinutes: settings.prep_minutes,
          bufferMinutes: settings.buffer_minutes,
          baselinePickupMin: settings.baseline_pickup_min,
        });

  // CHECK #6 + #7: slot + capacità con auto-shift
  let slot = computeSlot(eta.t1, settings.slot_duration_minutes);
  const MAX_SHIFTS = 20;
  let shifts = 0;

  while (shifts < MAX_SHIFTS) {
    const slotEndHHmm = timeOfDayRome(slot.end);
    const slotEndDateRome = dateInRome(slot.end);
    const slotEndOnDifferentDay = slotEndDateRome !== serviceCtx.dateRome;

    // Slot oltre l'orario di chiusura del servizio?
    if (slotEndOnDifferentDay && serviceCtx.lastDeliveryTime !== "00:00") {
      return slotOutsideWindow(eta.minutes, serviceCtx.lastDeliveryTime);
    }
    if (
      !slotEndOnDifferentDay &&
      !isTimeBefore(slotEndHHmm, serviceCtx.lastDeliveryTime) &&
      slotEndHHmm !== serviceCtx.lastDeliveryTime
    ) {
      return slotOutsideWindow(eta.minutes, serviceCtx.lastDeliveryTime);
    }

    // Capacità
    const { count: usedCount } = await sb
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("is_test", false)
      .eq("slot_end", slot.end.toISOString())
      .not("status", "in", "(delivered,cancelled,refunded)");

    if ((usedCount ?? 0) < settings.max_orders_per_slot) {
      return {
        ok: true,
        distanceKm,
        freeDelivery,
        minCartCents,
        etaMinutes: eta.minutes,
        slot,
        service: serviceCtx.service,
        isPreorder: serviceCtx.isPreorder,
      };
    }

    slot = shiftSlotForward(slot, settings.slot_duration_minutes);
    shifts++;
  }

  return {
    ok: false,
    code: "all_slots_full",
    message: "Siamo al completo per questo slot. Riprova tra qualche ora 🍣",
  };
}

function slotOutsideWindow(
  etaMinutes: number,
  lastDeliveryTime: string,
): ValidationError {
  return {
    ok: false,
    code: "after_last_order",
    message: `Per la tua zona ci servirebbero ~${etaMinutes} min e chiudiamo le consegne alle ${lastDeliveryTime}. Ti aspettiamo nel prossimo servizio.`,
    details: { etaMinutes, lastDeliveryTime },
  };
}

async function loadClosures(
  sb: ReturnType<typeof createAdminClient>,
  fromDate: string,
  lookaheadDays: number,
): Promise<ClosureRow[]> {
  // Calcola la data + lookaheadDays in formato YYYY-MM-DD
  const fromD = new Date(fromDate);
  const toD = new Date(fromD.getTime() + lookaheadDays * 86400_000);
  const toDate = toD.toISOString().slice(0, 10);

  const { data } = await sb
    .from("closures")
    .select("start_date, end_date, closes_lunch, closes_dinner")
    .lte("start_date", toDate)
    .gte("end_date", fromDate);

  return (data as ClosureRow[]) ?? [];
}

function findNextAvailableService(
  now: Date,
  settings: DeliverySettingsRow,
  closures: ClosureRow[],
): ServiceContext | null {
  for (let dayOffset = 0; dayOffset <= MAX_LOOKAHEAD_DAYS; dayOffset++) {
    const dayDate = addDaysRome(now, dayOffset);
    const dayDateStr = dateInRome(dayDate);
    const weekday = weekdayInRome(dayDate);
    const isWeekend = isWeekendRome(dayDate);

    // Giorno chiuso (lunedì di default)
    if (settings.closed_weekdays.includes(weekday)) continue;

    const dayClosures = closures.filter(
      (c) => c.start_date <= dayDateStr && c.end_date >= dayDateStr,
    );
    const lunchClosed = dayClosures.some((c) => c.closes_lunch);
    const dinnerClosed = dayClosures.some((c) => c.closes_dinner);

    const dinnerLastOrder = isWeekend
      ? settings.service_dinner_weekend_last_order_time
      : settings.service_dinner_last_order_time;
    const dinnerLastDelivery = isWeekend
      ? settings.service_dinner_weekend_last_delivery_time
      : settings.service_dinner_last_delivery_time;

    // Solo per "oggi" (dayOffset=0) controlliamo se siamo già dentro un servizio
    const isToday = dayOffset === 0;
    const nowHHmm = isToday ? timeOfDayRome(now) : "00:00";

    // Lunch
    if (!lunchClosed) {
      const lunchEnd = settings.service_lunch_last_order_time;
      if (isToday) {
        if (
          isTimeBefore(nowHHmm, lunchEnd) ||
          nowHHmm === settings.service_lunch_start_time
        ) {
          // Dentro al lunch o prima del lunch oggi
          const startsAt = isTimeBefore(nowHHmm, settings.service_lunch_start_time)
            ? romeAtTimeOfDay(dayDate, settings.service_lunch_start_time, 0)
            : now;
          return {
            service: "lunch",
            startsAt,
            lastOrderTime: settings.service_lunch_last_order_time,
            lastDeliveryTime: settings.service_lunch_last_delivery_time,
            isPreorder: startsAt.getTime() > now.getTime(),
            dateRome: dayDateStr,
          };
        }
      } else {
        return {
          service: "lunch",
          startsAt: romeAtTimeOfDay(dayDate, settings.service_lunch_start_time, 0),
          lastOrderTime: settings.service_lunch_last_order_time,
          lastDeliveryTime: settings.service_lunch_last_delivery_time,
          isPreorder: true,
          dateRome: dayDateStr,
        };
      }
    }

    // Dinner
    if (!dinnerClosed) {
      if (isToday) {
        if (
          isTimeBefore(nowHHmm, dinnerLastOrder) ||
          nowHHmm === settings.service_dinner_start_time
        ) {
          const startsAt = isTimeBefore(nowHHmm, settings.service_dinner_start_time)
            ? romeAtTimeOfDay(dayDate, settings.service_dinner_start_time, 0)
            : now;
          return {
            service: "dinner",
            startsAt,
            lastOrderTime: dinnerLastOrder,
            lastDeliveryTime: dinnerLastDelivery,
            isPreorder: startsAt.getTime() > now.getTime(),
            dateRome: dayDateStr,
          };
        }
      } else {
        return {
          service: "dinner",
          startsAt: romeAtTimeOfDay(dayDate, settings.service_dinner_start_time, 0),
          lastOrderTime: dinnerLastOrder,
          lastDeliveryTime: dinnerLastDelivery,
          isPreorder: true,
          dateRome: dayDateStr,
        };
      }
    }
  }

  return null;
}

function addDaysRome(d: Date, days: number): Date {
  // Aggiungere giorni in UTC è safe rispetto al DST
  return new Date(d.getTime() + days * 86400_000);
}
