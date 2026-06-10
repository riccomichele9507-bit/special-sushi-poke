"use client";

import { hydrateMenuRegistry } from "@/lib/menu-registry";
import type { Dish } from "@/types/dish";

/**
 * Wrappa l'app e idrata il menu-registry con i dati dal DB (passati dal layout RSC).
 * Hydrate sincrono durante il render → il cart-store ha il menu disponibile
 * sin dal primo render dei discendenti. Idempotente.
 */
export function MenuRegistryProvider({
  initialMenu,
  children,
}: {
  initialMenu: Dish[];
  children: React.ReactNode;
}) {
  hydrateMenuRegistry(initialMenu);
  return <>{children}</>;
}
