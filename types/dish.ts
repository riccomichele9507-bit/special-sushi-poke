export type CategoryId =
  | "box"
  | "barca"
  | "poke"
  | "uramaki"
  | "nigiri"
  | "sashimi"
  | "temaki"
  | "hosomaki"
  | "fritto"
  | "onigiri"
  | "chirashi"
  | "tacos"
  | "tartare"
  | "carpaccio"
  | "gunkan"
  | "tempura"
  | "antipasti"
  | "grigliati"
  | "yakimesi"
  | "caldi"
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
  isMostOrdered?: boolean;
  pieces?: number;
  /** Solid background color when no photo available (CSS color value). */
  bgFrom?: string;
  bgTo?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  slug: string;
  available: boolean;
  iconName?: string;
}
