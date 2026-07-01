"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore, useCartItemsWithDish } from "@/store/cart-store";
import { getDishById } from "@/lib/menu-registry";
import { getCategoryKanji } from "@/data/categories";
import { Price } from "@/components/shared/price";
import type { Dish } from "@/types/dish";

const UPSELL_IDS = ["coca-cola", "acai-smoothie"] as const;

function UpsellChip({ dish }: { dish: Dish }) {
  const add = useCartStore((s) => s.add);

  function handleAdd() {
    add(dish.id);
    toast.success("Aggiunto", { description: dish.name, duration: 1400 });
  }

  return (
    <motion.button
      type="button"
      onClick={handleAdd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="group relative flex flex-1 items-center gap-2 overflow-hidden rounded-xl ring-1 ring-border bg-paper p-2 text-left transition hover:ring-bamboo/40"
      aria-label={`Aggiungi ${dish.name} al carrello`}
    >
      <span
        aria-hidden
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-border"
        style={
          dish.image
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, ${dish.bgFrom ?? "#444"} 0%, ${dish.bgTo ?? "#111"} 100%)`,
              }
        }
      >
        {dish.image ? (
          <Image
            src={dish.image}
            alt={dish.imageAlt}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-heading text-lg text-white/40">
            {getCategoryKanji(dish.category)}
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-heading text-sm font-semibold text-ink">
          {dish.name}
        </p>
        <Price cents={dish.price} size="sm" className="mt-0.5 !text-bamboo font-bold" />
      </div>
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bamboo text-paper transition group-hover:bg-bamboo-deep group-hover:shadow-[0_0_18px_rgba(90,122,100,0.45)]">
        <Plus className="h-3 w-3" strokeWidth={2.8} />
      </span>
    </motion.button>
  );
}

export function CartUpsell() {
  const items = useCartItemsWithDish();
  if (items.length === 0) return null;

  const inCart = new Set(items.map((i) => i.dish.id));
  const suggestions = UPSELL_IDS.map((id) => getDishById(id)).filter(
    (d): d is Dish => !!d && !inCart.has(d.id),
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2 rounded-2xl border border-sakura/40 bg-sakura/15 p-3">
      <div className="flex items-center justify-between">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-sakura-deep">
          Una bevanda?
        </p>
        <span
          aria-hidden
          className="font-heading text-[10px] uppercase tracking-[0.14em] text-sakura-deep/70"
        >
          da €3
        </span>
      </div>
      <div className="flex gap-2">
        {suggestions.map((dish) => (
          <UpsellChip key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}
