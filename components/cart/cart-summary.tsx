"use client";

import { Clock } from "lucide-react";
import { useCartTotal } from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";
import { Price } from "@/components/shared/price";

export function CartSummary({ showPickupNote = true }: { showPickupNote?: boolean }) {
  const subtotal = useCartTotal();
  const discountCode = usePricing((s) => s.discountCode);
  const tipCents = usePricing((s) => s.tipCents);

  const discountCents = discountCode
    ? Math.round((subtotal * discountCode.percent) / 100)
    : 0;
  const total = Math.max(0, subtotal - discountCents) + tipCents;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-warm-gray">
        <span>Subtotale</span>
        <Price cents={subtotal} size="sm" className="!text-ink" />
      </div>
      {discountCents > 0 && discountCode && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bamboo-deep">
            Sconto <span className="font-mono">{discountCode.code}</span> (−{discountCode.percent}%)
          </span>
          <span className="font-heading font-semibold text-bamboo-deep tabular-nums">
            −<Price cents={discountCents} size="sm" className="!text-bamboo-deep" />
          </span>
        </div>
      )}
      {tipCents > 0 && (
        <div className="flex items-center justify-between text-sm text-warm-gray">
          <span>Mancia staff</span>
          <Price cents={tipCents} size="sm" className="!text-ink" />
        </div>
      )}
      <div className="my-1 h-px bg-border" />
      <div className="flex items-end justify-between">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-warm-gray">
          Totale
        </span>
        <Price cents={total} size="xl" className="!text-bamboo font-bold" />
      </div>
      {showPickupNote && (
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-warm-gray">
          <Clock className="h-3 w-3 text-bamboo" strokeWidth={1.75} />
          Slot di consegna calcolato al checkout
        </p>
      )}
    </div>
  );
}
