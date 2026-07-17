"use client";

import { create } from "zustand";

// Stato di prezzo lato CLIENT (solo display): mancia + sconto del codice
// applicato al checkout. La promo automatica non sta qui: si ricalcola dal
// subtotale con lib/promo/auto-promo.ts. Il server ricalcola comunque tutto in
// createOrder (anti-tamper): questi valori servono solo a mostrare il totale.
interface PricingState {
  tipCents: number;
  setTip: (cents: number) => void;

  /** Sconto del codice applicato, in centesimi (0 = nessun codice). */
  codeCents: number;
  /** Codice normalizzato applicato (es. "SUSHI10"), null se nessuno. */
  codeLabel: string | null;
  /**
   * Subtotale su cui `codeCents` è stato calcolato. Se il carrello cambia il
   * valore non vale più (uno sconto percentuale dipende dal subtotale) → chi
   * legge deve confrontarlo col subtotale corrente invece di fidarsi.
   */
  codeForSubtotalCents: number;

  setCodeDiscount: (v: {
    cents: number;
    label: string;
    subtotalCents: number;
  }) => void;
  clearCodeDiscount: () => void;
}

export const usePricing = create<PricingState>((set) => ({
  tipCents: 0,
  setTip: (cents) => set({ tipCents: Math.max(0, Math.round(cents)) }),

  codeCents: 0,
  codeLabel: null,
  codeForSubtotalCents: 0,
  setCodeDiscount: ({ cents, label, subtotalCents }) =>
    set({
      codeCents: Math.max(0, Math.round(cents)),
      codeLabel: label,
      codeForSubtotalCents: subtotalCents,
    }),
  clearCodeDiscount: () =>
    set({ codeCents: 0, codeLabel: null, codeForSubtotalCents: 0 }),
}));
