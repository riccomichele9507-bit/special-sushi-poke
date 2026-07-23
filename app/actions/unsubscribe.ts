"use server";

// Server action pubblica (NON admin): sicurezza garantita dal token HMAC, non
// dall'autenticazione. Usata dalla pagina /unsubscribe (bottone di conferma).

import { verifyUnsubscribe } from "@/lib/marketing/unsubscribe-token";
import { suppressEmail } from "@/lib/marketing/unsubscribe";

export type UnsubscribeResult = { ok: true } | { ok: false; error: string };

export async function confirmUnsubscribe(
  email: string,
  token: string,
): Promise<UnsubscribeResult> {
  if (!email || !verifyUnsubscribe(email, token)) {
    return { ok: false, error: "Link non valido o scaduto." };
  }
  try {
    await suppressEmail(email, "confirm-page");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Errore" };
  }
}
