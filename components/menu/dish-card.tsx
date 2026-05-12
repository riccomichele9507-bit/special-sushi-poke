"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Dish } from "@/types/dish";
import { DishBadges } from "./dish-badges";
import { AddToCartButton } from "./add-to-cart-button";
import { Price } from "@/components/shared/price";
import { categoryColors, getCategoryKanji } from "@/data/categories";
import { useDishDetail } from "@/lib/dish-detail-store";

export function DishCard({
  dish,
  featured = false,
  className,
  priority = false,
  variant = "card",
}: {
  dish: Dish;
  featured?: boolean;
  className?: string;
  priority?: boolean;
  variant?: "card" | "row";
}) {
  const openDetail = useDishDetail((s) => s.open);
  const isHighlight = featured || dish.isFeatured;
  const colors = categoryColors[dish.category];
  const bgFrom = dish.bgFrom ?? colors?.from ?? "#888";
  const bgTo = dish.bgTo ?? colors?.to ?? "#222";
  const kanji = getCategoryKanji(dish.category);

  function handleCardClick() {
    openDetail(dish.id);
  }

  // Compact row variant for long lists with no photo
  if (variant === "row") {
    return (
      <article
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={cn(
          "group flex items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-border transition hover:ring-bamboo/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo/50",
          className,
        )}
      >
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-border"
          style={{
            backgroundImage: dish.image
              ? undefined
              : `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          }}
        >
          {dish.image ? (
            <Image
              src={dish.image}
              alt={dish.imageAlt}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl text-paper/40">
              {kanji}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-[15px] font-semibold leading-tight text-ink">
              {dish.name}
            </h3>
            <DishBadges dish={dish} />
          </div>
          <p className="mt-0.5 line-clamp-1 font-sans text-[12px] text-warm-gray">
            {dish.ingredients.join(" · ")}
          </p>
          <p className="mt-1 font-heading text-sm font-bold tabular-nums text-bamboo">
            <Price cents={dish.price} size="sm" />
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <AddToCartButton dishId={dish.id} dishName={dish.name} variant="pill" />
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-paper cursor-pointer",
        "transition-all duration-300",
        "shadow-[0_2px_12px_-4px_rgba(28,28,28,0.05)] hover:shadow-[0_8px_28px_-8px_rgba(28,28,28,0.12)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo/50",
        isHighlight
          ? "ring-1 ring-bamboo/40 hover:ring-bamboo/60"
          : "ring-1 ring-border hover:ring-bamboo/30",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {dish.image ? (
          <>
            <Image
              src={dish.image}
              alt={dish.imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center font-heading text-7xl sm:text-8xl text-paper/30 select-none">
              {kanji}
            </span>
            <div
              aria-hidden
              className="absolute bottom-2 right-2 font-heading text-[10px] uppercase tracking-[0.2em] text-paper/50 select-none"
            >
              {dish.name.split(" ")[0]}
            </div>
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-overlay opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4), transparent 55%)",
              }}
            />
          </div>
        )}
        {isHighlight && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-paper/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bamboo-deep ring-1 ring-bamboo/30 backdrop-blur">
            ★ Signature
          </span>
        )}
        <DishBadges dish={dish} className="absolute left-2 top-2" />
        {dish.pieces && (
          <span className="absolute bottom-2 left-2 rounded-full bg-paper/90 px-2 py-0.5 font-sans text-[10px] font-semibold text-ink backdrop-blur">
            {dish.pieces} pz
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        <h3 className="font-heading text-[14px] font-semibold leading-tight text-ink line-clamp-1">
          {dish.name}
        </h3>
        <p className="line-clamp-1 font-sans text-[11px] leading-snug text-warm-gray">
          {dish.ingredients.slice(0, 3).join(" · ")}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Price cents={dish.price} size="md" className="!text-bamboo font-bold" />
          <div onClick={(e) => e.stopPropagation()}>
            <AddToCartButton dishId={dish.id} dishName={dish.name} variant="pill" />
          </div>
        </div>
      </div>
    </article>
  );
}
