// Validazione/calcolo codice sconto (server-only). Usato sia in createOrder
// (anti-tamper, ricalcolo reale) sia nell'action di "quote" per il feedback UI.
import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface CodeDiscount {
  /** Sconto in centesimi calcolato sul subtotale. */
  cents: number;
  /** Codice normalizzato come salvato a DB (es. "BENTORNATO10"). */
  code: string;
  label: string | null;
}

/**
 * Perché un codice non è applicabile. Il chiamante ne ricava il messaggio per
 * il cliente: "hai già usato questo codice" e "codice inesistente" non sono la
 * stessa cosa, e un `null` muto non permetteva di distinguerli.
 */
export type CodeRejection =
  | "not_found"
  | "requires_auth"
  | "already_used"
  | "exhausted"
  | "expired"
  | "min_order";

export type ResolveCodeResult =
  | { ok: true; discount: CodeDiscount }
  | { ok: false; reason: CodeRejection };

/** Contesto per risolvere il codice: chi è il cliente e se è autenticato. */
export interface ResolveCodeOptions {
  /**
   * True se l'utente è autenticato. I codici con `requires_auth` (es. SUSHI10
   * del volantino "iscriviti e ottieni 10%") sono riscattabili SOLO da iscritti.
   * Default `false` → fail-closed: un chiamante che dimentica di passarlo non
   * concede sconti riservati agli iscritti a un ospite.
   */
  isAuthenticated?: boolean;
  /** Account del cliente: identità affidabile per il limite `once_per_customer`. */
  customerId?: string | null;
  /** Email dell'ordine: ripiego per gli ospiti (best-effort, cambiabile). */
  customerEmail?: string | null;
}

/** Messaggio per il cliente per ogni motivo di rifiuto. */
export function codeRejectionMessage(reason: CodeRejection): string {
  switch (reason) {
    case "requires_auth":
      return "Accedi o registrati per usare questo codice.";
    case "already_used":
      return "Hai già usato questo codice: vale una volta sola per cliente.";
    case "exhausted":
      return "Questo codice ha esaurito gli utilizzi disponibili.";
    case "expired":
      return "Questo codice non è più valido.";
    case "min_order":
      return "Il tuo ordine non raggiunge il minimo richiesto da questo codice.";
    case "not_found":
      return "Codice non valido o non applicabile a questo ordine.";
  }
}

/**
 * True se il cliente ha GIÀ riscattato il codice su un ordine **pagato**.
 *
 * L'ordine nasce PRIMA del pagamento (`status = "received"`): per la carta vale
 * solo da `confirmed` in poi, altrimenti chi apre il checkout e non paga
 * brucerebbe il codice per sempre. Un ordine in contanti invece è reale da
 * subito. Annullati e rimborsati non contano: il codice torna disponibile.
 */
async function hasRedeemedCode(
  admin: AdminClient,
  code: string,
  opts: ResolveCodeOptions,
): Promise<boolean> {
  let q = admin
    .from("orders")
    .select("id")
    .eq("discount_code", code)
    .not("status", "in", "(cancelled,refunded)")
    .or("payment_method.eq.cash,status.neq.received")
    .limit(1);

  if (opts.customerId) {
    q = q.eq("customer_id", opts.customerId);
  } else if (opts.customerEmail) {
    q = q.eq("customer_email", opts.customerEmail);
  } else {
    // Nessuna identità: il riscatto non è attribuibile a nessuno. Non blocca —
    // i codici once_per_customer hanno requires_auth, quindi qui non si arriva.
    return false;
  }

  const { data } = await q;
  return (data?.length ?? 0) > 0;
}

/**
 * True se il codice è a riscatto unico E il cliente l'ha già consumato.
 *
 * Va richiamata anche al PAGAMENTO, non solo alla creazione dell'ordine: un
 * ordine a carta resta "received" finché non è pagato e quindi non conta come
 * riscatto (altrimenti chi abbandona il checkout brucerebbe il codice). Senza
 * questo secondo controllo un cliente poteva creare N ordini scontati non
 * pagati — nessuno dei quali "consuma" il codice — e poi pagarli tutti.
 * L'ordine in corso di pagamento è ancora "received", quindi qui si vedono
 * solo gli ALTRI ordini già pagati: il primo passa, i successivi no.
 */
export async function codeAlreadyRedeemed(
  admin: AdminClient,
  rawCode: string | null | undefined,
  who: Pick<ResolveCodeOptions, "customerId" | "customerEmail">,
): Promise<boolean> {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return false;
  const { data: row } = await admin
    .from("discount_codes")
    .select("code, once_per_customer")
    .eq("code", code)
    .maybeSingle();
  // Nessuna riga = marcatore della promo automatica (PROMO20), non un codice.
  if (!row?.once_per_customer) return false;
  return hasRedeemedCode(admin, row.code, who);
}

/**
 * Risolve un codice sconto sul subtotale dato. In caso di rifiuto ritorna il
 * motivo (vedi `CodeRejection`). Mai eccezioni.
 */
export async function resolveCodeDiscount(
  admin: AdminClient,
  rawCode: string | undefined | null,
  subtotalCents: number,
  opts: ResolveCodeOptions = {},
): Promise<ResolveCodeResult> {
  // Normalizza a MAIUSCOLO + match ESATTO. Prima si usava ilike() col valore
  // grezzo del cliente: `%` e `*` valgono da wildcard in PostgREST, quindi
  // digitando "SUSHI2%" si pescava SUSHI20 (20%) senza conoscerlo. I codici in
  // `discount_codes` sono per convenzione maiuscoli, quindi eq() sul valore
  // normalizzato resta case-insensitive per il cliente ma immune ai wildcard.
  const code = rawCode?.trim().toUpperCase();
  if (!code) return { ok: false, reason: "not_found" };

  const { data: row } = await admin
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();
  if (!row) return { ok: false, reason: "not_found" };

  // Codice riservato agli iscritti: se l'utente non è autenticato → non applicabile.
  if (row.requires_auth && !opts.isAuthenticated) {
    return { ok: false, reason: "requires_auth" };
  }

  const now = Date.now();
  if (row.valid_from && new Date(row.valid_from).getTime() > now) {
    return { ok: false, reason: "expired" };
  }
  if (row.valid_to && new Date(row.valid_to).getTime() < now) {
    return { ok: false, reason: "expired" };
  }
  if (row.max_redemptions != null && row.redemptions >= row.max_redemptions) {
    return { ok: false, reason: "exhausted" };
  }
  if (row.min_order_cents && subtotalCents < row.min_order_cents) {
    return { ok: false, reason: "min_order" };
  }
  if (row.once_per_customer && (await hasRedeemedCode(admin, row.code, opts))) {
    return { ok: false, reason: "already_used" };
  }

  let cents =
    row.kind === "percent"
      ? Math.floor((subtotalCents * row.value) / 100)
      : row.value; // kind "fixed" → value in centesimi
  cents = Math.min(Math.max(0, cents), subtotalCents); // mai oltre il subtotale
  // Sconto nullo: carrello vuoto o codice configurato male (value 0). Non è il
  // minimo d'ordine, quindi non usiamo quel messaggio: sarebbe fuorviante.
  if (cents <= 0) return { ok: false, reason: "not_found" };

  return { ok: true, discount: { cents, code: row.code, label: row.label } };
}
