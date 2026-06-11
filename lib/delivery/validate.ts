// Catena di validazione delivery: 7 check in ordine.
// Primo errore → blocca + messaggio user-friendly italiano.

import "server-only";
import { computeEta, computePickupEta } from "./eta";
import { computeSlot, shiftSlotForward, type SlotResult } from "./slot";
import {
  nowInRome,
  weekdayInRome,
  timeOfDayRome,
  isTimeBefore,
  dateInRome,
  isWeekendRome,
} from "./time";
import { estimatedRoadKm, RESTAURANT_COORDS, type LatLng } from "@/lib/geocoding";
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
  minCartCents: number; // 0 se freeDelivery
  etaMinutes: number;
  slot: SlotResult;
  service: "lunch" | "dinner";
};

export type ValidationResult = ValidationError | ValidationSuccess;

export interface ValidationInput {
  orderType: "delivery" | "pickup";
  customerCoords?: LatLng; // obbligatorio se delivery
  cartTotalCents: number; // subtotale corrente, per check minimo
  now?: Date; // optional, default ora corrente
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
  travel_buckets: unknown; // jsonb
}

/**
 * Esegue tutta la catena di validazione + ritorna slot + eta se ok.
 */
export async function validateDelivery(
  input: ValidationInput,
): Promise<ValidationResult> {
  const sb = createAdminClient();

  // Carica delivery_settings + restaurant_settings.manual_pause
  const [settingsRes, restaurantRes] = await Promise.all([
    sb.from("delivery_settings").select("*").eq("id", 1).maybeSingle(),
    sb
      .from("restaurant_settings")
      .select("manual_pause")
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

  // CHECK #7: pausa manuale (la mettiamo per prima così è veloce)
  if (manualPause) {
    return {
      ok: false,
      code: "restaurant_paused",
      message:
        "Il ristorante è temporaneamente in pausa, riapriamo presto. Riprova tra poco.",
    };
  }

  const now = input.now ?? new Date();

  // Determina servizio corrente (lunch o dinner) in base all'orario Roma
  const nowHHmm = timeOfDayRome(now);
  const weekday = weekdayInRome(now); // 0=Dom, 1=Lun, ...
  const isClosedDay = settings.closed_weekdays.includes(weekday);

  if (isClosedDay) {
    return {
      ok: false,
      code: "closure",
      message:
        "Oggi siamo chiusi. Ti aspettiamo nel prossimo giorno di apertura 🍣",
    };
  }

  // Check closures table
  const today = dateInRome(now);
  const { data: closures } = await sb
    .from("closures")
    .select("closes_lunch, closes_dinner")
    .lte("start_date", today)
    .gte("end_date", today);

  const isLunchClosure = closures?.some((c) => c.closes_lunch) ?? false;
  const isDinnerClosure = closures?.some((c) => c.closes_dinner) ?? false;

  // Determina servizio (lunch/dinner) in base all'orario
  let service: "lunch" | "dinner";
  let lastOrderTime: string;
  let lastDeliveryTime: string;

  const isWeekend = isWeekendRome(now);

  if (
    !isLunchClosure &&
    nowHHmm >= settings.service_lunch_start_time &&
    isTimeBefore(nowHHmm, settings.service_lunch_last_order_time)
  ) {
    service = "lunch";
    lastOrderTime = settings.service_lunch_last_order_time;
    lastDeliveryTime = settings.service_lunch_last_delivery_time;
  } else if (
    !isDinnerClosure &&
    nowHHmm >= settings.service_dinner_start_time &&
    isTimeBefore(
      nowHHmm,
      isWeekend
        ? settings.service_dinner_weekend_last_order_time
        : settings.service_dinner_last_order_time,
    )
  ) {
    service = "dinner";
    lastOrderTime = isWeekend
      ? settings.service_dinner_weekend_last_order_time
      : settings.service_dinner_last_order_time;
    lastDeliveryTime = isWeekend
      ? settings.service_dinner_weekend_last_delivery_time
      : settings.service_dinner_last_delivery_time;
  } else {
    // Fuori orario di servizio
    return {
      ok: false,
      code: "outside_service_hours",
      message: getOutsideServiceMessage(nowHHmm, settings, isWeekend),
    };
  }

  // CHECK #5: now < last_order_time già implicito sopra (il blocco else cattura quando supera)

  // Calcola distanza + check delivery rules (solo per delivery, non pickup)
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

    distanceKm = estimatedRoadKm(RESTAURANT_COORDS, input.customerCoords);

    // CHECK #1: distanza
    if (distanceKm > settings.max_distance_km) {
      return {
        ok: false,
        code: "out_of_zone",
        message: `Siamo spiacenti, non consegniamo oltre i ${settings.max_distance_km} km dal ristorante. Distanza stimata: ${distanceKm.toFixed(1)} km.`,
        details: { distanceKm, max: settings.max_distance_km },
      };
    }

    // CHECK #2: minimo carrello se oltre la zona gratuita
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

  // CHECK #3: calcola ETA
  const buckets = (settings.travel_buckets as Array<{
    max_km: number;
    min: number;
  }>) ?? [];
  const eta =
    input.orderType === "delivery"
      ? computeEta(distanceKm, now, {
          prepMinutes: settings.prep_minutes,
          bufferMinutes: settings.buffer_minutes,
          baselineMinMinutes: settings.baseline_min_minutes,
          travelBuckets: buckets,
        })
      : computePickupEta(now, {
          prepMinutes: settings.prep_minutes,
          bufferMinutes: settings.buffer_minutes,
          baselinePickupMin: settings.baseline_pickup_min,
        });

  // CHECK #4 + #6: calcola slot con auto-shift per capacità
  let slot = computeSlot(eta.t1, settings.slot_duration_minutes);

  // Limite di sicurezza per auto-shift: massimo 20 iterazioni
  const MAX_SHIFTS = 20;
  let shifts = 0;

  while (shifts < MAX_SHIFTS) {
    // CHECK #4: slot_end deve essere <= last_delivery_time del servizio corrente
    const slotEndHHmm = timeOfDayRome(slot.end);
    const slotEndDate = dateInRome(slot.end);
    const slotEndIsTomorrow = slotEndDate !== today;

    // Se lo slot finisce oltre la mezzanotte e il servizio non è weekend-late, rifiuta
    if (slotEndIsTomorrow && lastDeliveryTime !== "00:00") {
      return outsideTimeWindow(eta.minutes, lastDeliveryTime);
    }
    // Confronto orario
    if (
      !slotEndIsTomorrow &&
      !isTimeBefore(slotEndHHmm, lastDeliveryTime) &&
      slotEndHHmm !== lastDeliveryTime
    ) {
      return outsideTimeWindow(eta.minutes, lastDeliveryTime);
    }

    // CHECK #6: capacità slot
    const { count: usedCount } = await sb
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("is_test", false)
      .eq("slot_end", slot.end.toISOString())
      .not("status", "in", "(delivered,cancelled,refunded)");

    if ((usedCount ?? 0) < settings.max_orders_per_slot) {
      // OK trovato slot disponibile
      return {
        ok: true,
        distanceKm,
        freeDelivery,
        minCartCents,
        etaMinutes: eta.minutes,
        slot,
        service,
      };
    }

    // Auto-shift al prossimo slot
    slot = shiftSlotForward(slot, settings.slot_duration_minutes);
    shifts++;
  }

  // Cascade auto-shift esaurita = capacità piena per il resto della giornata
  return {
    ok: false,
    code: "all_slots_full",
    message: "Per stasera siamo al completo. Ti aspettiamo domani 🍣",
  };
}

function outsideTimeWindow(
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

function getOutsideServiceMessage(
  nowHHmm: string,
  settings: DeliverySettingsRow,
  isWeekend: boolean,
): string {
  if (nowHHmm < settings.service_lunch_start_time) {
    return `Apriamo per il pranzo alle ${settings.service_lunch_start_time}. Riprova tra poco 🍱`;
  }
  if (nowHHmm < settings.service_dinner_start_time) {
    return `Pranzo chiuso. Riapriamo per la cena alle ${settings.service_dinner_start_time}. Ti aspettiamo!`;
  }
  const dinnerEnd = isWeekend
    ? settings.service_dinner_weekend_last_order_time
    : settings.service_dinner_last_order_time;
  return `Ordini chiusi per oggi (ultimo ordine alle ${dinnerEnd}). Ti aspettiamo domani 🍣`;
}
