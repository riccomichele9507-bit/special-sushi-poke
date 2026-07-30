// Helper server-only per accodare un job di stampa.
// Chiamato dopo la creazione/conferma ordine in C4.
//
// Anti-duplicati: l'indice unico `ux_print_jobs_active_order` (parziale su
// status in pending/in_progress) garantisce a livello DB **una sola comanda
// viva per ordine**. Qui il conflitto (23505) non è un errore: significa
// "comanda già in coda", cioè esattamente l'esito voluto.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptPng } from "./receipt";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

/** Violazione di unique constraint Postgres. */
const UNIQUE_VIOLATION = "23505";

/**
 * Genera il testo comanda e lo accoda in print_jobs.status=pending.
 * Idempotente su due livelli:
 * - salta se esiste già un job pending/in_progress/printed per quell'ordine;
 * - se due chiamate corrono in parallelo (webhook Stripe + pagina di ritorno),
 *   l'indice unico fa fallire la seconda insert e la trattiamo come successo.
 * Non lancia mai eccezioni: log errore + return false. La stampa non deve
 * mai bloccare il flusso dell'ordine.
 */
export async function enqueuePrintJob(order: OrderRow): Promise<boolean> {
  const supabase = createAdminClient();

  // Skip solo se esiste un job non-fallito per quest'ordine (pending/in_progress/printed)
  // Se l'ultimo era 'failed' o 'cancelled', dobbiamo riaccodare.
  const { data: existing } = await supabase
    .from("print_jobs")
    .select("id, status")
    .eq("order_id", order.id)
    .in("status", ["pending", "in_progress", "printed"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return true; // job attivo/completato in passato → skip duplicate
  }

  // Payload comanda come PNG monocromatico (image/png) salvato come base64.
  const payload = generateReceiptPng(order).toString("base64");
  const { error } = await supabase.from("print_jobs").insert({
    order_id: order.id,
    payload,
    status: "pending",
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      // Un'altra chiamata concorrente ha già accodato la comanda: va bene così.
      return true;
    }
    console.error(`enqueuePrintJob[${order.id}]:`, error.message);
    return false;
  }
  return true;
}

export type ReprintResult = { ok: true } | { ok: false; reason: string };

/**
 * Forza una nuova stampa (es. bottone "Ristampa" nel dashboard admin).
 * Crea un nuovo print_job pending anche se ne esiste uno già 'printed'.
 * Se una comanda per quell'ordine è ancora in coda o in stampa NON ne accoda
 * una seconda: i click ripetuti sul pulsante non devono diventare copie in
 * cucina (era la causa principale delle comande stampate 10+ volte).
 */
export async function reprintOrder(orderId: string): Promise<ReprintResult> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, reason: "Ordine non trovato" };

  const { data: active } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("order_id", orderId)
    .in("status", ["pending", "in_progress"])
    .limit(1)
    .maybeSingle();

  if (active) {
    return { ok: false, reason: "Comanda già in coda: attendi la stampa" };
  }

  // Payload comanda come PNG monocromatico (image/png) salvato come base64.
  const payload = generateReceiptPng(order).toString("base64");
  const { error } = await supabase.from("print_jobs").insert({
    order_id: order.id,
    payload,
    status: "pending",
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { ok: false, reason: "Comanda già in coda: attendi la stampa" };
    }
    console.error(`reprintOrder[${orderId}]:`, error.message);
    return { ok: false, reason: "Ristampa fallita" };
  }
  return { ok: true };
}
