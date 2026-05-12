import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Ordine ricevuto",
  description: "Il tuo ordine è stato ricevuto.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="relative mx-auto max-w-md px-4 pt-6 pb-12">
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-bamboo/15 ring-2 ring-bamboo/30">
          <Check className="h-6 w-6 text-bamboo-deep" strokeWidth={2.8} />
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold leading-tight text-ink">
          Ordine ricevuto
        </h1>

        <p className="mx-auto mt-3 max-w-xs text-sm text-warm-gray leading-relaxed">
          Ti chiameremo entro 5 minuti per confermare l&apos;ordine.
          Grazie per aver scelto {restaurant.name}.
        </p>

        <div className="mx-auto mt-7 inline-flex flex-col items-center gap-1 rounded-2xl bg-paper ring-1 ring-border px-6 py-4 shadow-[0_2px_12px_-4px_rgba(28,28,28,0.06)]">
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-bamboo">
            Hai bisogno di parlarci?
          </p>
          <p className="mt-1.5 font-heading text-base font-semibold text-ink">
            {restaurant.address.fullAddress}
          </p>
          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            className="mt-1 text-xs text-warm-gray transition hover:text-bamboo"
          >
            {restaurant.phoneDisplay}
          </a>
          <a
            href={restaurant.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            Scrivici su WhatsApp →
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/menu"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-bamboo px-5 font-sans text-sm font-semibold text-paper shadow-[0_4px_16px_-4px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep"
          >
            Ordina ancora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-paper px-5 font-sans text-sm font-medium text-warm-gray transition hover:border-bamboo/40 hover:text-ink"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
