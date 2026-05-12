import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { KanjiOrnament } from "@/components/shared/kanji-ornament";

export function AboutTeaser() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <KanjiOrnament
        char="匠"
        className="absolute -right-12 top-1/2 -translate-y-1/2 text-[28rem] leading-none text-gold/[0.05]"
      />

      <Container>
        <div className="grid items-center gap-10 sm:gap-14 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold/80 font-sans">
              Lo chef
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-paper">
              Tecnica giapponese,<br />
              materie prime pugliesi.
            </h2>
            <p className="mt-5 max-w-md text-base text-white/65 leading-relaxed">
              Quindici anni dietro al banco di un sushi-ya a Osaka,
              poi il ritorno a Bari per portare la stessa precisione
              al pesce del nostro Adriatico. Il risultato è una cucina
              dove ogni taglio ha un perché.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-gold/40 px-6 font-sans text-sm font-medium text-gold transition hover:border-gold hover:bg-gold/10"
            >
              Scopri lo chef
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-gold/20">
              <Image
                src="/hero/chef.png"
                alt="Lo chef al banco mentre prepara nigiri"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              />
            </div>
            <div
              aria-hidden
              className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-gold/10 via-transparent to-sushi-red/10 blur-2xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
