"use client";

import { useState, useTransition } from "react";
import { sendTestEmail, type EmailTestResult } from "@/app/actions/admin/email-test";

export function EmailTestButton() {
  const [pending, startTransition] = useTransition();
  const [to, setTo] = useState("riccomichele9507@gmail.com");
  const [res, setRes] = useState<EmailTestResult | null>(null);

  return (
    <div className="rounded-lg border border-bamboo/20 p-3 text-sm space-y-2">
      <p className="font-semibold text-ink">🔧 Diagnostica email (Resend)</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex h-9 flex-1 min-w-[200px] rounded-md border border-border px-3 text-sm"
          placeholder="email destinatario test"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => setRes(await sendTestEmail(to)))
          }
          className="rounded-full bg-bamboo px-4 py-1.5 text-xs font-semibold text-paper hover:bg-bamboo/90 disabled:opacity-50"
        >
          {pending ? "Invio…" : "Invia email di test"}
        </button>
      </div>
      {res && (
        <div
          className={`rounded p-2 text-xs ${res.ok ? "bg-bamboo/10 text-bamboo-deep" : "bg-sushi-red/10 text-sushi-red"}`}
        >
          <div>Esito: <strong>{res.ok ? "OK" : "ERRORE"}</strong></div>
          <div>API key presente: <strong>{res.configured ? "sì" : "NO"}</strong></div>
          <div>Mittente (FROM): <code>{res.from}</code></div>
          <div>Dettaglio: {res.detail}</div>
        </div>
      )}
    </div>
  );
}
