"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDelivery } from "@/lib/delivery/validate";
import { enqueuePrintJob } from "@/lib/print/queue";
import type { CartItem, CustomPokeConfig } from "@/types/cart";
import type { Json } from "@/lib/supabase/database.types";

interface OrderItemSnapshot {
  dishId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
  variant?: string;
  extras?: string[];
  custom?: CustomPokeConfig;
}

export interface CreateOrderInput {
  orderType: "delivery" | "pickup";
  name: string;
  phone: string;
  email: string;
  addressLine?: string;
  addressNotes?: string;
  driverNotes?: string;
  paymentMethod: "cash" | "card";
  slotStartIso: string;
  slotEndIso: string;
  geo?: { lat: number; lng: number };
  items: CartItem[];
  tipCents?: number;
  /** Spuntato a checkout → aggiorna customers.marketing_consent se non già true */
  marketingConsent?: boolean;
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; errorCode: string; errorMessage: string };

/**
 * Crea un nuovo ordine. ANTI-TAMPER:
 * - Verifica auth (cliente loggato)
 * - Riesegue la catena validateDelivery (slot ancora libero, distanza, ecc.)
 * - Ricalcola TOTALI dal DB ignorando il client
 * - Insert orders + order_status_history + print_jobs
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      errorCode: "unauthenticated",
      errorMessage: "Devi accedere per finalizzare l'ordine.",
    };
  }

  // 2. Validate basic input
  if (!input.items || input.items.length === 0) {
    return {
      ok: false,
      errorCode: "empty_cart",
      errorMessage: "Il carrello è vuoto.",
    };
  }
  if (input.orderType === "delivery") {
    if (!input.geo) {
      return {
        ok: false,
        errorCode: "no_coords",
        errorMessage: "Indirizzo non confermato. Riprova dall'autocomplete.",
      };
    }
    if (!input.addressLine || input.addressLine.trim().length < 5) {
      return {
        ok: false,
        errorCode: "no_address",
        errorMessage: "Inserisci un indirizzo valido.",
      };
    }
  }

  // 3. Ricalcola items + totali da DB (anti-tamper)
  const admin = createAdminClient();

  // Separa custom poke dagli altri dishId
  const dishIds = input.items
    .filter((i) => !i.custom)
    .map((i) => i.dishId);

  const { data: dishRows } = await admin
    .from("dishes")
    .select("id, name, price, is_active")
    .in("id", dishIds.length ? dishIds : ["__none__"]);

  const dishMap = new Map<string, { name: string; price: number; is_active: boolean }>();
  for (const d of dishRows ?? []) {
    dishMap.set(d.id, { name: d.name, price: d.price, is_active: d.is_active });
  }

  const snapshots: OrderItemSnapshot[] = [];
  let subtotalCents = 0;

  for (const item of input.items) {
    if (item.custom) {
      // Custom poke: prezzo derivato dalla config (basePrice + extras)
      const unitPrice = item.custom.basePriceCents + item.custom.extrasCents;
      const lineTotal = unitPrice * item.quantity;
      const ingredients = Object.values(item.custom.selectionLabels).flat();
      snapshots.push({
        dishId: item.dishId,
        name: "La tua poke",
        qty: item.quantity,
        unitPriceCents: unitPrice,
        lineTotalCents: lineTotal,
        custom: item.custom,
        extras: ingredients,
      });
      subtotalCents += lineTotal;
      continue;
    }

    const dish = dishMap.get(item.dishId);
    if (!dish) {
      return {
        ok: false,
        errorCode: "dish_missing",
        errorMessage: `Piatto non più disponibile: ${item.dishId}. Aggiorna il carrello.`,
      };
    }
    if (!dish.is_active) {
      return {
        ok: false,
        errorCode: "dish_inactive",
        errorMessage: `"${dish.name}" è esaurito. Rimuovilo dal carrello.`,
      };
    }
    const unitPrice = dish.price;
    const lineTotal = unitPrice * item.quantity;
    snapshots.push({
      dishId: item.dishId,
      name: dish.name,
      qty: item.quantity,
      unitPriceCents: unitPrice,
      lineTotalCents: lineTotal,
    });
    subtotalCents += lineTotal;
  }

  const tipCents = Math.max(0, input.tipCents ?? 0);
  const discountCents = 0; // TODO: integrare codice sconto + loyalty
  const totalCents = subtotalCents + tipCents - discountCents;

  // 4. Re-valida slot (race protection)
  const slotEnd = new Date(input.slotEndIso);
  const slotStart = new Date(input.slotStartIso);
  const validation = await validateDelivery({
    orderType: input.orderType,
    cartTotalCents: subtotalCents,
    customerCoords: input.geo,
  });
  if (!validation.ok) {
    return {
      ok: false,
      errorCode: validation.code,
      errorMessage: validation.message,
    };
  }
  // Verifica che lo slot scelto sia ancora disponibile
  const slotStillAvailable = validation.slots.some(
    (s) => s.end.toISOString() === input.slotEndIso,
  );
  if (!slotStillAvailable) {
    return {
      ok: false,
      errorCode: "slot_unavailable",
      errorMessage:
        "L'orario che avevi scelto non è più disponibile. Aggiorna gli orari e riprova.",
    };
  }

  // 5. Genera order_number (formato: AAAAMMGG-XXXX progressivo)
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const { count: todayCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${today.toISOString().slice(0, 10)}T00:00:00Z`);
  const orderNumber = `SSP-${datePart}-${String((todayCount ?? 0) + 1).padStart(4, "0")}`;

  // 6. Insert order
  const isTest = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? true;
  const { data: inserted, error: insertError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      customer_name: input.name,
      customer_phone: input.phone,
      customer_email: input.email,
      order_type: input.orderType,
      address_line: input.addressLine ?? null,
      address_notes: input.addressNotes ?? null,
      driver_notes: input.driverNotes ?? null,
      geo: input.geo ? (input.geo as unknown as Json) : null,
      road_distance_m:
        validation.distanceKm != null
          ? Math.round(validation.distanceKm * 1000)
          : null,
      eta_minutes: validation.etaMinutes,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      deliver_by: slotEnd.toISOString(),
      items: snapshots as unknown as Json,
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      tip_cents: tipCents,
      total_cents: totalCents,
      payment_method: input.paymentMethod,
      status: "received",
      is_test: isTest,
    })
    .select("id, order_number")
    .single();

  if (insertError || !inserted) {
    console.error("createOrder insert failed", insertError);
    return {
      ok: false,
      errorCode: "system",
      errorMessage:
        "Impossibile salvare l'ordine. Riprova tra un minuto o chiamaci.",
    };
  }

  // 7. Order status history (record iniziale)
  await admin.from("order_status_history").insert({
    order_id: inserted.id,
    status: "received",
    changed_by: "system",
  });

  // 7b. Aggiorna marketing_consent se il cliente l'ha spuntato al checkout
  // (idempotente: aggiorna solo se attualmente false, mai abbassa a false)
  if (input.marketingConsent === true) {
    await admin
      .from("customers")
      .update({
        marketing_consent: true,
        // Aggiorna anche name + phone se erano vuoti
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
      })
      .eq("id", user.id);
  }

  // 8. Print job — solo per cash on delivery. Per card aspettiamo Stripe webhook.
  if (input.paymentMethod === "cash") {
    // Promuovi a "confirmed" subito (no pagamento da attendere)
    await admin
      .from("orders")
      .update({ status: "confirmed", status_updated_at: new Date().toISOString() })
      .eq("id", inserted.id);
    await admin.from("order_status_history").insert({
      order_id: inserted.id,
      status: "confirmed",
      changed_by: "system",
    });
    // Recupera ordine completo aggiornato per il receipt
    const { data: full } = await admin
      .from("orders")
      .select("*")
      .eq("id", inserted.id)
      .single();
    if (full) await enqueuePrintJob(full);
  }

  return {
    ok: true,
    orderId: inserted.id,
    orderNumber: inserted.order_number,
  };
}
