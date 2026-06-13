import { HelloHeader } from "@/components/home/hello-header";
import { HeroCard } from "@/components/home/hero-card";
import { DailySpecials } from "@/components/home/daily-specials";
import { ChefRecommendations } from "@/components/home/chef-recommendations";
import { CategoryCircles } from "@/components/home/category-circles";
import { RestaurantLocation } from "@/components/home/restaurant-location";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md pb-6">
      <HelloHeader />
      <HeroCard />
      <DailySpecials />
      <ChefRecommendations />
      <CategoryCircles />
      <RestaurantLocation />
    </div>
  );
}
