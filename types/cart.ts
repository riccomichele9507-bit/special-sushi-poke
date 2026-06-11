import type { Dish } from "./dish";

/**
 * Configurazione di una poke creata col builder.
 * Quando presente in un CartItem, il prezzo + nome sono calcolati da questa config
 * invece che da getDishById (perché non esiste un dishId in `dishes` per le custom).
 */
export interface CustomPokeConfig {
  type: "custom-poke";
  /** Centesimi base della poke (da pokeBuilderConfig.basePriceCents). */
  basePriceCents: number;
  /** Centesimi extras totali (somma calcolata). */
  extrasCents: number;
  /** Mappa categoryId -> array di label degli item selezionati (per display nel carrello). */
  selectionLabels: Record<string, string[]>;
}

export interface CartItem {
  /** Per le custom poke è un ID generato univoco (ogni configurazione = riga separata in carrello). */
  dishId: string;
  quantity: number;
  /** Presente SOLO per le custom poke. */
  custom?: CustomPokeConfig;
}

export interface CartItemWithDish {
  dish: Dish;
  quantity: number;
  lineTotal: number;
}

export interface CartState {
  items: CartItem[];
  add: (dishId: string) => void;
  /** Aggiunge una poke creata col builder (sempre nuova riga, mai unisce con esistenti). */
  addCustomPoke: (config: CustomPokeConfig) => void;
  remove: (dishId: string) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  clear: () => void;
}
