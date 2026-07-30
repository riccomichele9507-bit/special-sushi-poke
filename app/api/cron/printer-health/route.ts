// Cron schedulato esternamente (opzionale: oggi NON è configurato nessun
// scheduler). Il recupero dei job persi vive anche nel POST /api/cloudprnt
// (lease di 120s a ogni poll stampante), quindi questo endpoint è ridondanza,
// non un ingranaggio critico.
// Tre responsabilità:
// 1) ORPHAN RECOVERY: rimette in coda i print_jobs in_progress > 3 min MAI
//    scaricati; quelli già scaricati (served_at) vanno in 'failed' — mai
//    ristampa automatica di qualcosa che potrebbe essere già uscito su carta.
// 2) COUNTERS: aggiorna pending_jobs_count + oldest_pending_age_seconds (per banner dashboard).
// 3) HEALTH: se last_poll_at > 5min E printing_in_progress=false → stampante davvero offline
//    (non solo "occupata a stampare").

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ORPHAN_TIMEOUT_MIN = 3;
const OFFLINE_THRESHOLD_MIN = 5;

export async function GET(request: NextRequest) {
  // Verifica Bearer token (GitHub Actions lo aggiunge)
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("CRON_SECRET non configurato — endpoint disabilitato");
    return new NextResponse("Service unavailable", { status: 503 });
  }
  if (auth !== `Bearer ${expected}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = createAdminClient();
  const orphanCutoff = new Date(
    Date.now() - ORPHAN_TIMEOUT_MIN * 60 * 1000,
  ).toISOString();

  // 1) ORPHAN RECOVERY — solo job MAI scaricati dalla stampante.
  // Un job con served_at valorizzato può essere già uscito su carta: rimetterlo
  // in coda significherebbe una comanda doppia in cucina. Quelli si chiudono
  // 'failed' e restano visibili in /admin/stampante per la ristampa manuale.
  const { data: orphans } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("status", "in_progress")
    .is("served_at", null)
    .lt("claimed_at", orphanCutoff);

  const orphanCount = orphans?.length ?? 0;
  if (orphanCount > 0) {
    await supabase
      .from("print_jobs")
      .update({
        status: "pending",
        job_token: null,
        claimed_at: null,
        last_error: `recovered after ${ORPHAN_TIMEOUT_MIN}min orphan`,
      })
      .in(
        "id",
        orphans!.map((o) => o.id),
      );
    console.warn(`cron/printer-health: recovered ${orphanCount} orphan job(s)`);
  }

  const { data: served } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("status", "in_progress")
    .not("served_at", "is", null)
    .lt("claimed_at", orphanCutoff);

  const abandonedCount = served?.length ?? 0;
  if (abandonedCount > 0) {
    await supabase
      .from("print_jobs")
      .update({
        status: "failed",
        job_token: null,
        last_error: "payload servito ma stampa mai confermata",
      })
      .in(
        "id",
        served!.map((s) => s.id),
      );
    console.warn(`cron/printer-health: ${abandonedCount} job servito/i senza conferma`);
  }

  // 2) COUNTERS
  const { data: pendingJobs } = await supabase
    .from("print_jobs")
    .select("created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const pendingCount = pendingJobs?.length ?? 0;
  const oldestAge = pendingJobs?.[0]
    ? Math.floor(
        (Date.now() - new Date(pendingJobs[0].created_at).getTime()) / 1000,
      )
    : null;

  // 3) HEALTH check (offline = no poll da X min AND non sta stampando)
  const { data: health } = await supabase
    .from("printer_health")
    .select("last_poll_at, printing_in_progress")
    .eq("id", 1)
    .maybeSingle();

  let offlineFor: number | null = null;
  if (health && !health.printing_in_progress) {
    if (health.last_poll_at) {
      const secondsSincePoll = Math.floor(
        (Date.now() - new Date(health.last_poll_at).getTime()) / 1000,
      );
      if (secondsSincePoll > OFFLINE_THRESHOLD_MIN * 60) {
        offlineFor = secondsSincePoll;
      }
    } else {
      offlineFor = Number.POSITIVE_INFINITY; // mai pollato
    }
  }

  await supabase
    .from("printer_health")
    .update({
      pending_jobs_count: pendingCount,
      oldest_pending_age_seconds: oldestAge,
    })
    .eq("id", 1);

  return NextResponse.json({
    ok: true,
    pendingCount,
    oldestPendingAgeSeconds: oldestAge,
    orphansRecovered: orphanCount,
    servedWithoutConfirm: abandonedCount,
    offlineForSeconds: offlineFor === Number.POSITIVE_INFINITY ? null : offlineFor,
    printerOffline: offlineFor !== null,
    timestamp: new Date().toISOString(),
  });
}
