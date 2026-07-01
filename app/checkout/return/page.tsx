import { redirect } from "next/navigation";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enqueuePrintJob } from "@/lib/print/queue";
import {
  sendOrderConfirmationEmail,
  sendOwnerOrderEmail,
} from "@/lib/email/send";
import { PostPaymentRedirect } from "./redirect-client";

/**
 * Fallback del webhook Stripe: conferma l'ordine appena il pagamento risulta
 * completo, SENZA dipendere dal webhook (che in test può non essere configurato).
 * Idempotente: agisce solo se l'ordine è ancora "received".
 * Usa il service-role → non richiede sessione utente.
 */
async function confirmPaidOrder(
  orderNumber: string | undefined,
  paymentIntentId?: string | null,
): Promise<{ id: string; isGuest: boolean } | null> {
  if (!orderNumber) return null;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return null;

  const info = { id: order.id, isGuest: order.customer_id === null };

  // Robustezza: salva il riferimento del pagamento (payment intent) se manca,
  // indipendentemente dal webhook. Così il pagamento è tracciato/rimborsabile
  // anche se il webhook è lento o non configurato.
  if (paymentIntentId && !order.stripe_payment_intent_id) {
    await admin
      .from("orders")
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq("id", order.id);
  }

  if (order.status !== "received") return info; // già confermato dal webhook → solo info

  await admin
    .from("orders")
    .update({ status: "confirmed", status_updated_at: new Date().toISOString() })
    .eq("id", order.id);
  await admin.from("order_status_history").insert({
    order_id: order.id,
    status: "confirmed",
    changed_by: "checkout-return",
  });
  const { data: full } = await admin
    .from("orders")
    .select("*")
    .eq("id", order.id)
    .single();
  if (full) {
    await enqueuePrintJob(full);
    await sendOrderConfirmationEmail(full); // best-effort
    await sendOwnerOrderEmail(full); // telefono + composizione poke (solo titolare)
  }
  return info;
}

/** Destinazione post-pagamento: ospite → grazie pubblica; registrato → profilo. */
function landingTarget(
  info: { id: string; isGuest: boolean } | null,
  orderNumber: string | undefined,
): string {
  if (info?.isGuest) return `/checkout/grazie?id=${info.id}`;
  return `/account?paid=${orderNumber ?? ""}`;
}

interface PageProps {
  searchParams: Promise<{ session_id?: string; order_number?: string }>;
}

/**
 * Atterraggio dopo il pagamento Embedded.
 * Verifica lo stato della session: se complete → redirect a tracking ordine,
 * altrimenti riporta al checkout.
 */
export default async function CheckoutReturnPage({ searchParams }: PageProps) {
  const { session_id, order_number } = await searchParams;

  if (!session_id) {
    redirect("/checkout");
  }

  // Se Stripe non configurato (env vars mancanti in dev), manda comunque al profilo
  if (!isStripeConfigured()) {
    if (order_number) {
      const info = await confirmPaidOrder(order_number);
      return <PostPaymentRedirect target={landingTarget(info, order_number)} />;
    }
    return <PostPaymentRedirect target="/account" />;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const finalOrderNumber =
      (session.metadata?.order_number as string | undefined) ?? order_number;

    if (session.status === "complete") {
      // payment_intent della sessione (non espanso → è l'id stringa).
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      // Conferma l'ordine subito (fallback del webhook) + salva il payment intent.
      const info = await confirmPaidOrder(finalOrderNumber, paymentIntentId);
      // Pagina 200 + redirect client (NON redirect server) → la sessione Supabase
      // sopravvive al ritorno. Ospite → grazie pubblica; registrato → profilo coi punti.
      return <PostPaymentRedirect target={landingTarget(info, finalOrderNumber)} />;
    }
    if (session.status === "open") {
      // Pagamento ancora aperto → riporta al checkout per riprovare
      redirect("/checkout?retry=1");
    }
    // session expired / altro
    redirect(`/account?retry=${finalOrderNumber}`);
  } catch (e) {
    // NEXT_REDIRECT non è un errore vero — è il modo in cui redirect() comunica
    if (e && typeof e === "object" && "digest" in e) throw e;
    console.error("Stripe session retrieve failed:", e);
    redirect("/account");
  }
}
