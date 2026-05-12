import { cn } from "@/lib/utils";
import { Flame, Leaf, Sparkle } from "lucide-react";
import type { Dish } from "@/types/dish";

export function DishBadges({
  dish,
  className,
}: {
  dish: Dish;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {dish.isNew && (
        <span className="inline-flex items-center gap-1 rounded-full bg-sushi-red/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sushi-red border border-sushi-red/30">
          <Sparkle className="h-2.5 w-2.5" />
          Novità
        </span>
      )}
      {dish.isVegan && (
        <span
          aria-label="Vegano"
          title="Vegano"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-matcha/15 border border-matcha/40"
        >
          <Leaf className="h-3 w-3 text-matcha" />
        </span>
      )}
      {dish.spicyLevel > 0 && (
        <span
          aria-label={`Piccantezza ${dish.spicyLevel} su 3`}
          title={`Piccantezza ${dish.spicyLevel}/3`}
          className="inline-flex items-center gap-0.5 rounded-full bg-ink/60 px-1.5 py-0.5 border border-sushi-red/30"
        >
          {Array.from({ length: dish.spicyLevel }).map((_, i) => (
            <Flame key={i} className="h-2.5 w-2.5 text-sushi-red fill-sushi-red/40" />
          ))}
        </span>
      )}
    </div>
  );
}
