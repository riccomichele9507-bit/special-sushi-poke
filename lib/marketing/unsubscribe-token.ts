// Token di disiscrizione firmato (HMAC-SHA256). Server-only.
// Il link nelle email marketing porta ?e=<email>&t=<token>. Il token è
// deterministico sull'email (lowercase) → nessuno stato da salvare, e non è
// falsificabile senza il segreto. Un eventuale scanner non può "indovinare" t.

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://specialsushipokebari.com";

function secret(): string {
  // Segreto dedicato se presente, altrimenti la service-role key (sempre lato
  // server, mai esposta). Serve solo a firmare un HMAC stabile.
  const s = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("UNSUBSCRIBE_SECRET/SUPABASE_SERVICE_ROLE_KEY mancante");
  return s;
}

/** Email SEMPRE normalizzata lowercase+trim: chiave d'identità in tutto il flusso. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signUnsubscribe(email: string): string {
  return createHmac("sha256", secret())
    .update(normalizeEmail(email))
    .digest("hex");
}

/** Confronto in tempo costante: evita timing attack sul token. */
export function verifyUnsubscribe(email: string, token: string): boolean {
  if (!token) return false;
  const expected = signUnsubscribe(email);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(token, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** URL della PAGINA di disiscrizione (link visibile nell'email → conferma). */
export function buildUnsubscribeUrl(email: string): string {
  const e = normalizeEmail(email);
  const t = signUnsubscribe(e);
  return `${SITE_URL}/unsubscribe?e=${encodeURIComponent(e)}&t=${t}`;
}

/** URL per l'header List-Unsubscribe (POST one-click RFC 8058, senza conferma). */
export function buildUnsubscribePostUrl(email: string): string {
  const e = normalizeEmail(email);
  const t = signUnsubscribe(e);
  return `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(e)}&t=${t}`;
}
