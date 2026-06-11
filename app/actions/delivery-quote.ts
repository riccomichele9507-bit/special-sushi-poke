"use server";

import { geocodeAddress } from "@/lib/geocoding";
import { validateDelivery } from "@/lib/delivery/validate";
import { formatRomeHHmm, relativeDayLabel } from "@/lib/delivery/time";

export interface SlotOption {
  startIso: string;
  endIso: string;
  startHHmm: string; // "20:00"
  endHHmm: string; // "20:30"
}

export interface DeliveryQuoteResult {
  ok: boolean;
  // Success fields:
  distanceKm?: number;
  freeDelivery?: boolean;
  minCartCents?: number;
  etaMinutes?: number;
  slots?: SlotOption[];
  defaultSlotIndex?: number;
  formattedAddress?: string;
  service?: "lunch" | "dinner";
  dayLabel?: string;
  isPreorder?: boolean;
  // Error fields:
  errorCode?: string;
  errorMessage?: string;
}

export interface DeliveryQuoteInput {
  /** Indirizzo testuale (per /verifica-consegna). Ignorato se coords presenti. */
  address?: string;
  /** Coords già note (da autocomplete) → skip geocoding. */
  coords?: { lat: number; lng: number };
  /** Indirizzo formattato dall'autocomplete da mostrare al cliente. */
  formattedAddress?: string;
  cartTotalCents: number;
  orderType?: "delivery" | "pickup";
}

export async function getDeliveryQuote(
  input: DeliveryQuoteInput,
): Promise<DeliveryQuoteResult> {
  const orderType = input.orderType ?? "delivery";

  if (orderType === "pickup") {
    const result = await validateDelivery({
      orderType: "pickup",
      cartTotalCents: input.cartTotalCents,
    });
    if (!result.ok) {
      return { ok: false, errorCode: result.code, errorMessage: result.message };
    }
    return {
      ok: true,
      etaMinutes: result.etaMinutes,
      slots: result.slots.map(toSlotOption),
      defaultSlotIndex: result.defaultSlotIndex,
      service: result.service,
      freeDelivery: true,
      distanceKm: 0,
      dayLabel: relativeDayLabel(result.slots[0].start),
      isPreorder: result.isPreorder,
    };
  }

  let coords: { lat: number; lng: number };
  let formattedAddress: string;

  if (input.coords) {
    coords = input.coords;
    formattedAddress = input.formattedAddress ?? "";
  } else {
    if (!input.address || input.address.trim().length < 5) {
      return {
        ok: false,
        errorCode: "no_coords",
        errorMessage: "Inserisci un indirizzo completo (via, civico, città).",
      };
    }

    let geo;
    try {
      geo = await geocodeAddress(input.address);
    } catch (e) {
      console.error("geocode error", e);
      return {
        ok: false,
        errorCode: "system",
        errorMessage:
          "Servizio mappe momentaneamente non disponibile. Riprova tra poco.",
      };
    }

    if (!geo) {
      return {
        ok: false,
        errorCode: "no_coords",
        errorMessage:
          "Indirizzo non trovato. Riprova con un indirizzo più specifico (es. 'Via Sparano 10, Bari').",
      };
    }
    coords = { lat: geo.lat, lng: geo.lng };
    formattedAddress = geo.displayName;
  }

  const result = await validateDelivery({
    orderType: "delivery",
    cartTotalCents: input.cartTotalCents,
    customerCoords: coords,
  });

  if (!result.ok) {
    return {
      ok: false,
      errorCode: result.code,
      errorMessage: result.message,
      formattedAddress,
    };
  }

  return {
    ok: true,
    distanceKm: result.distanceKm,
    freeDelivery: result.freeDelivery,
    minCartCents: result.minCartCents,
    etaMinutes: result.etaMinutes,
    slots: result.slots.map(toSlotOption),
    defaultSlotIndex: result.defaultSlotIndex,
    formattedAddress,
    service: result.service,
    dayLabel: relativeDayLabel(result.slots[0].start),
    isPreorder: result.isPreorder,
  };
}

function toSlotOption(slot: { start: Date; end: Date }): SlotOption {
  return {
    startIso: slot.start.toISOString(),
    endIso: slot.end.toISOString(),
    startHHmm: formatRomeHHmm(slot.start),
    endHHmm: formatRomeHHmm(slot.end),
  };
}
