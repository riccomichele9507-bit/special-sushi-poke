"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleManualPause } from "@/app/actions/admin/restaurant";

/**
 * Toggle istantaneo "Pausa ordini ORA" per la dashboard admin: un clic
 * blocca/sblocca subito gli ordini, senza cambiare pagina. Aggiorna il DB
 * (restaurant_settings.manual_pause) e revalida home/checkout.
 */
export function PauseToggleButton({ paused: initial }: { paused: boolean }) {
  const [paused, setPaused] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    const next = !paused;
    startTransition(async () => {
      const res = await toggleManualPause(next);
      if (res.ok) {
        setPaused(next);
        toast.success(next ? "Ordini messi IN PAUSA" : "Ordini RIATTIVATI", {
          description: next
            ? "Il sito ora rifiuta i nuovi ordini."
            : "Il sito accetta di nuovo gli ordini.",
          duration: 2500,
        });
        router.refresh();
      } else {
        toast.error("Operazione non riuscita", { description: res.error });
      }
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        paused ? "border-sushi-red bg-sushi-red/5" : "border-bamboo/20 bg-paper",
      )}
    >
      <p className="font-semibold text-ink">Pausa ordini ORA</p>
      <p className="mt-0.5 text-sm text-warm-gray">
        {paused
          ? "🔴 Ordini IN PAUSA: il sito li sta rifiutando."
          : "🟢 Ordini attivi: il sito accetta ordini."}
      </p>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={paused}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-paper transition disabled:opacity-60",
          paused
            ? "bg-bamboo hover:bg-bamboo-deep"
            : "bg-sushi-red hover:bg-sushi-red/90",
        )}
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        {isPending
          ? "Attendi…"
          : paused
            ? "Riattiva ordini"
            : "Metti in pausa"}
      </button>
    </div>
  );
}
