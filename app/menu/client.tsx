"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { DishCard } from "@/components/menu/dish-card";
import { categories } from "@/data/categories";
import { menu, getDishesByCategory, searchDishes } from "@/data/menu";

export function MenuTabClient() {
  const [query, setQuery] = useState("");
  const activeCategories = useMemo(
    () => categories.filter((c) => c.available),
    [],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    return searchDishes(query);
  }, [query]);

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-4">
      <header className="mb-4">
        <h1 className="font-heading text-2xl font-bold text-ink">Menu</h1>
        <p className="mt-1 font-sans text-xs text-warm-gray">
          {menu.length} piatti · {activeCategories.length} categorie
        </p>
      </header>

      <div className="relative mb-2">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un piatto, ingrediente..."
          className="block h-11 w-full rounded-full bg-paper-warm/60 pl-10 pr-10 font-sans text-sm text-ink placeholder:text-warm-gray ring-1 ring-border outline-none transition focus:ring-bamboo/40 focus:bg-paper"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Pulisci ricerca"
            className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-paper-warm/80 text-warm-gray transition hover:bg-paper-warm hover:text-ink"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {filtered ? (
          <motion.section
            key="search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <p className="mb-3 font-sans text-xs uppercase tracking-wider text-warm-gray">
              {filtered.length} risultati per &ldquo;{query}&rdquo;
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-paper-warm/40 p-8 text-center">
                <p className="font-heading text-base text-ink">Nessun piatto trovato</p>
                <p className="mt-1 font-sans text-xs text-warm-gray">
                  Prova con un altro nome o ingrediente.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="row" />
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            key="full-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CategoryTabs categories={activeCategories} />

            <div className="mt-6 space-y-10">
              {activeCategories.map((cat) => {
                const dishes = getDishesByCategory(cat.id);
                if (dishes.length === 0) return null;
                return (
                  <section
                    key={cat.id}
                    id={`category-${cat.slug}`}
                    className="scroll-mt-36"
                  >
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h2 className="font-heading text-lg font-bold text-ink">
                        {cat.label}
                      </h2>
                      <span className="font-sans text-[11px] uppercase tracking-wider text-warm-gray">
                        {dishes.length} {dishes.length === 1 ? "piatto" : "piatti"}
                      </span>
                    </div>
                    {cat.id === "poke" && (
                      <Link
                        href="/menu/crea-la-tua-poke"
                        className="mb-3 block rounded-2xl border border-bamboo/40 bg-gradient-to-br from-bamboo/15 via-paper to-sakura/10 p-4 transition hover:from-bamboo/25"
                      >
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 h-12 w-12 rounded-full bg-bamboo/20 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-bamboo" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-base font-bold text-ink leading-tight">
                              Crea la tua poke
                            </p>
                            <p className="font-sans text-xs text-warm-gray mt-0.5">
                              Base, proteine, condimenti, topping e salse a scelta
                            </p>
                          </div>
                          <span className="shrink-0 text-bamboo text-xl leading-none">
                            →
                          </span>
                        </div>
                      </Link>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {dishes.map((dish) => (
                        <DishCard key={dish.id} dish={dish} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
