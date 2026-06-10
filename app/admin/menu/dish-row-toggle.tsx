"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleDishActive } from "@/app/actions/admin/dishes";

export function DishRowToggle({
  dishId,
  active,
}: {
  dishId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <label
      className={`inline-flex items-center cursor-pointer ${pending ? "opacity-50" : ""}`}
    >
      <input
        type="checkbox"
        defaultChecked={active}
        disabled={pending}
        onChange={(e) => {
          const next = e.currentTarget.checked;
          startTransition(async () => {
            const r = await toggleDishActive(dishId, next);
            if (!r.ok) {
              toast.error(r.error);
              e.target.checked = active; // revert
            } else {
              toast.success(next ? "Disponibile" : "Esaurito");
            }
          });
        }}
        className="h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
      />
    </label>
  );
}
