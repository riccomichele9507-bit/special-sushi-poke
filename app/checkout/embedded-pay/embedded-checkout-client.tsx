"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripeClient() {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY mancante");
      return null;
    }
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

export function EmbeddedCheckoutClient({
  clientSecret,
}: {
  clientSecret: string;
}) {
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    const promise = getStripeClient();
    if (!promise) return;
    promise.then(() => setStripeReady(true));
  }, []);

  if (!stripeReady) {
    return (
      <div className="rounded-2xl border border-border bg-paper p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-bamboo/20" />
        <p className="mt-3 text-sm text-warm-gray">Caricamento pagamento…</p>
      </div>
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return (
      <div className="rounded-2xl border border-sushi-red/40 bg-sushi-red/5 p-6 text-center">
        <p className="text-sm text-sushi-red">
          Configurazione pagamento mancante. Contattaci.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-paper ring-1 ring-border">
      <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
