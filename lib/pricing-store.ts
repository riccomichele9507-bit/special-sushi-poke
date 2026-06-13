"use client";

import { create } from "zustand";

/** Sconto applicato lato client (validato dal server). Solo per DISPLAY:
 *  il totale reale è ricalcolato server-side in createOrder (anti-tamper). */
export interface AppliedDiscount {
  code: string;
  kind: "percent" | "fixed";
  /** percent: 1..100 · fixed: centesimi */
  value: number;
  label: string | null;
}

/** Calcola lo sconto in centesimi per un subtotale dato. */
export function discountCentsFor(
  d: AppliedDiscount | null,
  subtotalCents: number,
): number {
  if (!d) return 0;
  if (d.kind === "percent") return Math.round((subtotalCents * d.value) / 100);
  return Math.min(d.value, subtotalCents);
}

/** Etichetta breve dello sconto, es. "−15%" o "−€5,00". */
export function discountShortLabel(d: AppliedDiscount): string {
  return d.kind === "percent"
    ? `−${d.value}%`
    : `−€${(d.value / 100).toFixed(2).replace(".", ",")}`;
}

interface PricingState {
  discount: AppliedDiscount | null;
  tipCents: number;
  setDiscount: (d: AppliedDiscount | null) => void;
  clearDiscount: () => void;
  setTip: (cents: number) => void;
}

export const usePricing = create<PricingState>((set) => ({
  discount: null,
  tipCents: 0,
  setDiscount: (d) => set({ discount: d }),
  clearDiscount: () => set({ discount: null }),
  setTip: (cents) => set({ tipCents: Math.max(0, Math.round(cents)) }),
}));
