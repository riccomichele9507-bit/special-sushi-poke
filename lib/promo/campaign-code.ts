// Generazione di un codice sconto FRESCO per ogni campagna email. Server-only.
// Codici brevi e memorabili (parola + 2 cifre, es. "GUSTO37"). Uso unico per
// cliente, scadenza N giorni, tetto usi (max_redemptions) come rete anti-abuso.
// requires_auth = false: usabili anche dai guest (a differenza di SUSHI10 del
// volantino, che resta riservato agli iscritti).

import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

// Parole on-brand, facili da leggere/ricordare. Niente caratteri ambigui.
const WORDS = [
  "SUSHI",
  "POKE",
  "TORNA",
  "GRAZIE",
  "CIAO",
  "REGALO",
  "BONUS",
  "GUSTO",
  "SAKE",
  "MAKI",
  "NIGIRI",
  "BENTORNATO",
];

function randomCode(): string {
  const w = WORDS[Math.floor(Math.random() * WORDS.length)];
  const n = 10 + Math.floor(Math.random() * 90); // 10..99
  return `${w}${n}`;
}

export interface CampaignCodeInput {
  kind: "percent" | "fixed";
  /** percent → 1..100 · fixed → centesimi */
  value: number;
  expiryDays: number;
  minOrderCents: number;
  maxRedemptions: number | null;
  label: string;
}

export interface CampaignCodeResult {
  code: string;
  /** ISO 8601 UTC della scadenza. */
  validTo: string;
}

/**
 * Crea un codice campagna univoco e lo inserisce in `discount_codes`.
 * L'inserimento stesso è il lock di unicità: su collisione PK (23505) riprova.
 */
export async function createCampaignCode(
  admin: AdminClient,
  input: CampaignCodeInput,
  now: Date = new Date(),
): Promise<CampaignCodeResult> {
  const validTo = new Date(now.getTime() + input.expiryDays * 86_400_000).toISOString();

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = randomCode();
    const { error } = await admin.from("discount_codes").insert({
      code,
      kind: input.kind,
      value: input.value,
      label: input.label.slice(0, 80),
      min_order_cents: input.minOrderCents,
      valid_from: now.toISOString(),
      valid_to: validTo,
      active: true,
      once_per_customer: true,
      requires_auth: false,
      max_redemptions: input.maxRedemptions,
    });
    if (!error) return { code, validTo };
    // 23505 = unique_violation sul PK `code` → riprova con un altro codice.
    if (error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Impossibile generare un codice univoco, riprova.");
}
