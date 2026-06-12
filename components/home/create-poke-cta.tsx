import Link from "next/link";
import Image from "next/image";
import { Salad, Sparkles, ChevronRight } from "lucide-react";

/**
 * CTA che invita il cliente a usare il builder "Crea la tua poke".
 * Posizionata sotto "I consigli dello chef" sulla home.
 */
export function CreatePokeCTA() {
  return (
    <section className="px-4 pt-7">
      <Link
        href="/menu/crea-la-tua-poke"
        className="group relative block overflow-hidden rounded-3xl ring-1 ring-bamboo/20 shadow-[0_8px_28px_-12px_rgba(90,122,100,0.35)]"
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/menu/poke-fresh.png"
            alt="Crea la tua poke personalizzata"
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover transition duration-500 group-hover:scale-105"
            quality={70}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/10"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bamboo-deep/40 via-transparent to-transparent"
          />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-5 py-4">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold ring-1 ring-gold/30">
            <Sparkles className="h-2.5 w-2.5" />
            Novità
          </span>
          <h3 className="mt-2 font-heading text-2xl font-bold text-paper drop-shadow">
            Crea la tua poke
          </h3>
          <p className="mt-1 max-w-[14rem] font-sans text-xs leading-snug text-paper/80 drop-shadow">
            Base, proteine, condimenti, topping, salse — la combini tu.
          </p>
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 text-xs font-semibold text-bamboo-deep shadow-[0_2px_8px_-2px_rgba(28,28,28,0.3)]">
            <Salad className="h-3.5 w-3.5" strokeWidth={2.25} />
            Inizia ora
            <ChevronRight className="h-3 w-3 -mr-1" strokeWidth={2.25} />
          </span>
        </div>
      </Link>
    </section>
  );
}
