import { Hero } from "@/components/home/hero";
import { UspStrip } from "@/components/home/usp-strip";
import { FeaturedDishes } from "@/components/home/featured-dishes";
import { AboutTeaser } from "@/components/home/about-teaser";
import { ReviewsSection } from "@/components/about/reviews-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <UspStrip />
      <FeaturedDishes />
      <AboutTeaser />
      <ReviewsSection />
    </>
  );
}
