// Endpoint CloudPRNT per Star Micronics TSP143IV (e simili).
// La stampante polla ogni N secondi (configurato sul pannello stampante).
//
// Contratto CloudPRNT 2.5.2:
// - POST  → "c'è lavoro?" → risponde { jobReady, mediaTypes, jobToken }
// - GET ?token=...&mac=...&uid={jobToken} → scarica payload (text/plain)
// - DELETE ?token=...&code=200&uid={jobToken} → conferma stampa
//
// Auth: HTTP Basic Auth (username:'printer', password=CLOUDPRNT_TOKEN) preferred
//       Fallback: ?token=CLOUDPRNT_TOKEN in querystring (compat firmware vecchi)

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Tipo del payload di stampa per TSP143IV-UEWB (TSP100IV) firmware 3.3.
// La TSP100IV supporta SOLO: text/plain, image/png, application/vnd.star.starprnt,
// vnd.star.starconfiguration, image/vnd.star.png, vnd.star.starprntcore, octet-stream.
// `application/vnd.star.line` NON è supportato → 510 Incompatible Media Type.
// Usiamo text/plain: comanda in testo ASCII (lib/print/receipt.ts → generateReceiptPlainText),
// universale e a prova di code page. Il payload è il testo, salvato base64 in print_jobs.
// (Il QR di navigazione richiederebbe image/png — enhancement separato.)
const PRINT_MEDIA_TYPE = "text/plain";

// ============================================================
// AUTH — Basic Auth preferred, ?token=... fallback
// ============================================================
function checkAuth(request: NextRequest): boolean {
  const expected = process.env.CLOUDPRNT_TOKEN;
  if (!expected) return false;

  // 1) HTTP Basic Auth
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
      const [user, pass] = decoded.split(":");
      if (user === "printer" && pass === expected) return true;
    } catch {
      // malformed — fall through
    }
  }

  // 2) Querystring fallback
  const urlToken = new URL(request.url).searchParams.get("token");
  return Boolean(urlToken) && urlToken === expected;
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CloudPRNT"' },
  });
}

// ============================================================
// POST — "c'è un job?"
// ============================================================
type CloudPrntPostBody = {
  printerMAC?: string;
  statusCode?: string;
  status?: string;
  printingInProgress?: boolean;
  clientType?: string;
  clientVersion?: string;
};

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  let body: CloudPrntPostBody = {};
  try {
    body = (await request.json()) as CloudPrntPostBody;
  } catch {
    /* alcune stampanti POST senza body */
  }

  const supabase = createAdminClient();
  const printerMac = body.printerMAC ?? null;
  const printing = Boolean(body.printingInProgress);
  const paperStatus =
    body.statusCode === "200" ? "OK" : (body.status ?? body.statusCode ?? "UNKNOWN");

  // Aggiorna printer_health per banner Realtime dashboard
  await supabase
    .from("printer_health")
    .update({
      last_poll_at: new Date().toISOString(),
      printer_mac: printerMac,
      paper_status: paperStatus,
      printing_in_progress: printing,
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

  // Rivendica il job: status=in_progress + jobToken univoco
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
    mediaTypes: [PRINT_MEDIA_TYPE],
    jobToken,
    deleteMethod: "DELETE",
  });
}

// ============================================================
// GET — la stampante scarica il payload
// Star CloudPRNT passa il jobToken nel querystring come ?uid={jobToken}
// (alcuni firmware usano ?token, gestiamo entrambi)
// ============================================================
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const url = new URL(request.url);
  const jobToken = url.searchParams.get("uid") ?? url.searchParams.get("jobToken");

  const supabase = createAdminClient();

  // Trova il job: prima per jobToken (preciso), fallback al più vecchio in_progress
  let jobQuery = supabase
    .from("print_jobs")
    .select("id, payload, order_id")
    .eq("status", "in_progress");

  if (jobToken) {
    jobQuery = jobQuery.eq("job_token", jobToken);
  }

  const { data: job } = await jobQuery
    .order("claimed_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!job) {
    return new NextResponse("", { status: 204 });
  }

  // CANCEL-DURING-PRINT CHECK
  // Se l'ordine è stato cancellato/rimborsato dopo la rivendicazione del job,
  // NON stampiamo. Marca print_job come failed con motivo cancelled.
  if (job.order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("status")
      .eq("id", job.order_id)
      .maybeSingle();

    if (order && (order.status === "cancelled" || order.status === "refunded")) {
      await supabase
        .from("print_jobs")
        .update({
          status: "failed",
          last_error: `order ${order.status} after claim`,
          printed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return new NextResponse("", { status: 204 });
    }
  }

  // payload è base64 del testo ASCII della comanda → decodifica e servi text/plain.
  const body = Buffer.from(job.payload, "base64");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": PRINT_MEDIA_TYPE,
      "Content-Length": String(body.length),
      "Cache-Control": "no-store",
    },
  });
}

// ============================================================
// DELETE — conferma stampa
// ?code=200 = OK | altri codici = errore
// ?uid={jobToken} = job specifico (sync col POST/GET)
// ============================================================
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const jobToken = url.searchParams.get("uid") ?? url.searchParams.get("jobToken");
  const now = new Date().toISOString();

  const supabase = createAdminClient();
  // Star invia il code come "200 OK", "510 Incompatible Media Type", ecc.
  // Estrai il prefisso numerico e accetta 2xx come successo. Uguaglianza esatta
  // su "200" falliva perché il valore reale è "200 OK" → ristampe + falso failed.
  // (code === null = firmware vecchi senza code → trattato come OK.)
  const codeNum = code === null ? 200 : Number.parseInt(code, 10);
  const isOk = Number.isFinite(codeNum) && codeNum >= 200 && codeNum < 300;

  // Trova il job specifico (per jobToken o fallback al più vecchio in_progress)
  let jobQuery = supabase
    .from("print_jobs")
    .select("id, attempts")
    .eq("status", "in_progress");
  if (jobToken) jobQuery = jobQuery.eq("job_token", jobToken);

  const { data: job } = await jobQuery
    .order("claimed_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!job) {
    return new NextResponse("", { status: 200 });
  }

  if (isOk) {
    await supabase
      .from("print_jobs")
      .update({ status: "printed", printed_at: now })
      .eq("id", job.id);
  } else {
    const attempts = (job.attempts ?? 0) + 1;
    const newStatus = attempts >= 3 ? "failed" : "pending";
    await supabase
      .from("print_jobs")
      .update({
        status: newStatus,
        attempts,
        last_error: `printer code ${code}`,
        job_token: null,
        claimed_at: null,
      })
      .eq("id", job.id);
  }

  return new NextResponse("", { status: 200 });
}
