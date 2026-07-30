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
//
// ANTI-DUPLICATI (regole invarianti — non rimuovere senza capirle):
// 1) UN SOLO job "in volo" per volta. Il POST non rivendica un nuovo job finché
//    quello precedente non è chiuso (printed/failed) o il lease è scaduto.
//    Prima il POST rivendicava un job a OGNI poll: con 5 comande in coda la
//    stampante se le prendeva tutte in 15 secondi pur scaricandone una sola,
//    e le altre restavano "in_progress" per sempre (nessuno le confermava).
// 2) SERVE-ONCE. Il GET segna `served_at` e non serve MAI due volte lo stesso
//    job: un payload sceso in stampante può essere già uscito su carta, quindi
//    non lo si ripropone. Meglio una comanda mancante (il titolare ristampa)
//    che una comanda doppia in cucina.
// 3) NIENTE ristampa automatica di un job già servito. Se manca la conferma
//    DELETE il job finisce 'failed' e resta visibile in /admin/stampante.
// 4) I fallback "job più vecchio in_progress" di GET/DELETE sono sicuri SOLO
//    grazie alla regola 1 (al massimo un job in quello stato). Erano la causa
//    delle comande vecchie ristampate: la conferma di una stampa chiudeva la
//    riga sbagliata e il payload servito era quello di un ordine precedente.

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

// Quanto a lungo un job rivendicato resta "di proprietà" della stampante prima
// di essere considerato perso. Il polling consigliato è 30s → 120s copre 4 poll.
const LEASE_SECONDS = 120;
// Oltre questo numero di tentativi il job va in 'failed' (niente loop infiniti).
const MAX_ATTEMPTS = 3;

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

/**
 * Token del job presente nella richiesta. Star lo passa come `uid`; alcuni
 * firmware usano `jobToken` o riciclano `token` (che per noi è l'auth: lo
 * consideriamo job token solo se NON coincide col segreto CloudPRNT).
 */
function readJobToken(url: URL): string | null {
  const uid = url.searchParams.get("uid") ?? url.searchParams.get("jobToken");
  if (uid) return uid;
  const generic = url.searchParams.get("token");
  if (generic && generic !== process.env.CLOUDPRNT_TOKEN) return generic;
  return null;
}

type Supabase = ReturnType<typeof createAdminClient>;

