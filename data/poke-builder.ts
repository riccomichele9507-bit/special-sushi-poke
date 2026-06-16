// Configurazione "Crea la tua poke" — listino + regole di pricing.
// MODIFICA QUI per cambiare ingredienti / limiti / prezzi.
//
// Pricing logic:
// - basePriceCents = costo di base (1 poke base scelti gli ingredienti inclusi)
// - Per ogni categoria con max != null e extraCents != null:
//   se l'utente seleziona N items e N > max → costo extra = (N - max) * extraCents
// - Topping e Salse: no max, no extra cost
// - Il totale finale è basePriceCents + somma extras

export interface PokeBuilderItem {
  id: string;
  label: string;
}

export interface PokeBuilderCategory {
  id: string;
  label: string;
  description: string;
  /** Max ingredienti inclusi nel prezzo base. null = nessun limite. */
  maxIncluded: number | null;
  /** Costo per ogni elemento OLTRE maxIncluded (in centesimi). null = non si può eccedere. */
  extraCents: number | null;
  /** Minimo da selezionare (per validation, es. base = 1 obbligatoria). */
  minRequired: number;
  items: PokeBuilderItem[];
}

export interface PokeBuilderConfig {
  /** Prezzo base in centesimi (es. 1050 = €10,50). TODO: confermare dal titolare. */
  basePriceCents: number;
  /** Mostra il watermark "Prezzo da confermare" in UI. Toggle a false una volta confermato. */
  pricePending: boolean;
  /** Titolo visualizzato in UI. */
  title: string;
  /** Sottotitolo / descrizione breve. */
  subtitle: string;
  categories: PokeBuilderCategory[];
}

export const pokeBuilderConfig: PokeBuilderConfig = {
  // Prezzo base confermato dal titolare: €10,00 + aggiunte.
  basePriceCents: 1000,
  pricePending: false,

  title: "Crea la tua poke",
  subtitle: "Scegli base, proteine, condimenti, topping e salse a tuo gusto.",

  categories: [
    {
      id: "base",
      label: "Base",
      description: "Massimo 2.",
      maxIncluded: 2,
      extraCents: null, // niente extra
      minRequired: 1,
      items: [
        { id: "riso-bianco-giapponese", label: "Riso bianco giapponese" },
        { id: "riso-bianco-insalata", label: "Riso bianco + insalata" },
        { id: "riso-nero", label: "Riso nero" },
        { id: "insalata", label: "Insalata" },
      ],
    },
    {
      id: "proteine",
      label: "Proteine",
      description: "2 comprese nel prezzo, ogni aggiunta +€1,50.",
      maxIncluded: 2,
      extraCents: 150,
      minRequired: 1,
      items: [
        { id: "salmone-crudo", label: "Salmone crudo" },
        { id: "tonno-crudo", label: "Tonno crudo" },
        { id: "gamberi-in-tempura", label: "Gamberi in tempura" },
        { id: "pollo-panato-fritto", label: "Pollo panato fritto" },
        { id: "pollo-saltato", label: "Pollo saltato" },
        { id: "salmone-cotto", label: "Salmone cotto" },
        { id: "salmone-spicy", label: "Salmone spicy" },
        { id: "salmone-crudo-condito", label: "Salmone crudo condito" },
        { id: "tempura-di-salmone", label: "Tempura di salmone" },
        { id: "gamberi-cotti", label: "Gamberi cotti" },
        { id: "surimi", label: "Surimi" },
        { id: "surimi-fritto", label: "Surimi fritto" },
        { id: "philadelphia", label: "Philadelphia" },
        { id: "ricciola", label: "Ricciola" },
        { id: "spigola", label: "Spigola" },
      ],
    },
    {
      id: "condimenti",
      label: "Condimenti",
      description: "Massimo 4 compresi nel prezzo, ogni aggiunta +€1.",
      maxIncluded: 4,
      extraCents: 100,
      minRequired: 0,
      items: [
        { id: "wakame", label: "Wakame" },
        { id: "carote", label: "Carote" },
        { id: "funghi", label: "Funghi" },
        { id: "edamame", label: "Edamame" },
        { id: "cetriolo", label: "Cetriolo" },
        { id: "mango", label: "Mango" },
        { id: "avocado", label: "Avocado" },
        { id: "zenzero", label: "Zenzero" },
        { id: "patatine-fritte", label: "Patatine fritte" },
        { id: "mais", label: "Mais" },
        { id: "zucchine-piastrate", label: "Zucchine piastrate" },
        { id: "rucola", label: "Rucola" },
        { id: "pomodorini", label: "Pomodorini" },
        { id: "ananas", label: "Ananas" },
        { id: "patata-dolce", label: "Patata dolce" },
        { id: "cavolo-viola", label: "Cavolo viola" },
        { id: "olive", label: "Olive" },
      ],
    },
    {
      id: "topping",
      label: "Topping",
      description: "Nessun limite, tutti inclusi.",
      maxIncluded: null,
      extraCents: 0,
      minRequired: 0,
      items: [
        { id: "cipolla-croccante", label: "Cipolla croccante" },
        { id: "anacardi", label: "Anacardi" },
        { id: "tobiko", label: "Tobiko" },
        { id: "mandorle", label: "Mandorle" },
        { id: "arachidi", label: "Arachidi" },
        { id: "sesamo", label: "Sesamo" },
        { id: "pistacchio", label: "Pistacchio" },
        { id: "kataifi", label: "Kataifi" },
      ],
    },
    {
      id: "salse",
      label: "Salse",
      description: "Nessun limite, tutte incluse.",
      maxIncluded: null,
      extraCents: 0,
      minRequired: 0,
      items: [
        { id: "soia", label: "Soia" },
        { id: "maionese-spicy", label: "Maionese spicy" },
        { id: "salsa-cheddar", label: "Salsa cheddar" },
        { id: "teriyaki", label: "Teriyaki" },
        { id: "salsa-mango", label: "Salsa mango" },
        { id: "agropiccante", label: "Agropiccante" },
        { id: "maionese", label: "Maionese" },
        { id: "salsa-alle-mandorle", label: "Salsa alle mandorle" },
        { id: "salsa-al-pistacchio", label: "Salsa al pistacchio" },
        { id: "passion-fruit", label: "Passion fruit" },
        { id: "salsa-rosa", label: "Salsa rosa" },
      ],
    },
  ],
};

