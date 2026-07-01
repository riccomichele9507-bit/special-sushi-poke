import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { DishCard } from "@/components/menu/dish-card";
import { getFeaturedDishes } from "@/lib/menu-registry";

export function FeaturedDishes() {
  const featured = getFeaturedDishes();

  return (
    <section className="relative bg-ink py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Selezione del giorno"
          title="I piatti che ci rappresentano"
          description="Tre piatti che raccontano la nostra cucina: poke freschi, signature rolls e sashimi tagliato al momento."
          kanji="季"
        />

        <div className="mt-12 grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((dish, i) => (
            <DishCard key={dish.id} dish={dish} priority={i === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}
