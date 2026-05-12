"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Plus } from "lucide-react";
import { toast } from "sonner";
import { dailySpecial, getNextSpecialEnd } from "@/data/specials";
import { getDishById } from "@/data/menu";
import { useCartStore } from "@/store/cart-store";
import { useCartUI } from "@/lib/cart-ui-store";
import { useCountdown, formatCountdownClock } from "@/lib/use-countdown";
import { formatPrice } from "@/lib/format";
import { categoryColors, getCategoryKanji } from "@/data/categories";

export function DailySpecials() {
  const [target, setTarget] = useState<Date | null>(null);
  useEffect(() => {
    setTarget(getNextSpecialEnd());
  }, []);

  const countdown = useCountdown(target ?? new Date());
  const dish = getDishById(dailySpecial.dishId);
  const add = useCartStore((s) => s.add);
  const openCart = useCartUI((s) => s.open);

  if (!dish) return null;

  const discountedCents = Math.round(
    dish.price * (1 - dailySpecial.discountPercent / 100),
  );

  const colors = categoryColors[dish.category];
  const bgFrom = dish.bgFrom ?? colors?.from ?? "#888";
  const bgTo = dish.bgTo ?? colors?.to ?? "#222";

  function handleAdd() {
    add(dish!.id);
    toast.success("Aggiunto al carrello", {
      description: `${dish!.name} · ${dailySpecial.label}`,
      duration: 1600,
    });
    setTimeout(() => openCart(), 220);
  }

  return (
    <section className="px-4 pt-7">
      <h2 className="mb-3 font-heading text-base font-semibold text-ink">
        Offerta del giorno
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3 overflow-hidden rounded-2xl bg-paper p-3 shadow-[0_4px_18px_-6px_rgba(28,28,28,0.1)] ring-1 ring-border"
      >
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-border"
          style={{
            backgroundImage: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center font-heading text-3xl text-paper/40">
            {getCategoryKanji(dish.category)}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 mix-blend-overlay opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4), transparent 55%)",
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-sushi-red/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sushi-red">
            {dailySpecial.badgeLabel}
          </span>
          <p className="mt-1 truncate font-heading text-base font-semibold text-ink">
            {dish.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-warm-gray">
            <Timer className="h-3 w-3 text-sushi-red" strokeWidth={2.5} />
            <span className="tabular-nums font-medium text-ink">
              Termina tra {target ? formatCountdownClock(countdown) : "—"}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-base font-bold text-bamboo tabular-nums">
              {formatPrice(discountedCents)}
            </span>
          </div>
          <span className="text-[10px] text-warm-gray line-through tabular-nums">
            {formatPrice(dish.price)}
          </span>
          <motion.button
            type="button"
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 460, damping: 18 }}
            className="mt-1 inline-flex h-7 items-center gap-1 rounded-full bg-bamboo px-2.5 text-[11px] font-semibold text-paper shadow-[0_2px_10px_-2px_rgba(90,122,100,0.5)] hover:bg-bamboo-deep"
            aria-label={`Aggiungi ${dish.name} al carrello`}
          >
            <Plus className="h-3 w-3" strokeWidth={2.8} />
            Aggiungi
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
