import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/shared/container";
import { KanjiOrnament } from "@/components/shared/kanji-ornament";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Ordine ricevuto",
  description: "Il tuo ordine è stato ricevuto.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-ink pt-24 pb-20 sm:pt-28">
      <KanjiOrnament
        char="謝"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[28rem] leading-none text-gold/[0.06]"
      />

      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-sushi-red/15 ring-1 ring-sushi-red/40">
            <Check className="h-7 w-7 text-sushi-red" strokeWidth={2.5} />
          </div>

          <h1 className="mt-8 font-heading text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-paper">
            Ordine ricevuto
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base sm:text-lg text-white/65 leading-relaxed">
            Ti chiameremo entro 5 minuti al numero indicato per confermare
            l&apos;orario di ritiro. Grazie per aver scelto {restaurant.name}.
          </p>

          <div className="mt-10 inline-flex flex-col items-center gap-1 rounded-2xl bg-paper/[0.04] ring-1 ring-white/[0.06] px-6 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/80">
              Indirizzo di ritiro
            </p>
            <p className="mt-2 font-heading text-lg text-paper">
              {restaurant.address.fullAddress}
            </p>
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="mt-2 text-sm text-white/65 transition hover:text-gold"
            >
              {restaurant.phoneDisplay}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-sushi-red px-5 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_24px_rgba(200,16,46,0.4)]"
            >
              Ordina ancora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 font-sans text-sm font-medium text-white/70 transition hover:border-gold/40 hover:text-paper"
            >
              Torna alla home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
