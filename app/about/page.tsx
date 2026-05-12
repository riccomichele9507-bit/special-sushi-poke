import type { Metadata } from "next";
import { ChefSection } from "@/components/about/chef-section";
import { ReviewsSection } from "@/components/about/reviews-section";
import { MapEmbed } from "@/components/about/map-embed";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "La storia di Special Sushi Poke a Bari: lo chef, le materie prime pugliesi e la tecnica giapponese.",
};

export default function AboutPage() {
  return (
    <>
      <ChefSection />
      <ReviewsSection />
      <MapEmbed />
    </>
  );
}
