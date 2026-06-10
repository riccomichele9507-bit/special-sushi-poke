// Cron Vercel ogni 5 minuti.
// Aggiorna i counter su printer_health per il banner Realtime del dashboard admin:
// - pending_jobs_count
// - oldest_pending_age_seconds (per allarme se carta finita / stampante offline)
//
// Vercel cron: configurazione in vercel.json. Autenticazione via Authorization header
// con CRON_SECRET (Vercel ce lo aggiunge in automatico se configurato).

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verifica del cron secret (best practice Vercel)
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = createAdminClient();

  // Conta job pending + età del più vecchio
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

  const { error } = await supabase
    .from("printer_health")
    .update({
      pending_jobs_count: pendingCount,
      oldest_pending_age_seconds: oldestAge,
    })
    .eq("id", 1);

  if (error) {
    console.error("cron/printer-health update error:", error.message);
  }

  return NextResponse.json({
    ok: true,
    pendingCount,
    oldestPendingAgeSeconds: oldestAge,
    timestamp: new Date().toISOString(),
  });
}
