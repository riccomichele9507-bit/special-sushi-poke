import type { Metadata } from "next";
import { MenuTabClient } from "./client";

export const metadata: Metadata = {
  title: "Menu",
  description: "Il nostro menu completo: poke bowls, sushi, sashimi, tempura e tanto altro.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return <MenuTabClient />;
}
