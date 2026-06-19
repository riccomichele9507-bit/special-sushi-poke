"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDelivery, type ValidationSuccess } from "@/lib/delivery/validate";
import { enqueuePrintJob } from "@/lib/print/queue";
import {
  PROMO_CODE,
  computeAutoPromoCents,
  type PromoConfig,
} from "@/lib/promo/auto-promo";
import { getPromoConfig } from "@/lib/promo/server";
import { sendOrderConfirmationEmail } from "@/lib/email/send";
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
  /** Chiave anti-doppione per tentativo di checkout (UUID generato dal client). */
  idempotencyKey?: string;
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; errorCode: string; errorMessage: string };

type AdminClient = ReturnType<typeof createAdminClient>;
type Fail = { ok: false; errorCode: string; errorMessage: string };

function fail(errorCode: string, errorMessage: string): Fail {
  return { ok: false, errorCode, errorMessage };
}

/**
 * Crea un nuovo ordine. Orchestratore: ogni passo è una funzione a singola
 * responsabilità (vedi sotto). ANTI-TAMPER — i totali, lo sconto, la distanza,
 * lo slot e la capacità sono SEMPRE ricalcolati lato server dal DB, mai dal client.
 * Ordine consentito anche da OSPITE (customer_id null).
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Validazione input (+ contatti ospite)
  const inputError = validateOrderInput(user, input);
  if (inputError) return inputError;

  const admin = createAdminClient();

  // 2. Idempotenza: se questo tentativo è già stato registrato → stesso ordine
  const duplicate = await findOrderByIdempotency(admin, input.idempotencyKey);
  if (duplicate) return duplicate;

  // 3. Ricalcola items + subtotale dal DB (anti-tamper)
  const items = await recomputeItems(admin, input.items);
  if ("ok" in items) return items;
  const { snapshots, subtotalCents } = items;

  // 4. Totali: unica promo automatica (config dal DB) + mancia (anti-tamper)
  const tipCents = Math.max(0, input.tipCents ?? 0);
  const promo = await getPromoConfig();
  const { discountCents, discountCode, totalCents } = computeTotals(
    subtotalCents,
    tipCents,
    promo,
  );

  // 5. Ri-valida consegna + slot ancora libero
  const slot = await revalidateSlot(input, subtotalCents);
  if ("ok" in slot) return slot;
  const { validation } = slot;

  // 6. Numero ordine progressivo atomico (Postgres SEQUENCE)
  const orderNumber = await nextOrderNumber(admin);
  if (typeof orderNumber !== "string") return orderNumber;

  // 7. Inserisci ordine (con gestione conflitto idempotenza)
  const inserted = await insertOrder(admin, {
    orderNumber,
    user,
    input,
    snapshots,
    subtotalCents,
    discountCents,
    discountCode,
    tipCents,
    totalCents,
    validation,
    isTest: computeIsTest(),
  });
  if ("ok" in inserted) return inserted;
  const orderId = inserted.row.id;

  // 8. Re-check capacità post-insert (rollback se lo slot si è riempito)
  const capacityError = await enforceCapacityOrRollback(
    admin,
    orderId,
    input.slotEndIso,
  );
  if (capacityError) return capacityError;

  // 9. Storico stato iniziale + profilo cliente (indirizzo/consenso)
  await recordInitialStatus(admin, orderId);
  await updateCustomerProfile(admin, user, input);

  // 10. Contanti: conferma subito + stampa + email (carta → attende Stripe)
  if (input.paymentMethod === "cash") {
    await finalizeCashOrder(admin, orderId);
  }

  return {
    ok: true,
    orderId,
    orderNumber: inserted.row.order_number,
  };
}

// ============================================================
// Helper a singola responsabilità
// ============================================================

/** Validazione input base + contatti obbligatori per gli ospiti. */
function validateOrderInput(
  user: { id: string } | null,
  input: CreateOrderInput,
): Fail | null {
  if (!user) {
    if (
      !input.email?.includes("@") ||
      !input.name?.trim() ||
      !input.phone?.trim()
    ) {
      return fail(
        "guest_missing_contact",
        "Per ordinare come ospite servono nome, email e telefono.",
      );
    }
  }
  if (!input.items || input.items.length === 0) {
    return fail("empty_cart", "Il carrello è vuoto.");
  }
  if (input.orderType === "delivery") {
    if (!input.geo) {
      return fail(
        "no_coords",
        "Indirizzo non confermato. Riprova dall'autocomplete.",
      );
    }
    if (!input.addressLine || input.addressLine.trim().length < 5) {
      return fail("no_address", "Inserisci un indirizzo valido.");
    }
  }
  return null;
}

