// Funzioni di invio email transazionali.
// Strategia MINIMAL (decisione 12/06): 1 sola email automatica per ordine,
// al click "Affidato al rider" / "Pronto al ritiro". Il resto del tracking
// è visibile in tempo reale sulla pagina /account/orders/[orderNumber].

import "server-only";
import { getResend, getFromEmail, getReplyTo, getBccEmail } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPromoConfig } from "@/lib/promo/server";
import { buildUnsubscribeUrl, buildUnsubscribePostUrl } from "@/lib/marketing/unsubscribe-token";
import { restaurant } from "@/data/restaurant";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://specialsushipokebari.com";

function formatRomeTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Email mandata quando l'admin clicca "Affidato al rider" (delivery)
 * o "Pronto al ritiro" (pickup). Dedup via email_type univoco per ordine.
 * Fail-safe: log + return su qualsiasi errore, MAI throw.
 */
export async function sendOrderOutForFulfillmentEmail(
  order: Order,
): Promise<{ sent: boolean; reason?: string }> {
  const resend = getResend();
  if (!resend) {
    return { sent: false, reason: "resend_not_configured" };
  }

  if (!order.customer_email) {
    return { sent: false, reason: "no_customer_email" };
  }

  const admin = createAdminClient();
  const emailType = `out_for_fulfillment:${order.order_number}`;

  // Dedup: se gia inviata per quest'ordine, skip
  const { data: existing } = await admin
    .from("marketing_emails_log")
    .select("id")
    .eq("email_type", emailType)
    .eq("email", order.customer_email)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return { sent: false, reason: "already_sent" };
  }

  const isDelivery = order.order_type === "delivery";
  const slotStart = formatRomeTime(order.slot_start);
  const slotEnd = formatRomeTime(order.slot_end);
  const subject = isDelivery
    ? `🛵 Il tuo ordine ${order.order_number} è partito!`
    : `🍱 Il tuo ordine ${order.order_number} è pronto al ritiro!`;

  const trackingUrl = `${SITE_URL}/account/orders/${order.order_number}`;

  const html = renderEmailHtml({
    isDelivery,
    customerName: order.customer_name,
    orderNumber: order.order_number,
    slotStart,
    slotEnd,
    addressLine: order.address_line ?? undefined,
    trackingUrl,
  });

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyTo(),
      bcc: getBccEmail(),
      to: order.customer_email,
      subject,
      html,
    });

    if (result.error) {
      console.error("[email] resend error:", result.error);
      return { sent: false, reason: result.error.message };
    }

    // Log per audit
    await admin.from("marketing_emails_log").insert({
      customer_id: order.customer_id,
      email: order.customer_email,
      email_type: emailType,
      subject,
      resend_id: result.data?.id ?? null,
    });

    return { sent: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[email] send failed:", msg);
    return { sent: false, reason: msg };
  }
}

