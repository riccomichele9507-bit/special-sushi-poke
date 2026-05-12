import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { KanjiOrnament } from "@/components/shared/kanji-ornament";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { DishGrid } from "@/components/menu/dish-grid";
import { categories } from "@/data/categories";
import { getDishesByCategory } from "@/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Il nostro menu di sushi e poke d'asporto a Bari: poke bowls, special rolls, uramaki e sashimi.",
};

export default function MenuPage() {
  return (
    <div className="relative bg-ink pb-20">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-ink pt-24 pb-12 sm:pt-28 sm:pb-16">
        <KanjiOrnament
          char="献"
          className="absolute -right-12 -top-8 text-[20rem] leading-none text-gold/[0.05]"
        />
        <Container>
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold/80 font-sans">
            Il menu
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-paper">
            Ordina il tuo asporto
          </h1>
          <p className="mt-5 max-w-xl font-sans text-base sm:text-lg text-white/65">
            Cinque piatti che raccontano la nostra cucina. Ne arriveranno presto altri,
            ma per ora abbiamo scelto i nostri preferiti.
          </p>
        </Container>
      </section>

      <Container>
        <CategoryTabs categories={categories} />

        <div className="mt-12 space-y-20">
          {categories
            .filter((c) => c.available)
            .map((cat) => {
              const dishes = getDishesByCategory(cat.id);
              if (dishes.length === 0) return null;
              return (
                <section
                  key={cat.id}
                  id={`category-${cat.slug}`}
                  className="scroll-mt-32"
                >
                  <div className="mb-7 flex items-baseline gap-4">
                    <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-paper">
                      {cat.label}
                    </h2>
                    <span className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                    <span className="font-sans text-xs uppercase tracking-[0.22em] text-white/40">
                      {dishes.length}{" "}
                      {dishes.length === 1 ? "piatto" : "piatti"}
                    </span>
                  </div>
                  <DishGrid dishes={dishes} priority={cat.id === categories.find((c) => c.available)?.id} />
                </section>
              );
            })}
        </div>
      </Container>
    </div>
  );
}
