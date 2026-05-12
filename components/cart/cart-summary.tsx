"use client";

import { Clock } from "lucide-react";
import { useCartTotal } from "@/store/cart-store";
import { Price } from "@/components/shared/price";

export function CartSummary({ showPickupNote = true }: { showPickupNote?: boolean }) {
  const total = useCartTotal();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm uppercase tracking-[0.2em] text-white/55">
          Totale
        </span>
        <Price cents={total} size="xl" accent />
      </div>
      {showPickupNote && (
        <p className="flex items-center gap-2 text-xs text-white/50">
          <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
          Ritiro in negozio pronto in circa 30 minuti
        </p>
      )}
    </div>
  );
}
