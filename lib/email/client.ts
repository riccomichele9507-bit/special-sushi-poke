// Wrapper Resend server-side. Importare SOLO da server actions / route handlers.
// Se RESEND_API_KEY non è configurato, le funzioni di invio fanno skip silenzioso
// (loggano warning) — niente crash, l'invio email non deve mai bloccare l'app.

import "server-only";
import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY non configurato — email skip");
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

export function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ??
    "Special Sushi Poke <onboarding@resend.dev>"
  );
}

/** Indirizzo a cui arrivano le RISPOSTE dei clienti (la gmail del ristorante). */
export function getReplyTo(): string {
  return process.env.RESEND_REPLY_TO ?? "specialsushipoke@gmail.com";
}

/**
 * Copia nascosta (BCC) al titolare: gli fa vedere nella SUA casella che le email
 * ai clienti partono davvero. Attivo SOLO col dominio verificato (in test/onboarding
 * Resend rifiuta destinatari diversi dall'owner dell'account).
 */
export function getBccEmail(): string | undefined {
  if (getFromEmail().includes("resend.dev")) return undefined;
  return process.env.RESEND_BCC ?? "specialsushipoke@gmail.com";
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
