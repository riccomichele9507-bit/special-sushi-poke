"use client";

import { Clock } from "lucide-react";
import { useCartTotal } from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";
import { Price } from "@/components/shared/price";
import {
  promoConfig,
  computeAutoPromoCents,
  centsToPromo,
} from "@/lib/promo/auto-promo";

export function CartSummary({
  showPickupNote = true,
}: {
  showPickupNote?: boolean;
}) {
  const subtotal = useCartTotal();
  const tipCents = usePricing((s) => s.tipCents);
  const codeLabel = usePricing((s) => s.codeLabel);
  const rawCodeCents = usePricing((s) => s.codeCents);
  const codeForSubtotal = usePricing((s) => s.codeForSubtotalCents);

  const promo = promoConfig();
  const promoCents = computeAutoPromoCents(subtotal, promo);
  const missingCents = centsToPromo(subtotal, promo);

  // Lo sconto del codice vale solo per il subtotale su cui è stato calcolato:
  // se il carrello è cambiato dopo, il valore è stale e va ignorato finché il
  // checkout non lo ricalcola (uno sconto percentuale dipende dal subtotale).
  const codeCents = codeForSubtotal === subtotal ? rawCodeCents : 0;

  // Cumulativi, come fa il server in computeTotals (app/actions/orders.ts).
  const discountCents = Math.min(promoCents + codeCents, subtotal);
  const total = subtotal - discountCents + tipCents;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-warm-gray">
        <span>Subtotale</span>
        <Price cents={subtotal} size="sm" className="!text-ink" />
      </div>

      {promoCents > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bamboo-deep font-medium">
            Promo {promo.percent}% su tutto
          </span>
          <span className="font-heading font-semibold text-bamboo-deep tabular-nums">
            −<Price cents={promoCents} size="sm" className="!text-bamboo-deep" />
          </span>
        </div>
      )}

      {codeCents > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bamboo-deep font-medium">
            Codice {codeLabel}
          </span>
          <span className="font-heading font-semibold text-bamboo-deep tabular-nums">
            −<Price cents={codeCents} size="sm" className="!text-bamboo-deep" />
          </span>
        </div>
      )}

      {missingCents > 0 && subtotal > 0 && (
        <p className="flex items-center gap-1 rounded-lg bg-gold/10 px-2.5 py-1.5 text-[11px] text-bamboo-deep">
          🎁 Aggiungi{" "}
          <Price cents={missingCents} size="sm" className="!text-bamboo-deep font-semibold" />{" "}
          e ottieni il {promo.percent}% di sconto su tutto
        </p>
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
