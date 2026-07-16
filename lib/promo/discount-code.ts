// Validazione/calcolo codice sconto (server-only). Usato sia in createOrder
// (anti-tamper, ricalcolo reale) sia nell'action di "quote" per il feedback UI.
import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface CodeDiscount {
  /** Sconto in centesimi calcolato sul subtotale. */
  cents: number;
  /** Codice normalizzato come salvato a DB (es. "BENTORNATO10"). */
  code: string;
  label: string | null;
}

/** Opzioni di contesto per la risoluzione del codice. */
export interface ResolveCodeOptions {
  /**
   * True se l'utente è autenticato. I codici con `requires_auth` (es. SUSHI10
   * del volantino "iscriviti e ottieni 10%") sono riscattabili SOLO da iscritti.
   * Default `false` → fail-closed: un chiamante che dimentica di passarlo non
   * concede sconti riservati agli iscritti a un ospite.
   */
  isAuthenticated?: boolean;
}

/**
 * Risolve un codice sconto sul subtotale dato. Ritorna null se il codice non
 * esiste, è disattivato, scaduto/non ancora valido, esaurito (max_redemptions),
 * sotto la soglia minima, o riservato agli iscritti mentre l'utente è ospite.
 * Mai eccezioni.
 */
export async function resolveCodeDiscount(
  admin: AdminClient,
  rawCode: string | undefined | null,
  subtotalCents: number,
  opts: ResolveCodeOptions = {},
): Promise<CodeDiscount | null> {
  // Normalizza a MAIUSCOLO + match ESATTO. Prima si usava ilike() col valore
  // grezzo del cliente: `%` e `*` valgono da wildcard in PostgREST, quindi
  // digitando "SUSHI2%" si pescava SUSHI20 (20%) senza conoscerlo. I codici in
  // `discount_codes` sono per convenzione maiuscoli, quindi eq() sul valore
  // normalizzato resta case-insensitive per il cliente ma immune ai wildcard.
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;

  const { data: row } = await admin
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();
  if (!row) return null;

  // Codice riservato agli iscritti: se l'utente non è autenticato → non applicabile.
  if (row.requires_auth && !opts.isAuthenticated) return null;

  const now = Date.now();
  if (row.valid_from && new Date(row.valid_from).getTime() > now) return null;
  if (row.valid_to && new Date(row.valid_to).getTime() < now) return null;
  if (row.max_redemptions != null && row.redemptions >= row.max_redemptions) {
    return null;
  }
  if (row.min_order_cents && subtotalCents < row.min_order_cents) return null;

  let cents =
    row.kind === "percent"
      ? Math.floor((subtotalCents * row.value) / 100)
      : row.value; // kind "fixed" → value in centesimi
  cents = Math.min(Math.max(0, cents), subtotalCents); // mai oltre il subtotale
  if (cents <= 0) return null;

  return { cents, code: row.code, label: row.label };
}
