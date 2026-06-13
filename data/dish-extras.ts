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

// Le poke gia' pronte NON accettano aggiunte: se il cliente vuole personalizzare
// usa la sezione "Crea la tua poke" col configuratore completo (max 4 condimenti
// inclusi, +€1 per ogni aggiunta extra, +€1.50 per ogni proteina extra).
const POKE_EXTRAS: DishExtra[] = [];

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

// Decisione 13/06/2026: NESSUN piatto ha selettore varianti taglia.
// Ogni piatto ha un numero pezzi FISSO definito dal ristorante:
//   - Sashimi misto: 16 pz | altri sashimi: 12 pz | tataki: 8 pz
//   - Hosomaki: 6 pz | Hoso fritti: 6 pz | Uramaki fritti: 8 pz
//   - Box e Barca: ogni taglia e' un piatto distinto nel menu
// Il cliente sceglie solo la quantita' (numero di porzioni) con +/-.
/** Ritorna sempre null: nessuna variante taglia (decisione business). */
export function getDishSizeVariants(_dish: Dish): DishSizeVariant[] | null {
  return null;
}
