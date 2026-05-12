import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummarySide } from "@/components/checkout/order-summary-side";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa il tuo ordine da Special Sushi Poke Bari.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
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
        <p className="mt-2 max-w-xl text-xs sm:text-sm text-warm-gray">
          Ti chiamiamo per confermare la consegna o paghi qui se preferisci.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <CheckoutForm />
        <div className="hidden lg:block">
          <OrderSummarySide />
        </div>
      </div>
    </div>
  );
}
