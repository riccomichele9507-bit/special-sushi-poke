"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { getDishById } from "@/data/menu";
import { useCartStore } from "@/store/cart-store";
import { useDishDetail } from "@/lib/dish-detail-store";
import { formatPrice } from "@/lib/format";
import { categoryColors, getCategoryKanji } from "@/data/categories";
import type { Dish } from "@/types/dish";

interface Recommendation {
  dishId: string;
  rating: number;
  reviewCount: number;
}

const recommendations: Recommendation[] = [
  { dishId: "uramaki-sakura", rating: 4.9, reviewCount: 128 },
  { dishId: "box-50", rating: 4.8, reviewCount: 96 },
  { dishId: "poke-fresh", rating: 4.7, reviewCount: 184 },
];

function RankedCard({
  dish,
  rating,
  rank,
}: {
  dish: Dish;
  rating: number;
  rank: number;
}) {
  const add = useCartStore((s) => s.add);
  const openDetail = useDishDetail((s) => s.open);
  const colors = categoryColors[dish.category];
  const bgFrom = dish.bgFrom ?? colors?.from ?? "#888";
  const bgTo = dish.bgTo ?? colors?.to ?? "#222";

  function handleAdd() {
    add(dish.id);
    toast.success("Aggiunto al carrello", { description: dish.name, duration: 1500 });
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={() => openDetail(dish.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(dish.id);
        }
      }}
      className="relative w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-paper ring-1 ring-border shadow-[0_4px_16px_-6px_rgba(28,28,28,0.08)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo/50"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {dish.image ? (
          <Image
            src={dish.image}
            alt={dish.imageAlt}
            fill
            sizes="180px"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center font-heading text-5xl text-paper/30">
              {getCategoryKanji(dish.category)}
            </span>
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper font-heading text-xs font-bold text-ink shadow-sm ring-1 ring-border">
          {rank}
        </span>
        <span className="absolute right-2 bottom-2 inline-flex items-center gap-0.5 rounded-full bg-ink/85 px-1.5 py-0.5 text-[10px] font-semibold text-paper backdrop-blur">
          <Star className="h-2.5 w-2.5 fill-gold text-gold" />
          {rating.toFixed(1)}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-ink">
            {dish.name}
          </p>
          <p className="font-sans text-[11px] tabular-nums text-warm-gray">
            {formatPrice(dish.price)}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 460, damping: 18 }}
          aria-label={`Aggiungi ${dish.name} al carrello`}
          className="inline-flex h-7 items-center gap-0.5 rounded-full bg-bamboo px-2 text-[11px] font-semibold text-paper hover:bg-bamboo-deep"
        >
          <Plus className="h-3 w-3" strokeWidth={2.8} />
          Ordina
        </motion.button>
      </div>
    </motion.article>
  );
}

export function ChefRecommendations() {
  const items = recommendations
    .map((r) => {
      const dish = getDishById(r.dishId);
      return dish ? { ...r, dish } : null;
    })
    .filter((x): x is Recommendation & { dish: Dish } => x !== null);

  if (items.length === 0) return null;

  return (
    <section className="pt-7">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="font-heading text-base font-semibold text-ink">
          I consigli dello chef
        </h2>
        <span className="font-sans text-[11px] uppercase tracking-wider text-warm-gray">
          Top {items.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, idx) => (
          <RankedCard
            key={item.dishId}
            dish={item.dish}
            rating={item.rating}
            rank={idx + 1}
          />
        ))}
      </div>
    </section>
  );
}
