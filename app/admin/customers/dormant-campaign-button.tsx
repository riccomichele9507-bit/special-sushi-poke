"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { sendDormantCampaign } from "@/app/actions/admin/marketing";

export function DormantCampaignButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
      <p>
        📨 <strong>Invia la promo di riattivazione</strong> ai clienti dormienti
        che hanno dato consenso marketing (codice <strong>BENTORNATO10</strong>,
        −10%). Ogni cliente la riceve una sola volta al mese.
      </p>
      {done && <p className="font-medium text-bamboo-deep">{done}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Inviare la promo di riattivazione ai clienti dormienti?")) return;
          startTransition(async () => {
            const r = await sendDormantCampaign();
            if (!r.ok) {
              toast.error(r.error);
            } else {
              const msg = `Inviate ${r.sent} email su ${r.eligible} clienti idonei.`;
              setDone(msg);
              toast.success(msg);
            }
          });
        }}
        className="rounded-full bg-bamboo px-4 py-1.5 text-xs font-semibold text-paper hover:bg-bamboo/90 disabled:opacity-50"
      >
        {pending ? "Invio in corso…" : "Invia promo ai dormienti"}
      </button>
    </div>
  );
}
