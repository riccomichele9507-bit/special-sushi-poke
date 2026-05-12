"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCartUI } from "@/lib/cart-ui-store";

export function EmptyCart() {
  const close = useCartUI((s) => s.close);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-[12rem] leading-none text-sakura/40 select-none"
      >
        🌸
      </span>
      <div className="relative">
        <h3 className="font-heading text-xl font-bold text-ink">
          Carrello vuoto
        </h3>
        <p className="mt-2 max-w-xs text-sm text-warm-gray">
          Aggiungi il tuo primo piatto e riceverai la consegna in 30 minuti.
        </p>
        <Link
          href="/menu"
          onClick={close}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-bamboo px-5 font-sans text-sm font-semibold text-paper shadow-[0_4px_16px_-4px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep active:scale-95"
        >
          Sfoglia il menu
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
