"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
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
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sushi-red/40 px-3 py-2 text-xs font-semibold text-sushi-red hover:bg-sushi-red/10 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "..." : "Rimuovi"}
    </button>
  );
}
