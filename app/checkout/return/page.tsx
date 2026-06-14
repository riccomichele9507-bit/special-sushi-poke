import { redirect } from "next/navigation";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enqueuePrintJob } from "@/lib/print/queue";
import { PostPaymentRedirect } from "./redirect-client";

/**
 * Fallback del webhook Stripe: conferma l'ordine appena il pagamento risulta
 * completo, SENZA dipendere dal webhook (che in test può non essere configurato).
 * Idempotente: agisce solo se l'ordine è ancora "received".
 * Usa il service-role → non richiede sessione utente.
 */
async function confirmPaidOrder(orderNumber: string | undefined) {
  if (!orderNumber) return;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order || order.status !== "received") return; // già confermato dal webhook → skip

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
  if (full) await enqueuePrintJob(full);
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
      await confirmPaidOrder(order_number);
      return <PostPaymentRedirect target={`/account?paid=${order_number}`} />;
    }
    return <PostPaymentRedirect target="/account" />;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const finalOrderNumber =
      (session.metadata?.order_number as string | undefined) ?? order_number;

    if (session.status === "complete") {
      // Conferma l'ordine subito (fallback webhook) → ordine + punti pronti.
      await confirmPaidOrder(finalOrderNumber);
      // Pagina 200 + redirect client (NON redirect server) → la sessione Supabase
      // sopravvive al ritorno dal pagamento. Atterra sul profilo coi punti.
      return <PostPaymentRedirect target={`/account?paid=${finalOrderNumber}`} />;
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
