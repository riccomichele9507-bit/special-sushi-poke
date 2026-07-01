// Cron: invia l'email di richiesta recensione ~12h dopo l'ordine.
// A TUTTI i clienti (delivery e pickup), una sola volta per ordine (dedup interno
// in sendReviewRequestEmail via marketing_emails_log).
//
// Auth: Authorization: Bearer CRON_SECRET (Vercel Cron lo aggiunge in automatico
// quando CRON_SECRET è impostata nelle env; oppure pinger esterno con lo stesso header).
//
// Finestra: ordini creati tra WINDOW_DAYS fa e DELAY_HOURS fa. La finestra evita
// di inviare a ordini troppo vecchi (nessun "blast" storico alla prima attivazione)
// e, col dedup, garantisce un solo invio anche se il cron gira più volte.

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewRequestEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DELAY_HOURS = 12; // invia dopo 12h dall'ordine
const WINDOW_DAYS = 2; // non toccare ordini più vecchi di 2 giorni
const MAX_PER_RUN = 300;

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("CRON_SECRET non configurato — endpoint disabilitato");
    return new NextResponse("Service unavailable", { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const upper = new Date(now - DELAY_HOURS * 3_600_000).toISOString();
  const lower = new Date(now - WINDOW_DAYS * 24 * 3_600_000).toISOString();

  // Ordini validi (esclusi non pagati/annullati/rimborsati) con email, nella finestra.
  const { data: orders, error } = await admin
    .from("orders")
    .select("*")
    .lte("created_at", upper)
    .gte("created_at", lower)
    .not("status", "in", "(received,cancelled,refunded)")
    .not("customer_email", "is", null)
    .eq("is_test", false) // niente richieste recensione per gli ordini di test
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  for (const order of orders ?? []) {
    const r = await sendReviewRequestEmail(order);
    if (r.sent) sent++;
    else skipped++;
  }

  return NextResponse.json({
    ok: true,
    candidates: orders?.length ?? 0,
    sent,
    skipped,
    timestamp: new Date().toISOString(),
  });
}
