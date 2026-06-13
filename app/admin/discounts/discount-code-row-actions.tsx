"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  toggleDiscountCode,
  deleteDiscountCode,
} from "@/app/actions/admin/discount-codes";

export function DiscountCodeRowActions({
  code,
  active,
}: {
  code: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await toggleDiscountCode(code, !active);
            if (!r.ok) toast.error(r.error);
            else toast.success(active ? "Disattivato" : "Attivato");
          })
        }
        className="text-bamboo-deep text-xs hover:underline"
      >
        {active ? "Disattiva" : "Attiva"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Eliminare definitivamente il codice "${code}"?`)) return;
          startTransition(async () => {
            const r = await deleteDiscountCode(code);
            if (!r.ok) toast.error(r.error);
            else toast.success("Codice eliminato");
          });
        }}
        className="text-sushi-red text-xs hover:underline"
      >
        Elimina
      </button>
    </div>
  );
}
