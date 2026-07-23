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

/** Offset (ms) del fuso `tz` all'istante `date` (gestisce l'ora legale). */
function tzOffsetMs(tz: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const m: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") m[p.type] = Number(p.value);
  const hour = m.hour === 24 ? 0 : m.hour; // alcune runtime rendono mezzanotte come 24
  const asUtc = Date.UTC(m.year, m.month - 1, m.day, hour, m.minute, m.second);
  return asUtc - date.getTime();
}

/**
 * Fine giornata (23:59:59.999 Europe/Rome) del giorno = base + addDays, in ISO UTC.
 * Così "valido fino al 30 luglio" vale per TUTTO il 30, non fino all'ora d'invio.
 */
function endOfDayRomeISO(base: Date, addDays: number): string {
  const target = new Date(base.getTime() + addDays * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(target);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const mo = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  // Offset di Roma calcolato a mezzogiorno di quel giorno (senza ms, lontano dai
  // cambi di ora legale che avvengono di notte) → niente errori di arrotondamento.
  const offset = tzOffsetMs("Europe/Rome", new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)));
  const wallUtc = Date.UTC(y, mo - 1, d, 23, 59, 59, 999);
  return new Date(wallUtc - offset).toISOString();
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
  const validTo = endOfDayRomeISO(now, input.expiryDays);

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
