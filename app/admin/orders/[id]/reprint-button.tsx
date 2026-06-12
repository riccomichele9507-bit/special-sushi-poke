"use client";

import { useTransition } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { reprint } from "@/app/actions/admin/printer";

export function ReprintButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const r = await reprint(orderId);
          if (r.ok) toast.success("Stampa accodata");
          else toast.error(r.error ?? "Ristampa fallita");
        })
      }
      disabled={pending}
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
    >
      <Printer className="h-3.5 w-3.5" />
      {pending ? "..." : "Ristampa"}
    </button>
  );
}
