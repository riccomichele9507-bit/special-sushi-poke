import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummarySide } from "@/components/checkout/order-summary-side";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getLoyaltyStatus,
  POINTS_REDEMPTION_THRESHOLD,
  POINTS_REDEMPTION_VALUE_CENTS,
} from "@/lib/loyalty/points";

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
  if (!user) {
    redirect("/login?returnTo=/checkout");
  }

  // Precompila nome/telefono/email + ultimo indirizzo salvato (address_default)
  const { data: customer } = await supabase
    .from("customers")
    .select("name, phone, address_default")
    .eq("id", user.id)
    .maybeSingle();

  // Sconto fedeltà disponibile (≥100 punti → −€5), mostrato nel riepilogo.
  const loyalty = await getLoyaltyStatus(user.id);
  const loyaltyDiscountCents =
    loyalty.balance >= POINTS_REDEMPTION_THRESHOLD ? POINTS_REDEMPTION_VALUE_CENTS : 0;

  const addr = customer?.address_default as
    | { address?: string; lat?: number; lng?: number; notes?: string | null }
    | null;
  let defaultAddress =
    addr && typeof addr.lat === "number" && typeof addr.lng === "number" && addr.address
      ? {
          address: addr.address,
          lat: addr.lat,
          lng: addr.lng,
          notes: addr.notes ?? "",
        }
      : null;

  // Fallback: se non c'è ancora un address_default salvato (cliente che ha
  // ordinato prima di questa feature, o che clicca "riordina"), recupera
  // l'indirizzo dall'ULTIMO ordine di consegna. Così l'indirizzo c'è sempre.
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

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <CheckoutForm
          defaultName={customer?.name ?? ""}
          defaultPhone={customer?.phone ?? ""}
          defaultEmail={user.email ?? ""}
          defaultAddress={defaultAddress}
        />
        <div className="hidden lg:block">
          <OrderSummarySide loyaltyDiscountCents={loyaltyDiscountCents} />
        </div>
      </div>
    </div>
  );
}
