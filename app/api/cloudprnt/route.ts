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
// Usiamo image/png: l'intera comanda è renderizzata come immagine
// (lib/print/receipt.ts → generateReceiptPng), che permette QR di navigazione,
// grassetto e simbolo € reale. Il payload è il PNG, salvato base64 in print_jobs.
const PRINT_MEDIA_TYPE = "image/png";

// Un solo job "in volo" per volta (vedi POST). Se la stampante rivendica un job
// e non lo conferma entro questo tempo, il lease scade e il job viene recuperato.
// 120s copre abbondantemente download + stampa di una comanda lunga.
const JOB_LEASE_SECONDS = 120;

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
  // Star invia statusCode come "200 OK" (non "200"): estrai il prefisso numerico
  // e considera 2xx = OK (stessa logica del DELETE handler). Evita che lo stato
  // grezzo ASB ("2f c 0 0…") finisca salvato come se fosse un errore.
  const statusNum = body.statusCode ? Number.parseInt(body.statusCode, 10) : NaN;
  const paperStatus =
    Number.isFinite(statusNum) && statusNum >= 200 && statusNum < 300
      ? "OK"
      : (body.status ?? body.statusCode ?? "UNKNOWN");

  // ANTI-DUPLICATI — regola: UN SOLO job in volo alla volta.
  // Prima consegnavamo un job nuovo a ogni poll (ogni 10s), anche mentre la
  // stampante era occupata: il job veniva marcato in_progress, la stampante lo
  // ignorava e restava bloccato per sempre. Le comande sparivano, il titolare
  // premeva "Ristampa" e più tardi uscivano tutte le copie insieme.
  // `busy` = c'è già lavoro consegnato e non ancora confermato.
  let busy = printing;

  if (!printing) {
    const { data: inFlight } = await supabase
      .from("print_jobs")
      .select("id, claimed_at, served_at")
      .eq("status", "in_progress")
      .order("claimed_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (inFlight) {
      const claimedMs = inFlight.claimed_at
        ? new Date(inFlight.claimed_at).getTime()
        : 0;
      const leaseExpired = Date.now() - claimedMs > JOB_LEASE_SECONDS * 1000;

      if (!leaseExpired) {
        // Consegnato da poco e non ancora confermato → aspetta, niente altro lavoro.
        busy = true;
      } else if (inFlight.served_at) {
        // Il payload è già stato scaricato dalla stampante: non sappiamo se la
        // carta è uscita. NON si ristampa in automatico — meglio una comanda
        // mancante (visibile in dashboard) che dieci copie identiche.
        await supabase
          .from("print_jobs")
          .update({
            status: "failed",
            last_error: "nessuna conferma dalla stampante dopo il download",
            job_token: null,
          })
          .eq("id", inFlight.id)
          .eq("status", "in_progress");
      } else {
        // Mai scaricato → sicuramente non stampato: rimettilo in coda.
        await supabase
          .from("print_jobs")
          .update({ status: "pending", job_token: null, claimed_at: null })
          .eq("id", inFlight.id)
          .eq("status", "in_progress");
      }
    }
  }

  // Testa della coda + conteggio esatto in una sola query.
  const { data: pendingHead, count: pendingCount } = await supabase
    .from("print_jobs")
    .select("id, media_type, created_at", { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);

  const job = pendingHead?.[0] ?? null;

  // Aggiorna printer_health per banner Realtime dashboard.
  // I contatori della coda si aggiornano qui a ogni poll: prima dipendevano dal
  // cron /api/cron/printer-health, che non è schedulato da nessuna parte, così
  // il banner diceva sempre "Stampante attiva · 0 in coda" anche con 15 comande
  // in attesa — ed era il motivo per cui non ci si accorgeva dell'ingorgo.
  await supabase
    .from("printer_health")
    .update({
      last_poll_at: new Date().toISOString(),
      printer_mac: printerMac,
      paper_status: paperStatus,
      printing_in_progress: printing,
      pending_jobs_count: pendingCount ?? 0,
      oldest_pending_age_seconds: job
        ? Math.floor((Date.now() - new Date(job.created_at).getTime()) / 1000)
        : null,
    })
    .eq("id", 1);

  if (busy || !job) {
    return NextResponse.json({ jobReady: false });
  }

  // Rivendica il job: status=in_progress + jobToken univoco.
  // Il filtro .eq("status","pending") rende la rivendicazione atomica: se due
  // poll arrivano insieme, solo uno aggiorna la riga e l'altro riceve 0 righe.
  const jobToken = crypto.randomUUID();
  const { data: claimed } = await supabase
    .from("print_jobs")
    .update({
      status: "in_progress",
      job_token: jobToken,
      claimed_at: new Date().toISOString(),
      served_at: null,
      printer_mac: printerMac,
    })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    // Job già rivendicato da un'altra richiesta concorrente.
    return NextResponse.json({ jobReady: false });
  }

  return NextResponse.json({
    jobReady: true,
    // Tipo del singolo job: comanda (image/png) o configurazione stampante
    // (application/vnd.star.starconfiguration).
    mediaTypes: [job.media_type ?? PRINT_MEDIA_TYPE],
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

  // Trova il job: prima per jobToken (preciso), fallback al più vecchio
  // in_progress — sicuro perché il POST garantisce un solo job in volo alla volta
  // (prima potevano essercene decine e il fallback pescava quello sbagliato).
  let jobQuery = supabase
    .from("print_jobs")
    .select("id, payload, order_id, media_type")
    .eq("status", "in_progress");

  if (jobToken) {
    jobQuery = jobQuery.eq("job_token", jobToken);
  }

  const { data: job } = await jobQuery
    .order("claimed_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!job) {
    return new NextResponse(null, { status: 204 });
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

      return new NextResponse(null, { status: 204 });
    }
  }

  // Traccia il download: da qui in poi la comanda potrebbe essere già uscita
  // su carta, quindi non va mai rimessa in coda automaticamente (vedi POST).
  await supabase
    .from("print_jobs")
    .update({ served_at: new Date().toISOString() })
    .eq("id", job.id);

  // payload è base64 del PNG della comanda → decodifica e servi image/png.
  const body = Buffer.from(job.payload, "base64");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": job.media_type ?? PRINT_MEDIA_TYPE,
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
    // La stampante dichiara esplicitamente di NON aver stampato → riprovare è
    // sicuro (nessun rischio di doppione). served_at azzerato: il payload andrà
    // riscaricato al prossimo tentativo.
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
        served_at: null,
      })
      .eq("id", job.id);
  }

  return new NextResponse("", { status: 200 });
}