/** Il job attualmente in volo (al massimo uno, vedi regola 1). */
async function getInFlightJob(supabase: Supabase) {
  const { data } = await supabase
    .from("print_jobs")
    .select("id, media_type, job_token, claimed_at, served_at, attempts, order_id, payload")
    .eq("status", "in_progress")
    .order("claimed_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

function isLeaseExpired(claimedAt: string | null): boolean {
  if (!claimedAt) return true;
  return Date.now() - new Date(claimedAt).getTime() > LEASE_SECONDS * 1000;
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

  // ---- job in volo: recupero lease PRIMA di offrire altro lavoro ----
  const inFlight = await getInFlightJob(supabase);
  let reoffer: { token: string; mediaType: string } | null = null;

  if (inFlight) {
    const expired = isLeaseExpired(inFlight.claimed_at);
    if (inFlight.served_at) {
      // Payload già sceso in stampante: potrebbe essere uscito su carta.
      // MAI ristampare da soli — si chiude in 'failed' e il titolare decide.
      if (expired) {
        await supabase
          .from("print_jobs")
          .update({
            status: "failed",
            last_error: "payload servito ma stampa mai confermata",
          })
          .eq("id", inFlight.id)
          .eq("status", "in_progress");
      }
    } else if (!expired) {
      // Mai scaricato e lease valido → ripropone LO STESSO job con lo stesso
      // token (idempotente: se la risposta POST precedente si è persa, la
      // stampante riprova senza che nasca una seconda copia).
      reoffer = {
        token: inFlight.job_token ?? crypto.randomUUID(),
        mediaType: inFlight.media_type ?? PRINT_MEDIA_TYPE,
      };
      if (!inFlight.job_token) {
        await supabase
          .from("print_jobs")
          .update({ job_token: reoffer.token, claimed_at: new Date().toISOString() })
          .eq("id", inFlight.id)
          .eq("status", "in_progress");
      }
    } else {
      // Mai scaricato e lease scaduto → nessun foglio può essere uscito:
      // rimetterlo in coda è sicuro.
      const attempts = (inFlight.attempts ?? 0) + 1;
      await supabase
        .from("print_jobs")
        .update({
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
          attempts,
          job_token: null,
          claimed_at: null,
          last_error: `lease scaduto (${LEASE_SECONDS}s) senza download`,
        })
        .eq("id", inFlight.id)
        .eq("status", "in_progress");
    }
  }

  // ---- health + contatori coda (il banner admin li legge in Realtime) ----
  const { count: pendingCount } = await supabase
    .from("print_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  await supabase
    .from("printer_health")
    .update({
      last_poll_at: new Date().toISOString(),
      printer_mac: printerMac,
      paper_status: paperStatus,
      printing_in_progress: printing,
      pending_jobs_count: pendingCount ?? 0,
    })
    .eq("id", 1);

  if (reoffer) {
    return NextResponse.json({
      jobReady: true,
      mediaTypes: [reoffer.mediaType],
      jobToken: reoffer.token,
      deleteMethod: "DELETE",
    });
  }

  // Un job è ancora in volo (servito, lease non scaduto) → niente altro lavoro
  // finché non arriva la conferma: una comanda per volta.
  if (inFlight && inFlight.served_at && !isLeaseExpired(inFlight.claimed_at)) {
    return NextResponse.json({ jobReady: false });
  }

  // Cerca un job pending
  const { data: job, error } = await supabase
    .from("print_jobs")
    .select("id, media_type")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !job) {
    return NextResponse.json({ jobReady: false });
  }

  // Rivendica il job in modo ATOMICO: l'update filtra ancora su status='pending',
  // quindi due poll ravvicinati non possono rivendicare la stessa riga.
  const jobToken = crypto.randomUUID();
  const { data: claimed } = await supabase
    .from("print_jobs")
    .update({
      status: "in_progress",
      job_token: jobToken,
      claimed_at: new Date().toISOString(),
      printer_mac: printerMac,
    })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    // Rivendicato da un altro poll in parallelo → nessun lavoro per questo giro.
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
// (alcuni firmware usano ?token/?jobToken, gestiamo tutti)
// ============================================================
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const url = new URL(request.url);
  const jobToken = readJobToken(url);

  const supabase = createAdminClient();

  // Trova il job: prima per jobToken (preciso), fallback all'unico in_progress
  // (sicuro: la regola "un job in volo per volta" garantisce che sia quello).
  let job = null as Awaited<ReturnType<typeof getInFlightJob>>;
  if (jobToken) {
    const { data } = await supabase
      .from("print_jobs")
      .select("id, media_type, job_token, claimed_at, served_at, attempts, order_id, payload")
      .eq("status", "in_progress")
      .eq("job_token", jobToken)
      .maybeSingle();
    job = data;
  }
  job ??= await getInFlightJob(supabase);

  if (!job) {
    return new NextResponse(null, { status: 204 });
  }

  // SERVE-ONCE: un payload già scaricato non si ripropone mai (regola 2).
  if (job.served_at) {
    console.warn(`cloudprnt GET: job ${job.id} già servito → nessuna ristampa`);
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

  // Segna il download PRIMA di rispondere: se due GET arrivano insieme, solo il
  // primo (quello che vede served_at ancora null) consegna il payload.
  const { data: reserved } = await supabase
    .from("print_jobs")
    .update({ served_at: new Date().toISOString() })
    .eq("id", job.id)
    .is("served_at", null)
    .select("id")
    .maybeSingle();

  if (!reserved) {
    return new NextResponse(null, { status: 204 });
  }

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
  const jobToken = readJobToken(url);
  const now = new Date().toISOString();

  const supabase = createAdminClient();
  // Star invia il code come "200 OK", "510 Incompatible Media Type", ecc.
  // Estrai il prefisso numerico e accetta 2xx come successo. Uguaglianza esatta
  // su "200" falliva perché il valore reale è "200 OK" → ristampe + falso failed.
  // (code === null = firmware vecchi senza code → trattato come OK.)
  const codeNum = code === null ? 200 : Number.parseInt(code, 10);
  const isOk = Number.isFinite(codeNum) && codeNum >= 200 && codeNum < 300;

  // Trova il job specifico (per jobToken o fallback all'unico in_progress)
  let job = null as Awaited<ReturnType<typeof getInFlightJob>>;
  if (jobToken) {
    const { data } = await supabase
      .from("print_jobs")
      .select("id, media_type, job_token, claimed_at, served_at, attempts, order_id, payload")
      .eq("status", "in_progress")
      .eq("job_token", jobToken)
      .maybeSingle();
    job = data;
  }
  job ??= await getInFlightJob(supabase);

  if (!job) {
    return new NextResponse("", { status: 200 });
  }

  if (isOk) {
    await supabase
      .from("print_jobs")
      .update({ status: "printed", printed_at: now })
      .eq("id", job.id)
      .eq("status", "in_progress");
    return new NextResponse("", { status: 200 });
  }

  const attempts = (job.attempts ?? 0) + 1;
  // Riprovare è sicuro SOLO se il payload non è mai stato scaricato: altrimenti
  // la carta potrebbe essere già uscita (anche parziale) → 'failed' e ristampa
  // manuale dal dashboard.
  const canRetry = !job.served_at && attempts < MAX_ATTEMPTS;
  await supabase
    .from("print_jobs")
    .update({
      status: canRetry ? "pending" : "failed",
      attempts,
      last_error: `printer code ${code}`,
      job_token: null,
      claimed_at: null,
    })
    .eq("id", job.id)
    .eq("status", "in_progress");

  return new NextResponse("", { status: 200 });
}
