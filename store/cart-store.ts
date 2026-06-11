"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useMemo, useState } from "react";
import type {
  CartItem,
  CartItemWithDish,
  CartState,
  CustomPokeConfig,
} from "@/types/cart";
import type { Dish } from "@/types/dish";
import { getDishById } from "@/lib/menu-registry";

const STORAGE_KEY = "ssp-cart-v2";

/**
 * Sintetizza un Dish "virtuale" da una CustomPokeConfig, così il carrello può
 * renderizzarlo come un qualsiasi piatto (stesso path nelle UI).
 */
function buildCustomPokeDish(
  cartDishId: string,
  config: CustomPokeConfig,
): Dish {
  const ingredientsFlat = Object.values(config.selectionLabels).flat();
  return {
    id: cartDishId,
    name: "La tua poke",
    description: ingredientsFlat.join(", "),
    ingredients: ingredientsFlat,
    price: config.basePriceCents + config.extrasCents,
    category: "poke",
    image: "/menu/poke-chicken-bowl.png",
    imageAlt: "Poke personalizzata",
    allergens: [],
    spicyLevel: 0,
  };
}

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
      addCustomPoke: (config) =>
        set((state) => {
          // Ogni custom poke = nuova riga distinta, mai unita ad altre.
          const uniqueId = `custom-poke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          return {
            items: [
              ...state.items,
              { dishId: uniqueId, quantity: 1, custom: config },
            ],
          };
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

function resolveDish(item: CartItem) {
  if (item.custom) {
    return buildCustomPokeDish(item.dishId, item.custom);
  }
  return getDishById(item.dishId);
}

export function useCartTotal(): number {
  return useCartStore((s) =>
    s.items.reduce((sum, item) => {
      const dish = resolveDish(item);
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
          const dish = resolveDish(item);
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
