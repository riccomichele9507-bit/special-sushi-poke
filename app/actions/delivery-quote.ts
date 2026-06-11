"use server";

import { geocodeAddress } from "@/lib/geocoding";
import { validateDelivery } from "@/lib/delivery/validate";
import { formatRomeHHmm } from "@/lib/delivery/time";

export interface DeliveryQuoteResult {
  ok: boolean;
  // Success fields:
  distanceKm?: number;
  freeDelivery?: boolean;
  minCartCents?: number;
  etaMinutes?: number;
  slotStart?: string; // HH:mm Roma
  slotEnd?: string; // HH:mm Roma
  slotStartIso?: string;
  slotEndIso?: string;
  formattedAddress?: string;
  service?: "lunch" | "dinner";
  // Error fields:
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Server action chiamata dal client per ottenere il quote consegna live.
 * Usata sia dal widget "Verifica consegna" sia dal checkout.
 */
export async function getDeliveryQuote(input: {
  address: string;
  cartTotalCents: number;
  orderType?: "delivery" | "pickup";
}): Promise<DeliveryQuoteResult> {
  const orderType = input.orderType ?? "delivery";

  // Pickup non richiede indirizzo
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
      slotStart: formatRomeHHmm(result.slot.start),
      slotEnd: formatRomeHHmm(result.slot.end),
      slotStartIso: result.slot.start.toISOString(),
      slotEndIso: result.slot.end.toISOString(),
      service: result.service,
      freeDelivery: true,
      distanceKm: 0,
    };
  }

  // Delivery: prima geocodifica indirizzo
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
      errorMessage: "Servizio mappe momentaneamente non disponibile. Riprova tra poco.",
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

  const result = await validateDelivery({
    orderType: "delivery",
    cartTotalCents: input.cartTotalCents,
    customerCoords: { lat: geo.lat, lng: geo.lng },
  });

  if (!result.ok) {
    return {
      ok: false,
      errorCode: result.code,
      errorMessage: result.message,
      formattedAddress: geo.displayName,
    };
  }

  return {
    ok: true,
    distanceKm: result.distanceKm,
    freeDelivery: result.freeDelivery,
    minCartCents: result.minCartCents,
    etaMinutes: result.etaMinutes,
    slotStart: formatRomeHHmm(result.slot.start),
    slotEnd: formatRomeHHmm(result.slot.end),
    slotStartIso: result.slot.start.toISOString(),
    slotEndIso: result.slot.end.toISOString(),
    formattedAddress: geo.displayName,
    service: result.service,
  };
}
