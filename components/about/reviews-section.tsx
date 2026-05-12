import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { reviews } from "@/data/reviews";
import { ReviewCard } from "./review-card";

export function ReviewsSection() {
  return (
    <section className="relative bg-ink py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Recensioni"
          title="Cosa dicono i clienti"
          description="Il riscontro che riceviamo ogni giorno, da chi ordina e da chi torna."
          kanji="心"
        />

        <div className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </Container>
    </section>
  );
}
