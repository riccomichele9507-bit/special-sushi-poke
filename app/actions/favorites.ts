"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleFavoriteResult =
  | { ok: true; nowFavorite: boolean }
  | { ok: false; errorMessage: string };

/**
 * Toggle: aggiunge o rimuove un piatto dai preferiti del cliente loggato.
 * Idempotente: chiama 2 volte non rompe nulla.
 */
export async function toggleFavorite(
  dishId: string,
): Promise<ToggleFavoriteResult> {
  if (!dishId || dishId.length > 80) {
    return { ok: false, errorMessage: "ID piatto non valido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, errorMessage: "Accedi per salvare i preferiti." };
  }

  // Esiste già?
  const { data: existing } = await supabase
    .from("favorites")
    .select("dish_id")
    .eq("customer_id", user.id)
    .eq("dish_id", dishId)
    .maybeSingle();

  if (existing) {
    // Rimuovi
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("dish_id", dishId);
    if (error) return { ok: false, errorMessage: "Errore rimozione." };
    revalidatePath("/account");
    return { ok: true, nowFavorite: false };
  }

  // Aggiungi
  const { error } = await supabase
    .from("favorites")
    .insert({ customer_id: user.id, dish_id: dishId });
  if (error) return { ok: false, errorMessage: "Errore aggiunta." };
  revalidatePath("/account");
  return { ok: true, nowFavorite: true };
}

/**
 * Ritorna gli ID dei piatti preferiti del cliente.
 * Usato dal client per stato cuore "filled" nei dish-card.
 */
export async function getMyFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("favorites")
    .select("dish_id")
    .eq("customer_id", user.id);

  return (data ?? []).map((r) => r.dish_id);
}
