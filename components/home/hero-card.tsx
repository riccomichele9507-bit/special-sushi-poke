import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export function HeroCard() {
  return (
    <section className="relative px-4 pt-3">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl shadow-[0_10px_40px_-15px_rgba(28,28,28,0.15)] ring-1 ring-border">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src="/hero/hero-home.png"
            alt={`${restaurant.name} — assortimento sushi premium`}
            fill
            priority
            quality={75}
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-ink/20 via-transparent to-transparent"
          />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <div>
            <h2 className="font-heading text-2xl font-semibold leading-tight text-paper drop-shadow-md">
              {restaurant.name}
            </h2>
            <p className="mt-1 font-sans text-xs text-paper/85 drop-shadow">
              Sushi & Poke Premium · Bari
            </p>
          </div>
          <span
            aria-hidden
            className="font-heading text-3xl text-paper/30 select-none drop-shadow"
          >
            寿司
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bamboo-soft/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-bamboo-deep ring-1 ring-bamboo/30">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Aperto
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-semibold text-ink ring-1 ring-border">
            <Clock className="h-3 w-3 text-bamboo" strokeWidth={2.5} />
            Consegna gratuita
          </span>
        </div>
      </div>
    </section>
  );
}
