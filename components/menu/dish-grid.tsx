import { cn } from "@/lib/utils";
import type { Dish } from "@/types/dish";
import { DishCard } from "./dish-card";

export function DishGrid({
  dishes,
  className,
  priority = false,
}: {
  dishes: Dish[];
  className?: string;
  priority?: boolean;
}) {
  if (dishes.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink/30">
        <p className="font-sans text-sm text-white/40">Nessun piatto in questa categoria.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {dishes.map((dish, i) => (
        <DishCard
          key={dish.id}
          dish={dish}
          priority={priority && i === 0}
        />
      ))}
    </div>
  );
}
