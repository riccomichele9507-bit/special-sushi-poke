export interface DishReview {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
}

/**
 * Pool di mini-recensioni per piatto. Distribuite in modo deterministico in base
 * all'id del piatto cosicché ogni piatto abbia sempre le stesse 2 recensioni.
 */
const REVIEW_POOL: DishReview[] = [
  { author: "Marta R.", rating: 5, text: "Delizioso! Freschissimo." },
  { author: "Luca G.", rating: 5, text: "Ottimo sapore e presentazione." },
  { author: "Antonella M.", rating: 5, text: "Il mio preferito, sempre top." },
  { author: "Federico T.", rating: 5, text: "Porzione generosa, super." },
  { author: "Sara D.", rating: 4, text: "Buonissimo, lo riprenderò." },
  { author: "Davide L.", rating: 5, text: "Salsa perfetta, riso al dente." },
  { author: "Giulia P.", rating: 5, text: "Veloce e buonissimo, top." },
  { author: "Stefano B.", rating: 5, text: "Meglio di quello che pensassi." },
  { author: "Chiara V.", rating: 5, text: "Pesce di prima qualità." },
  { author: "Andrea M.", rating: 5, text: "Bilanciato e fresco, ottimo." },
  { author: "Roberta S.", rating: 4, text: "Bella combinazione, consiglio." },
  { author: "Paolo F.", rating: 5, text: "Da provare assolutamente." },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Ritorna 2 recensioni deterministiche per il piatto. */
export function getDishReviews(dishId: string): DishReview[] {
  const seed = hashString(dishId);
  const i1 = seed % REVIEW_POOL.length;
  const i2 = (seed + 5) % REVIEW_POOL.length;
  const a = REVIEW_POOL[i1];
  const b = REVIEW_POOL[i2];
  return i1 === i2 ? [a] : [a, b];
}

/** Numero "totale recensioni" finto, deterministico (40-220). */
export function getDishReviewCount(dishId: string): number {
  const seed = hashString(dishId);
  return 40 + (seed % 180);
}

/** Rating medio finto deterministico (4.4 - 5.0). */
export function getDishRating(dishId: string): number {
  const seed = hashString(dishId + "rating");
  return 4.4 + ((seed % 6) / 10);
}
