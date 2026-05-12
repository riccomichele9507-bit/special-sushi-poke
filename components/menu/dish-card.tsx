import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Dish } from "@/types/dish";
import { DishBadges } from "./dish-badges";
import { AddToCartButton } from "./add-to-cart-button";
import { Price } from "@/components/shared/price";

export function DishCard({
  dish,
  featured = false,
  className,
  priority = false,
}: {
  dish: Dish;
  featured?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const isHighlight = featured || dish.isFeatured;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-ink/80 backdrop-blur-sm",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]",
        isHighlight
          ? "ring-1 ring-gold/30 hover:ring-gold/60"
          : "ring-1 ring-white/[0.04] hover:ring-white/[0.12]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
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
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
        />
        {isHighlight && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 backdrop-blur-md ring-1 ring-gold/40">
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-gold">
              Signature
            </span>
          </div>
        )}
        <DishBadges dish={dish} className="absolute left-3 top-3" />
        {dish.pieces && (
          <span className="absolute bottom-3 left-3 font-sans text-[11px] uppercase tracking-[0.18em] text-white/70">
            {dish.pieces} pz
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-2 px-4 pb-4 pt-4">
        <h3 className="font-heading text-lg font-semibold leading-tight text-paper">
          {dish.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-snug text-white/55">
          {dish.ingredients.join(" · ")}
        </p>

        <div className="mt-2 flex items-end justify-between gap-3 pt-2">
          <Price cents={dish.price} size="lg" accent />
          <AddToCartButton
            dishId={dish.id}
            dishName={dish.name}
            className="-mr-1"
          />
        </div>
      </div>

      {isHighlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
      )}
    </article>
  );
}
