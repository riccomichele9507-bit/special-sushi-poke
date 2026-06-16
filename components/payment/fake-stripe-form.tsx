"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCartStore, useCartTotal, useCartHydrated } from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";
import { computeAutoPromoCents } from "@/lib/promo/auto-promo";
import { Price } from "@/components/shared/price";

const INPUT_CLASSES =
  "h-12 rounded-xl border-border bg-paper-warm/40 px-4 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper";
const INPUT_MONO = INPUT_CLASSES + " font-mono tracking-wider";
const LABEL_CLASSES =
  "font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-warm-gray";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function FakeStripeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartTotal();
  const hydrated = useCartHydrated();
  const tipCents = usePricing((s) => s.tipCents);
  const discountCents = computeAutoPromoCents(subtotal);
  const total = Math.max(0, subtotal - discountCents) + tipCents;

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState(params.get("name") ?? "");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (hydrated && subtotal === 0) {
      router.replace("/menu");
    }
  }, [hydrated, subtotal, router]);

  const isValid =
    cardNumber.replace(/\s/g, "").length >= 13 &&
    expiry.length === 5 &&
    cvc.length >= 3 &&
    cardholder.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || processing) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    clear();
    toast.success("Pagamento approvato", {
      description: "Stai per essere reindirizzato.",
    });
    await new Promise((r) => setTimeout(r, 600));
    router.push("/checkout/success");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl bg-paper ring-1 ring-border p-5 shadow-[0_4px_18px_-6px_rgba(28,28,28,0.06)] sm:p-6"
        noValidate
      >
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-bamboo/10 px-3 py-1.5 ring-1 ring-bamboo/30">
            <Lock className="h-3.5 w-3.5 text-bamboo-deep" strokeWidth={2.5} />
            <span className="font-sans text-[11px] font-medium text-bamboo-deep">
              Pagamento sicuro <span className="font-mono">stripe</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-paper-warm px-1.5 py-0.5 font-heading text-[10px] font-bold tracking-tight text-ink">
              VISA
            </span>
            <span className="rounded bg-paper-warm px-1.5 py-0.5 font-heading text-[10px] font-bold tracking-tight text-ink">
              MC
            </span>
            <span className="rounded bg-paper-warm px-1.5 py-0.5 font-heading text-[10px] font-bold tracking-tight text-ink">
              AMEX
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber" className={LABEL_CLASSES}>
            Numero carta
          </Label>
          <Input
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            autoComplete="cc-number"
            className={INPUT_MONO}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="expiry" className={LABEL_CLASSES}>
              Scadenza
            </Label>
            <Input
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
              className={INPUT_MONO}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvc" className={LABEL_CLASSES}>
              CVC
            </Label>
            <Input
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
              className={INPUT_MONO}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardholder" className={LABEL_CLASSES}>
            Intestatario carta
          </Label>
          <Input
            id="cardholder"
            value={cardholder}
            onChange={(e) => setCardholder(e.target.value)}
            placeholder="Mario Rossi"
            autoComplete="cc-name"
            className={INPUT_CLASSES}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || processing}
          className={cn(
            "group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full font-sans text-sm font-semibold transition",
            processing
              ? "bg-bamboo-soft text-bamboo-deep"
              : "bg-bamboo text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)] hover:bg-bamboo-deep hover:shadow-[0_8px_28px_-6px_rgba(90,122,100,0.6)] active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none",
          )}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Pagamento in corso...
            </>
          ) : (
            <>
              Paga <Price cents={total} size="md" className="!text-paper" />
              <Lock className="h-3.5 w-3.5 ml-1" strokeWidth={2.5} />
            </>
          )}
        </button>

        <Link
          href="/checkout"
          className="inline-flex items-center justify-center gap-1.5 font-sans text-xs text-warm-gray transition hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
          Torna al checkout
        </Link>

        <div className="rounded-xl border border-sakura/40 bg-sakura/15 p-3 text-center">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-sakura-deep">
            Demo
          </p>
          <p className="mt-1 text-xs text-warm-gray">
            Nessun pagamento reale. Inserisci dati fittizi e premi Paga.
          </p>
        </div>
      </form>

      <aside className="flex flex-col gap-4 rounded-2xl bg-paper-warm/40 ring-1 ring-border p-5">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-bamboo">
            Riepilogo
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-ink">
            Stai per pagare
          </p>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-sans text-sm text-warm-gray">Totale</span>
          <Price cents={total} size="xl" className="!text-bamboo font-bold" />
        </div>
        <ul className="mt-1 space-y-2 text-xs text-warm-gray">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bamboo" strokeWidth={2} />
            <span>Dati di pagamento crittografati end-to-end.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bamboo" strokeWidth={2} />
            <span>Nessun dato carta sui nostri server.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bamboo" strokeWidth={2} />
            <span>Powered by Stripe — leader globale pagamenti.</span>
          </li>
        </ul>
      </aside>
    </div>
  );
}
