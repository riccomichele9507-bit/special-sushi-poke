import Image from "next/image";
import { Container } from "@/components/shared/container";
import { KanjiOrnament } from "@/components/shared/kanji-ornament";

export function ChefSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <KanjiOrnament
        char="匠"
        className="absolute -left-12 top-12 text-[24rem] leading-none text-gold/[0.05]"
      />

      <Container>
        <div className="grid items-center gap-12 md:grid-cols-[5fr_7fr]">
          <div className="relative">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-gold/25">
              <Image
                src="/hero/chef.png"
                alt="Lo chef di Special Sushi Poke al banco"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent"
              />
            </div>
            <span
              aria-hidden
              className="absolute -bottom-3 left-6 font-heading text-[7rem] leading-none text-gold/15 pointer-events-none select-none"
            >
              匠
            </span>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold/80 font-sans">
              Lo chef
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.02] tracking-tight text-paper">
              Quindici anni di banco,<br />
              un solo modo di lavorare il pesce.
            </h1>
            <div className="mt-8 space-y-5 max-w-xl font-sans text-base text-white/70 leading-relaxed">
              <p>
                Tutto inizia a Osaka, in un piccolo sushi-ya di quartiere
                dove non esiste menu scritto: ti siedi al banco e lo chef
                ti serve quello che ha trovato di buono al mercato la mattina.
                È lì che capisco che il sushi non è una ricetta, è un metodo.
              </p>
              <p>
                Tornato in Italia, ho cercato il pesce dell'Adriatico:
                il branzino di Polignano, il tonno del Tirreno,
                il salmone dei migliori allevatori del Nord. Stessa tecnica
                di Osaka, materia prima che ci appartiene.
              </p>
              <p>
                A Special Sushi Poke ogni piatto esce dal banco
                solo quando è giusto. Niente compromessi, niente fretta.
                Asporto sì — ma con la stessa cura del banco.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="font-heading text-3xl font-semibold text-gold">15</p>
                <p className="mt-1 uppercase tracking-[0.18em] text-white/50 text-[11px]">
                  anni al banco
                </p>
              </div>
              <div className="h-12 w-px self-center bg-white/10" />
              <div>
                <p className="font-heading text-3xl font-semibold text-gold">Osaka</p>
                <p className="mt-1 uppercase tracking-[0.18em] text-white/50 text-[11px]">
                  formazione
                </p>
              </div>
              <div className="h-12 w-px self-center bg-white/10" />
              <div>
                <p className="font-heading text-3xl font-semibold text-gold">Bari</p>
                <p className="mt-1 uppercase tracking-[0.18em] text-white/50 text-[11px]">
                  oggi
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
