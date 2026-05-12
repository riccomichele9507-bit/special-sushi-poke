"use client";

import { create } from "zustand";
import { DISCOUNT_CODES, type DiscountCode } from "@/lib/discount-codes";

interface PricingState {
  discountCode: DiscountCode | null;
  tipCents: number;
  applyDiscount: (code: string) => boolean;
  clearDiscount: () => void;
  setTip: (cents: number) => void;
}

export const usePricing = create<PricingState>((set) => ({
  discountCode: null,
  tipCents: 0,
  applyDiscount: (code) => {
    const normalized = code.trim().toUpperCase();
    const found = DISCOUNT_CODES[normalized];
    if (found) {
      set({ discountCode: found });
      return true;
    }
    return false;
  },
  clearDiscount: () => set({ discountCode: null }),
  setTip: (cents) => set({ tipCents: Math.max(0, Math.round(cents)) }),
}));
