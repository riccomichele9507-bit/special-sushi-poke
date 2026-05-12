import { HeroCard } from "@/components/home/hero-card";
import { DailySpecials } from "@/components/home/daily-specials";
import { ChefRecommendations } from "@/components/home/chef-recommendations";
import { CategoryCircles } from "@/components/home/category-circles";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md pb-6">
      <HeroCard />
      <DailySpecials />
      <ChefRecommendations />
      <CategoryCircles />
    </div>
  );
}
