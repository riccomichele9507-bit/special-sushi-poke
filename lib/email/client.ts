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
    "Special Sushi Poke <ordini@specialsushipoke.com>"
  );
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
