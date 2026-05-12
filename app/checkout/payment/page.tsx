import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FakeStripeForm } from "@/components/payment/fake-stripe-form";

export const metadata: Metadata = {
  title: "Pagamento",
  description: "Completa il pagamento del tuo ordine.",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-2 lg:max-w-4xl">
      <div className="flex items-center gap-2">
        <Link
          href="/checkout"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm/60 px-3 font-sans text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Checkout
        </Link>
        <Link
          href="/menu"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm/60 px-3 font-sans text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink"
        >
          Menu
        </Link>
      </div>

      <header className="mb-5 mt-4">
        <p className="text-[10px] uppercase tracking-[0.32em] text-bamboo font-sans">
          Pagamento
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink lg:text-3xl">
          Pagamento sicuro
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-warm-gray">
          Powered by Stripe — i tuoi dati sono crittografati.
        </p>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-warm" />}>
        <FakeStripeForm />
      </Suspense>
    </div>
  );
}
