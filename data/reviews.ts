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
    text: "Ordino sempre da loro per l'ufficio: poke spettacolari, riso al punto giusto e arrivano sempre puntuali al ritiro. Lo Special Roll Bellaveduta è una bomba.",
    source: "google",
  },
  {
    id: "r2",
    author: "Marco R.",
    rating: 5,
    date: "2026-04-10",
    text: "Pesce fresco, materie prime di qualità e prezzi onesti per quello che offrono. Bari aveva bisogno di un posto così.",
    source: "google",
  },
  {
    id: "r3",
    author: "Giulia P.",
    rating: 4,
    date: "2026-03-28",
    text: "Buonissimi tutti i poke, salmone freschissimo. Asporto veloce e packaging curato. L'unica nota: avrei preferito un'opzione gluten free in più.",
    source: "google",
  },
  {
    id: "r4",
    author: "Federico T.",
    rating: 5,
    date: "2026-03-15",
    text: "Il sashimi misto è di un livello che a Bari non avevo mai trovato. Lo chef sa lavorare il pesce, si vede subito. Tornerò.",
    source: "tripadvisor",
  },
  {
    id: "r5",
    author: "Sara D.",
    rating: 5,
    date: "2026-02-28",
    text: "Provato per la prima volta ieri sera: ordine via WhatsApp, ritiro in 25 minuti, tutto perfetto. La California uramaki è classica ma fatta benissimo.",
    source: "instagram",
  },
  {
    id: "r6",
    author: "Davide L.",
    rating: 4,
    date: "2026-02-12",
    text: "Ottimo rapporto qualità-prezzo per un asporto sushi. Mi sarei aspettato porzioni leggermente più grandi sui poke, ma la qualità c'è tutta.",
    source: "google",
  },
];
