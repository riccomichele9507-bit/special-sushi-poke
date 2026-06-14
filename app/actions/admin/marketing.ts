"use server";

import { assertAdmin } from "./helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDormantPromoEmail } from "@/lib/email/send";

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
    return { ok: true, sent, eligible: eligible.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Errore" };
  }
}
