import type { Dish } from "@/types/dish";

export const menu: Dish[] = [
  {
    id: "poke-tonno-mango",
    name: "Poke Bowl Tonno & Mango",
    description:
      "Tonno crudo marinato in salsa ponzu su riso jasmine, con mango fresco, edamame e sesamo.",
    ingredients: [
      "riso jasmine",
      "tonno crudo marinato",
      "mango",
      "edamame",
      "cetriolo",
      "salsa ponzu",
      "sesamo",
    ],
    price: 1250,
    category: "poke",
    image: "/menu/poke-tonno-mango.png",
    imageAlt:
      "Poke bowl con tonno crudo marinato e mango, vista dall'alto su ciotola ceramica scura",
    allergens: ["pesce", "soia", "sesamo"],
    spicyLevel: 0,
    isFeatured: true,
  },
  {
    id: "poke-salmone-avocado",
    name: "Poke Bowl Salmone & Avocado",
    description:
      "Salmone fresco e avocado su riso, con wakame, mais e cipolla croccante, glassato al teriyaki.",
    ingredients: [
      "riso",
      "salmone",
      "avocado",
      "alghe wakame",
      "mais",
      "cipolla croccante",
      "salsa teriyaki",
    ],
    price: 1200,
    category: "poke",
    image: "/menu/poke-salmone-avocado.png",
    imageAlt:
      "Poke bowl con salmone fresco e avocado, vista dall'alto su ciotola ceramica",
    allergens: ["pesce", "soia"],
    spicyLevel: 0,
  },
  {
    id: "special-roll-bellaveduta",
    name: "Special Roll Bellaveduta",
    description:
      "Il nostro signature: salmone scottato, philadelphia e mango fresco, finito con tobiko arancione e salsa al mango piccante.",
    ingredients: [
      "riso",
      "salmone scottato",
      "philadelphia",
      "mango",
      "tobiko arancione",
      "salsa al mango piccante",
    ],
    price: 1450,
    category: "special-rolls",
    image: "/menu/special-roll-bellaveduta.png",
    imageAlt:
      "Special roll con salmone scottato, mango e tobiko su lastra scura, vista 45 gradi",
    allergens: ["pesce", "latte", "uova"],
    spicyLevel: 2,
    isFeatured: true,
    isNew: true,
    pieces: 8,
  },
  {
    id: "uramaki-california",
    name: "Uramaki California",
    description:
      "Il classico rovesciato: surimi, avocado e cetriolo, esterno croccante al sesamo bianco.",
    ingredients: ["riso", "surimi", "avocado", "cetriolo", "sesamo bianco"],
    price: 850,
    category: "uramaki",
    image: "/menu/uramaki-california.png",
    imageAlt: "Uramaki California con surimi e avocado, vista 45 gradi su tagliere in bambù",
    allergens: ["pesce", "crostacei", "sesamo"],
    spicyLevel: 0,
    pieces: 8,
  },
  {
    id: "sashimi-misto",
    name: "Sashimi Misto",
    description:
      "Selezione del giorno: tonno, salmone e branzino tagliati al momento, serviti con wasabi e zenzero.",
    ingredients: ["tonno", "salmone", "branzino", "wasabi", "zenzero", "daikon"],
    price: 1300,
    category: "sashimi",
    image: "/menu/sashimi-misto.png",
    imageAlt: "Sashimi misto di tonno, salmone e branzino su piatto minimal bianco",
    allergens: ["pesce"],
    spicyLevel: 0,
    isFeatured: true,
    pieces: 12,
  },
];

export function getDishById(id: string): Dish | undefined {
  return menu.find((d) => d.id === id);
}

export function getDishesByCategory(category: string): Dish[] {
  return menu.filter((d) => d.category === category);
}

export function getFeaturedDishes(): Dish[] {
  return menu.filter((d) => d.isFeatured);
}
