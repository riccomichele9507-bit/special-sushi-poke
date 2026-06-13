"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { categories } from "@/data/categories";

interface CategoryHero {
  id: string;
  imageSrc: string;
  imageAlt: string;
}

/**
 * Mapping categoria → foto piatto rappresentativo per il "thumb" della home.
 * Usa foto vere del menu (no piu' icone Lucide generiche).
 */
const CATEGORY_HEROES: Record<string, CategoryHero> = {
  box: {
    id: "box",
    imageSrc: "/menu/box-50.png",
    imageAlt: "Box 50 pezzi assortito",
  },
  poke: {
    id: "poke",
    imageSrc: "/menu/poke-fresh.png",
    imageAlt: "Poke Fresh colorata",
  },
  uramaki: {
    id: "uramaki",
    imageSrc: "/menu/uramaki-dragon.png",
    imageAlt: "Uramaki Dragon",
  },
  nigiri: {
    id: "nigiri",
    imageSrc: "/menu/nigiri-salmon.png",
    imageAlt: "Nigiri salmone",
  },
  sashimi: {
    id: "sashimi",
    imageSrc: "/menu/sashimi-salmon.png",
    imageAlt: "Sashimi salmone",
  },
  bevande: {
    id: "bevande",
    imageSrc: "/menu/coca-cola.png",
    imageAlt: "Bevande fredde",
  },
};

const HOME_CATEGORIES = [
  "box",
  "poke",
  "uramaki",
  "nigiri",
  "sashimi",
  "bevande",
] as const;

export function CategoryCircles() {
  const items = HOME_CATEGORIES.map((id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return null;
    const hero = CATEGORY_HEROES[id];
    return { cat, hero };
  }).filter((x): x is { cat: NonNullable<typeof x>["cat"]; hero: CategoryHero } => x !== null);

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
        {items.map(({ cat, hero }) => (
          <Link
            key={cat.id}
            href={`/menu#category-${cat.slug}`}
            className="group flex flex-col items-center gap-2"
          >
            <motion.div
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04, y: -2 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="relative h-22 w-22 sm:h-24 sm:w-24 overflow-hidden rounded-full ring-2 ring-paper shadow-[0_6px_20px_-8px_rgba(28,28,28,0.25)] ring-offset-1 ring-offset-bamboo/15"
              style={{ height: "5.5rem", width: "5.5rem" }}
            >
              <Image
                src={hero.imageSrc}
                alt={hero.imageAlt}
                fill
                sizes="(max-width: 480px) 90px, 96px"
                className="object-cover transition duration-300 group-hover:scale-110"
              />
              {/* Overlay subtle per profondità */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-ink/15 via-transparent to-transparent"
              />
            </motion.div>
            <span className="font-sans text-[12px] font-semibold text-ink text-center leading-tight">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
