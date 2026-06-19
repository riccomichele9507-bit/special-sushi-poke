"use client";

import { hydratePromoConfig, type PromoConfig } from "@/lib/promo/auto-promo";

/**
 * Idrata la config promo lato client con il valore dal DB (passato dall'RSC nel
 * layout), come MenuRegistryProvider per il menu. Così carrello e banner mostrano
 * la promo aggiornata se il titolare la cambia dall'admin.
 */
export function PromoConfigProvider({
  config,
  children,
}: {
  config: PromoConfig;
  children: React.ReactNode;
}) {
  hydratePromoConfig(config);
  return <>{children}</>;
}
