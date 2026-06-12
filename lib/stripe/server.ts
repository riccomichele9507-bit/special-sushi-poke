// Client Stripe server-side. Importare SOLO da server actions / route handlers.
// Richiede STRIPE_SECRET_KEY in env.

import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY non configurata. Aggiungerla nelle env Vercel.",
    );
  }
  _stripe = new Stripe(key);
  return _stripe;
}

/**
 * Verifica se Stripe è configurato (utile per fallback UI).
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
