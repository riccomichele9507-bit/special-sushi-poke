export type CategoryId =
  | "nigiri"
  | "sashimi"
  | "uramaki"
  | "special-rolls"
  | "poke"
  | "antipasti"
  | "bevande"
  | "dolci";

export type Allergen =
  | "pesce"
  | "crostacei"
  | "molluschi"
  | "soia"
  | "glutine"
  | "sesamo"
  | "uova"
  | "latte"
  | "frutta-secca";

export type SpicyLevel = 0 | 1 | 2 | 3;

export interface Dish {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category: CategoryId;
  image: string;
  imageAlt: string;
  allergens: Allergen[];
  spicyLevel: SpicyLevel;
  isNew?: boolean;
  isVegan?: boolean;
  isFeatured?: boolean;
  pieces?: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  slug: string;
  available: boolean;
  iconName?: string;
}
