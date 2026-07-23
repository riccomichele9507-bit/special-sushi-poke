"use client";

import { useState, useTransition } from "react";
import { confirmUnsubscribe } from "@/app/actions/unsubscribe";

export function UnsubscribeConfirm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div className="rounded-xl bg-bamboo/10 p-4 text-center text-sm text-bamboo-deep">
        Iscrizione annullata. Non riceverai più email promozionali.
        <br />
        Puoi comunque ordinare quando vuoi dal nostro menu.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-warm-gray">
        Vuoi annullare l&apos;iscrizione alle email promozionali per{" "}
        <strong className="text-ink">{email}</strong>?
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await confirmUnsubscribe(email, token);
            if (r.ok) {
              setState("done");
            } else {
              setError(r.error);
              setState("error");
            }
          })
        }
        className="rounded-full bg-bamboo px-6 py-2 text-sm font-semibold text-paper hover:bg-bamboo/90 disabled:opacity-50"
      >
        {pending ? "Attendi…" : "Conferma disiscrizione"}
      </button>
      {state === "error" && (
        <p className="text-xs text-sushi-red">{error ?? "Errore, riprova."}</p>
      )}
    </div>
  );
}
