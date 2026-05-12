"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import {
  useCartHydrated,
  useCartItemsWithDish,
} from "@/store/cart-store";
import { CartSummary } from "@/components/cart/cart-summary";
import { Price } from "@/components/shared/price";

export function OrderSummarySide() {
  const hydrated = useCartHydrated();
  const items = useCartItemsWithDish();

  if (!hydrated) {
    return (
      <div className="rounded-2xl bg-ink/60 ring-1 ring-white/10 p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-paper/[0.06]" />
      </div>
    );
  }

  return (
    <aside className="sticky top-24 rounded-2xl bg-ink/60 ring-1 ring-white/10 backdrop-blur p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-gold" strokeWidth={1.75} />
        <h2 className="font-heading text-base font-semibold uppercase tracking-[0.2em] text-paper">
          Il tuo ordine
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-white/50">Il carrello è vuoto.</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-white/[0.06]">
            {items.map((item) => (
              <li key={item.dish.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                  <Image
                    src={item.dish.image}
                    alt={item.dish.imageAlt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium text-paper">
                    {item.dish.name}
                  </p>
                  <p className="text-xs text-white/45">
                    {item.quantity} × <Price cents={item.dish.price} size="sm" />
                  </p>
                </div>
                <Price cents={item.lineTotal} size="md" />
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-white/[0.06] pt-5">
            <CartSummary showPickupNote />
          </div>
        </>
      )}
    </aside>
  );
}
