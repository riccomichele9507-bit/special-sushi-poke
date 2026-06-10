"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteClosure } from "@/app/actions/admin/closures";

export function ClosureDeleteButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Rimuovere la chiusura "${label}"?`)) return;
        startTransition(async () => {
          const r = await deleteClosure(id);
          if (!r.ok) toast.error(r.error);
          else toast.success("Chiusura rimossa");
        });
      }}
      className="text-sushi-red text-xs hover:underline"
    >
      Rimuovi
    </button>
  );
}
