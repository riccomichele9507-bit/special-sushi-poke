"use client";

import { hydrateMenuRegistry } from "@/lib/menu-registry";
import type { Dish } from "@/types/dish";

/**
 * Idrata il menu registry con il menu fetchato server-side da DB.
 * Da montare nel root layout (`app/layout.tsx`) avvolgendo `{children}`.
 *
 * Esempio:
 *   const menu = await getMenu();
 *   <MenuRegistryProvider menu={menu}>{children}</MenuRegistryProvider>
 *
 * L'idratazione avviene **durante il render** (top-level), così il cart-store
 * vede il registry popolato prima del primo accesso.
 */
export function MenuRegistryProvider({
  menu,
  children,
}: {
  menu: Dish[];
  children: React.ReactNode;
}) {
  hydrateMenuRegistry(menu);
  return children;
}
