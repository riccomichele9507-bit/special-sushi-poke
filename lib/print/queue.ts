// Helper server-only per accodare un job di stampa.
// Chiamato dopo la creazione/conferma ordine in C4.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptPng } from "./receipt";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

/** Violazione di unique constraint Postgres (indice ux_print_jobs_active_order). */
const UNIQUE_VIOLATION = "23505";

/** Esito di una richiesta di ristampa manuale. */
export type ReprintResult =
  | { ok: true; queued: boolean }
  | { ok: false; error: string };

/**
 * Genera il testo comanda e lo accoda in print_jobs.status=pending.
 * Idempotente: se già esiste un job pending/in_progress/printed per quell'ordine, skip.
 * Non lancia mai eccezioni: log errore + return false. La stampa non deve
 * mai bloccare il flusso dell'ordine.
 */
export async function enqueuePrintJob(order: OrderRow): Promise<boolean> {
  // Il try/catch copre TUTTO il corpo, non solo l'insert: generateReceiptPng
  // disegna un PNG con canvas e font nativi e può lanciare. Senza questa rete
  // l'eccezione risaliva fino a createOrder e il cliente vedeva un errore su un
  // ordine già salvato e confermato — quindi lo rifaceva, e in cucina ne
  // arrivavano due. Una comanda mancante si ristampa; un ordine doppio no.
  try {
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
      // L'indice ux_print_jobs_active_order ha bloccato una seconda copia: è
      // esattamente il comportamento voluto quando webhook Stripe e pagina di
      // ritorno confermano lo stesso ordine in parallelo.
      if (error.code === UNIQUE_VIOLATION) return true;
      console.error(`enqueuePrintJob[${order.id}]:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`enqueuePrintJob[${order.id}] eccezione:`, e);
    return false;
  }
}

/**
 * Forza una nuova stampa (es. bottone "Ristampa" nel dashboard admin).
 * Crea un nuovo print_job pending se l'ultimo è già stato stampato o è fallito.
 *
 * NON accoda una seconda copia se ce n'è già una in coda o in corso di stampa:
 * era la causa principale delle comande stampate 5-10 volte (click ripetuti
 * mentre la stampante era ferma). `queued:false` = copia già in coda, nulla da fare.
 */
export async function reprintOrder(orderId: string): Promise<ReprintResult> {
  try {
    return await doReprint(orderId);
  } catch (e) {
    // Stessa rete di enqueuePrintJob: generateReceiptPng può lanciare e il
    // titolare deve leggere un errore chiaro, non veder esplodere la pagina.
    console.error(`reprintOrder[${orderId}] eccezione:`, e);
    return { ok: false, error: "Impossibile generare la comanda. Riprova." };
  }
}

async function doReprint(orderId: string): Promise<ReprintResult> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "Ordine non trovato" };

  const { data: active } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("order_id", order.id)
    .in("status", ["pending", "in_progress"])
    .limit(1)
    .maybeSingle();

  if (active) return { ok: true, queued: false };

  // Payload comanda come PNG monocromatico (image/png) salvato come base64.
  const payload = generateReceiptPng(order).toString("base64");
  const { error } = await supabase.from("print_jobs").insert({
    order_id: order.id,
    payload,
    status: "pending",
  });

  if (error) {
    // Doppio click ravvicinato: l'indice unique ha già respinto la copia.
    if (error.code === UNIQUE_VIOLATION) return { ok: true, queued: false };
    console.error(`reprintOrder[${orderId}]:`, error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, queued: true };
}
