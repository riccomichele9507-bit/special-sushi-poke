"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Price } from "@/components/shared/price";
import { categoryColors, getCategoryKanji } from "@/data/categories";
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

  const colors = categoryColors[item.dish.category];
  const bgFrom = item.dish.bgFrom ?? colors?.from ?? "#888";
  const bgTo = item.dish.bgTo ?? colors?.to ?? "#222";

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 py-4",
        !isLast && "border-b border-border",
      )}
    >
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-border"
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
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl text-paper/40">
            {getCategoryKanji(item.dish.category)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading text-sm font-semibold leading-tight text-ink">
            {item.dish.name}
          </h4>
          <button
            type="button"
            onClick={() => remove(item.dish.id)}
            aria-label={`Rimuovi ${item.dish.name} dal carrello`}
            className="-mr-1 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-warm-gray transition hover:bg-paper-warm hover:text-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <p className="text-[11px] text-warm-gray">
          <Price cents={item.dish.price} size="sm" /> cad.
        </p>
        <div className="mt-0.5 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-full bg-paper-warm/50 p-0.5 ring-1 ring-border">
            <button
              type="button"
              onClick={() => decrement(item.dish.id)}
              aria-label="Diminuisci quantità"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink transition hover:bg-paper active:scale-90"
            >
              <Minus className="h-3 w-3" strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.25rem] text-center font-sans text-sm font-semibold tabular-nums text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(item.dish.id)}
              aria-label="Aumenta quantità"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink transition hover:bg-paper active:scale-90"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
          <Price cents={item.lineTotal} size="md" className="!text-bamboo font-bold" />
        </div>
      </div>
    </div>
  );
}
