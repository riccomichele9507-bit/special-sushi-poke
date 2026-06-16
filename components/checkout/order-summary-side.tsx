"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import {
  useCartHydrated,
  useCartItemsWithDish,
} from "@/store/cart-store";
import { CartSummary } from "@/components/cart/cart-summary";
import { Price } from "@/components/shared/price";
import { categoryColors, getCategoryKanji } from "@/data/categories";

export function OrderSummarySide() {
  const hydrated = useCartHydrated();
  const items = useCartItemsWithDish();

  if (!hydrated) {
    return (
      <div className="rounded-2xl bg-paper ring-1 ring-border p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-paper-warm" />
      </div>
    );
  }

  return (
    <aside className="sticky top-24 rounded-2xl bg-paper ring-1 ring-border p-5 sm:p-6 shadow-[0_4px_18px_-6px_rgba(28,28,28,0.06)]">
      <div className="mb-5 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-bamboo" strokeWidth={1.75} />
        <h2 className="font-heading text-base font-semibold uppercase tracking-[0.18em] text-ink">
          Il tuo ordine
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-warm-gray">Il carrello è vuoto.</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border">
            {items.map((item) => {
              const colors = categoryColors[item.dish.category];
              const bgFrom = item.dish.bgFrom ?? colors?.from ?? "#888";
              const bgTo = item.dish.bgTo ?? colors?.to ?? "#222";
              return (
                <li
                  key={item.dish.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md ring-1 ring-border"
                    style={{
                      backgroundImage: item.dish.image
                        ? undefined
                        : `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
                    }}
                  >
                    {item.dish.image ? (
                      <Image
                        src={item.dish.image}
                        alt={item.dish.imageAlt}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-heading text-xl text-paper/40">
                        {getCategoryKanji(item.dish.category)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-ink">
                      {item.dish.name}
                    </p>
                    <p className="text-xs text-warm-gray">
                      {item.quantity} × <Price cents={item.dish.price} size="sm" />
                    </p>
                  </div>
                  <Price cents={item.lineTotal} size="md" className="!text-bamboo font-bold" />
                </li>
              );
            })}
          </ul>
          <div className="mt-5 border-t border-border pt-5">
            <CartSummary showPickupNote />
          </div>
        </>
      )}
    </aside>
  );
}
