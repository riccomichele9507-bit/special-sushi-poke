import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Domande frequenti",
  description:
    "Domande frequenti su Special Sushi Poke a Bari: consegna a domicilio, tempi di consegna, asporto, poke personalizzata, pagamenti, allergeni e orari.",
  alternates: { canonical: "/faq" },
};

// Fonte unica: da qui si generano sia l'accordion visibile sia i dati
// strutturati FAQPage (schema.org) che Google usa per i risultati arricchiti.
const faqs: { q: string; a: string }[] = [
  {
    q: "Fate consegna a domicilio a Bari?",
    a: `Sì. Consegniamo a Bari e nei dintorni entro ${restaurant.deliveryRadiusKm} km dal locale. La consegna è gratuita entro ${restaurant.freeDeliveryMaxKm} km; oltre tale distanza è previsto un ordine minimo di €30.`,
  },
  {
    q: "Quanto tempo ci vuole per la consegna?",
    a: "Il tempo stimato viene calcolato al momento dell'ordine in base alla distanza e al carico della cucina (in media 45–60 minuti). L'orario preciso ti viene mostrato prima di confermare l'ordine.",
  },
  {
    q: "Posso ordinare sushi e poke d'asporto (ritiro)?",
    a: `Sì. Puoi ordinare per il ritiro direttamente al locale in ${restaurant.address.fullAddress}. Il tempo medio di preparazione è di circa 30 minuti.`,
  },
  {
    q: "Come funziona la poke personalizzata?",
    a: "Puoi comporre la tua poke scegliendo base, proteine, topping e salse direttamente dal menu, e aggiungerla al carrello come qualsiasi altro piatto.",
  },
  {
    q: "Come posso pagare?",
    a: "Puoi pagare con carta online (inclusi Apple Pay e Google Pay) oppure in contanti alla consegna o al ritiro.",
  },
  {
    q: "Il pesce crudo è trattato in sicurezza?",
    a: "Sì. Tutto il pesce servito crudo è sottoposto ad abbattimento di temperatura secondo le norme sanitarie (bonifica anti-Anisakis). Trovi tutte le informazioni nella pagina Allergeni.",
  },
  {
    q: "Quali sono gli orari?",
    a: "Siamo aperti tutti i giorni dalle 11:30 alle 23:30, con orario continuato.",
  },
  {
    q: "Dove vi trovate?",
    a: `Siamo in ${restaurant.address.fullAddress}.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink no-underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <h1 className="font-serif-jp text-3xl text-ink">Domande frequenti</h1>
      <p className="mt-2 text-sm text-warm-gray">
        Consegna, asporto, poke, pagamenti e orari di Special Sushi Poke a Bari.
      </p>

      <div className="mt-8 divide-y divide-bamboo/15 overflow-hidden rounded-2xl border border-bamboo/15">
        {faqs.map((f) => (
          <details key={f.q} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="shrink-0 text-lg leading-none text-warm-gray transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-warm-gray">{f.a}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </article>
  );
}