/** Doppio-tap / retry: se la chiave idempotenza esiste, ritorna lo stesso ordine. */
async function findOrderByIdempotency(
  admin: AdminClient,
  key: string | undefined,
): Promise<CreateOrderResult | null> {
  if (!key) return null;
  const { data: existing } = await admin
    .from("orders")
    .select("id, order_number")
    .eq("idempotency_key", key)
    .maybeSingle();
  return existing
    ? { ok: true, orderId: existing.id, orderNumber: existing.order_number }
    : null;
}

/** Ricalcola gli snapshot e il subtotale dal DB (prezzi reali, anti-tamper). */
async function recomputeItems(
  admin: AdminClient,
  items: CartItem[],
): Promise<{ snapshots: OrderItemSnapshot[]; subtotalCents: number } | Fail> {
  const dishIds = items.filter((i) => !i.custom).map((i) => i.dishId);
  const { data: dishRows } = await admin
    .from("dishes")
    .select("id, name, price, is_active")
    .in("id", dishIds.length ? dishIds : ["__none__"]);

  const dishMap = new Map<
    string,
    { name: string; price: number; is_active: boolean }
  >();
  for (const d of dishRows ?? []) {
    dishMap.set(d.id, { name: d.name, price: d.price, is_active: d.is_active });
  }

  const snapshots: OrderItemSnapshot[] = [];
  let subtotalCents = 0;

  for (const item of items) {
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
      return fail(
        "dish_missing",
        `Piatto non più disponibile: ${item.dishId}. Aggiorna il carrello.`,
      );
    }
    if (!dish.is_active) {
      return fail("dish_inactive", `"${dish.name}" è esaurito. Rimuovilo dal carrello.`);
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

  return { snapshots, subtotalCents };
}

/** Sconto (unica promo automatica, config dal DB) + totale. */
function computeTotals(
  subtotalCents: number,
  tipCents: number,
  promo: PromoConfig,
): { discountCents: number; discountCode: string | null; totalCents: number } {
  const discountCents = computeAutoPromoCents(subtotalCents, promo);
  const discountCode = discountCents > 0 ? PROMO_CODE : null;
  const totalCents = subtotalCents + tipCents - discountCents;
  return { discountCents, discountCode, totalCents };
}

/** Ri-valida la consegna e che lo slot scelto sia ancora disponibile. */
async function revalidateSlot(
  input: CreateOrderInput,
  subtotalCents: number,
): Promise<{ validation: ValidationSuccess } | Fail> {
  const validation = await validateDelivery({
    orderType: input.orderType,
    cartTotalCents: subtotalCents,
    customerCoords: input.geo,
  });
  if (!validation.ok) return fail(validation.code, validation.message);

  const slotStillAvailable = validation.slots.some(
    (s) => s.end.toISOString() === input.slotEndIso,
  );
  if (!slotStillAvailable) {
    return fail(
      "slot_unavailable",
      "L'orario che avevi scelto non è più disponibile. Aggiorna gli orari e riprova.",
    );
  }
  return { validation };
}

/** Numero ordine progressivo atomico via Postgres SEQUENCE. */
async function nextOrderNumber(admin: AdminClient): Promise<string | Fail> {
  const { data: seqValue, error: seqError } = await admin.rpc(
    "get_next_order_number",
  );
  if (seqError || !seqValue) {
    console.error("get_next_order_number failed:", seqError);
    return fail("system", "Impossibile generare il numero d'ordine. Riprova.");
  }
  return String(seqValue);
}

/** Ordine "test" solo in dev locale o con Stripe in test mode. In produzione: reale. */
function computeIsTest(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false)
  );
}

interface InsertOrderParams {
  orderNumber: string;
  user: { id: string } | null;
  input: CreateOrderInput;
  snapshots: OrderItemSnapshot[];
  subtotalCents: number;
  discountCents: number;
  discountCode: string | null;
  tipCents: number;
  totalCents: number;
  validation: ValidationSuccess;
  isTest: boolean;
}

/**
 * Inserisce l'ordine. Ritorna la riga inserita, OPPURE un CreateOrderResult
 * terminale (successo per conflitto idempotenza concorrente, o errore di sistema).
 */
