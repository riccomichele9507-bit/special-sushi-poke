import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import { KanjiOrnament } from "@/components/shared/kanji-ornament";
import { restaurant } from "@/data/restaurant";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[88svh] w-full items-center overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero/hero-home.png"
          alt="Selezione di sushi e poke su lastra di ardesia scura"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/90"
        />
      </div>

      <KanjiOrnament
        char="寿司"
        className="absolute -left-8 top-16 text-[18rem] sm:text-[24rem] md:text-[30rem] leading-none text-gold/[0.08]"
      />

      <Container className="relative">
        <div className="flex max-w-2xl flex-col gap-7 py-20 sm:py-28">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-gold">
            <span className="h-px w-8 bg-gold/60" />
            <span className="font-sans">Sushi · Poke · Asporto</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] tracking-tight text-paper">
            {restaurant.name}
          </h1>

          <p className="max-w-lg font-heading text-xl sm:text-2xl font-normal italic text-white/75 leading-snug">
            Ingredienti freschi, tecnica giapponese,<br className="hidden sm:block" />
            ritiro in 30 minuti nel cuore di Bari.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-sushi-red px-6 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_36px_rgba(200,16,46,0.5)] active:scale-95"
            >
              Ordina asporto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/menu#category-poke-bowls"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink/40 px-6 font-sans text-sm font-medium text-gold backdrop-blur transition hover:border-gold hover:bg-gold/10 active:scale-95"
            >
              Vedi il menu
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
            <span className="font-sans">{restaurant.address.fullAddress}</span>
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
    </section>
  );
}
