import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummarySide } from "@/components/checkout/order-summary-side";

export const metadata: Metadata = {
  title: "Conferma ordine",
  description: "Completa il tuo ordine di asporto da Special Sushi Poke Bari.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] bg-ink pb-20 pt-24 sm:pt-28">
      <Container>
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold/80 font-sans">
          Checkout
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-paper">
          Conferma il tuo ordine
        </h1>
        <p className="mt-4 max-w-xl text-sm sm:text-base text-white/60">
          Niente pagamento online — ti chiamiamo per confermare il ritiro,
          paghi al banco quando vieni a prendere il tuo asporto.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[7fr_5fr]">
          <CheckoutForm />
          <OrderSummarySide />
        </div>
      </Container>
    </div>
  );
}
