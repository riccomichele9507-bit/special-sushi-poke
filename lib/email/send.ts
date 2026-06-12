// Funzioni di invio email transazionali.
// Strategia MINIMAL (decisione 12/06): 1 sola email automatica per ordine,
// al click "Affidato al rider" / "Pronto al ritiro". Il resto del tracking
// è visibile in tempo reale sulla pagina /account/orders/[orderNumber].

import "server-only";
import { getResend, getFromEmail } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://special-sushi-poke.vercel.app";

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
