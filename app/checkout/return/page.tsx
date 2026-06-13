import { redirect } from "next/navigation";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

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

  // Se Stripe non configurato (env vars mancanti in dev), manda comunque al tracking
  if (!isStripeConfigured()) {
    if (order_number) {
      redirect(`/account/orders/${order_number}?paid=true`);
    }
    redirect("/account");
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const finalOrderNumber =
      (session.metadata?.order_number as string | undefined) ?? order_number;

    if (session.status === "complete") {
      // Pagamento andato → porta direttamente al profilo (punti + lista ordini)
      // Il cliente vede subito i suoi premi accumulati.
      redirect(`/account?paid=${finalOrderNumber}`);
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
