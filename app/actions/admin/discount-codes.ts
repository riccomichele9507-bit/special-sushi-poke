"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

// Lo `value` arriva dal form come:
//  - percent → numero intero 1..100
//  - fixed   → importo in EURO (es. "5" o "5,50"), convertito in centesimi qui.
const baseSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,20}$/, "Codice: 2-20 caratteri (lettere, numeri, - _)"),
  kind: z.enum(["percent", "fixed"]),
  value: z.number().positive("Il valore deve essere > 0"),
  label: z.string().trim().max(60).nullable(),
  min_order_cents: z.number().int().min(0),
  valid_from: z.string().datetime().nullable(),
  valid_to: z.string().datetime().nullable(),
  max_redemptions: z.number().int().positive().nullable(),
  active: z.boolean(),
});

function parseEuroToCents(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").replace(",", ".").trim();
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function parseLocalDateTime(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const d = new Date(s); // datetime-local interpretato come ora locale del browser (titolare = IT)
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function addDiscountCode(fd: FormData): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const kind = String(fd.get("kind") ?? "percent") as "percent" | "fixed";

      // value: percent = intero; fixed = euro → centesimi
      const rawValue = String(fd.get("value") ?? "").replace(",", ".").trim();
      const value =
        kind === "fixed"
          ? Math.round(Number(rawValue) * 100)
          : Math.round(Number(rawValue));

      const row = baseSchema.parse({
        code: fd.get("code"),
        kind,
        value,
        label: (String(fd.get("label") ?? "").trim() || null) as string | null,
        min_order_cents: parseEuroToCents(fd.get("min_order_euro")),
        valid_from: parseLocalDateTime(fd.get("valid_from")),
        valid_to: parseLocalDateTime(fd.get("valid_to")),
        max_redemptions: fd.get("max_redemptions")
          ? Math.round(Number(fd.get("max_redemptions")))
          : null,
        active: fd.get("active") === "on",
      });

      if (row.kind === "percent" && (row.value < 1 || row.value > 100)) {
        throw new Error("La percentuale deve essere tra 1 e 100.");
      }
      if (row.valid_from && row.valid_to && row.valid_to <= row.valid_from) {
        throw new Error("La data fine deve essere successiva alla data inizio.");
      }

      const { error } = await sb.from("discount_codes").insert({
        code: row.code,
        kind: row.kind,
        value: row.value,
        label: row.label,
        min_order_cents: row.min_order_cents,
        valid_from: row.valid_from,
        valid_to: row.valid_to,
        max_redemptions: row.max_redemptions,
        active: row.active,
      });
      if (error) {
        if (error.code === "23505") throw new Error("Esiste già un codice con questo nome.");
        throw new Error(error.message);
      }
    },
    { revalidate: ["/admin/discounts"] },
  );
}

export async function toggleDiscountCode(
  code: string,
  active: boolean,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb
        .from("discount_codes")
        .update({ active })
        .eq("code", code);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/discounts"] },
  );
}

export async function deleteDiscountCode(code: string): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb.from("discount_codes").delete().eq("code", code);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/discounts"] },
  );
}
