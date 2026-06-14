"use server";

import { assertAdmin } from "./helpers";
import { getResend, getFromEmail, isResendConfigured } from "@/lib/email/client";

export type EmailTestResult = {
  ok: boolean;
  configured: boolean;
  from: string;
  detail: string;
};

/**
 * Diagnostica invio email: prova a mandare una mail di test e ritorna l'errore
 * ESATTO di Resend (key mancante, dominio non verificato, destinatario test, ecc.).
 */
export async function sendTestEmail(to: string): Promise<EmailTestResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, configured: false, from: "", detail: "Non autorizzato." };
  }

  const configured = isResendConfigured();
  const from = getFromEmail();
  if (!configured) {
    return {
      ok: false,
      configured,
      from,
      detail:
        "RESEND_API_KEY NON presente nel deploy. Aggiungila su Vercel e fai un Redeploy.",
    };
  }
  const resend = getResend();
  if (!resend) {
    return { ok: false, configured, from, detail: "Client Resend non inizializzato." };
  }
  const target = to.trim() || "delivered@resend.dev";
  try {
    const r = await resend.emails.send({
      from,
      to: target,
      subject: "Test email · Special Sushi Poke",
      html: "<p>Se leggi questa, l'invio email funziona ✅</p>",
    });
    if (r.error) {
      return { ok: false, configured, from, detail: `Resend: ${r.error.message}` };
    }
    return { ok: true, configured, from, detail: `Inviata a ${target} (id ${r.data?.id ?? "?"})` };
  } catch (e) {
    return {
      ok: false,
      configured,
      from,
      detail: e instanceof Error ? e.message : "Errore sconosciuto",
    };
  }
}
