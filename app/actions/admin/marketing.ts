"use server";

import { assertAdmin } from "./helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDormantPromoEmail, sendCampaignRecapEmail } from "@/lib/email/send";

const PROMO_CODE = "BENTORNATO10";
const PROMO_PERCENT = 10;
const DORMANT_DAYS = 30;

export type CampaignResult =
  | { ok: true; sent: number; eligible: number }
  | { ok: false; error: string };

/**
 * Invia la promo di riattivazione ai clienti inattivi da 30+ giorni che hanno
 * dato consenso marketing. Dedup mensile (campaignKey = anno-mese) → un cliente
 * non riceve due volte la stessa campagna nello stesso mese.
 */
export async function sendDormantCampaign(): Promise<CampaignResult> {
  try {
    await assertAdmin();
    const sb = createAdminClient();
    const { data: dormant, error } = await sb.rpc("list_dormant_customers", {
      days: DORMANT_DAYS,
    });
    if (error) throw new Error(error.message);

    const campaignKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const eligible = (dormant ?? []).filter((c) => c.marketing_consent && c.email);

    // Guest (non registrati) con consenso marketing: la loro email vive solo sugli
    // ordini. Includiamo quelli inattivi da 30+ giorni, deduplicati per email ed
    // esclusi quelli già presenti tra i clienti registrati.
    const cutoffMs = Date.now() - DORMANT_DAYS * 86_400_000;
    const { data: guestOrders } = await sb
      .from("orders")
      .select("customer_email, customer_name, created_at")
      .is("customer_id", null)
      .eq("marketing_consent", true)
      .order("created_at", { ascending: false });

    const seen = new Set(eligible.map((c) => c.email.toLowerCase()));
    const guestEligible: { email: string; name: string | null }[] = [];
    for (const o of guestOrders ?? []) {
      const email = (o.customer_email ?? "").toLowerCase();
      if (!email || seen.has(email)) continue; // dedup + esclude registrati/già visti
      seen.add(email); // primo incontro = ordine più recente di questa email
      if (new Date(o.created_at).getTime() <= cutoffMs) {
        guestEligible.push({ email: o.customer_email, name: o.customer_name });
      }
    }

    let sent = 0;
    for (const c of eligible) {
      const r = await sendDormantPromoEmail({
        to: c.email,
        name: c.name,
        customerId: c.id,
        code: PROMO_CODE,
        percent: PROMO_PERCENT,
        campaignKey,
      });
      if (r.sent) sent++;
    }
    for (const g of guestEligible) {
      const r = await sendDormantPromoEmail({
        to: g.email,
        name: g.name,
        customerId: null,
        code: PROMO_CODE,
        percent: PROMO_PERCENT,
        campaignKey,
      });
      if (r.sent) sent++;
    }

    const totalEligible = eligible.length + guestEligible.length;
    // Riepilogo al titolare: prova che la promo è partita + a quanti (1 sola email).
    if (sent > 0) {
      await sendCampaignRecapEmail({
        campaign: campaignKey,
        sent,
        eligible: totalEligible,
        promoCode: PROMO_CODE,
        promoPercent: PROMO_PERCENT,
      });
    }

    return { ok: true, sent, eligible: totalEligible };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Errore" };
  }
}
