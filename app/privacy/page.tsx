import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa privacy di Special Sushi Poke Bari.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 prose prose-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink no-underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <h1 className="font-serif-jp text-3xl text-ink">Privacy Policy</h1>
      <p className="text-warm-gray">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
      </p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento dei dati personali è <strong>{restaurant.name}</strong>,
        con sede in {restaurant.address.fullAddress}. Email:{" "}
        <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>.
      </p>

      <h2>2. Dati raccolti</h2>
      <p>Raccogliamo i seguenti dati quando effettui un ordine:</p>
      <ul>
        <li>Nome, cognome, email, numero di telefono</li>
        <li>Indirizzo di consegna (via, civico, città, dettagli interno) e coordinate GPS</li>
        <li>Storico degli ordini (piatti, importi, date)</li>
        <li>Dati di pagamento gestiti direttamente da Stripe (non li conserviamo noi)</li>
        <li>Consenso marketing (opzionale, per ricevere offerte via email)</li>
      </ul>

      <h2>3. Finalità del trattamento</h2>
      <ul>
        <li>Gestione degli ordini e consegna</li>
        <li>Adempimenti fiscali e contabili</li>
        <li>Assistenza clienti</li>
        <li>Comunicazioni promozionali, solo previo consenso esplicito</li>
      </ul>

      <h2>4. Base giuridica</h2>
      <p>
        Il trattamento dei tuoi dati è basato sull&apos;esecuzione del contratto
        (per gestire l&apos;ordine) e sul consenso esplicito (per il marketing).
      </p>

      <h2>5. Conservazione dei dati</h2>
      <p>
        I dati relativi agli ordini sono conservati per 10 anni come previsto dalla normativa fiscale.
        I dati per finalità di marketing sono conservati fino alla revoca del consenso.
      </p>

      <h2>6. Diritti dell&apos;interessato</h2>
      <p>
        In qualsiasi momento puoi esercitare i diritti previsti dal GDPR:
        accesso, rettifica, cancellazione, limitazione, portabilità, opposizione.
        Per esercitarli scrivici a <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>.
      </p>

      <h2>7. Sicurezza</h2>
      <p>
        Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati,
        inclusi server cifrati, accessi limitati e backup regolari.
      </p>

      <h2>8. Terze parti</h2>
      <p>
        Per erogare il servizio condividiamo alcuni dati con fornitori tecnici:
      </p>
      <ul>
        <li><strong>Stripe</strong> (pagamenti) — privacy-shield certificato</li>
        <li><strong>Supabase</strong> (database, hosting Europa) — GDPR-compliant</li>
        <li><strong>Resend</strong> (invio email transazionali)</li>
        <li><strong>Google Maps</strong> (geocodifica indirizzi)</li>
      </ul>
    </article>
  );
}
