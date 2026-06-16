"use client";

import { create } from "zustand";

// Lo sconto è ora un'unica promo automatica (20% da €50) calcolata da
// lib/promo/auto-promo.ts in base al subtotale, sia client (display) sia server
// (anti-tamper in createOrder). Qui resta solo la mancia.
interface PricingState {
  tipCents: number;
  setTip: (cents: number) => void;
}

export const usePricing = create<PricingState>((set) => ({
  tipCents: 0,
  setTip: (cents) => set({ tipCents: Math.max(0, Math.round(cents)) }),
}));
