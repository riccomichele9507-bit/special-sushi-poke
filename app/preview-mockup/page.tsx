import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

/**
 * Pagina di preview SOLO per mostrare il mockup Fase 2+3 generato.
 * NON è una pagina di produzione, solo dev/preview.
 */
export const metadata = {
  title: "Preview Mockup Fase 2+3",
  robots: { index: false, follow: false },
};

export default function PreviewMockupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink/95 via-ink to-bamboo-deep/90 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper/10 px-3 font-sans text-xs font-medium text-paper/80 ring-1 ring-paper/20 transition hover:bg-paper/20 backdrop-blur"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Torna alla home reale
        </Link>

        <div className="mt-6 mb-8 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/40">
            <Sparkles className="h-3 w-3" />
            Mockup AI · Fase 2 + 3
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-paper sm:text-4xl">
            Come potrebbe diventare l&apos;app
          </h1>
          <p className="mt-2 text-sm text-paper/70">
            Generato AI con kie.ai. Solo previsione di stile,
            non è l&apos;app reale.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Mockup proposto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gold animate-pulse" />
              <p className="font-heading text-sm font-bold uppercase tracking-wider text-gold">
                Proposta · Fase 2+3
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-paper/10">
              <Image
                src="/mockup-phase2-phase3.png"
                alt="Mockup app Fase 2+3 — Special Sushi Poke premium redesign"
                width={1024}
                height={1820}
                className="w-full h-auto"
                priority
              />
            </div>
            <ul className="space-y-1.5 text-xs text-paper/80">
              <li className="flex items-start gap-2">
                <span className="text-gold">●</span> Header avatar + Ciao Michele
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">●</span> Furgone full-width + Consegna gratuita overlay
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">●</span> CTA beige (Ordina) + verde (Crea poke)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">●</span> Tipografia serif drammatica per i titoli
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">●</span> Foto piatti food-porn cinematografiche
              </li>
            </ul>
          </div>

          {/* Stato attuale (reale, screenshot dinamico — iframe della home) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-bamboo" />
              <p className="font-heading text-sm font-bold uppercase tracking-wider text-bamboo">
                Stato attuale · Reale
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-paper/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] bg-paper">
              <iframe
                src="/"
                title="Home attuale"
                className="block w-full"
                style={{ height: "720px" }}
              />
            </div>
            <ul className="space-y-1.5 text-xs text-paper/80">
              <li className="flex items-start gap-2">
                <span className="text-bamboo">●</span> Header avatar + Ciao Michele ✓
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bamboo">●</span> Furgone full-width + Consegna gratuita ✓
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bamboo">●</span> CTA beige + verde ✓
              </li>
              <li className="flex items-start gap-2 opacity-50">
                <span className="text-warm-gray">○</span> Tipografia serif drammatica (mancante)
              </li>
              <li className="flex items-start gap-2 opacity-50">
                <span className="text-warm-gray">○</span> Foto piatti food-porn (160 da rifare)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
          <p className="text-sm text-paper/90">
            Quando confermi, lancio in autonomia: <br className="hidden sm:inline" />
            <strong className="text-gold">Fase 1</strong> (rigenerazione 160 foto · ~25 min · ~$5) +{" "}
            <strong className="text-gold">Fase 2</strong> (tipografia serif + microinterazioni · ~1h)
          </p>
        </div>
      </div>
    </div>
  );
}
