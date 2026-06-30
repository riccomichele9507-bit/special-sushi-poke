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

/**
 * Risolve un codice sconto sul subtotale dato. Ritorna null se il codice non
 * esiste, è disattivato, scaduto/non ancora valido, esaurito (max_redemptions)
 * o sotto la soglia minima. Mai eccezioni.
 */
export async function resolveCodeDiscount(
  admin: AdminClient,
  rawCode: string | undefined | null,
  subtotalCents: number,
): Promise<CodeDiscount | null> {
  const code = rawCode?.trim();
  if (!code) return null;

  const { data: row } = await admin
    .from("discount_codes")
    .select("*")
    .ilike("code", code) // match case-insensitive (nessun wildcard nel valore)
    .eq("active", true)
    .maybeSingle();
  if (!row) return null;

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
