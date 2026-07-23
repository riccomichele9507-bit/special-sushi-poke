"use server";

import { createHash } from "node:crypto";
import { assertAdmin } from "./helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendDormantPromoEmail,
  sendCampaignRecapEmail,
  sendMarketingCampaignEmail,
} from "@/lib/email/send";
import {
  applySegment,
  mapAudienceRow,
  type AudienceRow,
  type SegmentCriteria,
} from "@/lib/marketing/segments";
import { segmentCriteriaSchema, campaignContentSchema } from "@/lib/validations";

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

// ============================================================================
// Campagne a segmentazione (nuova sezione /admin/marketing)
// ============================================================================

// Tetto prudenziale sotto il limite Resend free (3k/mese) e cap per singolo invio.
const RESEND_MONTHLY_CAP = 2900;
const MAX_PER_RUN = 500;

/** Carica l'audience unificata (registrati + guest) con metriche aggregate. */
async function loadAudience(
  sb: ReturnType<typeof createAdminClient>,
): Promise<AudienceRow[]> {
  const { data, error } = await sb.rpc("get_marketing_audience");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAudienceRow);
}

/** Set (lowercase) delle email nella suppression list. */
async function loadSuppressed(
  sb: ReturnType<typeof createAdminClient>,
): Promise<Set<string>> {
  const { data } = await sb.from("marketing_unsubscribes").select("email");
  return new Set((data ?? []).map((r) => r.email.toLowerCase()));
}

function slugify(s: string): string {
  const out = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // rimuove i diacritici combinanti
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return out || "campagna";
}

function monthKey(now: Date): string {
  return now.toISOString().slice(0, 7); // YYYY-MM
}

export type PreviewRow = {
  email: string;
  name: string | null;
  isRegistered: boolean;
  marketingConsent: boolean;
  suppressed: boolean;
  totalOrders: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
};

export type PreviewResult =
  | {
      ok: true;
      total: number; // righe che matchano il segmento
      consenting: number; // di cui con consenso marketing
      suppressed: number; // di cui disiscritte (suppression list)
      reachableDefault: number; // destinatari con invio "solo consenso" (default)
      sample: PreviewRow[]; // destinatari (ordinati per email), fino a SAMPLE_CAP
      sampleTruncated: boolean; // true se ci sono più righe di quelle restituite
    }
  | { ok: false; error: string };

// Quante righe di anteprima restituire al client (audience piccola → tutte).
const PREVIEW_SAMPLE_CAP = 300;

/**
 * Calcola quante persone matchano il segmento + un'anteprima. Sola lettura.
 * Non invia nulla. Usata per il contatore/anteprima live nella UI.
 */
