"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { CartItem, CustomPokeConfig } from "@/types/cart";

const orderItemSnapshotSchema = z.object({
  dishId: z.string().min(1),
  qty: z.number().int().positive(),
  custom: z
    .object({
      type: z.literal("custom-poke"),
      basePriceCents: z.number().int().nonnegative(),
      extrasCents: z.number().int().nonnegative(),
      selectionLabels: z.record(z.string(), z.array(z.string())),
    })
    .optional(),
});
const orderItemsSchema = z.array(orderItemSnapshotSchema);

interface OrderItemSnapshot {
  dishId: string;
  qty: number;
  custom?: CustomPokeConfig;
}

export type ReorderResult =
  | { ok: true; items: CartItem[]; unavailableCount: number }
  | { ok: false; errorMessage: string };

/**
 * Riprende i piatti da un ordine passato e li ritorna come CartItem[].
 * Il client li mette nel cart-store. Salta i piatti non più attivi/esauriti.
 * Le custom poke vengono mantenute con la stessa config.
 */
export async function reorderFromOrder(orderNumber: string): Promise<ReorderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, errorMessage: "Devi essere loggato per riordinare." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("items")
    .eq("order_number", orderNumber)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) {
    return { ok: false, errorMessage: "Ordine non trovato." };
  }

  // Validazione runtime: se il jsonb è corrotto/manomesso, fail safe
  const parsed = orderItemsSchema.safeParse(order.items);
  if (!parsed.success) {
    console.error("reorder: items snapshot invalido", parsed.error);
    return {
      ok: false,
      errorMessage: "Dati ordine non leggibili. Aggiungi i piatti manualmente.",
    };
  }
  const items = parsed.data as OrderItemSnapshot[];
  const dishIds = items.filter((i) => !i.custom).map((i) => i.dishId);

  // Verifica disponibilità piatti correnti
  const { data: dishes } = await supabase
    .from("dishes")
    .select("id, is_active")
    .in("id", dishIds.length ? dishIds : ["__none__"]);

  const activeMap = new Map<string, boolean>();
  for (const d of dishes ?? []) activeMap.set(d.id, d.is_active);

  const result: CartItem[] = [];
  let unavailableCount = 0;

  for (const item of items) {
    if (item.custom) {
      // Custom poke: aggiungiamo sempre (configurazione self-contained)
      result.push({
        dishId: `custom-poke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        quantity: item.qty,
        custom: item.custom,
      });
      continue;
    }
    if (activeMap.get(item.dishId)) {
      result.push({ dishId: item.dishId, quantity: item.qty });
    } else {
      unavailableCount += 1;
    }
  }

  return { ok: true, items: result, unavailableCount };
}
