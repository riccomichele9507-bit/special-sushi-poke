"use client";

import { create } from "zustand";

interface DishDetailState {
  openDishId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const useDishDetail = create<DishDetailState>((set) => ({
  openDishId: null,
  open: (id) => set({ openDishId: id }),
  close: () => set({ openDishId: null }),
}));
