import type { Metadata } from "next";
import { MenuTabClient } from "./client";
import { AutoApplyDiscount } from "@/components/cart/auto-apply-discount";

export const metadata: Metadata = {
  title: "Menu",
  description: "Il nostro menu completo: poke bowls, sushi, sashimi, tempura e tanto altro.",
};

export default function MenuPage() {
  return (
    <>
      <AutoApplyDiscount />
      <MenuTabClient />
    </>
  );
}