// ============================================================
// Template HTML (inline, no React Email per ora - 1 sola email)
// ============================================================
function renderEmailHtml(args: {
  isDelivery: boolean;
  customerName: string;
  orderNumber: string;
  slotStart: string;
  slotEnd: string;
  addressLine?: string;
  trackingUrl: string;
}): string {
  const headline = args.isDelivery
    ? "Il tuo ordine è partito! 🛵"
    : "Il tuo ordine è pronto al ritiro! 🍱";
  const subline = args.isDelivery
    ? `Il rider è in strada verso ${args.addressLine ? escapeHtml(args.addressLine) : "il tuo indirizzo"}.`
    : "Puoi venire a ritirarlo al nostro locale in Via G. Petroni 12/H-i, Bari.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${headline}</title></head>
<body style="margin:0;padding:0;background:#f3eee5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d2a26;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="background:#ffffff;border-radius:24px;padding:32px 24px;box-shadow:0 4px 18px -6px rgba(28,28,28,0.08);">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:14px;color:#8a8074;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">Special Sushi Poke</div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#2d2a26;line-height:1.2;">${headline}</h1>
      </div>

      <p style="font-size:16px;line-height:1.5;margin:0 0 16px 0;">
        Ciao <strong>${escapeHtml(args.customerName)}</strong>,
      </p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 24px 0;color:#5a5048;">
        ${subline}
      </p>

      <div style="background:linear-gradient(135deg,#5a7a64 0%,#4a6a54 100%);color:#fff;padding:20px;border-radius:16px;text-align:center;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;margin-bottom:8px;">${args.isDelivery ? "Consegna prevista" : "Pronto al ritiro"}</div>
        <div style="font-size:32px;font-weight:800;line-height:1;">
          ${args.slotStart} – ${args.slotEnd}
        </div>
      </div>

      <div style="font-size:14px;color:#8a8074;margin-bottom:8px;">Numero ordine:</div>
      <div style="font-family:monospace;font-size:16px;font-weight:600;color:#2d2a26;margin-bottom:24px;">${args.orderNumber}</div>

      <div style="text-align:center;margin:32px 0 8px 0;">
        <a href="${args.trackingUrl}" style="display:inline-block;background:#2d2a26;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:14px;">
          Vedi stato ordine →
        </a>
      </div>

      <p style="font-size:12px;color:#8a8074;text-align:center;margin:24px 0 0 0;line-height:1.5;">
        ${args.isDelivery
          ? "Se hai bisogno di noi, chiamaci al 080 123 4567"
          : "Ti aspettiamo in Via G. Petroni 12/H-i, Bari · 080 123 4567"}
      </p>
    </div>

    <p style="font-size:11px;color:#a0998e;text-align:center;margin:24px 0 0 0;">
      Special Sushi Poke · Via G. Petroni 12/H-i, 70124 Bari<br/>
      Questa email è una notifica transazionale legata al tuo ordine.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// Shell brandizzato condiviso + email benvenuto / ordine / promo
// ============================================================
const LOGO_URL = `${SITE_URL}/logo-mark.png`;
const WHATSAPP_DISPLAY = "+39 353 326 3829";
const RESTAURANT_ADDR = "Via G. Petroni 12/H-i, 70124 Bari";

function brandShell(opts: {
  title: string;
  bodyHtml: string;
  heroImg?: string;
  /** Se presente, aggiunge il link di disiscrizione nel footer (email marketing). */
  unsubscribeUrl?: string;
}): string {
  const unsubLine = opts.unsubscribeUrl
    ? `<br/>Ricevi questa email come cliente di Special Sushi Poke · <a href="${opts.unsubscribeUrl}" style="color:#8a8074;text-decoration:underline;">Annulla iscrizione</a>`
    : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f3eee5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d2a26;">
  <div style="max-width:600px;margin:0 auto;padding:28px 18px;">
    <div style="text-align:center;margin-bottom:16px;">
      <img src="${LOGO_URL}" alt="Special Sushi Poke" width="48" height="48" style="width:48px;height:48px;object-fit:contain;" />
      <div style="font-size:12px;color:#8a8074;letter-spacing:0.22em;text-transform:uppercase;margin-top:6px;">Special Sushi Poke</div>
    </div>
    <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 18px -6px rgba(28,28,28,0.08);">
      ${opts.heroImg ? `<img src="${opts.heroImg}" alt="" width="600" style="display:block;width:100%;height:auto;" />` : ""}
      <div style="padding:28px 24px;">${opts.bodyHtml}</div>
    </div>
    <p style="font-size:11px;color:#a0998e;text-align:center;margin:18px 0 0 0;line-height:1.6;">
      Special Sushi Poke · ${RESTAURANT_ADDR}<br/>
      WhatsApp ${WHATSAPP_DISPLAY} · <a href="${SITE_URL}/menu" style="color:#5a7a64;">Vai al menu</a>${unsubLine}
    </p>
  </div>
</body></html>`;
}

function ctaButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0 4px 0;"><a href="${href}" style="display:inline-block;background:#5a7a64;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:700;font-size:15px;">${label}</a></div>`;
}

type SendResult = { sent: boolean; reason?: string };

/** Email di benvenuto dopo l'iscrizione (una volta per indirizzo). */
export async function sendWelcomeEmail(args: {
  to: string;
  name: string;
  customerId?: string | null;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "resend_not_configured" };
  if (!args.to?.includes("@")) return { sent: false, reason: "no_email" };
  const admin = createAdminClient();
  const emailType = `welcome:${args.to}`;
  const { data: existing } = await admin
    .from("marketing_emails_log")
    .select("id")
    .eq("email_type", emailType)
    .eq("email", args.to)
    .limit(1)
    .maybeSingle();
  if (existing) return { sent: false, reason: "already_sent" };

  // Vantaggi REALI dell'iscrizione. Niente programma punti: non esiste (nessuna
  // tabella, nessun saldo) e prometterlo creava un debito impagabile — chi
  // arrivava a "100 punti" non avrebbe mai visto i 5€.
  // La promo è configurabile dall'admin (restaurant_settings): letta dal DB e
  // non scritta a mano, altrimenti cambiandola in pannello l'email mentirebbe.
  const promo = await getPromoConfig();
  const promoLine = promo.active
    ? `Da ora la consegna a Bari è gratuita e ogni ordine sopra i ${(promo.minCents / 100).toFixed(0)}€ ha il ${promo.percent}% di sconto applicato in automatico — nessun codice da inserire.`
    : `Da ora la consegna a Bari è gratuita.`;

  // Tono "transazionale" (no immagine grande, meno cue da newsletter) → resta in
  // Posta principale invece che Promozioni/Spam.
  const subject = "Grazie per la tua iscrizione — Special Sushi Poke";
  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;">Ciao ${escapeHtml(args.name || "")}, account creato ✓</h1>
    <p style="font-size:16px;line-height:1.55;margin:0 0 14px;color:#5a5048;">Grazie per esserti iscritto a Special Sushi Poke. Il tuo account è attivo.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 14px;color:#2d2a26;">${promoLine} E il tuo indirizzo resta salvato: la prossima volta ordini in due tap.</p>
    <p style="font-size:15px;line-height:1.6;margin:0;color:#5a5048;">Quando vuoi, trovi il menu qui: <a href="${SITE_URL}/menu" style="color:#5a7a64;font-weight:600;">specialsushipokebari.com/menu</a></p>
  `;
  const html = brandShell({ title: subject, bodyHtml: body });
  const text = `Ciao ${args.name || ""}, account creato.\n\nGrazie per esserti iscritto a Special Sushi Poke. Il tuo account è attivo.\n${promoLine} E il tuo indirizzo resta salvato: la prossima volta ordini in due tap.\n\nMenu: ${SITE_URL}/menu\n\nSpecial Sushi Poke - Via G. Petroni 12/H-i, Bari`;
  try {
    const r = await resend.emails.send({ from: getFromEmail(), replyTo: getReplyTo(), bcc: getBccEmail(), to: args.to, subject, html, text });
    if (r.error) return { sent: false, reason: r.error.message };
    await admin.from("marketing_emails_log").insert({
      customer_id: args.customerId ?? null,
      email: args.to,
      email_type: emailType,
      subject,
      resend_id: r.data?.id ?? null,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** Email "ordine ricevuto" alla conferma dell'ordine (una volta per ordine). */
export async function sendOrderConfirmationEmail(order: Order): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "resend_not_configured" };
  if (!order.customer_email) return { sent: false, reason: "no_email" };
  const admin = createAdminClient();
  const emailType = `order_received:${order.order_number}`;
  const { data: existing } = await admin
    .from("marketing_emails_log")
    .select("id")
    .eq("email_type", emailType)
    .eq("email", order.customer_email)
    .limit(1)
    .maybeSingle();
  if (existing) return { sent: false, reason: "already_sent" };

  const isDelivery = order.order_type === "delivery";
  const slot = `${formatRomeTime(order.slot_start)}–${formatRomeTime(order.slot_end)}`;
  const items = Array.isArray(order.items)
    ? (order.items as Array<{ name?: string; qty?: number; lineTotalCents?: number }>)
    : [];
  const itemsHtml = items
    .map(
      (it) =>
        `<tr><td style="padding:4px 0;font-size:14px;color:#2d2a26;">${escapeHtml(String(it.qty ?? 1))}× ${escapeHtml(it.name ?? "Piatto")}</td><td style="padding:4px 0;font-size:14px;text-align:right;color:#5a5048;">€${(((it.lineTotalCents ?? 0)) / 100).toFixed(2).replace(".", ",")}</td></tr>`,
    )
    .join("");
  // Il risparmio è un FATTO già avvenuto (discount_cents dell'ordine), non una
  // promessa: rimpiazza i "punti" che venivano calcolati qui, mostrati e mai
  // salvati da nessuna parte. Rinforza anche l'abitudine giusta — ordinare dal
  // sito conviene — che è l'unico messaggio utile contro le piattaforme.
  const savedCents = order.discount_cents ?? 0;
  const subject = `Ordine ${order.order_number} ricevuto ✓ Special Sushi Poke`;
  const body = `
    <h1 style="margin:0 0 8px;font-size:23px;font-weight:800;">Ordine #${escapeHtml(order.order_number)} ricevuto ✓</h1>
    <p style="font-size:16px;line-height:1.5;margin:0 0 16px;color:#5a5048;">Grazie <strong>${escapeHtml(order.customer_name)}</strong>, lo prepariamo subito!</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 10px;">${itemsHtml}
      <tr><td style="border-top:1px solid #eee;padding-top:10px;font-size:15px;font-weight:700;">Totale</td><td style="border-top:1px solid #eee;padding-top:10px;font-size:15px;font-weight:800;text-align:right;color:#5a7a64;">€${(order.total_cents / 100).toFixed(2).replace(".", ",")}</td></tr>
    </table>
    <div style="background:#5a7a64;color:#fff;border-radius:14px;padding:14px;text-align:center;margin:14px 0;">
      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85;">${isDelivery ? "Consegna" : "Ritiro"}</div>
      <div style="font-size:22px;font-weight:800;">${slot}</div>
      ${isDelivery && order.address_line ? `<div style="font-size:13px;opacity:.9;margin-top:4px;">${escapeHtml(order.address_line)}</div>` : ""}
    </div>
    ${savedCents > 0 ? `<p style="font-size:14px;text-align:center;color:#5a7a64;margin:0 0 6px;">💚 Hai risparmiato <strong>€${(savedCents / 100).toFixed(2).replace(".", ",")}</strong> ordinando dal nostro sito.</p>` : ""}
    ${order.customer_id ? ctaButton(`${SITE_URL}/account/orders/${order.order_number}`, "Vedi il tuo ordine") : ctaButton(`${SITE_URL}/menu`, "Ordina ancora")}
  `;
  const html = brandShell({ title: subject, bodyHtml: body });
  try {
    // Nessun BCC al titolare: riceve la sua email dedicata (sendOwnerOrderEmail)
    // con telefono e composizione poke. Questa resta la conferma "pulita" al cliente.
    const r = await resend.emails.send({ from: getFromEmail(), replyTo: getReplyTo(), to: order.customer_email, subject, html });
    if (r.error) return { sent: false, reason: r.error.message };
    await admin.from("marketing_emails_log").insert({
      customer_id: order.customer_id,
      email: order.customer_email,
      email_type: emailType,
      subject,
      resend_id: r.data?.id ?? null,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/**
 * Email al TITOLARE (ristorante) ad ogni nuovo ordine, con i dettagli operativi
 * che NON stanno nella conferma cliente: TELEFONO del cliente e la COMPOSIZIONE
 * delle poke personalizzate (base, proteine, topping, salse). Va SOLO al titolare
 * (indirizzo BCC/ristorante). Dedup per ordine. Mai throw.
 */
export async function sendOwnerOrderEmail(order: Order): Promise<SendResult> {
  try {
    const resend = getResend();
    if (!resend) return { sent: false, reason: "resend_not_configured" };
    const to = getBccEmail();
    if (!to) return { sent: false, reason: "no_owner_email" };

    const admin = createAdminClient();
    const emailType = `order_owner:${order.order_number}`;
    const { data: existing } = await admin
      .from("marketing_emails_log")
      .select("id")
      .eq("email_type", emailType)
      .eq("email", to)
      .limit(1)
      .maybeSingle();
    if (existing) return { sent: false, reason: "already_sent" };

    const isDelivery = order.order_type === "delivery";
    const slot = `${formatRomeTime(order.slot_start)}–${formatRomeTime(order.slot_end)}`;
    const items = Array.isArray(order.items)
      ? (order.items as Array<{
          name?: string;
          qty?: number;
          lineTotalCents?: number;
          variant?: string;
          extras?: string[];
        }>)
      : [];
    const itemsHtml = items
      .map((it) => {
        const price = `€${((it.lineTotalCents ?? 0) / 100).toFixed(2).replace(".", ",")}`;
        const sub = [
          it.variant,
          it.extras && it.extras.length ? it.extras.join(", ") : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const subRow = sub
          ? `<tr><td colspan="2" style="font-size:13px;color:#5a5048;padding:0 0 6px 14px;">↳ ${escapeHtml(sub)}</td></tr>`
          : "";
        return `<tr><td style="padding:4px 0;font-size:15px;font-weight:600;color:#2d2a26;">${escapeHtml(String(it.qty ?? 1))}× ${escapeHtml(it.name ?? "Piatto")}</td><td style="padding:4px 0;font-size:15px;text-align:right;color:#5a5048;">${price}</td></tr>${subRow}`;
      })
      .join("");

    const subject = `🍣 Nuovo ordine #${order.order_number} — ${order.customer_name}`;
    const body = `
      <div style="text-align:center;background:${isDelivery ? "#5a7a64" : "#b8965a"};color:#fff;border-radius:12px;padding:10px;margin:0 0 14px;">
        <div style="font-size:20px;font-weight:800;letter-spacing:.05em;">${isDelivery ? "DELIVERY" : "RITIRO"}</div>
        <div style="font-size:14px;opacity:.95;">${isDelivery ? "Consegna" : "Pronto"}: ${slot}</div>
      </div>
      <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;">Ordine #${escapeHtml(order.order_number)}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#5a5048;line-height:1.5;">
        <strong>${escapeHtml(order.customer_name)}</strong><br/>
        📞 <a href="tel:${escapeHtml(order.customer_phone)}" style="color:#5a7a64;font-weight:700;text-decoration:none;">${escapeHtml(order.customer_phone)}</a>
      </p>
      ${
        isDelivery
          ? `<p style="margin:0 0 12px;font-size:14px;color:#5a5048;line-height:1.5;">📍 ${escapeHtml(order.address_line ?? "")}${order.address_notes ? "<br/>" + escapeHtml(order.address_notes) : ""}${order.driver_notes ? '<br/><em>Note rider: ' + escapeHtml(order.driver_notes) + "</em>" : ""}</p>`
          : ""
      }
      <table style="width:100%;border-collapse:collapse;margin:6px 0;">${itemsHtml}
        ${order.discount_cents > 0 ? `<tr><td style="font-size:14px;color:#5a5048;padding-top:6px;">Sconto${order.discount_code ? " (" + escapeHtml(order.discount_code) + ")" : ""}</td><td style="text-align:right;font-size:14px;color:#5a5048;padding-top:6px;">−€${(order.discount_cents / 100).toFixed(2).replace(".", ",")}</td></tr>` : ""}
        <tr><td style="border-top:1px solid #eee;padding-top:8px;font-size:16px;font-weight:800;">TOTALE</td><td style="border-top:1px solid #eee;padding-top:8px;font-size:16px;font-weight:800;text-align:right;color:#5a7a64;">€${(order.total_cents / 100).toFixed(2).replace(".", ",")}</td></tr>
      </table>
      <p style="font-size:13px;color:#8a8074;margin:6px 0 0;">Pagamento: ${order.payment_method === "card" ? "Carta — già pagato online" : "Contanti/carta alla consegna"}</p>
    `;
    const html = brandShell({ title: subject, bodyHtml: body });
    const r = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyTo(),
      to,
      subject,
      html,
    });
    if (r.error) return { sent: false, reason: r.error.message };
    await admin.from("marketing_emails_log").insert({
      customer_id: order.customer_id,
      email: to,
      email_type: emailType,
      subject,
      resend_id: r.data?.id ?? null,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/**
 * Email post-ordine che invita a lasciare una recensione Google (inviata ~12h
 * dopo l'ordine, dal cron). A TUTTI i clienti (delivery e pickup). Dedup per
 * ordine. Mai throw.
 */
export async function sendReviewRequestEmail(order: Order): Promise<SendResult> {
  try {
    const resend = getResend();
    if (!resend) return { sent: false, reason: "resend_not_configured" };
    if (!order.customer_email?.includes("@")) {
      return { sent: false, reason: "no_email" };
    }

    const admin = createAdminClient();
    const emailType = `review_request:${order.order_number}`;
    const { data: existing } = await admin
      .from("marketing_emails_log")
      .select("id")
      .eq("email_type", emailType)
      .eq("email", order.customer_email)
      .limit(1)
      .maybeSingle();
    if (existing) return { sent: false, reason: "already_sent" };

    const subject = "Com'è andata? Lascia una recensione ⭐ — Special Sushi Poke";
    const body = `
      <h1 style="margin:0 0 10px;font-size:23px;font-weight:800;">Grazie ${escapeHtml(order.customer_name)}! 🍣</h1>
      <p style="font-size:16px;line-height:1.55;margin:0 0 16px;color:#5a5048;">Speriamo tu abbia gustato il tuo ordine. Ci regali <strong>30 secondi</strong>? Una tua recensione su Google ci aiuta tantissimo — e aiuta altri a scoprirci.</p>
      ${ctaButton(restaurant.googleReviewUrl, "Lascia una recensione ⭐")}
      <p style="font-size:13px;color:#8a8074;text-align:center;margin:16px 0 0;">Grazie di cuore — il team di Special Sushi Poke</p>
    `;
    const html = brandShell({ title: subject, bodyHtml: body });
    const r = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyTo(),
      to: order.customer_email,
      subject,
      html,
    });
    if (r.error) return { sent: false, reason: r.error.message };
    await admin.from("marketing_emails_log").insert({
      customer_id: order.customer_id,
      email: order.customer_email,
      email_type: emailType,
      subject,
      resend_id: r.data?.id ?? null,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/**
 * Riepilogo campagna al TITOLARE (gmail ristorante): prova che la promo è partita
 * + a quanti clienti + anteprima dell'offerta inviata. Una sola email per campagna.
 */
export async function sendCampaignRecapEmail(args: {
  campaign: string;
  sent: number;
  eligible: number;
  promoCode: string;
  promoPercent: number;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "resend_not_configured" };
  const to = getReplyTo(); // casella del ristorante
  const subject = `📣 Promo inviata a ${args.sent} clienti — Special Sushi Poke`;
  const body = `
    <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;">Campagna promo inviata ✅</h1>
    <p style="font-size:16px;line-height:1.55;color:#5a5048;">La promo di riattivazione clienti è partita. Riepilogo per te (titolare):</p>
    <div style="background:#f3eee5;border-radius:14px;padding:16px;margin:8px 0 14px;">
      <p style="margin:0;font-size:15px;">✉️ Ricevuta da <strong>${args.sent}</strong> clienti (su ${args.eligible} idonei con consenso).</p>
    </div>
    <p style="font-size:13px;color:#8a8074;margin:0 0 6px;text-transform:uppercase;letter-spacing:.12em;">Anteprima di ciò che hanno ricevuto:</p>
    <div style="border:2px dashed #b8965a;border-radius:16px;padding:16px;text-align:center;">
      <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a8074;">Codice sconto</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:.08em;color:#5a7a64;margin:4px 0;">${escapeHtml(args.promoCode)}</div>
      <div style="font-size:13px;color:#5a5048;">−${args.promoPercent}% sul prossimo ordine</div>
    </div>
  `;
  const html = brandShell({ title: subject, bodyHtml: body });
  try {
    const r = await resend.emails.send({ from: getFromEmail(), to, subject, html });
    if (r.error) return { sent: false, reason: r.error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** Converte il testo libero dell'admin in paragrafi HTML sicuri (escape + a capo). */
function textToParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="font-size:16px;line-height:1.6;margin:0 0 14px;color:#2d2a26;">${escapeHtml(
          para,
        ).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

/**
 * Email di CAMPAGNA marketing (oggetto + messaggio liberi dall'admin, codice
 * sconto opzionale). Include SEMPRE il link di disiscrizione (compliance).
 * Dedup per campagna via email_type = campaignKey. Mai throw.
 */
export async function sendMarketingCampaignEmail(args: {
  to: string;
  name: string | null;
  customerId: string | null;
  subject: string;
  messageText: string;
  promoCode?: string | null;
  campaignKey: string; // es. "campaign:<slug>:<YYYY-MM>"
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "resend_not_configured" };
  if (!args.to?.includes("@")) return { sent: false, reason: "no_email" };
  const admin = createAdminClient();
  const unsubscribeUrl = buildUnsubscribeUrl(args.to);
  const greeting = args.name
    ? `<p style="font-size:16px;line-height:1.6;margin:0 0 14px;color:#2d2a26;">Ciao <strong>${escapeHtml(args.name)}</strong>,</p>`
    : "";
  const promoBox = args.promoCode
    ? `<div style="border:2px dashed #b8965a;border-radius:16px;padding:16px;text-align:center;margin:6px 0 4px;">
         <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a8074;">Codice sconto</div>
         <div style="font-size:26px;font-weight:800;letter-spacing:.08em;color:#5a7a64;margin:4px 0;">${escapeHtml(args.promoCode)}</div>
         <div style="font-size:13px;color:#5a5048;">Usalo sul tuo prossimo ordine</div>
       </div>`
    : "";
  const body = `
    ${greeting}
    ${textToParagraphs(args.messageText)}
    ${promoBox}
    ${ctaButton(`${SITE_URL}/menu`, "Ordina ora")}
  `;
  const html = brandShell({ title: args.subject, bodyHtml: body, unsubscribeUrl });
  const text = `${args.name ? `Ciao ${args.name},\n\n` : ""}${args.messageText}${
    args.promoCode ? `\n\nCodice sconto: ${args.promoCode}` : ""
  }\n\nOrdina: ${SITE_URL}/menu\n\nAnnulla iscrizione: ${unsubscribeUrl}`;

  // Prenotazione ATOMICA prima dell'invio: l'indice unico parziale
  // marketing_emails_log_campaign_uq (email_type LIKE 'campaign:%') fa fallire
  // il secondo insert concorrente (23505) → niente doppio invio in caso di
  // doppio click / retry / due tab admin.
  const { data: reserved, error: reserveErr } = await admin
    .from("marketing_emails_log")
    .insert({
      customer_id: args.customerId,
      email: args.to,
      email_type: args.campaignKey,
      subject: args.subject,
      resend_id: null,
    })
    .select("id")
    .single();
  if (reserveErr) {
    // 23505 = unique_violation → già inviata/prenotata per questa campagna.
    if (reserveErr.code === "23505") return { sent: false, reason: "already_sent" };
    return { sent: false, reason: reserveErr.message };
  }

  try {
    const r = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyTo(),
      to: args.to,
      subject: args.subject,
      html,
      text,
      headers: {
        // One-click unsubscribe (RFC 8058): migliora deliverability e reputazione.
        // L'header punta all'endpoint POST; il link visibile porta alla pagina di conferma.
        "List-Unsubscribe": `<${buildUnsubscribePostUrl(args.to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (r.error) {
      // Invio fallito → annulla la prenotazione così un retry può riprovare.
      await admin.from("marketing_emails_log").delete().eq("id", reserved.id);
      return { sent: false, reason: r.error.message };
    }
    await admin
      .from("marketing_emails_log")
      .update({ resend_id: r.data?.id ?? null })
      .eq("id", reserved.id);
    return { sent: true };
  } catch (e) {
    await admin.from("marketing_emails_log").delete().eq("id", reserved.id);
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** Email promo per cliente inattivo (dedup per campagna). */
export async function sendDormantPromoEmail(args: {
  to: string;
  name: string | null;
  customerId: string | null;
  code: string;
  percent: number;
  campaignKey: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "resend_not_configured" };
  if (!args.to?.includes("@")) return { sent: false, reason: "no_email" };
  const admin = createAdminClient();
  const emailType = `promo_dormant:${args.campaignKey}`;
  const { data: existing } = await admin
    .from("marketing_emails_log")
    .select("id")
    .eq("email_type", emailType)
    .eq("email", args.to)
    .limit(1)
    .maybeSingle();
  if (existing) return { sent: false, reason: "already_sent" };

  const unsubscribeUrl = buildUnsubscribeUrl(args.to);
  const subject = "Ci manchi! 🍣 Un'offerta per te da Special Sushi Poke";
  const body = `
    <h1 style="margin:0 0 10px;font-size:23px;font-weight:800;">Ci manchi, ${escapeHtml(args.name || "amico")}! 🍣</h1>
    <p style="font-size:16px;line-height:1.55;margin:0 0 16px;color:#5a5048;">Non ordini da un po'. Torna a trovarci: sushi freschi, <strong>consegna gratis</strong> a Bari e un regalo per te.</p>
    <div style="border:2px dashed #b8965a;border-radius:16px;padding:16px;text-align:center;margin:0 0 4px;">
      <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a8074;">Codice sconto</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:.08em;color:#5a7a64;margin:4px 0;">${escapeHtml(args.code)}</div>
      <div style="font-size:13px;color:#5a5048;">−${args.percent}% sul tuo prossimo ordine</div>
    </div>
    ${ctaButton(`${SITE_URL}/menu`, "Ordina ora")}
  `;
  const html = brandShell({ title: subject, bodyHtml: body, unsubscribeUrl });
  try {
    const r = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyTo(),
      to: args.to,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${buildUnsubscribePostUrl(args.to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (r.error) return { sent: false, reason: r.error.message };
    await admin.from("marketing_emails_log").insert({
      customer_id: args.customerId,
      email: args.to,
      email_type: emailType,
      subject,
      resend_id: r.data?.id ?? null,
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}
