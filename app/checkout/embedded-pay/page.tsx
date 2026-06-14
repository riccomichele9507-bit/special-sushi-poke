import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmbeddedCheckoutClient } from "./embedded-checkout-client";
import { createCheckoutSession } from "@/app/actions/stripe";

export const metadata = {
  title: "Pagamento",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function EmbeddedPayPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/checkout");
  }

  // Auth opzionale (ospite consentito)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, total_cents, status, customer_id")
    .eq("id", orderId)
    .maybeSingle();

  // Autorizzazione: il registrato deve possedere l'ordine; l'ospite può pagare
  // solo ordini-ospite (customer_id null) e possiede l'id uuid (non indovinabile).
  const owns = order
    ? user
      ? order.customer_id === user.id
      : order.customer_id === null
    : false;
  if (!order || !owns) {
    redirect(user ? "/account" : "/menu");
  }

  // Se già confermato, manda al tracking giusto
  if (order.status !== "received") {
    redirect(
      user ? `/account/orders/${order.order_number}` : `/checkout/grazie?id=${order.id}`,
    );
  }

  // Crea sessione Stripe embedded e ottieni il client_secret
  const result = await createCheckoutSession(orderId);

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al checkout
        </Link>
        <h1 className="text-2xl font-bold text-ink mb-2">
          Pagamento non disponibile
        </h1>
        <p className="text-sm text-warm-gray">{result.errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-2">
      <Link
        href="/checkout"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm/60 px-3 font-sans text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Annulla
      </Link>

      {/* Logo ristorante in cima (Stripe Embedded non mostra il logo del Branding) */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
        <Image
          src="/logo.png"
          alt="Special Sushi Poke"
          width={120}
          height={120}
          priority
          className="h-full w-full object-contain"
        />
      </div>

      <header className="mb-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-bamboo font-sans">
          Pagamento sicuro
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
          Ordine #{order.order_number}
        </h1>
        <p className="mt-1 text-sm text-warm-gray">
          Totale:{" "}
          <span className="font-semibold text-ink tabular-nums">
            €{(order.total_cents / 100).toFixed(2).replace(".", ",")}
          </span>
        </p>
      </header>

      <EmbeddedCheckoutClient clientSecret={result.clientSecret} />

      <p className="mt-4 text-center text-[11px] text-warm-gray">
        Pagamento gestito da Stripe. I tuoi dati carta non passano mai dai
        nostri server.
      </p>
    </div>
  );
}
