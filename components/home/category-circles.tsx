"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Salad,
  Sparkles,
  Cherry,
  Fish,
  Wine,
  Utensils,
} from "lucide-react";
import { categories, categoryColors } from "@/data/categories";

const ICONS: Record<string, typeof Package> = {
  box: Package,
  poke: Salad,
  uramaki: Sparkles,
  nigiri: Cherry,
  sashimi: Fish,
  bevande: Wine,
};

const HOME_CATEGORIES = ["box", "poke", "uramaki", "nigiri", "sashimi", "bevande"] as const;

export function CategoryCircles() {
  const items = HOME_CATEGORIES.map((id) => categories.find((c) => c.id === id)).filter(
    (c): c is NonNullable<typeof c> => c !== undefined,
  );

  return (
    <section className="pt-7">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="font-heading text-base font-semibold text-ink">
          Esplora il menu
        </h2>
        <Link
          href="/menu"
          className="font-sans text-[12px] font-medium text-bamboo hover:text-bamboo-deep"
        >
          Vedi tutto →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4">
        {items.map((cat) => {
          const Icon = ICONS[cat.id] ?? Utensils;
          const colors = categoryColors[cat.id];
          return (
            <Link
              key={cat.id}
              href={`/menu#category-${cat.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              <motion.div
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
                style={{
                  backgroundImage: colors
                    ? `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}45 100%)`
                    : undefined,
                  backgroundColor: "var(--color-paper-warm)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 mix-blend-overlay opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5), transparent 60%)",
                  }}
                />
                <Icon
                  className="relative h-7 w-7 text-bamboo-deep transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                />
              </motion.div>
              <span className="font-sans text-[12px] font-medium text-ink text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
