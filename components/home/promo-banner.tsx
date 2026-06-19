import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPromoConfig } from "@/lib/promo/server";

/**
 * Box promo del locale (sostituisce la vecchia "offerta del giorno").
 * Legge la promo configurabile dal DB (admin → Dati ristorante). Stile premium.
 */
export async function PromoBanner() {
  const promo = await getPromoConfig();
  if (!promo.active) return null;
  const minEuro = Math.round(promo.minCents / 100);

  return (
    <section className="px-4 pt-3">
      <Link
        href="/menu"
        className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-bamboo-deep via-bamboo to-bamboo-deep p-5 shadow-[0_10px_30px_-12px_rgba(63,88,73,0.6)] ring-1 ring-gold/30"
      >
        {/* kanji watermark "得" = buon affare */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-5 select-none font-heading text-[7rem] leading-none text-gold/15"
        >
          得
        </span>
        {/* riflesso sottile */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18), transparent 45%)",
          }}
        />

        <div className="relative">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Offerta del locale
          </p>

          <p className="mt-2 font-heading text-4xl font-bold leading-none text-paper">
            −{promo.percent}%
            <span className="ml-2 align-middle text-lg font-semibold text-paper/90">
              su tutto il menu
            </span>
          </p>

          <p className="mt-2.5 max-w-[20rem] text-sm leading-snug text-paper/75">
            Si applica <strong className="text-gold">da sola</strong> al carrello
            a partire da €{minEuro}. Nessun codice da inserire.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink transition group-hover:gap-2.5">
            Ordina ora
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </section>
  );
}
