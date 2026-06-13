"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export type CheckoutSessionResult =
  | { ok: true; clientSecret: string; sessionId: string }
  | { ok: false; errorMessage: string };

/**
 * Crea una Stripe Checkout Session per un ordine esistente in stato 'received'.
 * Ritorna l'URL dove redirigere il cliente.
 *
 * Pre-requisiti env:
 *   STRIPE_SECRET_KEY (server)
 *   STRIPE_WEBHOOK_SECRET (per il webhook handler)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client, per Stripe.js futuro)
 *   NEXT_PUBLIC_SITE_URL (per success/cancel URLs)
 */
export async function createCheckoutSession(
  orderId: string,
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      errorMessage:
        "Pagamento con carta non ancora attivo. Scegli 'Contanti alla consegna' per ora.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, errorMessage: "Devi essere loggato." };
  }

  // Fetch ordine + verifica ownership
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) {
    return { ok: false, errorMessage: "Ordine non trovato." };
  }
  if (order.status !== "received") {
    return {
      ok: false,
      errorMessage: `Ordine già in stato "${order.status}", non pagabile di nuovo.`,
    };
  }

  const stripe = getStripe();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://special-sushi-poke.vercel.app";

  try {
    const sessionParams = {
      // EMBEDDED MODE: pagamento dentro la nostra pagina, no redirect a checkout.stripe.com
      // Cast a unknown poiche' i tipi @types/stripe potrebbero non avere ancora
      // 'embedded' nell'enum UiMode (lo accetta a runtime).
      // Stripe 2026 ha rinominato 'embedded' -> 'embedded_page'
      ui_mode: "embedded_page",
      mode: "payment",
      // Apple Pay + Google Pay attivi automaticamente se abilitati nel dashboard
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Ordine ${order.order_number} — Special Sushi Poke`,
              description:
                order.order_type === "delivery"
                  ? `Consegna a ${order.address_line ?? "indirizzo cliente"}`
                  : "Ritiro al locale",
            },
            unit_amount: order.total_cents,
          },
          quantity: 1,
        },
      ],
      customer_email: order.customer_email,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_id: user.id,
      },
      // Embedded mode usa return_url invece di success/cancel
      return_url: `${siteUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}&order_number=${order.order_number}`,
    } as unknown as Parameters<typeof stripe.checkout.sessions.create>[0];

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (session.id) {
      await admin
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id);
    }

    if (!session.client_secret) {
      return { ok: false, errorMessage: "client_secret non disponibile." };
    }
    return {
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore Stripe sconosciuto";
    console.error("createCheckoutSession failed:", msg);
    return {
      ok: false,
      errorMessage:
        "Impossibile creare la sessione di pagamento. Riprova o usa contanti.",
    };
  }
}
