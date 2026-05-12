"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({
  dishId,
  dishName,
  className,
  variant = "floating",
}: {
  dishId: string;
  dishName: string;
  className?: string;
  variant?: "floating" | "inline";
}) {
  const add = useCartStore((s) => s.add);
  const [pulse, setPulse] = useState(false);

  function handleAdd() {
    add(dishId);
    setPulse(true);
    setTimeout(() => setPulse(false), 350);
    toast.success("Aggiunto al carrello", {
      description: dishName,
      duration: 1800,
    });
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Aggiungi ${dishName} al carrello`}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full bg-sushi-red px-5 text-sm font-medium text-paper",
          "transition-all duration-200 active:scale-95",
          "hover:bg-sushi-red/90 hover:shadow-[0_0_24px_rgba(200,16,46,0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sushi-red focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
          pulse && "scale-110",
          className,
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Aggiungi
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Aggiungi ${dishName} al carrello`}
      className={cn(
        "group inline-flex h-11 w-11 items-center justify-center rounded-full bg-sushi-red text-paper",
        "shadow-[0_8px_24px_-8px_rgba(200,16,46,0.6)]",
        "ring-1 ring-inset ring-paper/10",
        "transition-all duration-200 active:scale-90",
        "hover:bg-sushi-red/90 hover:shadow-[0_0_32px_rgba(200,16,46,0.55)] hover:ring-paper/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sushi-red focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        pulse && "scale-110 ring-paper/40",
        className,
      )}
    >
      <Plus
        className={cn(
          "h-5 w-5 transition-transform duration-200 group-hover:rotate-90",
          pulse && "rotate-180",
        )}
        strokeWidth={2.5}
      />
    </button>
  );
}
