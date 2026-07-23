// Applicazione della disiscrizione (soppressione). Server-only.
// Chiamata SOLO dopo aver verificato il token HMAC. Idempotente.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "./unsubscribe-token";

/**
 * Sopprime un'email dal marketing:
 *  1) la aggiunge alla suppression list (idempotente, upsert su PK email);
 *  2) se è un cliente registrato, azzera anche customers.marketing_consent.
 * La suppression list è la fonte "hard": controllata a ogni invio a prescindere
 * dal consenso, così copre anche i guest (che non hanno una riga in customers).
 */
export async function suppressEmail(
  email: string,
  reason = "one-click",
): Promise<void> {
  const e = normalizeEmail(email);
  const sb = createAdminClient();

  await sb
    .from("marketing_unsubscribes")
    .upsert({ email: e, reason }, { onConflict: "email", ignoreDuplicates: true });

  // customers.email è citext → il match è case-insensitive lato DB.
  await sb
    .from("customers")
    .update({ marketing_consent: false })
    .eq("email", e);
}
