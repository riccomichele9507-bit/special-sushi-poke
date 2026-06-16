import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummarySide } from "@/components/checkout/order-summary-side";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa il tuo ordine da Special Sushi Poke Bari.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Gate auth: niente checkout senza login
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // OSPITE consentito: niente redirect al login. Precompila solo se loggato.
  let customerName = "";
  let customerPhone = "";
  const customerEmail = user?.email ?? "";
  let defaultAddress:
    | { address: string; lat: number; lng: number; notes?: string }
    | null = null;

  if (user) {
    const { data: customer } = await supabase
      .from("customers")
      .select("name, phone, address_default")
      .eq("id", user.id)
      .maybeSingle();
    customerName = customer?.name ?? "";
    customerPhone = customer?.phone ?? "";

    const addr = customer?.address_default as
      | { address?: string; lat?: number; lng?: number; notes?: string | null }
      | null;
    if (addr && typeof addr.lat === "number" && typeof addr.lng === "number" && addr.address) {
      defaultAddress = { address: addr.address, lat: addr.lat, lng: addr.lng, notes: addr.notes ?? "" };
    }
    // Fallback dall'ultimo ordine di consegna (riordino / cliente storico).
    if (!defaultAddress) {
      const admin = createAdminClient();
      const { data: lastOrder } = await admin
        .from("orders")
        .select("address_line, address_notes, geo")
        .eq("customer_id", user.id)
        .eq("order_type", "delivery")
        .not("geo", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const geo = lastOrder?.geo as { lat?: number; lng?: number } | null;
      if (
        lastOrder?.address_line &&
        geo &&
        typeof geo.lat === "number" &&
        typeof geo.lng === "number"
      ) {
        defaultAddress = {
          address: lastOrder.address_line,
          lat: geo.lat,
          lng: geo.lng,
          notes: lastOrder.address_notes ?? "",
        };
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-2 lg:max-w-5xl">
      <Link
        href="/menu"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm/60 px-3 font-sans text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Torna al menu
      </Link>

      <header className="mb-5 mt-4">
        <p className="text-[10px] uppercase tracking-[0.32em] text-bamboo font-sans">
          Checkout
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink lg:text-3xl">
          Conferma il tuo ordine
        </h1>
      </header>

      {!user && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
          <p className="text-sm text-ink">
            🎁 <strong>Hai un account?</strong> Accedi per avere
            l&apos;indirizzo già pronto e riordinare in un tap.
          </p>
          <Link
            href="/login?returnTo=/checkout"
            className="shrink-0 rounded-full bg-bamboo px-4 py-1.5 text-xs font-semibold text-paper hover:bg-bamboo-deep"
          >
            Accedi
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <CheckoutForm
          defaultName={customerName}
          defaultPhone={customerPhone}
          defaultEmail={customerEmail}
          defaultAddress={defaultAddress}
          isGuest={!user}
        />
        <div className="hidden lg:block">
          <OrderSummarySide />
        </div>
      </div>
    </div>
  );
}
