"use server";

// Verifica "leggera" di un codice sconto per dare feedback immediato al checkout.
// NON è la fonte di verità: createOrder ricalcola SEMPRE lo sconto dal DB
// (anti-tamper). Qui usiamo il subtotale passato dal client solo per l'anteprima.
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCodeDiscount } from "@/lib/promo/discount-code";

export type QuoteCodeResult =
  | { ok: true; discountCents: number; label: string | null }
  | { ok: false; message: string };

export async function quoteDiscountCode(
  code: string,
  subtotalCents: number,
): Promise<QuoteCodeResult> {
  const trimmed = (code ?? "").trim();
  if (!trimmed) return { ok: false, message: "Inserisci un codice." };

  const safeSubtotal = Number.isFinite(subtotalCents)
    ? Math.max(0, Math.floor(subtotalCents))
    : 0;

  const admin = createAdminClient();
  const result = await resolveCodeDiscount(admin, trimmed, safeSubtotal);
  if (!result) {
    return {
      ok: false,
      message: "Codice non valido o non applicabile a questo ordine.",
    };
  }
  return { ok: true, discountCents: result.cents, label: result.label };
}