async function insertOrder(
  admin: AdminClient,
  p: InsertOrderParams,
): Promise<{ row: { id: string; order_number: string } } | CreateOrderResult> {
  const { input, validation } = p;
  const { data: inserted, error: insertError } = await admin
    .from("orders")
    .insert({
      order_number: p.orderNumber,
      customer_id: p.user?.id ?? null,
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
      slot_start: new Date(input.slotStartIso).toISOString(),
      slot_end: new Date(input.slotEndIso).toISOString(),
      deliver_by: new Date(input.slotEndIso).toISOString(),
      items: p.snapshots as unknown as Json,
      subtotal_cents: p.subtotalCents,
      discount_cents: p.discountCents,
      discount_code: p.discountCode,
      tip_cents: p.tipCents,
      total_cents: p.totalCents,
      payment_method: input.paymentMethod,
      status: "received",
      is_test: p.isTest,
      idempotency_key: input.idempotencyKey ?? null,
    })
    .select("id, order_number")
    .single();

  if (insertError || !inserted) {
    // Conflitto sulla chiave idempotenza (richiesta concorrente che ha vinto la
    // corsa): ritorna l'ordine già creato invece di un errore.
    if (insertError?.code === "23505" && input.idempotencyKey) {
      const { data: existing } = await admin
        .from("orders")
        .select("id, order_number")
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      if (existing) {
        return {
          ok: true,
          orderId: existing.id,
          orderNumber: existing.order_number,
        };
      }
    }
    console.error("createOrder insert failed", insertError);
    return fail(
      "system",
      "Impossibile salvare l'ordine. Riprova tra un minuto o chiamaci.",
    );
  }

  return { row: inserted };
}

/**
 * Re-check capacità post-insert (best-effort senza SQL FOR UPDATE): se lo slot si
 * è riempito nel frattempo, fa rollback dell'ordine appena creato.
 */
async function enforceCapacityOrRollback(
  admin: AdminClient,
  orderId: string,
  slotEndIso: string,
): Promise<Fail | null> {
  const slotEnd = new Date(slotEndIso).toISOString();
  const { count: usedAfterInsert } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("is_test", false)
    .eq("slot_end", slotEnd)
    .not("status", "in", "(delivered,cancelled,refunded)");

  const { data: settingsNow } = await admin
    .from("delivery_settings")
    .select("max_orders_per_slot")
    .eq("id", 1)
    .maybeSingle();
  const maxOrdersPerSlot = settingsNow?.max_orders_per_slot ?? 8;

  if ((usedAfterInsert ?? 0) > maxOrdersPerSlot) {
    await admin.from("orders").delete().eq("id", orderId);
    return fail(
      "slot_unavailable",
      "Lo slot si è appena riempito mentre stavi confermando. Scegli un altro orario.",
    );
  }
  return null;
}

/** Record iniziale "received" nello storico stato. */
async function recordInitialStatus(
  admin: AdminClient,
  orderId: string,
): Promise<void> {
  await admin.from("order_status_history").insert({
    order_id: orderId,
    status: "received",
    changed_by: "system",
  });
}

/**
 * Aggiorna il profilo cliente: marketing_consent, name/phone e salva l'indirizzo
 * di consegna come address_default (riapparirà precompilato al prossimo checkout).
 */
async function updateCustomerProfile(
  admin: AdminClient,
  user: { id: string } | null,
  input: CreateOrderInput,
): Promise<void> {
  if (!user) return;
  const customerUpdate: {
    marketing_consent?: boolean;
    name?: string;
    phone?: string;
    address_default?: Json;
  } = {};
  if (input.marketingConsent === true) customerUpdate.marketing_consent = true;
  if (input.name) customerUpdate.name = input.name;
  if (input.phone) customerUpdate.phone = input.phone;
  if (input.orderType === "delivery" && input.addressLine && input.geo) {
    customerUpdate.address_default = {
      address: input.addressLine,
      lat: input.geo.lat,
      lng: input.geo.lng,
      notes: input.addressNotes ?? null,
    } as unknown as Json;
  }
  if (Object.keys(customerUpdate).length > 0) {
    await admin.from("customers").update(customerUpdate).eq("id", user.id);
  }
}

/**
 * Ordine contanti: promuove a "confirmed" subito (niente pagamento da attendere),
 * accoda la comanda di stampa e invia l'email di conferma (best-effort).
 */
async function finalizeCashOrder(
  admin: AdminClient,
  orderId: string,
): Promise<void> {
  await admin
    .from("orders")
    .update({ status: "confirmed", status_updated_at: new Date().toISOString() })
    .eq("id", orderId);
  await admin.from("order_status_history").insert({
    order_id: orderId,
    status: "confirmed",
    changed_by: "system",
  });
  const { data: full } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (full) {
    await enqueuePrintJob(full);
    await sendOrderConfirmationEmail(full);
  }
}
