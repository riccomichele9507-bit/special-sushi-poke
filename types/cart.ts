import type { Dish } from "./dish";

export interface CartItem {
  dishId: string;
  quantity: number;
}

export interface CartItemWithDish {
  dish: Dish;
  quantity: number;
  lineTotal: number;
}

export interface CartState {
  items: CartItem[];
  add: (dishId: string) => void;
  remove: (dishId: string) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  clear: () => void;
}
