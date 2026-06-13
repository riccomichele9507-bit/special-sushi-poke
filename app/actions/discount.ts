"use server";

// Server action pubblica: valida un codice sconto digitato nel carrello.
// La validazione vera (e il ricalcolo del totale) avviene comunque di nuovo
// in createOrder — questa serve solo a dare feedback immediato al cliente.

import { validateDiscountCodeDb } from "@/lib/discount/validate";

export type CheckDiscountResult =
  | {
      ok: true;
      code: string;
      kind: "percent" | "fixed";
      value: number;
      label: string | null;
    }
  | { ok: false; reason: string };

export async function checkDiscountCode(
  code: string,
  subtotalCents: number,
): Promise<CheckDiscountResult> {
  const r = await validateDiscountCodeDb(code, subtotalCents);
  if (!r.ok) return { ok: false, reason: r.reason };
  return { ok: true, code: r.code, kind: r.kind, value: r.value, label: r.label };
}
