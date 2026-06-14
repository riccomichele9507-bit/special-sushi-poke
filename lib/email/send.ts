// Funzioni di invio email transazionali.
// Strategia MINIMAL (decisione 12/06): 1 sola email automatica per ordine,
// al click "Affidato al rider" / "Pronto al ritiro". Il resto del tracking
// è visibile in tempo reale sulla pagina /account/orders/[orderNumber].

import "server-only";
import { getResend, getFromEmail, getReplyTo } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
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
    ? `Il rider è in strada verso ${args.addressLine ?? "il tuo indirizzo"}.`
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
const VAN_URL = `${SITE_URL}/hero/hero-van.png`;
const WHATSAPP_DISPLAY = "+39 353 326 3829";
const RESTAURANT_ADDR = "Via G. Petroni 12/H-i, 70124 Bari";

function brandShell(opts: { title: string; bodyHtml: string; heroImg?: string }): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${opts.title}</title></head>
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
      WhatsApp ${WHATSAPP_DISPLAY} · <a href="${SITE_URL}/menu" style="color:#5a7a64;">Vai al menu</a>
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

  const subject = "Benvenuto in Special Sushi Poke 🍣 I tuoi premi ti aspettano";
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;">Benvenuto/a, ${escapeHtml(args.name || "amico")}! 🎉</h1>
    <p style="font-size:16px;line-height:1.55;margin:0 0 14px;color:#5a5048;">Grazie per esserti iscritto a Special Sushi Poke. Da ora ogni ordine ti fa guadagnare premi.</p>
    <div style="background:#f3eee5;border-radius:16px;padding:16px 18px;margin:0 0 4px;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#2d2a26;">⭐ <strong>1€ speso = 1 punto.</strong> A <strong>100 punti</strong> ricevi <strong>€5 di sconto</strong> automatico.<br/>🛵 <strong>Consegna gratuita</strong> a Bari.</p>
    </div>
    ${ctaButton(`${SITE_URL}/menu`, "Ordina ora")}
  `;
  const html = brandShell({ title: subject, bodyHtml: body, heroImg: VAN_URL });
  try {
    const r = await resend.emails.send({ from: getFromEmail(), to: args.to, subject, html });
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
  const eligible = Math.max(0, order.subtotal_cents - (order.discount_cents ?? 0));
  const points = order.customer_id ? Math.floor(eligible / 100) : 0;
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
    ${points > 0 ? `<p style="font-size:14px;text-align:center;color:#b8965a;margin:0 0 6px;">⭐ Hai guadagnato <strong>${points} punti</strong>!</p>` : ""}
    ${order.customer_id ? ctaButton(`${SITE_URL}/account/orders/${order.order_number}`, "Vedi il tuo ordine") : ctaButton(`${SITE_URL}/menu`, "Ordina ancora")}
  `;
  const html = brandShell({ title: subject, bodyHtml: body });
  try {
    const r = await resend.emails.send({ from: getFromEmail(), to: order.customer_email, subject, html });
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
  const html = brandShell({ title: subject, bodyHtml: body });
  try {
    const r = await resend.emails.send({ from: getFromEmail(), to: args.to, subject, html });
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
