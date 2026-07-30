"use client";

import { useEffect, useState } from "react";
import { Printer, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PrinterHealth = {
  last_poll_at: string | null;
  paper_status: string | null;
  pending_jobs_count: number;
  oldest_pending_age_seconds: number | null;
  printing_in_progress: boolean;
};

const HEALTH_COLUMNS =
  "last_poll_at, paper_status, pending_jobs_count, oldest_pending_age_seconds, printing_in_progress";

/** Ricontrollo periodico: rete di sicurezza se il canale Realtime cade. */
const REFRESH_MS = 30_000;
/** Oltre questo silenzio, e la stampante non sta stampando, è davvero offline. */
const OFFLINE_AFTER_SECONDS = 5 * 60;

/**
 * I timestamp arrivano in due formati diversi: ISO da PostgREST
 * ("2026-07-30T20:58:31.398+00:00") e formato Postgres da Realtime
 * ("2026-07-30 20:58:31.398+00", a volte senza fuso orario). Un timestamp senza
 * fuso il browser lo interpreta come ora locale: in Italia d'estate sembrerebbe
 * vecchio di due ore e il banner darebbe un falso "Stampante non funzionante".
 */
function parseTimestamp(value: string | null): number | null {
  if (!value) return null;
  let s = value.trim().replace(" ", "T");
  if (/[+-]\d{2}$/.test(s)) s += ":00";
  else if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += "Z";
  const ms = new Date(s).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function classifyStatus(health: PrinterHealth | null): {
  level: "ok" | "warn" | "error";
  text: string;
} {
  const lastPoll = parseTimestamp(health?.last_poll_at ?? null);
  if (!health || lastPoll === null) {
    return { level: "error", text: "Stampante non funzionante" };
  }
  const secondsSincePoll = Math.floor((Date.now() - lastPoll) / 1000);
  if (!health.printing_in_progress && secondsSincePoll > OFFLINE_AFTER_SECONDS) {
    return { level: "error", text: "Stampante non funzionante" };
  }
  if (
    health.oldest_pending_age_seconds != null &&
    health.oldest_pending_age_seconds > 60
  ) {
    return {
      level: "warn",
      text: `Stampante attiva · ${health.pending_jobs_count} in coda`,
    };
  }
  return { level: "ok", text: "Stampante attiva" };
}

export function PrinterStatusBanner({
  initialHealth,
}: {
  initialHealth: PrinterHealth | null;
}) {
  const [health, setHealth] = useState<PrinterHealth | null>(initialHealth);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const channel = supabase
      .channel("printer_health_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "printer_health",
          filter: "id=eq.1",
        },
        (payload) => {
          setHealth(payload.new as PrinterHealth);
        },
      )
      .subscribe();

    // Ricarica periodica oltre al Realtime. Serve per due motivi: se il canale
    // cade (wifi del locale) il banner resterebbe fermo su un dato vecchio e
    // dopo 5 minuti darebbe un falso allarme; e comunque va rivalutato il tempo
    // trascorso dall'ultimo contatto, che cambia anche senza nuovi eventi.
    const refresh = async () => {
      const { data } = await supabase
        .from("printer_health")
        .select(HEALTH_COLUMNS)
        .eq("id", 1)
        .maybeSingle();
      if (!cancelled && data) setHealth(data as PrinterHealth);
    };
    const timer = setInterval(refresh, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const status = classifyStatus(health);
  const cls = {
    ok: "bg-bamboo/10 text-bamboo border-bamboo/30",
    warn: "bg-amber-100 text-amber-900 border-amber-300",
    error: "bg-sushi-red/10 text-sushi-red border-sushi-red/40 animate-pulse",
  }[status.level];

  return (
    <div
      className={`sticky top-14 z-30 flex items-center justify-center gap-2 border-b px-4 py-3 text-base font-bold sm:text-lg md:top-0 ${cls}`}
    >
      {status.level === "error" ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Printer className="h-5 w-5" />
      )}
      <span>{status.text}</span>
      {health?.printing_in_progress && (
        <span className="ml-2 text-xs opacity-70">(stampa in corso…)</span>
      )}
    </div>
  );
}
