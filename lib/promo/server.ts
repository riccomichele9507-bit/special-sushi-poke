// Lettura SERVER della config promo dal DB (restaurant_settings). Fonte di
// verità per createOrder (anti-tamper) e per idratare il client nel layout.

import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PROMO, type PromoConfig } from "./auto-promo";

/** Config promo dal DB. Cache per-request (React cache) → una sola query. */
export const getPromoConfig = cache(async (): Promise<PromoConfig> => {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("restaurant_settings")
      .select("auto_promo_active, auto_promo_percent, auto_promo_min_cents")
      .eq("id", 1)
      .maybeSingle();
    if (!data) return DEFAULT_PROMO;
    return {
      active: data.auto_promo_active ?? DEFAULT_PROMO.active,
      percent: data.auto_promo_percent ?? DEFAULT_PROMO.percent,
      minCents: data.auto_promo_min_cents ?? DEFAULT_PROMO.minCents,
    };
  } catch {
    return DEFAULT_PROMO;
  }
});
