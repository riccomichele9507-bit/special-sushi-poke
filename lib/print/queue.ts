// Helper server-only per accodare un job di stampa.
// Chiamato dopo la creazione/conferma ordine in C4.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptPng } from "./receipt";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

/**
 * Genera il testo comanda e lo accoda in print_jobs.status=pending.
 * Idempotente: se già esiste un job pending/in_progress/printed per quell'ordine, skip.
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
    console.error(`enqueuePrintJob[${order.id}]:`, error.message);
    return false;
  }
  return true;
}

/**
 * Forza una nuova stampa (es. bottone "Ristampa" nel dashboard admin).
 * Crea un nuovo print_job pending anche se ne esiste uno già 'printed'.
 */
export async function reprintOrder(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return false;

  // Payload comanda come PNG monocromatico (image/png) salvato come base64.
  const payload = generateReceiptPng(order).toString("base64");
  const { error } = await supabase.from("print_jobs").insert({
    order_id: order.id,
    payload,
    status: "pending",
  });

  if (error) {
    console.error(`reprintOrder[${orderId}]:`, error.message);
    return false;
  }
  return true;
}
