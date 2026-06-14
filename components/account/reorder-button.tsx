"use client";

import { useTransition } from "react";
import { Repeat } from "lucide-react";
import { toast } from "sonner";
import { reorderFromOrder } from "@/app/actions/reorder";
import { useCartStore } from "@/store/cart-store";
import { useCartUI } from "@/lib/cart-ui-store";

export function ReorderButton({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition();

  // Accesso diretto allo store (non hook reattivo: ci serve solo per scrivere)
  function handleReorder(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await reorderFromOrder(orderNumber);
      if (!result.ok) {
        toast.error(result.errorMessage);
        return;
      }
      if (result.items.length === 0) {
        toast.error("Nessuno dei piatti di quest'ordine è più disponibile.");
        return;
      }
      // Sostituisci carrello attuale con quelli dell'ordine
      const store = useCartStore.getState();
      store.clear();
      for (const item of result.items) {
        if (item.custom) {
          store.addCustomPoke(item.custom);
        } else {
          for (let i = 0; i < item.quantity; i++) store.add(item.dishId);
        }
      }
      if (result.unavailableCount > 0) {
        toast.warning(
          `${result.unavailableCount} piatto${result.unavailableCount > 1 ? "i" : ""} non più disponibili — saltato${result.unavailableCount > 1 ? "i" : ""}.`,
        );
      }
      toast.success("Carrello pronto!", {
        description: "Controlla e vai al checkout.",
      });
      // Apri il carrello (drawer), NON il menu
      useCartUI.getState().open();
    });
  }

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full bg-bamboo/10 px-2.5 py-1 text-[11px] font-medium text-bamboo hover:bg-bamboo/20 disabled:opacity-50"
    >
      <Repeat className="h-3 w-3" />
      {pending ? "..." : "Riordina"}
    </button>
  );
}
