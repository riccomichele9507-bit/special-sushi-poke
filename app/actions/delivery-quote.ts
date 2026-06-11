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

/**
 * Server action per ottenere il quote consegna live.
 * Path veloce: passa `coords` (da autocomplete) → niente geocoding.
 * Path legacy: passa `address` → geocoding via Google/Nominatim.
 */
export async function getDeliveryQuote(
  input: DeliveryQuoteInput,
): Promise<DeliveryQuoteResult> {
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

  // Delivery: due path possibili — coords diretti o address da geocodificare
  let coords: { lat: number; lng: number };
  let formattedAddress: string;

  if (input.coords) {
    // Path veloce: autocomplete ha già fornito coords + formatted address
    coords = input.coords;
    formattedAddress = input.formattedAddress ?? "";
  } else {
    // Path legacy: geocodifica da testo
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
    slotStart: formatRomeHHmm(result.slot.start),
    slotEnd: formatRomeHHmm(result.slot.end),
    slotStartIso: result.slot.start.toISOString(),
    slotEndIso: result.slot.end.toISOString(),
    formattedAddress,
    service: result.service,
  };
}
