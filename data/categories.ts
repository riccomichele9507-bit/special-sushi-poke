import type { Category } from "@/types/dish";

export const categories: Category[] = [
  { id: "box", label: "Box", slug: "box", available: true, iconName: "Package" },
  { id: "barca", label: "Barca", slug: "barca", available: true, iconName: "Ship" },
  { id: "poke", label: "Poke Bowls", slug: "poke", available: true, iconName: "Salad" },
  { id: "uramaki", label: "Uramaki", slug: "uramaki", available: true, iconName: "Sparkles" },
  { id: "nigiri", label: "Nigiri", slug: "nigiri", available: true, iconName: "Cherry" },
  { id: "sashimi", label: "Sashimi & Tataki", slug: "sashimi", available: true, iconName: "Fish" },
  { id: "temaki", label: "Temaki", slug: "temaki", available: true, iconName: "ChefHat" },
  { id: "hosomaki", label: "Hoso Maki", slug: "hosomaki", available: true, iconName: "Circle" },
  { id: "fritto", label: "Fritti", slug: "fritto", available: true, iconName: "Flame" },
  { id: "onigiri", label: "Onigiri", slug: "onigiri", available: true, iconName: "Wheat" },
  { id: "chirashi", label: "Chirashi", slug: "chirashi", available: true, iconName: "Soup" },
  { id: "tacos", label: "Tacos", slug: "tacos", available: true, iconName: "Sandwich" },
  { id: "tartare", label: "Tartare", slug: "tartare", available: true, iconName: "Beef" },
  { id: "carpaccio", label: "Carpaccio", slug: "carpaccio", available: true, iconName: "Slice" },
  { id: "gunkan", label: "Gunkan", slug: "gunkan", available: true, iconName: "Egg" },
  { id: "tempura", label: "Tempura", slug: "tempura", available: true, iconName: "Drumstick" },
  { id: "antipasti", label: "Antipasti & Ravioli", slug: "antipasti", available: true, iconName: "Cookie" },
  { id: "grigliati", label: "Grigliati", slug: "grigliati", available: true, iconName: "Flame" },
  { id: "yakimesi", label: "Yakimesi", slug: "yakimesi", available: true, iconName: "Wheat" },
  { id: "caldi", label: "Piatti caldi", slug: "caldi", available: true, iconName: "Soup" },
  { id: "bevande", label: "Bevande", slug: "bevande", available: true, iconName: "Wine" },
  { id: "dolci", label: "Dolci", slug: "dolci", available: true, iconName: "IceCream" },
];

export const availableCategories = categories.filter((c) => c.available);

export function getCategoryById(id: string) {
  return categories.find((c) => c.id === id);
}

/** Single kanji per category — used as visual marker on dish cards without photo. */
export const categoryKanji: Record<string, string> = {
  box: "弁",
  barca: "船",
  poke: "丼",
  uramaki: "巻",
  nigiri: "握",
  sashimi: "刺",
  temaki: "手",
  hosomaki: "細",
  fritto: "揚",
  onigiri: "お",
  chirashi: "散",
  tacos: "タ",
  tartare: "切",
  carpaccio: "薄",
  gunkan: "艦",
  tempura: "天",
  antipasti: "餃",
  grigliati: "焼",
  yakimesi: "飯",
  caldi: "温",
  bevande: "飲",
  dolci: "菓",
};

export function getCategoryKanji(categoryId: string): string {
  return categoryKanji[categoryId] ?? "和";
}

/** Gradient palette per category — used as bg for dish cards without photo. */
export const categoryColors: Record<string, { from: string; to: string }> = {
  box: { from: "#d4a574", to: "#8b5a2b" },
  barca: { from: "#a23028", to: "#5a1818" },
  poke: { from: "#c8a165", to: "#6a4a25" },
  uramaki: { from: "#7a5a40", to: "#2a1a10" },
  nigiri: { from: "#e89a80", to: "#a05545" },
  sashimi: { from: "#b04040", to: "#602020" },
  temaki: { from: "#7a9a7a", to: "#3a5a3a" },
  hosomaki: { from: "#5a8aa0", to: "#2a4a60" },
  fritto: { from: "#c89d5a", to: "#6a4a20" },
  onigiri: { from: "#d4c9b0", to: "#8a7a50" },
  chirashi: { from: "#e89880", to: "#a05a45" },
  tacos: { from: "#d05a40", to: "#802a20" },
  tartare: { from: "#a04545", to: "#5a2020" },
  carpaccio: { from: "#e8a5a0", to: "#a05a55" },
  gunkan: { from: "#3a5a4a", to: "#1a3a2a" },
  tempura: { from: "#d4a060", to: "#7a5020" },
  antipasti: { from: "#c8a880", to: "#6a4a30" },
  grigliati: { from: "#5a3a2a", to: "#2a1a10" },
  yakimesi: { from: "#d4c070", to: "#8a7030" },
  caldi: { from: "#d08555", to: "#804020" },
  bevande: { from: "#5a7a64", to: "#2a3a30" },
  dolci: { from: "#e8b8a8", to: "#a86858" },
};

export function getCategoryColors(categoryId: string) {
  return categoryColors[categoryId] ?? { from: "#5a5a55", to: "#2a2a25" };
}
