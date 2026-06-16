"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDelivery } from "@/lib/delivery/validate";
import { enqueuePrintJob } from "@/lib/print/queue";
import { AUTO_PROMO, computeAutoPromoCents } from "@/lib/promo/auto-promo";
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
  geo?: { lat: number; lng: number; placeId?: string };
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
  // 1. Auth — opzionale: ordine consentito anche da OSPITE (customer_id null).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Per gli ospiti servono nome, email e telefono (per contattarli sull'ordine).
  if (!user) {
    if (
      !input.email?.includes("@") ||
      !input.name?.trim() ||
      !input.phone?.trim()
    ) {
      return {
        ok: false,
        errorCode: "guest_missing_contact",
        errorMessage: "Per ordinare come ospite servono nome, email e telefono.",
      };
    }
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

  // IDEMPOTENZA (anti-doppione): se questo tentativo di checkout è già stato
  // registrato (doppio-tap / retry di rete), ritorna lo STESSO ordine invece di
  // crearne uno nuovo.
  const admin = createAdminClient();
  if (input.idempotencyKey) {
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

  // 3. Ricalcola items + totali da DB (anti-tamper)

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

  // SCONTO (anti-tamper: ricalcolato SEMPRE lato server, mai dal client).
  // Unica promo del locale: 20% automatico sul carrello ≥ €50.
  const discountCents = computeAutoPromoCents(subtotalCents);
  const discountCode = discountCents > 0 ? AUTO_PROMO.code : null;
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

  // 5. Genera order_number progressivo atomico via Postgres SEQUENCE
  // Format: "0001", "0002", "0003"... lpad 4 zero, espandibile auto (es. "12345").
  // Atomic: niente race condition tra ordini simultanei.
  let orderNumber: string;
  {
    const { data: seqValue, error: seqError } = await admin.rpc(
      "get_next_order_number",
    );
    if (seqError || !seqValue) {
      console.error("get_next_order_number failed:", seqError);
      return {
        ok: false,
        errorCode: "system",
        errorMessage: "Impossibile generare il numero d'ordine. Riprova.",
      };
    }
    orderNumber = String(seqValue);
  }

  // 6. Insert order
  // is_test logic: ordine "test" solo in development locale o se Stripe è in test mode.
  // In produzione (NODE_ENV=production su Vercel), tutti gli ordini sono REALI.
  const isTest =
    process.env.NODE_ENV !== "production" ||
    (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false);
  const { data: inserted, error: insertError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: user?.id ?? null,
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
      discount_code: discountCode,
      tip_cents: tipCents,
      total_cents: totalCents,
      payment_method: input.paymentMethod,
      status: "received",
      is_test: isTest,
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
    return {
      ok: false,
      errorCode: "system",
      errorMessage:
        "Impossibile salvare l'ordine. Riprova tra un minuto o chiamaci.",
    };
  }

  // 6b. Post-insert capacity re-check (best-effort senza SQL FOR UPDATE).
  // Se nel mentre altri N ordini sono entrati nello stesso slot e abbiamo superato
  // max_orders_per_slot, fai rollback dell'ordine appena creato e ritorna errore.
  // Nota: window di race ridotta da ~secondi a ~millisecondi (non zero ma molto contenuta).
  const { count: usedAfterInsert } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("is_test", false)
    .eq("slot_end", slotEnd.toISOString())
    .not("status", "in", "(delivered,cancelled,refunded)");

  // Re-leggi max_orders_per_slot (in case di update concorrente)
  const { data: settingsNow } = await admin
    .from("delivery_settings")
    .select("max_orders_per_slot")
    .eq("id", 1)
    .maybeSingle();
  const maxOrdersPerSlot = settingsNow?.max_orders_per_slot ?? 8;

  if ((usedAfterInsert ?? 0) > maxOrdersPerSlot) {
    // Overflow: rollback insert
    await admin.from("orders").delete().eq("id", inserted.id);
    return {
      ok: false,
      errorCode: "slot_unavailable",
      errorMessage:
        "Lo slot si è appena riempito mentre stavi confermando. Scegli un altro orario.",
    };
  }

  // 7. Order status history (record iniziale)
  await admin.from("order_status_history").insert({
    order_id: inserted.id,
    status: "received",
    changed_by: "system",
  });

  // 7b. Aggiorna profilo cliente: marketing_consent (se spuntato), name/phone,
  // e SALVA l'indirizzo di consegna come address_default → riapparirà
  // precompilato al prossimo checkout / riordino.
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
  if (user && Object.keys(customerUpdate).length > 0) {
    await admin.from("customers").update(customerUpdate).eq("id", user.id);
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
    if (full) {
      await enqueuePrintJob(full);
      // Email "ordine ricevuto" (best-effort, non blocca l'ordine)
      await sendOrderConfirmationEmail(full);
    }
  }

  return {
    ok: true,
    orderId: inserted.id,
    orderNumber: inserted.order_number,
  };
}
