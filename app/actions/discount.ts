"use server";

// Verifica "leggera" di un codice sconto per dare feedback immediato al checkout.
// NON è la fonte di verità: createOrder ricalcola SEMPRE lo sconto dal DB
// (anti-tamper). Qui usiamo il subtotale passato dal client solo per l'anteprima.
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveCodeDiscount,
  codeRejectionMessage,
} from "@/lib/promo/discount-code";

export type QuoteCodeResult =
  | {
      ok: true;
      discountCents: number;
      label: string | null;
      /** Codice normalizzato: il client lo rimanda a createOrder così com'è. */
      code: string;
      /** Subtotale su cui è stato calcolato: se il carrello cambia, va rifatto. */
      subtotalCents: number;
    }
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

  // Identità dal cookie di sessione, mai dal client: decide sia i codici
  // riservati agli iscritti (requires_auth) sia il limite once_per_customer.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const result = await resolveCodeDiscount(admin, trimmed, safeSubtotal, {
    isAuthenticated: !!user,
    customerId: user?.id ?? null,
    customerEmail: user?.email ?? null,
  });

  if (result.ok) {
    return {
      ok: true,
      discountCents: result.discount.cents,
      label: result.discount.label,
      code: result.discount.code,
      subtotalCents: safeSubtotal,
    };
  }

  return {
    ok: false,
    message: codeRejectionMessage(result.reason),
    requiresAuth: result.reason === "requires_auth",
  };
}