export async function previewSegment(
  criteriaRaw: SegmentCriteria,
): Promise<PreviewResult> {
  try {
    await assertAdmin();
    const criteria = segmentCriteriaSchema.parse(criteriaRaw);
    const sb = createAdminClient();

    const [audience, suppressed] = await Promise.all([
      loadAudience(sb),
      loadSuppressed(sb),
    ]);

    const matched = applySegment(audience, criteria);
    const notSuppressed = matched.filter((r) => !suppressed.has(r.email.toLowerCase()));
    const consenting = matched.filter((r) => r.marketingConsent).length;
    const reachableDefault = notSuppressed.filter((r) => r.marketingConsent).length;

    // Ordina per email (scansione prevedibile + ricerca lato client affidabile).
    const sorted = [...matched].sort((a, b) => a.email.localeCompare(b.email));
    const sample: PreviewRow[] = sorted.slice(0, PREVIEW_SAMPLE_CAP).map((r) => ({
      email: r.email,
      name: r.name,
      isRegistered: r.isRegistered,
      marketingConsent: r.marketingConsent,
      suppressed: suppressed.has(r.email.toLowerCase()),
      totalOrders: r.totalOrders,
      totalSpentCents: r.totalSpentCents,
      lastOrderAt: r.lastOrderAt,
    }));

    return {
      ok: true,
      total: matched.length,
      consenting,
      suppressed: matched.length - notSuppressed.length,
      reachableDefault,
      sample,
      sampleTruncated: matched.length > PREVIEW_SAMPLE_CAP,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Errore" };
  }
}

export type SendCampaignResult =
  | {
      ok: true;
      matched: number; // righe del segmento
      suppressed: number; // rimosse perché disiscritte
      skippedNoConsent: number; // rimosse dalla guardia consenso (invio default)
      recipients: number; // destinatari finali (prima del cap Resend)
      sent: number; // email effettivamente inviate (esclusi dedup/errori)
      capped: boolean; // true se il cap mensile Resend ha troncato l'invio
    }
  | { ok: false; error: string };

/**
 * Invia una campagna al segmento. Guardie applicate in ordine:
 *  1) suppression list (SEMPRE rimossa, hard opt-out);
 *  2) consenso: default solo consenso=sì; includeNoConsent=true forza anche i no
 *     (scelta consapevole dell'utente, con doppia conferma lato UI);
 *  3) cap Resend mensile + cap per singolo invio;
 *  4) dedup per campagna (email_type = campaign:<slug>:<YYYY-MM>).
 */
export async function sendCampaign(
  criteriaRaw: SegmentCriteria,
  contentRaw: unknown,
): Promise<SendCampaignResult> {
  try {
    await assertAdmin();
    const criteria = segmentCriteriaSchema.parse(criteriaRaw);
    const content = campaignContentSchema.parse(contentRaw);
    const sb = createAdminClient();
    const now = new Date();

    const [audience, suppressed] = await Promise.all([
      loadAudience(sb),
      loadSuppressed(sb),
    ]);

    const matched = applySegment(audience, criteria, now.getTime());
    const notSuppressed = matched.filter((r) => !suppressed.has(r.email.toLowerCase()));
    const recipients = content.includeNoConsent
      ? notSuppressed
      : notSuppressed.filter((r) => r.marketingConsent);
    const skippedNoConsent = content.includeNoConsent
      ? 0
      : notSuppressed.length - recipients.length;

    // Cap Resend: conta TUTTE le email del mese (transazionali + campagne), non
    // solo le campagne, altrimenti si sfora il limite free 3k/mese e Resend
    // rifiuta anche le email d'ordine.
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const { count: sentThisMonth } = await sb
      .from("marketing_emails_log")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", monthStart.toISOString());

    const remaining = Math.max(0, RESEND_MONTHLY_CAP - (sentThisMonth ?? 0));
    const allowed = Math.min(recipients.length, remaining, MAX_PER_RUN);
    const capped = allowed < recipients.length;

    const promoCode = content.promoCode?.trim() ? content.promoCode.trim().toUpperCase() : null;

    // Dedup key su HASH del contenuto (oggetto + messaggio + codice): campagne
    // con contenuto diverso ma oggetto simile NON collidono (niente skip
    // silenziosi); ri-inviare contenuto identico nello stesso mese dedupa.
    const contentHash = createHash("sha1")
      .update(`${content.subject}\n${content.message}\n${promoCode ?? ""}`)
      .digest("hex")
      .slice(0, 8);
    const campaignKey = `campaign:${slugify(content.subject)}-${contentHash}:${monthKey(now)}`;

    let sent = 0;
    for (const r of recipients.slice(0, allowed)) {
      const res = await sendMarketingCampaignEmail({
        to: r.email,
        name: r.name,
        customerId: r.customerId,
        subject: content.subject,
        messageText: content.message,
        promoCode,
        campaignKey,
      });
      if (res.sent) sent++;
    }

    return {
      ok: true,
      matched: matched.length,
      suppressed: matched.length - notSuppressed.length,
      skippedNoConsent,
      recipients: recipients.length,
      sent,
      capped,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Errore" };
  }
}
