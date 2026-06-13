// Validazione codici sconto SERVER-SIDE (anti-tamper).
// Usa il service-role (RLS lockata sulla tabella → nessuna enumerazione lato client).
// Il client NON valida né calcola lo sconto: chiede a una server action che usa questo.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type DiscountKind = "percent" | "fixed";

export interface DiscountValidationOk {
  ok: true;
  code: string;
  label: string | null;
  kind: DiscountKind;
  /** Valore grezzo: percent=1..100, fixed=centesimi. */
  value: number;
  /** Sconto calcolato in centesimi per il subtotale passato. */
  discountCents: number;
}
export interface DiscountValidationErr {
  ok: false;
  reason: string;
}
export type DiscountValidation = DiscountValidationOk | DiscountValidationErr;

/**
 * Valida un codice sconto contro il DB e calcola lo sconto per il subtotale dato.
 * @param rawCode codice digitato dal cliente (case-insensitive)
 * @param subtotalCents subtotale piatti (centesimi), per soglia minima + calcolo percentuale
 */
export async function validateDiscountCodeDb(
  rawCode: string,
  subtotalCents: number,
): Promise<DiscountValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Inserisci un codice." };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("discount_codes")
    .select(
      "code, kind, value, label, min_order_cents, valid_from, valid_to, active, max_redemptions, redemptions",
    )
    .eq("code", code)
    .maybeSingle();

  if (!row) return { ok: false, reason: "Codice non valido." };
  if (!row.active) return { ok: false, reason: "Codice non più attivo." };

  const now = Date.now();
  if (row.valid_from && now < new Date(row.valid_from).getTime()) {
    return { ok: false, reason: "Codice non ancora attivo." };
  }
  if (row.valid_to && now > new Date(row.valid_to).getTime()) {
    return { ok: false, reason: "Codice scaduto." };
  }
  if (row.max_redemptions != null && row.redemptions >= row.max_redemptions) {
    return { ok: false, reason: "Codice esaurito." };
  }
  if (subtotalCents < row.min_order_cents) {
    const min = (row.min_order_cents / 100).toFixed(2).replace(".", ",");
    return { ok: false, reason: `Ordine minimo €${min} per questo codice.` };
  }

  const kind = row.kind as DiscountKind;
  const discountCents =
    kind === "percent"
      ? Math.floor((subtotalCents * row.value) / 100)
      : Math.min(row.value, subtotalCents);

  return {
    ok: true,
    code: row.code,
    label: row.label,
    kind,
    value: row.value,
    discountCents,
  };
}

/** Incrementa il contatore usi di un codice (best-effort, post-ordine). */
export async function incrementDiscountRedemption(code: string): Promise<void> {
  const admin = createAdminClient();
  // Increment atomico via RPC mancante → leggo+scrivo (race trascurabile su volumi ristorante)
  const { data: row } = await admin
    .from("discount_codes")
    .select("redemptions")
    .eq("code", code)
    .maybeSingle();
  if (row) {
    await admin
      .from("discount_codes")
      .update({ redemptions: row.redemptions + 1 })
      .eq("code", code);
  }
}
