// Webhook Stripe: riceve eventi pagamento e aggiorna lo stato ordini.
// SICUREZZA: verifica obbligatoria della firma con STRIPE_WEBHOOK_SECRET.
// IDEMPOTENCY: ogni event.id è registrato in stripe_webhook_events_processed
// per non riprocessare lo stesso evento (Stripe ritrasmette in caso di failure).

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enqueuePrintJob } from "@/lib/print/queue";

export const runtime = "nodejs";
// Body raw richiesto da Stripe per verificare signature
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe non configurato" },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET non configurato");
    return NextResponse.json(
      { error: "Webhook secret mancante" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature header mancante" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "signature error";
    console.error("Stripe webhook signature verification failed:", msg);
    return NextResponse.json(
      { error: "Signature non valida" },
      { status: 400 },
    );
  }

  // Idempotency: rifiuta event.id già processato
  const admin = createAdminClient();
  const { error: dedupError } = await admin
    .from("stripe_webhook_events_processed")
    .insert({
      event_id: event.id,
      event_type: event.type,
    });

  if (dedupError) {
    // Likely conflict on PK event_id → già processato
    console.log(`Stripe webhook duplicato ignorato: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Dispatch eventi
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          admin,
        );
        break;

      case "charge.refunded":
      case "payment_intent.payment_failed":
        await handleRefundOrFailed(event, admin);
        break;

      default:
        // Altri eventi: log e ignora
        console.log(`Stripe webhook tipo non gestito: ${event.type}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler error";
    console.error(`Stripe webhook handler error (${event.type}):`, msg);
    // Stripe ritenterà in caso di 500
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Handler: pagamento completato → marca ordine confirmed + accoda print job + (futuro) email.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  admin: ReturnType<typeof createAdminClient>,
) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("checkout.session.completed senza metadata.order_id", session.id);
    return;
  }

  // Recupera ordine
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) {
    console.error(`Ordine ${orderId} non trovato per session ${session.id}`);
    return;
  }

  // Update status + payment_intent_id
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await admin
    .from("orders")
    .update({
      status: "confirmed",
      stripe_payment_intent_id: paymentIntentId ?? null,
      stripe_session_id: session.id,
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await admin.from("order_status_history").insert({
    order_id: orderId,
    status: "confirmed",
    changed_by: "stripe-webhook",
  });

  // Accoda print job (recupera ordine aggiornato)
  const { data: full } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (full) {
    await enqueuePrintJob(full);
  }

  // TODO C7: trigger email conferma ordine via Resend
  console.log(`Ordine ${order.order_number} confermato via Stripe`);
}

/**
 * Handler: refund o payment failed → marca ordine refunded.
 * NOTA: il cliente non può cancellare/rimborsare (#10 eliminato).
 * Questo handler scatta solo se l'admin emette refund manuale da Stripe dashboard.
 */
async function handleRefundOrFailed(
  event: Stripe.Event,
  admin: ReturnType<typeof createAdminClient>,
) {
  let paymentIntentId: string | undefined;
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
  } else if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    paymentIntentId = pi.id;
  }

  if (!paymentIntentId) return;

  await admin
    .from("orders")
    .update({
      status: "refunded",
      status_updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntentId);
}
