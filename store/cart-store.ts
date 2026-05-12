"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useMemo, useState } from "react";
import type { CartItem, CartItemWithDish, CartState } from "@/types/cart";
import { getDishById } from "@/data/menu";

const STORAGE_KEY = "ssp-cart-v1";

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (dishId) =>
        set((state) => {
          const existing = state.items.find((i) => i.dishId === dishId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === dishId ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { dishId, quantity: 1 }] };
        }),
      remove: (dishId) =>
        set((state) => ({
          items: state.items.filter((i) => i.dishId !== dishId),
        })),
      increment: (dishId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.dishId === dishId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        })),
      decrement: (dishId) =>
        set((state) => {
          const target = state.items.find((i) => i.dishId === dishId);
          if (!target) return state;
          if (target.quantity <= 1) {
            return { items: state.items.filter((i) => i.dishId !== dishId) };
          }
          return {
            items: state.items.map((i) =>
              i.dishId === dishId ? { ...i, quantity: i.quantity - 1 } : i,
            ),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useCartStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartTotal(): number {
  return useCartStore((s) =>
    s.items.reduce((sum, item) => {
      const dish = getDishById(item.dishId);
      return sum + (dish ? dish.price * item.quantity : 0);
    }, 0),
  );
}

export function useCartItemsWithDish(): CartItemWithDish[] {
  const items = useCartStore(useShallow((s) => s.items));
  return useMemo(
    () =>
      items
        .map((item) => {
          const dish = getDishById(item.dishId);
          if (!dish) return null;
          return {
            dish,
            quantity: item.quantity,
            lineTotal: dish.price * item.quantity,
          };
        })
        .filter((x): x is CartItemWithDish => x !== null),
    [items],
  );
}
