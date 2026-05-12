export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  source?: "google" | "tripadvisor" | "instagram";
}

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Antonella M.",
    rating: 5,
    date: "2026-04-22",
    text: "Ordino sempre da loro per l'ufficio: poke spettacolari, riso al punto giusto e arrivano sempre puntuali alla consegna. Lo Special Roll Bellaveduta è una bomba.",
    source: "google",
  },
  {
    id: "r2",
    author: "Federico T.",
    rating: 5,
    date: "2026-03-15",
    text: "Il sashimi misto è di un livello che a Bari non avevo mai trovato. Lo chef sa lavorare il pesce, si vede subito. Tornerò.",
    source: "tripadvisor",
  },
  {
    id: "r3",
    author: "Sara D.",
    rating: 5,
    date: "2026-02-28",
    text: "Ordine via WhatsApp, consegna in 25 minuti, tutto perfetto. La California uramaki è classica ma fatta benissimo. Da provare anche l'açaí.",
    source: "instagram",
  },
];
