import type { Dish } from "@/types/dish";

export interface DishExtra {
  id: string;
  label: string;
  price: number; // in cents
}

const SUSHI_EXTRAS: DishExtra[] = [
  { id: "wasabi", label: "Wasabi Extra", price: 100 },
  { id: "ginger", label: "Zenzero Extra", price: 100 },
  { id: "spicy-mayo", label: "Salsa Spicy", price: 150 },
  { id: "edamame", label: "Edamame Porzione", price: 400 },
];

const POKE_EXTRAS: DishExtra[] = [
  { id: "avocado", label: "Avocado Extra", price: 150 },
  { id: "mango", label: "Mango Extra", price: 150 },
  { id: "salmon", label: "Doppio Salmone", price: 300 },
  { id: "ginger", label: "Zenzero", price: 100 },
];

const FRIED_EXTRAS: DishExtra[] = [
  { id: "spicy-mayo", label: "Salsa Spicy", price: 150 },
  { id: "teriyaki", label: "Salsa Teriyaki", price: 100 },
  { id: "sesame", label: "Sesamo Extra", price: 50 },
];

const DRINK_EXTRAS: DishExtra[] = [];

const CATEGORY_EXTRAS: Record<string, DishExtra[]> = {
  poke: POKE_EXTRAS,
  uramaki: SUSHI_EXTRAS,
  nigiri: SUSHI_EXTRAS,
  sashimi: SUSHI_EXTRAS,
  temaki: SUSHI_EXTRAS,
  hosomaki: SUSHI_EXTRAS,
  gunkan: SUSHI_EXTRAS,
  chirashi: SUSHI_EXTRAS,
  fritto: FRIED_EXTRAS,
  tempura: FRIED_EXTRAS,
  tacos: SUSHI_EXTRAS,
  tartare: SUSHI_EXTRAS,
  carpaccio: SUSHI_EXTRAS,
  onigiri: SUSHI_EXTRAS,
  box: SUSHI_EXTRAS,
  barca: SUSHI_EXTRAS,
  grigliati: FRIED_EXTRAS,
  yakimesi: SUSHI_EXTRAS,
  caldi: FRIED_EXTRAS,
  antipasti: FRIED_EXTRAS,
  bevande: DRINK_EXTRAS,
  dolci: DRINK_EXTRAS,
};

export function getDishExtras(dish: Dish): DishExtra[] {
  return CATEGORY_EXTRAS[dish.category] ?? [];
}

export interface DishSizeVariant {
  id: string;
  label: string;
  pieces: number;
  priceMultiplier: number;
}

/** Ritorna le 3 varianti di dimensione (small / standard / large) se applicabile. */
export function getDishSizeVariants(dish: Dish): DishSizeVariant[] | null {
  if (!dish.pieces || dish.pieces < 6) return null;
  const base = dish.pieces;
  const small = Math.max(2, Math.round(base * 0.7));
  const large = Math.round(base * 1.5);
  return [
    { id: "small", label: `${small} pz`, pieces: small, priceMultiplier: 0.75 },
    { id: "standard", label: `${base} pz`, pieces: base, priceMultiplier: 1 },
    { id: "large", label: `${large} pz`, pieces: large, priceMultiplier: 1.45 },
  ];
}
