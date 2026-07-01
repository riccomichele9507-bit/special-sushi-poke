// Client-side menu registry.
// Sostituisce gli helper sincroni di data/menu.ts per il cart-store.
//
// Flusso: RSC fetcha il menu dal DB → MenuRegistryProvider chiama hydrateMenuRegistry()
// → cart-store legge dal registry. Finché non idratato, fallback a data/menu.ts statico
// (mantiene la compatibilità per il primo render e zero-downtime sulla migrazione).

import { menu as staticMenu } from "@/data/menu";
import type { Dish } from "@/types/dish";

let registry: Map<string, Dish> | null = null;
let registryArray: Dish[] | null = null;

/**
 * Popola il registry con i piatti dal DB. Idempotente: chiamare ad ogni render
 * del provider; aggiorna solo se l'array è cambiato (per supportare hot updates
 * da Realtime in FASE D).
 */
export function hydrateMenuRegistry(dishes: Dish[]): void {
  if (registryArray === dishes) return;
  registryArray = dishes;
  registry = new Map(dishes.map((d) => [d.id, d]));
}

export function isMenuRegistryHydrated(): boolean {
  return registry !== null;
}

/**
 * Lookup sincrono per id. Usato dal cart-store.
 * Fallback a data/menu.ts statico finché il registry non è idratato.
 */
export function getDishById(id: string): Dish | undefined {
  if (registry) return registry.get(id);
  return staticMenu.find((d) => d.id === id);
}

/**
 * Lista completa del menu (attivi). Fallback a static.
 */
export function getMenu(): Dish[] {
  if (registryArray) return registryArray;
  return staticMenu;
}

// Helper di lettura per i componenti (leggono dal DB via registry idratato,
// con fallback statico). Sostituiscono gli omonimi di data/menu.ts, che
// leggevano SOLO il file statico → il sito non rifletteva le modifiche admin.

export function getDishesByCategory(category: string): Dish[] {
  return getMenu().filter((d) => d.category === category);
}

export function searchDishes(query: string): Dish[] {
  const all = getMenu();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.ingredients.some((i) => i.toLowerCase().includes(q)),
  );
}

export function getFeaturedDishes(): Dish[] {
  return getMenu().filter((d) => d.isFeatured);
}

export function getMostOrderedDishes(): Dish[] {
  return getMenu().filter((d) => d.isMostOrdered);
}
