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

function classifyStatus(health: PrinterHealth | null): {
  level: "ok" | "warn" | "error";
  text: string;
} {
  if (!health || !health.last_poll_at) {
    return { level: "error", text: "Stampante mai contattata" };
  }
  const secondsSincePoll = Math.floor(
    (Date.now() - new Date(health.last_poll_at).getTime()) / 1000,
  );
  if (!health.printing_in_progress && secondsSincePoll > 5 * 60) {
    return {
      level: "error",
      text: `Stampante OFFLINE (ultimo segnale ${Math.floor(secondsSincePoll / 60)} min fa)`,
    };
  }
  if (health.paper_status && health.paper_status !== "OK") {
    return { level: "error", text: `Stato: ${health.paper_status}` };
  }
  if (
    health.oldest_pending_age_seconds != null &&
    health.oldest_pending_age_seconds > 60
  ) {
    return {
      level: "warn",
      text: `${health.pending_jobs_count} job in attesa (più vecchio ${Math.floor(health.oldest_pending_age_seconds / 60)} min)`,
    };
  }
  return { level: "ok", text: "Stampante OK · pronta" };
}

export function PrinterStatusBanner({
  initialHealth,
}: {
  initialHealth: PrinterHealth | null;
}) {
  const [health, setHealth] = useState<PrinterHealth | null>(initialHealth);

  useEffect(() => {
    const supabase = createClient();
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

    return () => {
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
      className={`sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-2 text-sm ${cls}`}
    >
      {status.level === "error" ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span className="font-medium">{status.text}</span>
      {health?.printing_in_progress && (
        <span className="ml-2 text-xs opacity-70">(stampa in corso…)</span>
      )}
    </div>
  );
}
