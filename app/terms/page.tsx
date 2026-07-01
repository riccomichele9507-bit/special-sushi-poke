import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Termini di servizio",
  description: "Termini e condizioni di Special Sushi Poke Bari.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 prose prose-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink no-underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <h1 className="font-serif-jp text-3xl text-ink">Termini di servizio</h1>
      <p className="text-warm-gray">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
      </p>

      <h2>1. Oggetto</h2>
      <p>
        I presenti termini regolano l&apos;utilizzo del sito {restaurant.name}{" "}
        per la prenotazione e la consegna di prodotti gastronomici.
      </p>

      <h2>2. Ordini e pagamenti</h2>
      <ul>
        <li>
          Per effettuare un ordine devi avere almeno 18 anni e registrarti
          fornendo dati veri e completi.
        </li>
        <li>
          Il pagamento può avvenire tramite carta (Stripe, Apple Pay, Google Pay)
          oppure in contanti alla consegna/ritiro.
        </li>
        <li>
          Una volta confermato e pagato, <strong>l&apos;ordine non è cancellabile né rimborsabile</strong>{" "}
          poiché viene immediatamente preso in carico dalla cucina.
        </li>
        <li>
          Lo scontrino fiscale (Documento Commerciale) ti sarà consegnato dal rider
          o al banco al momento del ritiro.
        </li>
      </ul>

      <h2>3. Consegna</h2>
      <ul>
        <li>Consegniamo a Bari e comuni limitrofi entro 12 km dal locale.</li>
        <li>Consegna gratuita entro 6 km, oltre richiesto un minimo d&apos;ordine di €30.</li>
        <li>
          L&apos;orario indicato in fase di ordine è una stima. In casi eccezionali
          (traffico, maltempo) può variare leggermente.
        </li>
        <li>
          Se all&apos;arrivo del rider non sei reperibile, l&apos;ordine viene comunque
          considerato consegnato e non è rimborsabile.
        </li>
      </ul>

      <h2>4. Allergeni</h2>
      <p>
        I nostri piatti possono contenere o entrare in contatto con: pesce, crostacei,
        molluschi, glutine, soia, latte, uova, sesamo, arachidi e frutta a guscio.
        Indica eventuali allergie nelle note quando ordini. Non garantiamo cucina
        completamente esente da tracce di allergeni.
      </p>

      <h2>5. Promozioni</h2>
      <p>
        Eventuali promozioni (es. sconto automatico sugli ordini dal sito a
        partire da una certa soglia di spesa) sono valide solo per gli ordini
        effettuati tramite questa applicazione e possono essere modificate o
        sospese da Special Sushi Poke in qualsiasi momento, senza preavviso.
      </p>

      <h2>6. Account utente</h2>
      <ul>
        <li>L&apos;account è personale e non trasferibile.</li>
        <li>
          Sei responsabile della riservatezza delle credenziali (password / passkey).
        </li>
        <li>
          Possiamo sospendere account con comportamenti abusivi (ordini falsi,
          frodi, recensioni offensive).
        </li>
      </ul>

      <h2>7. Limitazione di responsabilità</h2>
      <p>
        Non rispondiamo per danni derivanti da uso improprio del sito, da informazioni
        errate fornite dall&apos;utente o da cause di forza maggiore.
      </p>

      <h2>8. Modifiche</h2>
      <p>
        Ci riserviamo il diritto di modificare questi termini in qualsiasi momento.
        Le modifiche entrano in vigore alla pubblicazione su questa pagina.
      </p>

      <h2>9. Legge applicabile</h2>
      <p>
        Per qualsiasi controversia sarà competente in via esclusiva il Foro di Bari.
        Si applica la legge italiana.
      </p>

      <h2>10. Contatti</h2>
      <p>
        Per qualsiasi domanda scrivi a{" "}
        <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> o chiama{" "}
        {restaurant.phoneDisplay}.
      </p>
    </article>
  );
}
