"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartCount, useCartHydrated } from "@/store/cart-store";
import { useCartUI } from "@/lib/cart-ui-store";

export function CartIcon({ className }: { className?: string }) {
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const openDrawer = useCartUI((s) => s.open);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={
        hydrated && count > 0
          ? `Apri carrello, ${count} ${count === 1 ? "articolo" : "articoli"}`
          : "Apri carrello"
      }
      className={cn(
        "group relative inline-flex h-11 w-11 items-center justify-center rounded-full",
        "ring-1 ring-white/10 bg-ink/40 backdrop-blur-md",
        "transition-all duration-200 hover:ring-gold/40 hover:bg-ink/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        className,
      )}
    >
      <ShoppingBag
        className="h-[18px] w-[18px] text-paper transition-transform duration-200 group-hover:scale-105"
        strokeWidth={1.75}
      />
      {hydrated && count > 0 && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sushi-red px-1 font-sans text-[10px] font-semibold leading-none text-paper ring-2 ring-ink"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
