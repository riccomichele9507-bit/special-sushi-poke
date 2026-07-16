"use server";

// Verifica "leggera" di un codice sconto per dare feedback immediato al checkout.
// NON è la fonte di verità: createOrder ricalcola SEMPRE lo sconto dal DB
// (anti-tamper). Qui usiamo il subtotale passato dal client solo per l'anteprima.
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCodeDiscount } from "@/lib/promo/discount-code";

export type QuoteCodeResult =
  | { ok: true; discountCents: number; label: string | null }
  | { ok: false; message: string; requiresAuth?: boolean };

export async function quoteDiscountCode(
  code: string,
  subtotalCents: number,
): Promise<QuoteCodeResult> {
  const trimmed = (code ?? "").trim();
  if (!trimmed) return { ok: false, message: "Inserisci un codice." };

  const safeSubtotal = Number.isFinite(subtotalCents)
    ? Math.max(0, Math.floor(subtotalCents))
    : 0;

  // Stato autenticazione: i codici "riservati agli iscritti" (requires_auth)
  // valgono solo se l'utente è loggato.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const admin = createAdminClient();
  const result = await resolveCodeDiscount(admin, trimmed, safeSubtotal, {
    isAuthenticated,
  });
  if (result) {
    return { ok: true, discountCents: result.cents, label: result.label };
  }

  // Distinzione: codice valido ma riservato agli iscritti (ospite) vs codice
  // davvero non valido. Riproviamo "come iscritto": se passa, il blocco è l'auth.
  if (!isAuthenticated) {
    const asMember = await resolveCodeDiscount(admin, trimmed, safeSubtotal, {
      isAuthenticated: true,
    });
    if (asMember) {
      return {
        ok: false,
        requiresAuth: true,
        message: "Accedi o registrati per usare questo codice.",
      };
    }
  }

  return {
    ok: false,
    message: "Codice non valido o non applicabile a questo ordine.",
  };
}