/**
 * Calcola il prezzo finale dato il dizionario { categoryId: [itemIds...] }.
 * Ritorna { totalCents, extrasCents, extrasBreakdown }.
 */
export function computePokePrice(
  selections: Record<string, string[]>,
): {
  totalCents: number;
  extrasCents: number;
  extrasBreakdown: Array<{ category: string; extras: number; cents: number }>;
} {
  let extrasCents = 0;
  const breakdown: Array<{ category: string; extras: number; cents: number }> = [];

  for (const cat of pokeBuilderConfig.categories) {
    const selected = selections[cat.id]?.length ?? 0;
    if (
      cat.maxIncluded != null &&
      cat.extraCents != null &&
      cat.extraCents > 0 &&
      selected > cat.maxIncluded
    ) {
      const extraCount = selected - cat.maxIncluded;
      const cents = extraCount * cat.extraCents;
      extrasCents += cents;
      breakdown.push({ category: cat.label, extras: extraCount, cents });
    }
  }

  return {
    totalCents: pokeBuilderConfig.basePriceCents + extrasCents,
    extrasCents,
    extrasBreakdown: breakdown,
  };
}

/**
 * Valida che le selezioni rispettino i minimi e i max non-extra.
 * Ritorna array di errori (vuoto = ok).
 */
export function validatePokeSelections(
  selections: Record<string, string[]>,
): string[] {
  const errors: string[] = [];
  for (const cat of pokeBuilderConfig.categories) {
    const count = selections[cat.id]?.length ?? 0;
    if (count < cat.minRequired) {
      errors.push(`${cat.label}: minimo ${cat.minRequired} richiesto.`);
    }
    if (
      cat.maxIncluded != null &&
      cat.extraCents == null &&
      count > cat.maxIncluded
    ) {
      errors.push(`${cat.label}: massimo ${cat.maxIncluded}.`);
    }
  }
  return errors;
}
