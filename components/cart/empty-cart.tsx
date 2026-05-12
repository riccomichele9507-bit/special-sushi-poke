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
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-[14rem] leading-none text-gold/[0.06] select-none"
      >
        寿司
      </span>
      <div className="relative">
        <h3 className="font-heading text-2xl font-semibold text-paper">
          Carrello vuoto
        </h3>
        <p className="mt-2 max-w-xs text-sm text-white/55">
          Aggiungi il tuo primo piatto e ritira il tuo asporto in 30 minuti.
        </p>
        <Link
          href="/menu"
          onClick={close}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-sushi-red px-6 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_24px_rgba(200,16,46,0.35)] active:scale-95"
        >
          Sfoglia il menu
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
