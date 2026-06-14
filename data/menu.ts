import type { Dish } from "@/types/dish";

export const menu: Dish[] = [
  // === BOX ===

  {
    id: "box-50",
    name: "Box 50 pezzi",
    description: "Uramaki 24 pezzi, nigiri 8 pezzi, gunkan 4 pezzi, sashimi 8 pezzi misto, hosomaki 6 pezzi.",
    ingredients: ["uramaki", "nigiri", "gunkan", "sashimi", "hosomaki"],
    price: 3500,
    category: "box",
    image: "/menu/box-50.png",
    imageAlt: "Box 50 pezzi sushi misto",
    allergens: ["pesce", "crostacei", "soia"],
    spicyLevel: 0,
    isFeatured: true,
    pieces: 50,
  },
  {
    id: "box-25",
    name: "Box 25 pezzi",
    description: "Uramaki 16 pezzi, Hoso Avocado Salmone 6 pezzi, Nigiri 3 pezzi.",
    ingredients: ["uramaki", "hosomaki avocado", "hosomaki salmone", "nigiri"],
    price: 1800,
    category: "box",
    image: "/menu/box-25.png",
    imageAlt: "Box 25 pezzi sushi",
    allergens: ["pesce", "soia"],
    spicyLevel: 0,
    pieces: 25,
  },  {
    id: "box-100",
    name: "Box 100 pezzi",
    description: "Uramaki 56 pezzi, sashimi misto 20 pezzi, hoso fritto 6 pezzi, gunkan 8 pezzi, nigiri 10 pezzi.",
    ingredients: ["uramaki", "sashimi misto", "nigiri", "gunkan", "hoso fritto"],
    price: 6500,
    category: "box",
    image: "/menu/box-100.png",
    imageAlt: "Box 100 pezzi sushi assortito",
    allergens: ["pesce", "crostacei", "soia", "glutine", "sesamo"],
    spicyLevel: 0,
    pieces: 100,
  },
  {
    id: "box-70",
    name: "Box 70 pezzi",
    description: "Uramaki 40 pezzi, nigiri 6 pezzi, gunkan 6 pezzi, sashimi 10 pezzi, misto uramaki fritto 8 pezzi.",
    ingredients: ["uramaki", "nigiri", "gunkan", "sashimi", "uramaki fritto"],
    price: 4500,
    category: "box",
    image: "/menu/box-70.png",
    imageAlt: "Box 70 pezzi sushi misto",
    allergens: ["pesce", "crostacei", "soia", "glutine"],
    spicyLevel: 0,
    pieces: 70,
  },
  {
    id: "box-35",
    name: "Box 35 pezzi",
    description: "Uramaki 24 pezzi, Nigiri 4 pezzi, Sashimi Salmone 5 pezzi, Gunkan 2 pezzi.",
    ingredients: ["uramaki", "nigiri", "sashimi salmone", "gunkan"],
    price: 2500,
    category: "box",
    image: "/menu/box-35.png",
    imageAlt: "Box 35 pezzi sushi",
    allergens: ["pesce", "soia"],
    spicyLevel: 0,
    pieces: 35,
  },

  // === BARCA ===
  {
    id: "barca-grande",
    name: "Barca Grande",
    description: "Uramaki 24 pezzi, nigiri misto 8 pezzi, sashimi 8 pezzi, futomaki fritto 8 pezzi, hosomaki 6 pezzi, gunkan 6 pezzi.",
    ingredients: ["uramaki", "nigiri", "sashimi", "futomaki fritto", "hosomaki", "gunkan"],
    price: 4500,
    category: "barca",
    image: "/menu/barca-grande.png",
    imageAlt: "Barca grande sushi 60 pezzi",
    allergens: ["pesce", "crostacei", "soia", "glutine"],
    spicyLevel: 0,
    pieces: 60,
  },
  {
    id: "barca-piccola",
    name: "Barca Piccola",
    description: "Uramaki 16 pezzi, nigiri 6 pezzi, gunkan 6 pezzi, sashimi 8 pezzi, hoso fritto 6 pezzi.",
    ingredients: ["uramaki", "nigiri", "gunkan", "sashimi", "hoso fritto"],
    price: 3200,
    category: "barca",
    image: "/menu/barca-piccola.png",
    imageAlt: "Barca piccola sushi 42 pezzi",
    allergens: ["pesce", "crostacei", "soia"],
    spicyLevel: 0,
    pieces: 42,
  },

  // === POKE ===
  {
    id: "poke-fresh",
    name: "Poke Fresh",
    description: "Salmone, pomodoro, mango, avocado, mais, edamame e sesamo su riso.",
    ingredients: ["riso", "salmone", "pomodoro", "mango", "avocado", "mais", "edamame", "sesamo"],
    price: 800,
    category: "poke",
    image: "/menu/poke-fresh.png",
    imageAlt: "Poke bowl Fresh con salmone e frutta",
    allergens: ["pesce", "sesamo"],
    spicyLevel: 0,
    isFeatured: true,
    isMostOrdered: true,
  },
  {
    id: "poke-salmon-spicy",
    name: "Poke Salmon Spicy",
    description: "Salmone, avocado, mais, edamame, wakame, maio spicy teriyaki, anacardi.",
    ingredients: ["riso", "salmone", "avocado", "mais", "edamame", "wakame", "maio spicy", "teriyaki", "anacardi"],
    price: 900,
    category: "poke",
    image: "/menu/poke-salmone-avocado.png",
    imageAlt: "Poke salmon spicy con teriyaki",
    allergens: ["pesce", "soia", "frutta-secca"],
    spicyLevel: 2,
  },
  {
    id: "poke-tuna-bowl",
    name: "Poke Tuna Bowl",
    description: "Tonno, pomodoro, mango, edamame, mais, teriyaki, sesamo, pistacchio.",
    ingredients: ["riso", "tonno", "pomodoro", "mango", "edamame", "mais", "teriyaki", "sesamo", "pistacchio"],
    price: 800,
    category: "poke",
    image: "/menu/poke-tonno-mango.png",
    imageAlt: "Poke tuna bowl con tonno e mango",
    allergens: ["pesce", "soia", "sesamo", "frutta-secca"],
    spicyLevel: 0,
    isMostOrdered: true,
  },
  {
    id: "duo-bowl",
    name: "Duo Bowl",
    description: "Tempura gamberi, salmone, mango, avocado, philadelphia, salsa mandorla.",
    ingredients: ["riso", "tempura gamberi", "salmone", "mango", "avocado", "philadelphia", "salsa mandorla"],
    price: 900,
    category: "poke",
    image: "/menu/duo-bowl.png",
    imageAlt: "Duo bowl con tempura e salmone",
    allergens: ["pesce", "crostacei", "latte", "glutine", "frutta-secca"],
    spicyLevel: 0,
  },
  {
    id: "poke-chicken-bowl",
    name: "Poke Chicken Bowl",
    description: "Pollo cotto con avocado, burro d'arachidi, pomodorini, cetriolo e maio spicy.",
    ingredients: ["riso", "pollo", "avocado", "burro d'arachidi", "pomodorini", "cetriolo", "mandorla", "maio spicy"],
    price: 1000,
    category: "poke",
    image: "/menu/poke-chicken-bowl.png",
    imageAlt: "Poke chicken bowl",
    allergens: ["frutta-secca", "uova"],
    spicyLevel: 1,
  },
  {
    id: "poke-spigola-bowl",
    name: "Poke Spigola Bowl",
    description: "Branzino marinato soy & lime, mango, wakame e mandorla su riso.",
    ingredients: ["riso", "branzino marinato", "soia", "lime", "mango", "wakame", "mandorla"],
    price: 900,
    category: "poke",
    image: "/menu/poke-spigola-bowl.png",
    imageAlt: "Poke spigola bowl",
    allergens: ["pesce", "soia", "frutta-secca"],
    spicyLevel: 0,
  },
  {
    id: "poke-crunchy-bowl",
    name: "Poke Crunchy Bowl",
    description: "Tempura, gamberi, wakame, pomodorini, pistacchio e maio wasabi.",
    ingredients: ["riso", "tempura", "gamberi", "wakame", "pomodorini", "pistacchio", "maio wasabi"],
    price: 800,
    category: "poke",
    image: "/menu/poke-crunchy-bowl.png",
    imageAlt: "Poke crunchy con tempura e gamberi",
    allergens: ["crostacei", "frutta-secca", "uova", "glutine"],
    spicyLevel: 1,
  },
  {
    id: "poke-salmon",
    name: "Poke Salmon",
    description: "Salmone, avocado, edamame, mais, philadelphia, teriyaki e patate fritte.",
    ingredients: ["riso", "salmone", "avocado", "edamame", "mais", "philadelphia", "teriyaki", "patata fritta", "sesamo"],
    price: 700,
    category: "poke",
    image: "/menu/poke-salmon.png",
    imageAlt: "Poke salmon classico",
    allergens: ["pesce", "soia", "latte", "sesamo"],
    spicyLevel: 0,
  },
  {
    id: "poke-gamberi",
    name: "Poke Gamberi",
    description: "Riso venere, gamberi tempura, salmone, avocado, wakame, mais, ananas e teriyaki.",
    ingredients: ["riso venere", "gamberi tempura", "salmone", "avocado", "wakame", "mais", "ananas", "teriyaki", "maio", "mandorla"],
    price: 1000,
    category: "poke",
    image: "/menu/poke-gamberi.png",
    imageAlt: "Poke gamberi su riso venere",
    allergens: ["pesce", "crostacei", "soia", "glutine", "uova", "frutta-secca"],
    spicyLevel: 0,
  },
  {
    id: "poke-rainbow",
    name: "Poke Rainbow",
    description: "Salmone, tonno, spigola, avocado, pomodoro, edamame, mais e sesamo.",
    ingredients: ["riso", "salmone", "tonno", "spigola", "avocado", "pomodoro", "edamame", "mais", "sesamo"],
    price: 900,
    category: "poke",
    image: "/menu/poke-rainbow.png",
    imageAlt: "Poke rainbow con pesce misto",
    allergens: ["pesce", "sesamo"],
    spicyLevel: 0,
  },
  {
    id: "poke-ananas",
    name: "Poke Ananas",
    description: "Salmone, avocado, ananas, mais, wakame, philadelphia, teriyaki, cipolla fritta.",
    ingredients: ["riso", "salmone", "avocado", "ananas", "mais", "wakame", "philadelphia", "teriyaki", "cipolla fritta"],
    price: 700,
    category: "poke",
    image: "/menu/poke-ananas.png",
    imageAlt: "Poke ananas dolce",
    allergens: ["pesce", "soia", "latte"],
    spicyLevel: 0,
  },
  {
    id: "poke-salmon-cotto",
    name: "Poke Salmon Cotto",
    description: "Salmone cotto, gamberi cotti, avocado, mais, wakame, maio, teriyaki, philadelphia, kataifi.",
    ingredients: ["riso", "salmone cotto", "gamberi cotti", "avocado", "mais", "wakame", "salsa maio", "teriyaki", "philadelphia", "kataifi"],
    price: 900,
    category: "poke",
    image: "/menu/poke-salmon-cotto.png",
    imageAlt: "Poke salmon cotto con gamberi",
    allergens: ["pesce", "crostacei", "soia", "latte", "uova", "glutine"],
    spicyLevel: 0,
  },
  {
    id: "poke-vegetables",
    name: "Poke Vegetables",
    description: "Insalata, carota, edamame, avocado, mais, cavolo viola, olio, oliva, pistacchio, anacardi.",
    ingredients: ["insalata", "carota", "edamame", "avocado", "mais", "cavolo viola", "olio di oliva", "oliva", "pistacchio", "anacardi"],
    price: 1000,
    category: "poke",
    image: "/menu/poke-vegetables.png",
    imageAlt: "Poke vegetariano",
    allergens: ["frutta-secca"],
    spicyLevel: 0,
    isVegan: true,
  },

  // === TEMAKI ===
  { id: "temaki-salmon", name: "Temaki Salmon", description: "Salmone, avocado e sesamo in cono di alga.", ingredients: ["salmone", "avocado", "sesamo"], price: 300, category: "temaki", image: "/menu/temaki-salmon.png", imageAlt: "Temaki salmone", allergens: ["pesce", "sesamo"], spicyLevel: 0 },
  { id: "temaki-maguro", name: "Temaki Maguro", description: "Tonno, avocado e sesamo.", ingredients: ["tonno", "avocado", "sesamo"], price: 300, category: "temaki", image: "/menu/temaki-maguro.png", imageAlt: "Temaki tonno", allergens: ["pesce", "sesamo"], spicyLevel: 0 },
  { id: "temaki-salmon-spicy", name: "Temaki Salmon Spicy", description: "Salmone, avocado, maio spicy e patate fritte.", ingredients: ["salmone", "avocado", "maio spicy", "patata fritta"], price: 300, category: "temaki", image: "/menu/temaki-salmon-spicy.png", imageAlt: "Temaki salmone spicy", allergens: ["pesce", "uova"], spicyLevel: 2 },
  { id: "temaki-gamberi", name: "Temaki Gamberi", description: "Gamberi, avocado, philadelphia, teriyaki e patate fritte.", ingredients: ["avocado", "gamberi", "philadelphia", "teriyaki", "patata fritta"], price: 300, category: "temaki", image: "/menu/temaki-gamberi.png", imageAlt: "Temaki gamberi", allergens: ["crostacei", "latte", "soia"], spicyLevel: 0 },
  { id: "temaki-maguro-cotto", name: "Temaki Maguro Cotto", description: "Tonno cotto, avocado, teriyaki e cipolla fritta.", ingredients: ["avocado", "tonno cotto", "teriyaki", "cipolla fritta"], price: 300, category: "temaki", image: "/menu/temaki-maguro-cotto.png", imageAlt: "Temaki tonno cotto", allergens: ["pesce", "soia"], spicyLevel: 0 },
  { id: "temaki-venere-soy", name: "Temaki Venere Soy", description: "Riso venere, philadelphia, gamberi tempura, salsa mandorla.", ingredients: ["riso venere", "philadelphia", "gamberi tempura", "salsa mandorla", "mandorla"], price: 350, category: "temaki", image: "/menu/temaki-venere-soy.png", imageAlt: "Temaki venere e gamberi", allergens: ["crostacei", "latte", "glutine", "frutta-secca"], spicyLevel: 0 },
  { id: "temaki-california", name: "Temaki California", description: "Surimi, avocado, teriyaki e sesamo.", ingredients: ["surimi", "avocado", "teriyaki", "sesamo"], price: 300, category: "temaki", image: "/menu/temaki-california.png", imageAlt: "Temaki california", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0 },

  // === HOSO MAKI ===
  { id: "hoso-salmon", name: "Hoso Salmon (6 pz)", description: "Hosomaki classico al salmone.", ingredients: ["riso", "salmone", "alga nori"], price: 400, category: "hosomaki", image: "/menu/hoso-salmon.png", imageAlt: "Hosomaki salmone", allergens: ["pesce"], spicyLevel: 0, pieces: 6 },
  { id: "hoso-salmon-avocado", name: "Hoso Salmon & Avocado (6 pz)", description: "Salmone e avocado in piccolo rotolo.", ingredients: ["riso", "salmone", "avocado", "alga nori"], price: 450, category: "hosomaki", image: "/menu/hoso-salmon-avocado.png", imageAlt: "Hosomaki salmone avocado", allergens: ["pesce"], spicyLevel: 0, pieces: 6 },
  { id: "hoso-ebi-cotto", name: "Hoso Ebi Cotto (6 pz)", description: "Gamberi cotti nel rotolo.", ingredients: ["riso", "gamberi cotti", "alga nori"], price: 400, category: "hosomaki", image: "/menu/hoso-ebi-cotto.png", imageAlt: "Hosomaki gambero", allergens: ["crostacei"], spicyLevel: 0, pieces: 6 },
  { id: "hoso-avocado", name: "Hoso Avocado (6 pz)", description: "Avocado puro, vegano.", ingredients: ["riso", "avocado", "alga nori"], price: 350, category: "hosomaki", image: "/menu/hoso-avocado.png", imageAlt: "Hosomaki avocado", allergens: [], spicyLevel: 0, pieces: 6, isVegan: true },
  { id: "hoso-soy-frutta", name: "Hoso Soy & Frutta (6 pz)", description: "Salsa soia e frutta fresca.", ingredients: ["riso", "soia", "frutta"], price: 500, category: "hosomaki", image: "/menu/hoso-soy-frutta.png", imageAlt: "Hosomaki soy frutta", allergens: ["soia"], spicyLevel: 0, pieces: 6 },
  { id: "hoso-ebiten", name: "Hoso Ebiten (6 pz)", description: "Gamberi tempura, dorato e croccante.", ingredients: ["riso", "gamberi tempura", "alga nori"], price: 500, category: "hosomaki", image: "/menu/hoso-ebiten.png", imageAlt: "Hosomaki ebiten", allergens: ["crostacei", "glutine", "uova"], spicyLevel: 0, pieces: 6 },

  // === FRITTI ===

  { id: "uramaki-fritto", name: "Uramaki Fritto (8 pz)", description: "Salmone, avocado, philadelphia, teriyaki, kataifi.", ingredients: ["salmone", "avocado", "philadelphia", "teriyaki", "kataifi"], price: 800, category: "fritto", image: "/menu/uramaki-fritto.png", imageAlt: "Uramaki fritto signature", allergens: ["pesce", "latte", "soia", "glutine", "uova"], spicyLevel: 0, pieces: 8 },  { id: "hoso-avocado-fritto", name: "Hoso Avocado Fritto (6 pz)", description: "Philadelphia, frutta, salsa di chef. Esterno croccante.", ingredients: ["philadelphia", "frutta", "salsa di chef"], price: 600, category: "fritto", image: "/menu/hoso-avocado-fritto.png", imageAlt: "Hoso avocado fritto", allergens: ["latte", "glutine", "uova"], spicyLevel: 0, pieces: 6 },
  { id: "hoso-salmon-fritto", name: "Hoso Salmon Fritto (6 pz)", description: "Salmone piccante, teriyaki e patate.", ingredients: ["salmone piccante", "teriyaki", "patata"], price: 600, category: "fritto", image: "/menu/hoso-salmon-fritto.png", imageAlt: "Hoso salmone fritto", allergens: ["pesce", "soia", "glutine", "uova"], spicyLevel: 2, pieces: 6 },
  { id: "fotomaki-fritto", name: "Futomaki Fritto (8 pz)", description: "Tobiko, surimi, avocado, gamberi tempura, teriyaki e patate.", ingredients: ["tobiko", "surimi", "avocado", "gamberi tempura", "teriyaki", "patata"], price: 800, category: "fritto", image: "/menu/fotomaki-fritto.png", imageAlt: "Fotomaki fritto", allergens: ["pesce", "crostacei", "soia", "glutine", "uova"], spicyLevel: 0, pieces: 8 },

  // === ONIGIRI ===

  { id: "onigiri-sake", name: "Onigiri Sake (1 pz)", description: "Philadelphia e sesamo.", ingredients: ["riso", "salmone", "philadelphia", "sesamo"], price: 300, category: "onigiri", image: "/menu/onigiri-sake.png", imageAlt: "Onigiri salmone", allergens: ["pesce", "latte", "sesamo"], spicyLevel: 0, pieces: 1 },  { id: "onigiri-ebi", name: "Onigiri Ebi (1 pz)", description: "Gamberi, teriyaki e sesamo.", ingredients: ["riso", "gamberi", "teriyaki", "sesamo"], price: 350, category: "onigiri", image: "/menu/onigiri-ebi.png", imageAlt: "Onigiri gamberi", allergens: ["crostacei", "soia", "sesamo"], spicyLevel: 0, pieces: 1 },
  { id: "onigiri-salmon-cotto", name: "Onigiri Salmon Cotto (1 pz)", description: "Salmone cotto con teriyaki e patate.", ingredients: ["riso", "salmone cotto", "teriyaki", "patata"], price: 300, category: "onigiri", image: "/menu/onigiri-salmon-cotto.png", imageAlt: "Onigiri salmone cotto", allergens: ["pesce", "soia"], spicyLevel: 0, pieces: 1 },
  { id: "onigiri-tonno-cotto", name: "Onigiri Tonno Cotto (1 pz)", description: "Tonno cotto, teriyaki, cipolla fritta e sesamo.", ingredients: ["riso", "tonno cotto", "teriyaki", "cipolla fritta", "sesamo"], price: 300, category: "onigiri", image: "/menu/onigiri-tonno-cotto.png", imageAlt: "Onigiri tonno cotto", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0, pieces: 1 },

  // === CHIRASHI ===

  { id: "king-chirashi", name: "King Chirashi", description: "Riso nero, tartare salmone, avocado, philadelphia, mandorla, salsa rucola e teriyaki.", ingredients: ["riso nero", "tartare salmone", "avocado", "philadelphia", "mandorla", "salsa rucola", "teriyaki"], price: 900, category: "chirashi", image: "/menu/king-chirashi.png", imageAlt: "King chirashi premium su riso nero", allergens: ["pesce", "latte", "soia", "frutta-secca"], spicyLevel: 0 },  { id: "chirashi-sake", name: "Chirashi Sake", description: "Salmone su riso, teriyaki e sesamo.", ingredients: ["riso", "salmone", "teriyaki", "sesamo"], price: 600, category: "chirashi", image: "/menu/chirashi-sake.png", imageAlt: "Chirashi salmone", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0 },
  { id: "chirashi-misto", name: "Chirashi Misto", description: "Salmone, tonno, spigola, maio, teriyaki e pistacchio.", ingredients: ["riso", "salmone", "tonno", "spigola", "maio", "teriyaki", "pistacchio"], price: 700, category: "chirashi", image: "/menu/chirashi-misto.png", imageAlt: "Chirashi misto di pesce", allergens: ["pesce", "soia", "uova", "frutta-secca"], spicyLevel: 0 },

  // === TACOS ===
  { id: "tacos-sake", name: "Tacos Sake", description: "Salmone, avocado, salsa mango, philadelphia, teriyaki e sesamo.", ingredients: ["salmone", "avocado", "salsa mango", "philadelphia", "teriyaki", "sesamo"], price: 300, category: "tacos", image: "/menu/tacos-sake.png", imageAlt: "Tacos salmone", allergens: ["pesce", "latte", "soia", "sesamo"], spicyLevel: 0 },
  { id: "tacos-spicy-salmon", name: "Tacos Spicy Salmon", description: "Salmone piccante, avocado, teriyaki e patate.", ingredients: ["salmone piccante", "avocado", "teriyaki", "patata"], price: 300, category: "tacos", image: "/menu/tacos-spicy-salmon.png", imageAlt: "Tacos salmone spicy", allergens: ["pesce", "soia"], spicyLevel: 2 },

  // === TARTARE ===

  { id: "tris-tartar", name: "Tris Tartar", description: "Salmone, tonno, spigola, avocado, quinoa e salsa di chef.", ingredients: ["salmone", "tonno", "spigola", "avocado", "quinoa", "salsa di chef"], price: 800, category: "tartare", image: "/menu/tris-tartar.png", imageAlt: "Tris di tartare misto", allergens: ["pesce"], spicyLevel: 0 },  { id: "tartar-salmon", name: "Tartar Salmon", description: "Salmone, avocado, philadelphia, kataifi e salsa di chef.", ingredients: ["salmone", "avocado", "philadelphia", "kataifi", "salsa di chef"], price: 650, category: "tartare", image: "/menu/tartar-salmon.png", imageAlt: "Tartare salmone", allergens: ["pesce", "latte", "glutine"], spicyLevel: 0 },
  { id: "tartar-tonno", name: "Tartar Tonno", description: "Tonno, avocado, mango, kiwi e salsa di chef.", ingredients: ["tonno", "avocado", "mango", "kiwi", "salsa di chef"], price: 600, category: "tartare", image: "/menu/tartar-tonno.png", imageAlt: "Tartare tonno", allergens: ["pesce"], spicyLevel: 0 },
  { id: "fresh-tartar", name: "Fresh Tartar", description: "Salmone, avocado, mango, sesamo e salsa di chef.", ingredients: ["salmone", "avocado", "mango", "sesamo", "salsa di chef"], price: 600, category: "tartare", image: "/menu/fresh-tartar.png", imageAlt: "Fresh tartar di salmone", allergens: ["pesce", "sesamo"], spicyLevel: 0 },

  // === CARPACCIO ===

  { id: "carpaccio-misto", name: "Carpaccio Misto (12 pz)", description: "Salmone, tonno, spigola, mango, avocado, kiwi e salsa di chef.", ingredients: ["salmone", "tonno", "spigola", "mango", "avocado", "kiwi", "salsa di chef"], price: 800, category: "carpaccio", image: "/menu/carpaccio-misto.png", imageAlt: "Carpaccio misto di pesce", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },  { id: "carpaccio-salmon", name: "Carpaccio Salmon (12 pz)", description: "Salmone, mango, avocado, kiwi e salsa di chef.", ingredients: ["salmone", "mango", "avocado", "kiwi", "salsa di chef"], price: 800, category: "carpaccio", image: "/menu/carpaccio-salmon.png", imageAlt: "Carpaccio di salmone", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "carpaccio-tonno", name: "Carpaccio Tonno (12 pz)", description: "Tonno, mango, avocado, kiwi e salsa di chef.", ingredients: ["tonno", "mango", "avocado", "kiwi", "salsa di chef"], price: 800, category: "carpaccio", image: "/menu/carpaccio-tonno.png", imageAlt: "Carpaccio di tonno", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },

  // === NIGIRI ===
  { id: "nigiri-misto", name: "Nigiri Misto (12 pz)", description: "Selezione assortita del giorno.", ingredients: ["riso", "pesce misto"], price: 1000, category: "nigiri", image: "/menu/nigiri-misto.png", imageAlt: "Nigiri misto", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "nigiri-salmon", name: "Nigiri Salmon (3 pz)", description: "Salmone fresco su riso.", ingredients: ["riso", "salmone"], price: 400, category: "nigiri", image: "/menu/nigiri-salmon.png", imageAlt: "Nigiri salmone", allergens: ["pesce"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-tonno", name: "Nigiri Tonno (3 pz)", description: "Tonno fresco su riso.", ingredients: ["riso", "tonno"], price: 400, category: "nigiri", image: "/menu/nigiri-tonno.png", imageAlt: "Nigiri tonno", allergens: ["pesce"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-spigola", name: "Nigiri Spigola (3 pz)", description: "Spigola fresca su riso.", ingredients: ["riso", "spigola"], price: 450, category: "nigiri", image: "/menu/nigiri-spigola.png", imageAlt: "Nigiri spigola", allergens: ["pesce"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-ricciola", name: "Nigiri Ricciola (3 pz)", description: "Ricciola fresca su riso.", ingredients: ["riso", "ricciola"], price: 500, category: "nigiri", image: "/menu/nigiri-ricciola.png", imageAlt: "Nigiri ricciola", allergens: ["pesce"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-amaebi", name: "Nigiri Amaebi (3 pz)", description: "Gambero rosso crudo, dolce e delicato.", ingredients: ["riso", "gambero rosso"], price: 500, category: "nigiri", image: "/menu/nigiri-amaebi.png", imageAlt: "Nigiri amaebi gambero", allergens: ["crostacei"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-ebi", name: "Nigiri Ebi (3 pz)", description: "Gamberi cotti su riso.", ingredients: ["riso", "gamberi cotti"], price: 300, category: "nigiri", image: "/menu/nigiri-ebi.png", imageAlt: "Nigiri gamberi", allergens: ["crostacei"], spicyLevel: 0, pieces: 3 },
  { id: "nigiri-salmon-flambe", name: "Nigiri Salmon Flambé (3 pz)", description: "Salmone flambé con teriyaki, maio spicy e pistacchio.", ingredients: ["riso", "salmone flambé", "teriyaki", "maio spicy", "pistacchio"], price: 600, category: "nigiri", image: "/menu/nigiri-salmon-flambe.png", imageAlt: "Nigiri salmone flambé", allergens: ["pesce", "soia", "uova", "frutta-secca"], spicyLevel: 1, pieces: 3 },
  { id: "nigiri-tonno-flambe", name: "Nigiri Tonno Flambé (3 pz)", description: "Tonno flambé con maio spicy, teriyaki e mandorla.", ingredients: ["riso", "tonno flambé", "maio spicy", "teriyaki", "mandorla"], price: 600, category: "nigiri", image: "/menu/nigiri-tonno-flambe.png", imageAlt: "Nigiri tonno flambé", allergens: ["pesce", "soia", "uova", "frutta-secca"], spicyLevel: 1, pieces: 3 },
  { id: "nigiri-spigola-flambe", name: "Nigiri Spigola Flambé (3 pz)", description: "Spigola flambé con salsa mandorla e mandorle.", ingredients: ["riso", "spigola flambé", "salsa mandorla", "mandorla"], price: 500, category: "nigiri", image: "/menu/nigiri-spigola-flambe.png", imageAlt: "Nigiri spigola flambé", allergens: ["pesce", "frutta-secca"], spicyLevel: 0, pieces: 3 },

  // === GUNKAN ===

  { id: "gunkan-tempura", name: "Gunkan Tempura (3 pz)", description: "Salmone flambé, philadelphia, gamberi tempura, sweet chili.", ingredients: ["riso", "salmone flambé", "philadelphia", "gamberi tempura", "sweet chili", "erba cipollina"], price: 400, category: "gunkan", image: "/menu/gunkan-tempura.png", imageAlt: "Gunkan tempura", allergens: ["pesce", "crostacei", "latte", "glutine", "uova"], spicyLevel: 1, pieces: 3 },  { id: "gunkan-salmon-classic", name: "Gunkan Salmon (3 pz)", description: "Gunkan classico al salmone.", ingredients: ["riso", "salmone", "alga nori"], price: 400, category: "gunkan", image: "/menu/gunkan-salmon-classic.png", imageAlt: "Gunkan salmone", allergens: ["pesce"], spicyLevel: 0, pieces: 3 },
  { id: "gunkan-salmon-tobiko", name: "Gunkan Salmone & Tobiko (3 pz)", description: "Salmone, philadelphia e tobiko.", ingredients: ["riso", "salmone", "philadelphia", "tobiko"], price: 400, category: "gunkan", image: "/menu/gunkan-salmon-tobiko.png", imageAlt: "Gunkan salmone tobiko", allergens: ["pesce", "latte"], spicyLevel: 0, pieces: 3 },
  { id: "gunkan-salmon-spicy", name: "Gunkan Salmon Spicy (3 pz)", description: "Salmone piccante, teriyaki e mandorla.", ingredients: ["riso", "salmone piccante", "teriyaki", "mandorla"], price: 400, category: "gunkan", image: "/menu/gunkan-salmon-spicy.png", imageAlt: "Gunkan salmone spicy", allergens: ["pesce", "soia", "frutta-secca"], spicyLevel: 2, pieces: 3 },

  // === SASHIMI & TATAKI ===

  { id: "sashimi-misto", name: "Sashimi Misto (16 pz)", description: "Selezione di tonno, salmone e spigola.", ingredients: ["tonno", "salmone", "spigola"], price: 1200, category: "sashimi", image: "/menu/sashimi-misto.png", imageAlt: "Sashimi misto su piatto bianco", allergens: ["pesce"], spicyLevel: 0, pieces: 16, isFeatured: true },  { id: "sashimi-salmon", name: "Sashimi Salmon (12 pz)", description: "Sashimi di salmone, taglio del giorno.", ingredients: ["salmone"], price: 800, category: "sashimi", image: "/menu/sashimi-salmon.png", imageAlt: "Sashimi salmone", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "sashimi-tonno", name: "Sashimi Tonno (12 pz)", description: "Sashimi di tonno, taglio del giorno.", ingredients: ["tonno"], price: 1000, category: "sashimi", image: "/menu/sashimi-tonno.png", imageAlt: "Sashimi tonno", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "sashimi-spigola", name: "Sashimi Spigola (12 pz)", description: "Sashimi di spigola, fresco e delicato.", ingredients: ["spigola"], price: 1000, category: "sashimi", image: "/menu/sashimi-spigola.png", imageAlt: "Sashimi spigola", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "sashimi-ricciola", name: "Sashimi Ricciola (12 pz)", description: "Sashimi di ricciola pregiata.", ingredients: ["ricciola"], price: 1200, category: "sashimi", image: "/menu/sashimi-ricciola.png", imageAlt: "Sashimi ricciola", allergens: ["pesce"], spicyLevel: 0, pieces: 12 },
  { id: "tataki-salmon", name: "Tataki Salmon (8 pz)", description: "Salmone tataki con teriyaki e sesamo.", ingredients: ["salmone tataki", "teriyaki", "sesamo"], price: 800, category: "sashimi", image: "/menu/tataki-salmon.png", imageAlt: "Tataki salmone", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "tataki-tonno", name: "Tataki Tonno (8 pz)", description: "Tonno tataki con teriyaki e sesamo.", ingredients: ["tonno tataki", "teriyaki", "sesamo"], price: 800, category: "sashimi", image: "/menu/tataki-tonno.png", imageAlt: "Tataki tonno", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0, pieces: 8 },

  // === URAMAKI === (selezione completa dal menu)

  { id: "uramaki-california", name: "Uramaki California", description: "Tartare di surimi, avocado, maio, tobiko, teriyaki.", ingredients: ["tartare surimi", "avocado", "maio", "tobiko", "teriyaki"], price: 700, category: "uramaki", image: "/menu/uramaki-california.png", imageAlt: "Uramaki California", allergens: ["pesce", "soia", "uova"], spicyLevel: 0, pieces: 8, isMostOrdered: true },
  { id: "uramaki-sakura", name: "Uramaki Sakura", description: "Avocado, philadelphia, sopra salmone, teriyaki e ikura. La nostra signature.", ingredients: ["avocado", "philadelphia", "salmone", "teriyaki", "ikura"], price: 1000, category: "uramaki", image: "/menu/special-roll-bellaveduta.png", imageAlt: "Uramaki Sakura signature con ikura", allergens: ["pesce", "latte", "soia"], spicyLevel: 0, pieces: 8, isFeatured: true, isMostOrdered: true },  { id: "uramaki-astice", name: "Uramaki Astice", description: "Astice, avocado, maio, sopra tobiko e salsa teriyaki.", ingredients: ["astice", "avocado", "maio", "tobiko", "teriyaki"], price: 1000, category: "uramaki", image: "/menu/uramaki-astice.png", imageAlt: "Uramaki astice", allergens: ["pesce", "crostacei", "uova", "soia"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-lovestar", name: "Uramaki Lovestar", description: "Riso nero e bianco, salmone, avocado, sopra salmone, philadelphia, teriyaki, pistacchio.", ingredients: ["riso nero", "riso bianco", "salmone", "avocado", "philadelphia", "teriyaki", "pistacchio"], price: 1000, category: "uramaki", image: "/menu/uramaki-lovestar.png", imageAlt: "Uramaki lovestar bicolor", allergens: ["pesce", "latte", "soia", "frutta-secca"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-mandorla", name: "Uramaki Mandorla", description: "Salmone, avocado, sopra salmone, salsa e granella di mandorle.", ingredients: ["salmone", "avocado", "salsa mandorla", "mandorla"], price: 900, category: "uramaki", image: "/menu/uramaki-mandorla.png", imageAlt: "Uramaki mandorla", allergens: ["pesce", "frutta-secca"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-tiger", name: "Uramaki Tiger", description: "Gamberi tempura, avocado, salmone flambé, maio spicy, teriyaki, mandorla.", ingredients: ["gamberi tempura", "avocado", "salmone flambé", "maio spicy", "teriyaki", "mandorla"], price: 800, category: "uramaki", image: "/menu/uramaki-tiger.png", imageAlt: "Uramaki tiger", allergens: ["pesce", "crostacei", "soia", "glutine", "uova", "frutta-secca"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-pistachio", name: "Uramaki Pistachio", description: "Salmone, avocado, philadelphia, pistacchio e salsa pistacchio.", ingredients: ["salmone", "avocado", "philadelphia", "pistacchio", "salsa pistacchio"], price: 800, category: "uramaki", image: "/menu/uramaki-pistachio.png", imageAlt: "Uramaki pistacchio", allergens: ["pesce", "latte", "frutta-secca"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-tiger-plus", name: "Uramaki Tiger Plus", description: "Surimi fritto, avocado fritto, salmone flambé, maio spicy, teriyaki e mandorla.", ingredients: ["surimi fritto", "avocado fritto", "salmone flambé", "maio spicy", "teriyaki", "mandorla"], price: 900, category: "uramaki", image: "/menu/uramaki-tiger-plus.png", imageAlt: "Uramaki tiger plus", allergens: ["pesce", "soia", "glutine", "uova", "frutta-secca"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-tobiko", name: "Uramaki Tobiko", description: "Salmone, avocado, philadelphia e sopra tobiko.", ingredients: ["salmone", "avocado", "philadelphia", "tobiko"], price: 800, category: "uramaki", image: "/menu/uramaki-tobiko.png", imageAlt: "Uramaki tobiko", allergens: ["pesce", "latte"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-salmon", name: "Uramaki Salmon", description: "Classico salmone, avocado e sesamo.", ingredients: ["salmone", "avocado", "sesamo"], price: 700, category: "uramaki", image: "/menu/uramaki-salmon.png", imageAlt: "Uramaki salmone", allergens: ["pesce", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-spicy-ebiten", name: "Uramaki Spicy Ebiten", description: "Gamberi tempura, avocado, salmone piccante, teriyaki, patate fritte.", ingredients: ["gamberi tempura", "avocado", "salmone piccante", "teriyaki", "patata fritta"], price: 800, category: "uramaki", image: "/menu/uramaki-spicy-ebiten.png", imageAlt: "Uramaki spicy ebiten", allergens: ["pesce", "crostacei", "soia", "glutine", "uova"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-ebiten", name: "Uramaki Ebiten", description: "Gamberi tempura, insalata, sesamo, maio teriyaki, patate fritte.", ingredients: ["gamberi tempura", "insalata", "sesamo", "maio", "teriyaki", "patata fritta"], price: 700, category: "uramaki", image: "/menu/uramaki-ebiten.png", imageAlt: "Uramaki ebiten", allergens: ["crostacei", "soia", "glutine", "uova", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-ebiten-plus", name: "Uramaki Ebiten Plus", description: "Gamberi tempura, philadelphia, sesamo, teriyaki e kataifi.", ingredients: ["gamberi tempura", "philadelphia", "sesamo", "teriyaki", "kataifi"], price: 700, category: "uramaki", image: "/menu/uramaki-ebiten-plus.png", imageAlt: "Uramaki ebiten plus", allergens: ["crostacei", "latte", "soia", "glutine", "uova", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-fry", name: "Uramaki Fry", description: "Salmone fritto, avocado, maio, salmone flambé, maio piccante, teriyaki, pistacchio.", ingredients: ["salmone fritto", "avocado", "maio", "salmone flambé", "maio piccante", "teriyaki", "pistacchio"], price: 800, category: "uramaki", image: "/menu/uramaki-fry.png", imageAlt: "Uramaki fry", allergens: ["pesce", "soia", "glutine", "uova", "frutta-secca"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-miura-plus", name: "Uramaki Miura Plus", description: "Salmone cotto, avocado, philadelphia, sesamo, teriyaki e patate fritte.", ingredients: ["salmone cotto", "avocado", "philadelphia", "sesamo", "teriyaki", "patata fritta"], price: 700, category: "uramaki", image: "/menu/uramaki-miura-plus.png", imageAlt: "Uramaki miura plus", allergens: ["pesce", "latte", "soia", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-tonno-cotto", name: "Uramaki Tonno Cotto", description: "Tonno cotto, avocado, philadelphia, sesamo, teriyaki e cipolla fritta.", ingredients: ["tonno cotto", "avocado", "philadelphia", "sesamo", "teriyaki", "cipolla fritta"], price: 700, category: "uramaki", image: "/menu/uramaki-tonno-cotto.png", imageAlt: "Uramaki tonno cotto", allergens: ["pesce", "latte", "soia", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-dragon", name: "Uramaki Dragon", description: "Gamberoni tempura, patate dolci, maio, sopra avocado, salsa teriyaki e sesamo.", ingredients: ["gamberoni tempura", "patate dolci", "maio", "avocado", "teriyaki", "sesamo"], price: 1200, category: "uramaki", image: "/menu/uramaki-dragon.png", imageAlt: "Uramaki dragon signature", allergens: ["crostacei", "soia", "glutine", "uova", "sesamo"], spicyLevel: 0, pieces: 8, isFeatured: true },
  { id: "uramaki-rainbow", name: "Uramaki Rainbow", description: "Pesce misto, sopra pesce misto e avocado, salsa mandorla e teriyaki.", ingredients: ["pesce misto", "avocado", "salsa mandorla", "teriyaki"], price: 900, category: "uramaki", image: "/menu/uramaki-rainbow.png", imageAlt: "Uramaki rainbow", allergens: ["pesce", "soia", "frutta-secca"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-chicken", name: "Uramaki Chicken", description: "Pollo fritto, cetriolo, maio, sesamo, maio piccante, teriyaki e cipolla fritta.", ingredients: ["pollo fritto", "cetriolo", "maio", "sesamo", "maio piccante", "teriyaki", "cipolla fritta"], price: 700, category: "uramaki", image: "/menu/uramaki-chicken.png", imageAlt: "Uramaki chicken", allergens: ["soia", "glutine", "uova", "sesamo"], spicyLevel: 1, pieces: 8 },
  { id: "uramaki-guacamole", name: "Uramaki Guacamole", description: "Salmone, cetriolo, gamberi cotti, sopra guacamole, teriyaki, wasabi e piselli.", ingredients: ["salmone", "cetriolo", "gamberi cotti", "guacamole", "teriyaki", "wasabi", "piselli"], price: 800, category: "uramaki", image: "/menu/uramaki-guacamole.png", imageAlt: "Uramaki guacamole", allergens: ["pesce", "crostacei", "soia"], spicyLevel: 1, pieces: 8 },
  { id: "uramaki-philadelphia", name: "Uramaki Philadelphia", description: "Salmone, avocado, philadelphia e sesamo.", ingredients: ["salmone", "avocado", "philadelphia", "sesamo"], price: 700, category: "uramaki", image: "/menu/uramaki-philadelphia.png", imageAlt: "Uramaki philadelphia", allergens: ["pesce", "latte", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-salmon-spicy", name: "Uramaki Salmon Spicy", description: "Salmone, avocado, salmone piccante flambé, teriyaki e patate fritte.", ingredients: ["salmone", "avocado", "salmone piccante flambé", "teriyaki", "patata fritta"], price: 800, category: "uramaki", image: "/menu/uramaki-salmon-spicy.png", imageAlt: "Uramaki salmon spicy", allergens: ["pesce", "soia"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-tonno-spicy", name: "Uramaki Tonno Spicy", description: "Tonno, avocado, tonno, maio spicy, teriyaki e mandorla.", ingredients: ["tonno", "avocado", "maio spicy", "teriyaki", "mandorla"], price: 800, category: "uramaki", image: "/menu/uramaki-tonno-spicy.png", imageAlt: "Uramaki tonno spicy", allergens: ["pesce", "soia", "uova", "frutta-secca"], spicyLevel: 2, pieces: 8 },
  { id: "uramaki-mazara", name: "Uramaki Mazara", description: "Salmone, avocado, gamberi rossi e lime.", ingredients: ["salmone", "avocado", "gamberi rossi", "lime"], price: 900, category: "uramaki", image: "/menu/uramaki-mazara.png", imageAlt: "Uramaki mazara gamberi rossi", allergens: ["pesce", "crostacei"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-lemon", name: "Uramaki Lemon", description: "Gamberi tempura, philadelphia, tartare salmone, salsa al limone e kataifi.", ingredients: ["gamberi tempura", "philadelphia", "tartare salmone", "salsa lemon", "kataifi"], price: 800, category: "uramaki", image: "/menu/uramaki-lemon.png", imageAlt: "Uramaki lemon", allergens: ["pesce", "crostacei", "latte", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-crispy", name: "Uramaki Crispy", description: "Gamberi tempura, philadelphia, cedro flambé, teriyaki, cipolla e cipolla verde.", ingredients: ["gamberi tempura", "philadelphia", "cedro flambé", "teriyaki", "cipolla verde"], price: 700, category: "uramaki", image: "/menu/uramaki-crispy.png", imageAlt: "Uramaki crispy", allergens: ["crostacei", "latte", "soia", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-special-miura", name: "Uramaki Special Miura", description: "Salmone cotto, avocado, salmone, wakame, teriyaki e sesamo.", ingredients: ["salmone cotto", "avocado", "salmone", "wakame", "teriyaki", "sesamo"], price: 800, category: "uramaki", image: "/menu/uramaki-special-miura.png", imageAlt: "Uramaki special miura", allergens: ["pesce", "soia", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-queen", name: "Uramaki Queen", description: "Salmone, avocado, philadelphia, fragola e teriyaki.", ingredients: ["salmone", "avocado", "philadelphia", "fragola", "teriyaki"], price: 800, category: "uramaki", image: "/menu/uramaki-queen.png", imageAlt: "Uramaki queen con fragola", allergens: ["pesce", "latte", "soia"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-mango", name: "Uramaki Mango", description: "Salmone, mango, philadelphia, salsa al mango e sesamo.", ingredients: ["salmone", "mango", "philadelphia", "salsa mango", "sesamo"], price: 800, category: "uramaki", image: "/menu/uramaki-mango.png", imageAlt: "Uramaki mango", allergens: ["pesce", "latte", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-pink", name: "Uramaki Pink", description: "Salmone, philadelphia e salsa al tartufo.", ingredients: ["riso", "salmone", "philadelphia", "salsa tartufo"], price: 800, category: "uramaki", image: "/menu/uramaki-pink.png", imageAlt: "Uramaki pink al tartufo", allergens: ["pesce", "latte"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-nudo", name: "Uramaki Nudo", description: "Senza alga: riso, salmone, avocado, philadelphia e sesamo.", ingredients: ["riso", "salmone", "avocado", "philadelphia", "sesamo"], price: 700, category: "uramaki", image: "/menu/uramaki-nudo.png", imageAlt: "Uramaki nudo senza alga", allergens: ["pesce", "latte", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-arcobaleno", name: "Uramaki Arcobaleno", description: "Gamberi tempura, pesce misto, salsa maio teriyaki.", ingredients: ["gamberi tempura", "pesce misto", "maio", "teriyaki"], price: 700, category: "uramaki", image: "/menu/uramaki-arcobaleno.png", imageAlt: "Uramaki arcobaleno", allergens: ["pesce", "crostacei", "soia", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-affumicato", name: "Uramaki Affumicato", description: "Gamberi tempura, avocado, salmone affumicato, salsa rucola e patata fritta.", ingredients: ["gamberi tempura", "avocado", "salmone affumicato", "salsa rucola", "patata fritta"], price: 800, category: "uramaki", image: "/menu/uramaki-affumicato.png", imageAlt: "Uramaki affumicato", allergens: ["pesce", "crostacei", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-fresh", name: "Uramaki Fresh", description: "Salmone, avocado, cetriolo e sesamo. Aggiunta recente al menu.", ingredients: ["salmone", "avocado", "cetriolo", "sesamo"], price: 700, category: "uramaki", image: "/menu/uramaki-fresh.png", imageAlt: "Uramaki fresh", allergens: ["pesce", "sesamo"], spicyLevel: 0, pieces: 8, isNew: true },
  { id: "uramaki-ananas", name: "Uramaki Ananas", description: "Salmone, philadelphia, ananas e sesamo.", ingredients: ["salmone", "philadelphia", "ananas", "sesamo"], price: 700, category: "uramaki", image: "/menu/uramaki-ananas.png", imageAlt: "Uramaki ananas", allergens: ["pesce", "latte", "sesamo"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-nero-ricciola", name: "Uramaki Nero Ricciola", description: "Ricciola fritta, maio, avocado, maio piccante, teriyaki, pistacchio.", ingredients: ["ricciola fritta", "maio", "avocado", "maio piccante", "teriyaki", "pistacchio"], price: 1000, category: "uramaki", image: "/menu/uramaki-nero-ricciola.png", imageAlt: "Uramaki nero ricciola", allergens: ["pesce", "soia", "uova", "frutta-secca"], spicyLevel: 1, pieces: 8 },
  { id: "uramaki-venere-mandorla", name: "Uramaki Venere Mandorla", description: "Avocado, gamberi tempura, philadelphia, teriyaki e mandorla.", ingredients: ["riso venere", "avocado", "gamberi tempura", "philadelphia", "teriyaki", "mandorla"], price: 800, category: "uramaki", image: "/menu/uramaki-venere-mandorla.png", imageAlt: "Uramaki venere mandorla", allergens: ["crostacei", "latte", "soia", "glutine", "uova", "frutta-secca"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-ebiten-venere", name: "Uramaki Ebiten Venere", description: "Riso venere, gamberi tempura, teriyaki, kataifi, tobiko.", ingredients: ["riso venere", "gamberi tempura", "teriyaki", "kataifi", "tobiko"], price: 700, category: "uramaki", image: "/menu/uramaki-ebiten-venere.png", imageAlt: "Uramaki ebiten venere", allergens: ["pesce", "crostacei", "soia", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-fry-venere", name: "Uramaki Fry Venere", description: "Salmone fritto, avocado, salmone piccante, teriyaki, mandorla e pistacchio.", ingredients: ["riso venere", "salmone fritto", "avocado", "salmone piccante", "teriyaki", "mandorla", "pistacchio"], price: 800, category: "uramaki", image: "/menu/uramaki-fry-venere.png", imageAlt: "Uramaki fry venere", allergens: ["pesce", "soia", "glutine", "uova", "frutta-secca"], spicyLevel: 1, pieces: 8 },
  { id: "uramaki-venere-vegetarian", name: "Uramaki Venere Vegetarian", description: "Verdure fritte, salmone flambé, teriyaki e tobiko.", ingredients: ["riso venere", "verdure fritte", "salmone flambé", "teriyaki", "tobiko"], price: 1000, category: "uramaki", image: "/menu/uramaki-venere-vegetarian.png", imageAlt: "Uramaki venere vegetarian", allergens: ["pesce", "glutine", "uova"], spicyLevel: 0, pieces: 8 },
  { id: "uramaki-ebi-bollito", name: "Uramaki Ebi", description: "Avocado, gamberi bolliti, maionese, sesamo, salsa mandorle fritte.", ingredients: ["avocado", "gamberi bolliti", "maionese", "sesamo", "salsa mandorle"], price: 900, category: "uramaki", image: "/menu/uramaki-ebi-bollito.png", imageAlt: "Uramaki ebi bolliti", allergens: ["crostacei", "uova", "sesamo", "frutta-secca"], spicyLevel: 0, pieces: 8 },

  // === TEMPURA ===
  { id: "ebi-tempura-5", name: "Ebi Tempura (5 pz)", description: "Gamberi in tempura croccante.", ingredients: ["gamberi", "pastella tempura"], price: 800, category: "tempura", image: "/menu/ebi-tempura.png", imageAlt: "Ebi tempura", allergens: ["crostacei", "glutine", "uova"], spicyLevel: 0, pieces: 5 },
  { id: "ebi-tempura-mandorla", name: "Ebi Tempura con Mandorla (3 pz)", description: "Gamberi tempura con granella di mandorla.", ingredients: ["gamberi", "pastella tempura", "mandorla"], price: 500, category: "tempura", image: "/menu/ebi-tempura-mandorla.png", imageAlt: "Ebi tempura mandorla", allergens: ["crostacei", "glutine", "uova", "frutta-secca"], spicyLevel: 0, pieces: 3 },
  { id: "tempura-verdura", name: "Tempura Verdura", description: "Verdure miste in tempura.", ingredients: ["verdure miste", "pastella tempura"], price: 500, category: "tempura", image: "/menu/tempura-verdura.png", imageAlt: "Tempura di verdure", allergens: ["glutine", "uova"], spicyLevel: 0, isVegan: false },
  { id: "involtini-gamberi", name: "Involtini Gamberi (3 pz)", description: "Involtini fritti ai gamberi.", ingredients: ["gamberi", "pasta fillo"], price: 350, category: "tempura", image: "/menu/involtini-gamberi.png", imageAlt: "Involtini gamberi", allergens: ["crostacei", "glutine"], spicyLevel: 0, pieces: 3 },
  { id: "involtini-primavera", name: "Involtini Primavera (3 pz)", description: "Involtini vegetariani fritti.", ingredients: ["verdure", "pasta fillo"], price: 300, category: "tempura", image: "/menu/involtini-primavera.png", imageAlt: "Involtini primavera", allergens: ["glutine"], spicyLevel: 0, pieces: 3, isVegan: true },
  { id: "ebi-tempura-kataifi", name: "Ebi Tempura Kataifi (3 pz)", description: "Gamberi in kataifi croccante.", ingredients: ["gamberi", "kataifi"], price: 400, category: "tempura", image: "/menu/ebi-tempura-kataifi.png", imageAlt: "Ebi tempura kataifi", allergens: ["crostacei", "glutine"], spicyLevel: 0, pieces: 3 },
  { id: "calamari-fritti-gamberoni", name: "Calamari Fritti & Gamberoni", description: "Frittura mista di mare.", ingredients: ["calamari", "gamberoni"], price: 800, category: "tempura", image: "/menu/calamari-fritti-gamberoni.png", imageAlt: "Calamari fritti e gamberoni", allergens: ["molluschi", "crostacei", "glutine"], spicyLevel: 0 },
  { id: "pollo-fritto", name: "Pollo Fritto", description: "Bocconcini di pollo fritto stile karaage.", ingredients: ["pollo"], price: 500, category: "tempura", image: "/menu/pollo-fritto.png", imageAlt: "Pollo fritto", allergens: ["glutine"], spicyLevel: 0 },
  { id: "patate-fritte", name: "Patate Fritte", description: "Patatine fritte classiche.", ingredients: ["patate"], price: 250, category: "tempura", image: "/menu/patate-fritte.png", imageAlt: "Patate fritte", allergens: [], spicyLevel: 0, isVegan: true },
  { id: "edamame", name: "Edamame", description: "Fagioli di soia bolliti al sale.", ingredients: ["edamame", "sale"], price: 350, category: "tempura", image: "/menu/edamame.png", imageAlt: "Edamame", allergens: ["soia"], spicyLevel: 0, isVegan: true },

  // === ANTIPASTI & RAVIOLI ===

  { id: "gyoza-pollo", name: "Gyoza Pollo (4 pz)", description: "Ravioli al vapore con pollo.", ingredients: ["pasta gyoza", "pollo"], price: 400, category: "antipasti", image: "/menu/gyoza-pollo.png", imageAlt: "Gyoza pollo", allergens: ["glutine"], spicyLevel: 0, pieces: 4 },  { id: "nuvoletta-gamberi", name: "Nuvolette Gamberi", description: "Croccante cracker ai gamberi.", ingredients: ["cracker", "gamberi"], price: 200, category: "antipasti", image: "/menu/nuvoletta-gamberi.png", imageAlt: "Nuvolette gamberi", allergens: ["crostacei", "glutine"], spicyLevel: 0 },
  { id: "gomma-wakame", name: "Goma Wakame", description: "Insalata di alghe wakame.", ingredients: ["alghe wakame"], price: 400, category: "antipasti", image: "/menu/gomma-wakame.png", imageAlt: "Insalata wakame", allergens: ["soia"], spicyLevel: 0, isVegan: true },
  { id: "pane-fritto", name: "Pane Fritto (3 pz)", description: "Pane dolce fritto.", ingredients: ["pane dolce"], price: 200, category: "antipasti", image: "/menu/pane-fritto.png", imageAlt: "Pane fritto", allergens: ["glutine", "uova", "latte"], spicyLevel: 0, pieces: 3 },
  { id: "pane-coniglio", name: "Pane con Coniglio (3 pz)", description: "Pane dolce di uova con coniglio.", ingredients: ["pane dolce", "uova", "coniglio"], price: 400, category: "antipasti", image: "/menu/pane-coniglio.png", imageAlt: "Pane con coniglio", allergens: ["glutine", "uova"], spicyLevel: 0, pieces: 3 },
  { id: "chicken-bao", name: "Chicken Bao (1 pz)", description: "Panino bao al vapore con pollo.", ingredients: ["pane bao", "pollo"], price: 400, category: "antipasti", image: "/menu/chicken-bao.png", imageAlt: "Chicken bao", allergens: ["glutine"], spicyLevel: 0, pieces: 1 },
  { id: "gyoza-carne", name: "Gyoza Carne (4 pz)", description: "Ravioli giapponesi alla carne.", ingredients: ["pasta gyoza", "carne mista"], price: 400, category: "antipasti", image: "/menu/gyoza-carne.png", imageAlt: "Gyoza carne", allergens: ["glutine"], spicyLevel: 0, pieces: 4 },
  { id: "ravioli-gamberi", name: "Ravioli Gamberi (4 pz)", description: "Ravioli al vapore con gamberi.", ingredients: ["pasta", "gamberi"], price: 400, category: "antipasti", image: "/menu/ravioli-gamberi.png", imageAlt: "Ravioli gamberi", allergens: ["crostacei", "glutine"], spicyLevel: 0, pieces: 4 },
  { id: "ravioli-verdura", name: "Ravioli Verdura (4 pz)", description: "Ravioli al vapore con verdure.", ingredients: ["pasta", "verdure"], price: 400, category: "antipasti", image: "/menu/ravioli-verdura.png", imageAlt: "Ravioli verdura", allergens: ["glutine"], spicyLevel: 0, pieces: 4, isVegan: true },
  { id: "xiaomai-gamberi", name: "Xiaomai Gamberi (4 pz)", description: "Dim sum aperti ai gamberi.", ingredients: ["pasta dim sum", "gamberi"], price: 400, category: "antipasti", image: "/menu/xiaomai-gamberi.png", imageAlt: "Xiaomai gamberi", allergens: ["crostacei", "glutine"], spicyLevel: 0, pieces: 4 },
  { id: "ravioli-misto", name: "Ravioli Misto (3 pz)", description: "Selezione di ravioli misti.", ingredients: ["pasta", "ripieni misti"], price: 400, category: "antipasti", image: "/menu/ravioli-misto.png", imageAlt: "Ravioli misto", allergens: ["glutine"], spicyLevel: 0, pieces: 3 },

  // === GRIGLIATI ===

  { id: "gamberoni-piastra", name: "Gamberoni Piastra (3 pz)", description: "Gamberoni alla piastra.", ingredients: ["gamberoni"], price: 600, category: "grigliati", image: "/menu/gamberoni-piastra.png", imageAlt: "Gamberoni piastra", allergens: ["crostacei"], spicyLevel: 0, pieces: 3 },  { id: "salmon-piastra", name: "Salmon Piastra (2 pz)", description: "Salmone cotto su piastra.", ingredients: ["salmone"], price: 600, category: "grigliati", image: "/menu/salmon-piastra.png", imageAlt: "Salmone piastra", allergens: ["pesce"], spicyLevel: 0, pieces: 2 },
  { id: "spiedini-gamberi", name: "Spiedini Gamberi (3 pz)", description: "Spiedini di gamberi grigliati.", ingredients: ["gamberi"], price: 600, category: "grigliati", image: "/menu/spiedini-gamberi.png", imageAlt: "Spiedini gamberi", allergens: ["crostacei"], spicyLevel: 0, pieces: 3 },
  { id: "spiedini-pollo", name: "Spiedini Pollo (3 pz)", description: "Spiedini di pollo grigliato.", ingredients: ["pollo"], price: 600, category: "grigliati", image: "/menu/spiedini-pollo.png", imageAlt: "Spiedini pollo", allergens: [], spicyLevel: 0, pieces: 3 },

  // === YAKIMESI ===
  { id: "yakimesi-gamberi", name: "Yakimeshi Gamberi", description: "Riso saltato con gamberi, uova, cipolla e verdure.", ingredients: ["riso", "gamberi", "uova", "cipolla", "verdure"], price: 500, category: "yakimesi", image: "/menu/yakimesi-gamberi.png", imageAlt: "Yakimeshi gamberi", allergens: ["crostacei", "uova", "soia"], spicyLevel: 0 },
  { id: "yakimesi-pollo", name: "Yakimeshi Pollo", description: "Riso saltato con pollo, uova e verdure.", ingredients: ["riso", "pollo", "uova", "verdure"], price: 500, category: "yakimesi", image: "/menu/yakimesi-pollo.png", imageAlt: "Yakimeshi pollo", allergens: ["uova", "soia"], spicyLevel: 0 },
  { id: "yakimesi-salmon", name: "Yakimeshi Salmon", description: "Riso saltato con salmone, piselli e uova.", ingredients: ["riso", "salmone", "piselli", "uova"], price: 500, category: "yakimesi", image: "/menu/yakimesi-salmon.png", imageAlt: "Yakimeshi salmone", allergens: ["pesce", "uova", "soia"], spicyLevel: 0 },
  { id: "yakimesi-verdura", name: "Yakimeshi Verdura", description: "Riso saltato con verdure e piselli.", ingredients: ["riso", "verdure", "piselli"], price: 500, category: "yakimesi", image: "/menu/yakimesi-verdura.png", imageAlt: "Yakimeshi verdura", allergens: ["soia"], spicyLevel: 0, isVegan: true },

  // === PIATTI CALDI ===

  { id: "ramen-zuppa", name: "Ramen Zuppa", description: "Ramen in brodo con uova, tempura di gamberi e insalata.", ingredients: ["ramen", "brodo", "uova", "tempura gamberi", "insalata"], price: 600, category: "caldi", image: "/menu/ramen-zuppa.png", imageAlt: "Ramen zuppa", allergens: ["glutine", "crostacei", "uova", "soia"], spicyLevel: 0 },  { id: "gamberi-sale-pepe", name: "Gamberi sale & pepe", description: "Gamberi cotti al sale e pepe.", ingredients: ["gamberi", "sale", "pepe"], price: 650, category: "caldi", image: "/menu/gamberi-sale-pepe.png", imageAlt: "Gamberi sale pepe", allergens: ["crostacei"], spicyLevel: 0 },
  { id: "pollo-limone", name: "Pollo Limone", description: "Pollo croccante con salsa al limone.", ingredients: ["pollo", "salsa limone"], price: 600, category: "caldi", image: "/menu/pollo-limone.png", imageAlt: "Pollo al limone", allergens: ["glutine"], spicyLevel: 0 },
  { id: "spaghetti-riso-verdure", name: "Spaghetti di Riso Verdure", description: "Spaghetti saltati con soia, verdure miste e uova.", ingredients: ["spaghetti di riso", "soia", "verdure", "uova"], price: 500, category: "caldi", image: "/menu/spaghetti-riso-verdure.png", imageAlt: "Spaghetti di riso verdure", allergens: ["soia", "uova"], spicyLevel: 0 },
  { id: "spaghetti-riso-gamberi", name: "Spaghetti di Riso Gamberi", description: "Spaghetti di riso con gamberi, verdure e uova.", ingredients: ["spaghetti di riso", "gamberi", "verdure", "uova"], price: 500, category: "caldi", image: "/menu/spaghetti-riso-gamberi.png", imageAlt: "Spaghetti di riso gamberi", allergens: ["crostacei", "soia", "uova"], spicyLevel: 0 },
  { id: "spaghetti-soia-gamberi", name: "Spaghetti di Soia con Gamberi", description: "Spaghetti di soia con verdure e gamberi.", ingredients: ["spaghetti di soia", "verdure", "gamberi"], price: 500, category: "caldi", image: "/menu/spaghetti-soia-gamberi.png", imageAlt: "Spaghetti di soia gamberi", allergens: ["crostacei", "soia"], spicyLevel: 0 },
  { id: "spaghetti-soia-vegetariani", name: "Spaghetti di Soia Vegetariani", description: "Spaghetti di soia con verdure miste.", ingredients: ["spaghetti di soia", "verdure"], price: 500, category: "caldi", image: "/menu/spaghetti-soia-vegetariani.png", imageAlt: "Spaghetti di soia vegetariani", allergens: ["soia"], spicyLevel: 0, isVegan: true },
  { id: "ramen-verdure", name: "Ramen Verdure", description: "Spaghetti ramen con verdure e uova.", ingredients: ["ramen", "verdure", "uova"], price: 550, category: "caldi", image: "/menu/ramen-verdure.png", imageAlt: "Ramen verdure", allergens: ["glutine", "uova", "soia"], spicyLevel: 0 },
  { id: "ramen-gamberi", name: "Ramen Gamberi", description: "Ramen con carote e gamberi.", ingredients: ["ramen", "carote", "gamberi"], price: 550, category: "caldi", image: "/menu/ramen-gamberi.png", imageAlt: "Ramen gamberi", allergens: ["crostacei", "glutine", "soia"], spicyLevel: 0 },
  { id: "sarsina-spaghetti", name: "Spaghetti Assassina", description: "Spaghetti saltati con pomodoro, ricetta piccante della casa.", ingredients: ["spaghetti", "pomodoro"], price: 800, category: "caldi", image: "/menu/sarsina-spaghetti.png", imageAlt: "Spaghetti Assassina", allergens: ["glutine"], spicyLevel: 1 },
  { id: "udon-crema-avocado", name: "Udon Crema di Avocado", description: "Spaghetti udon in crema delicata di avocado.", ingredients: ["udon", "crema avocado"], price: 1000, category: "caldi", image: "/menu/udon-crema-avocado.png", imageAlt: "Udon crema avocado", allergens: ["glutine"], spicyLevel: 0, isVegan: true },

  // === BEVANDE ===
  {
    id: "coca-cola",
    name: "Coca-Cola",
    description: "Lattina 33cl ghiacciata.",
    ingredients: ["lattina 33cl"],
    price: 200,
    category: "bevande",
    image: "/menu/coca-cola.png",
    imageAlt: "Coca-Cola lattina 33cl",
    allergens: [],
    spicyLevel: 0,
    bgFrom: "#c8102e",
    bgTo: "#450a0a",
  },
  {
    id: "acai-smoothie",
    name: "Açaí Smoothie",
    description: "Frullato di açaí brasiliano, banana e latte di mandorla. Vegano.",
    ingredients: ["açaí", "banana", "latte di mandorla", "granola"],
    price: 550,
    category: "bevande",
    image: "/menu/acai-smoothie.png",
    imageAlt: "Açaí smoothie con topping di granola",
    allergens: ["frutta-secca"],
    spicyLevel: 0,
    isNew: true,
    isVegan: true,
    bgFrom: "#7e22ce",
    bgTo: "#4a044e",
  },

  // === DOLCI ===
  { id: "mochi-mango", name: "Mochi Mango (2 pz)", description: "Mochi giapponesi al mango.", ingredients: ["riso mochi", "mango"], price: 400, category: "dolci", image: "/menu/mochi-mango.png", imageAlt: "Mochi mango", allergens: [], spicyLevel: 0, pieces: 2, isVegan: true },
  { id: "mochi-limone", name: "Mochi Limone (2 pz)", description: "Mochi giapponesi al limone.", ingredients: ["riso mochi", "limone"], price: 400, category: "dolci", image: "/menu/mochi-limone.png", imageAlt: "Mochi limone", allergens: [], spicyLevel: 0, pieces: 2, isVegan: true },
  { id: "mochi-pistacchio", name: "Mochi Pistacchio (2 pz)", description: "Mochi giapponesi al pistacchio.", ingredients: ["riso mochi", "pistacchio"], price: 400, category: "dolci", image: "/menu/mochi-pistacchio.png", imageAlt: "Mochi pistacchio", allergens: ["frutta-secca"], spicyLevel: 0, pieces: 2, isVegan: true },
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

export function getMostOrderedDishes(): Dish[] {
  return menu.filter((d) => d.isMostOrdered);
}

export function searchDishes(query: string): Dish[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.ingredients.some((i) => i.toLowerCase().includes(q)),
  );
}
