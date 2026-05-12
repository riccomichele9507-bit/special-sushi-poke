"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Price } from "@/components/shared/price";
import type { CartItemWithDish } from "@/types/cart";

export function CartItemRow({
  item,
  isLast = false,
}: {
  item: CartItemWithDish;
  isLast?: boolean;
}) {
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 py-4",
        !isLast &&
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-gold/20 after:to-transparent",
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
        <Image
          src={item.dish.image}
          alt={item.dish.imageAlt}
          fill
          sizes="80px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading text-sm font-semibold leading-tight text-paper">
            {item.dish.name}
          </h4>
          <button
            type="button"
            onClick={() => remove(item.dish.id)}
            aria-label={`Rimuovi ${item.dish.name} dal carrello`}
            className="-mr-1 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-paper/[0.06] hover:text-paper"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <p className="text-xs text-white/45">
          <Price cents={item.dish.price} size="sm" /> · cad.
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-full bg-paper/[0.04] p-0.5 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => decrement(item.dish.id)}
              aria-label="Diminuisci quantità"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/[0.08] active:scale-90"
            >
              <Minus className="h-3 w-3" strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.25rem] text-center font-sans text-sm font-medium tabular-nums text-paper">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(item.dish.id)}
              aria-label="Aumenta quantità"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-paper/80 transition hover:bg-paper/[0.08] active:scale-90"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
          <Price cents={item.lineTotal} size="md" accent />
        </div>
      </div>
    </div>
  );
}
