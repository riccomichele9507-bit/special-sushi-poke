import { HeroCard } from "@/components/home/hero-card";
import { PromoBanner } from "@/components/home/promo-banner";
import { ChefRecommendations } from "@/components/home/chef-recommendations";
import { CategoryCircles } from "@/components/home/category-circles";
import { RestaurantLocation } from "@/components/home/restaurant-location";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md pb-6">
      {/* HelloHeader rimosso: saluto + avatar ora nel DeliveryLocationBar sticky */}
      <HeroCard />
      <PromoBanner />
      <ChefRecommendations />
      <CategoryCircles />
      <RestaurantLocation />
    </div>
  );
}
