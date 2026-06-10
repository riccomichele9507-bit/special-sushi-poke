// Endpoint CloudPRNT per Star Micronics TSP143IV CloudPRNT.
// La stampante polla questo endpoint ogni N secondi (configurabile dal pannello stampante).
//
// Contratto CloudPRNT:
// - POST  → "c'è lavoro da fare?" → risponde { jobReady: bool, ... }
// - GET   → scarica il contenuto del job → risponde con il body in text/plain
// - DELETE→ conferma stampa → segna job come 'printed'
//
// Autenticazione: token segreto nel querystring (?token=...).
// La stampante ce lo aggiunge ed è configurato una volta sola dal pannello web.

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function checkToken(request: NextRequest): boolean {
  const token = new URL(request.url).searchParams.get("token");
  return Boolean(token) && token === process.env.CLOUDPRNT_TOKEN;
}

// -----------------------------------------------------------------------------
// POST — la stampante chiede "c'è un job?"
// -----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  if (!checkToken(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let body: {
    printerMAC?: string;
    statusCode?: string;
    status?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    // alcune stampanti polleranno senza body
  }

  const supabase = createAdminClient();
  const printerMac = body.printerMAC ?? null;

  // Aggiorna lo stato della stampante (per il banner Realtime del dashboard)
  await supabase
    .from("printer_health")
    .update({
      last_poll_at: new Date().toISOString(),
      printer_mac: printerMac,
      paper_status: body.statusCode === "200" ? "OK" : (body.status ?? "UNKNOWN"),
    })
    .eq("id", 1);

  // Cerca un job pending
  const { data: job, error } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !job) {
    return NextResponse.json({ jobReady: false });
  }

  // Marca il job come in_progress + assegna un token univoco
  const jobToken = crypto.randomUUID();
  await supabase
    .from("print_jobs")
    .update({
      status: "in_progress",
      job_token: jobToken,
      claimed_at: new Date().toISOString(),
      printer_mac: printerMac,
    })
    .eq("id", job.id);

  return NextResponse.json({
    jobReady: true,
    mediaTypes: ["text/plain"],
    jobToken,
  });
}

// -----------------------------------------------------------------------------
// GET — la stampante scarica il payload del job
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  if (!checkToken(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = createAdminClient();

  // Prendi il job in_progress più vecchio (= quello appena rivendicato dal POST)
  const { data: job, error } = await supabase
    .from("print_jobs")
    .select("payload")
    .eq("status", "in_progress")
    .order("claimed_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !job) {
    return new NextResponse("", { status: 204 });
  }

  return new NextResponse(job.payload, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// -----------------------------------------------------------------------------
// DELETE — la stampante conferma "ho stampato OK"
// -----------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  if (!checkToken(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code"); // "200" = OK, altrimenti errore

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  if (code === "200" || code === null) {
    // Successo: marca il job in_progress come 'printed'
    await supabase
      .from("print_jobs")
      .update({ status: "printed", printed_at: now })
      .eq("status", "in_progress");
  } else {
    // Errore stampa: marca come failed con incremento attempts
    const { data: job } = await supabase
      .from("print_jobs")
      .select("id, attempts")
      .eq("status", "in_progress")
      .limit(1)
      .maybeSingle();

    if (job) {
      const attempts = (job.attempts ?? 0) + 1;
      // Dopo 3 tentativi falliti, lo segniamo failed; prima lo rimettiamo pending
      const newStatus = attempts >= 3 ? "failed" : "pending";
      await supabase
        .from("print_jobs")
        .update({
          status: newStatus,
          attempts,
          last_error: `printer code ${code}`,
          job_token: null,
        })
        .eq("id", job.id);
    }
  }

  return new NextResponse("", { status: 200 });
}
