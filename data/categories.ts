import type { Category } from "@/types/dish";

export const categories: Category[] = [
  { id: "poke", label: "Poke Bowls", slug: "poke-bowls", available: true, iconName: "Salad" },
  { id: "special-rolls", label: "Special Rolls", slug: "special-rolls", available: true, iconName: "Sparkles" },
  { id: "uramaki", label: "Uramaki", slug: "uramaki", available: true, iconName: "Circle" },
  { id: "sashimi", label: "Sashimi", slug: "sashimi", available: true, iconName: "Fish" },
  { id: "nigiri", label: "Nigiri", slug: "nigiri", available: false, iconName: "Cherry" },
  { id: "antipasti", label: "Antipasti", slug: "antipasti", available: false, iconName: "Soup" },
  { id: "bevande", label: "Bevande", slug: "bevande", available: false, iconName: "Wine" },
  { id: "dolci", label: "Dolci", slug: "dolci", available: false, iconName: "IceCream" },
];

export const availableCategories = categories.filter((c) => c.available);

export function getCategoryById(id: string) {
  return categories.find((c) => c.id === id);
}
