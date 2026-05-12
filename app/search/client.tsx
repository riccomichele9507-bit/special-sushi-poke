"use client";

import { useState, useMemo } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DishCard } from "@/components/menu/dish-card";
import { searchDishes, getMostOrderedDishes } from "@/data/menu";

const QUICK_SUGGESTIONS = ["Salmone", "Gamberi", "Vegano", "Spicy", "Tempura", "Mango"];

export function SearchClient() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? searchDishes(query) : []), [query]);
  const popular = useMemo(() => getMostOrderedDishes(), []);

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-4">
      <header className="mb-4">
        <h1 className="font-heading text-2xl font-bold text-ink">Cerca</h1>
        <p className="mt-1 font-sans text-xs text-warm-gray">
          Trova un piatto, ingrediente o caratteristica.
        </p>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca: salmone, vegano, spicy..."
          autoFocus
          className="block h-12 w-full rounded-full bg-paper-warm/60 pl-10 pr-10 font-sans text-base text-ink placeholder:text-warm-gray ring-1 ring-border outline-none transition focus:ring-bamboo/40 focus:bg-paper"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Pulisci ricerca"
            className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-paper-warm/80 text-warm-gray transition hover:bg-paper-warm hover:text-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {!query.trim() && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full bg-paper-warm/60 px-3 py-1.5 text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink hover:ring-bamboo/30"
              >
                {s}
              </button>
            ))}
          </div>

          <section className="mt-7">
            <h2 className="mb-3 flex items-center gap-1.5 font-heading text-base font-semibold text-ink">
              <TrendingUp className="h-3.5 w-3.5 text-bamboo" strokeWidth={2.5} />
              I più ordinati
            </h2>
            <div className="flex flex-col gap-2">
              {popular.map((dish) => (
                <DishCard key={dish.id} dish={dish} variant="row" />
              ))}
            </div>
          </section>
        </>
      )}

      <AnimatePresence mode="wait">
        {query.trim() && (
          <motion.section
            key={query}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <p className="mb-3 font-sans text-xs uppercase tracking-wider text-warm-gray">
              {results.length} {results.length === 1 ? "risultato" : "risultati"}
            </p>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-paper-warm/40 p-8 text-center">
                <p className="font-heading text-base text-ink">Nessun piatto trovato</p>
                <p className="mt-1 font-sans text-xs text-warm-gray">
                  Prova un termine diverso.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="row" />
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
