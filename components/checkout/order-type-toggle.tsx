"use client";

import { Bike, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/types/checkout";

const options: { id: OrderType; label: string; sub: string; icon: typeof Bike }[] = [
  { id: "delivery", label: "Consegna a domicilio", sub: "Riceverai a casa", icon: Bike },
  { id: "pickup", label: "Ritiro in negozio", sub: "Vieni a prenderlo", icon: ShoppingBag },
];

export function OrderTypeToggle({
  value,
  onValueChange,
}: {
  value: OrderType;
  onValueChange: (value: OrderType) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Modalità d'ordine"
      className="grid grid-cols-2 gap-2 rounded-full bg-paper-warm/40 p-1 ring-1 ring-border"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            key={opt.id}
            onClick={() => onValueChange(opt.id)}
            className={cn(
              "relative inline-flex items-center justify-center gap-2.5 rounded-full px-4 py-3 font-sans text-sm font-medium transition-all",
              selected
                ? "bg-bamboo text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)]"
                : "text-warm-gray hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={selected ? 2.25 : 1.75} />
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">{opt.id === "delivery" ? "Consegna" : "Ritiro"}</span>
          </button>
        );
      })}
    </div>
  );
}
