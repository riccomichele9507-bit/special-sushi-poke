import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        Informativa sul trattamento dei dati personali ai sensi degli artt. 13 e
        14 del Regolamento UE 2016/679 (GDPR)
      </p>
      <p className="text-warm-gray">Ultimo aggiornamento: 16 giugno 2026</p>

      <h2>1. Titolare del trattamento</h2>
      <p>Il Titolare del trattamento dei dati personali è:</p>
      <p>
        <strong>Special Sushi Poke</strong>
        <br />
        Sede: Via Giulio Petroni 12/H-i, 70124 Bari (BA), Italia
        <br />
        Partita IVA: 09041530727
        <br />
        Email: <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>
        <br />
        Telefono: +39 353 326 3829
      </p>

      <h2>2. Tipologie di dati trattati</h2>
      <p>Trattiamo le seguenti categorie di dati personali:</p>
      <ul>
        <li>
          <strong>Dati identificativi e di contatto:</strong> nome, cognome,
          email, numero di telefono, indirizzo di consegna.
        </li>
        <li>
          <strong>Dati relativi agli ordini:</strong> prodotti acquistati,
          importi, modalità di pagamento, indirizzo di consegna, eventuali note
          (es. allergie, preferenze).
        </li>
        <li>
          <strong>Dati di accesso all'account:</strong> email e password (in
          forma crittografata), dati relativi al programma fedeltà.
        </li>
        <li>
          <strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser,
          sistema operativo, pagine visitate, data e ora di accesso, raccolti
          tramite cookie e tecnologie analoghe (vedi Cookie Policy).
        </li>
        <li>
          <strong>Dati di pagamento:</strong> raccolti e gestiti esclusivamente
          dal fornitore di pagamento (Stripe). Special Sushi Poke non memorizza
          dati di carta di credito sui propri server.
        </li>
      </ul>

      <h2>3. Finalità e basi giuridiche del trattamento</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Finalità</th>
              <th>Base giuridica (art. 6 GDPR)</th>
              <th>Conservazione</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Gestione ordini, consegna, fatturazione e adempimenti contabili
              </td>
              <td>
                Esecuzione del contratto (art. 6.1.b) e obbligo di legge (art.
                6.1.c)
              </td>
              <td>10 anni (norme fiscali)</td>
            </tr>
            <tr>
              <td>Creazione e gestione dell'account utente</td>
              <td>Esecuzione del contratto (art. 6.1.b)</td>
              <td>Fino a cancellazione account</td>
            </tr>
            <tr>
              <td>Gestione del programma fedeltà (accumulo e utilizzo punti)</td>
              <td>Esecuzione del contratto (art. 6.1.b)</td>
              <td>Fino a cancellazione account o 24 mesi di inattività</td>
            </tr>
            <tr>
              <td>
                Invio di comunicazioni commerciali e promozionali via
                email/SMS/WhatsApp
              </td>
              <td>Consenso esplicito (art. 6.1.a)</td>
              <td>Fino a revoca del consenso</td>
            </tr>
            <tr>
              <td>
                Analisi statistica anonimizzata e miglioramento del servizio
              </td>
              <td>Legittimo interesse (art. 6.1.f)</td>
              <td>26 mesi</td>
            </tr>
            <tr>
              <td>Adempimento di obblighi normativi e fiscali</td>
              <td>Obbligo di legge (art. 6.1.c)</td>
              <td>Secondo termini di legge</td>
            </tr>
            <tr>
              <td>Difesa di diritti in sede giudiziaria</td>
              <td>Legittimo interesse (art. 6.1.f)</td>
              <td>Durata del contenzioso</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Natura del conferimento</h2>
      <p>
        Il conferimento dei dati necessari alla gestione dell'ordine,
        dell'account e all'adempimento di obblighi di legge è obbligatorio: il
        rifiuto rende impossibile completare l'ordine o creare l'account.
      </p>
      <p>
        Il conferimento dei dati per finalità di marketing è facoltativo:
        l'utente può rifiutare il consenso senza alcuna conseguenza
        sull'erogazione del servizio.
      </p>

      <h2>5. Destinatari dei dati</h2>
      <p>I dati possono essere comunicati a:</p>
      <ul>
        <li>
          Personale autorizzato di Special Sushi Poke (cuochi, addetti consegna,
          amministrazione), formato e vincolato a riservatezza.
        </li>
        <li>
          Responsabili esterni del trattamento (art. 28 GDPR), tra cui:
          <ul>
            <li>Vercel Inc. (Stati Uniti) — fornitore hosting e infrastruttura</li>
            <li>Supabase Inc. (Stati Uniti) — fornitore database</li>
            <li>Stripe Payments Europe Ltd. (Irlanda) — fornitore pagamenti</li>
            <li>Resend Inc. (Stati Uniti) — fornitore email transazionali</li>
            <li>Consulenti fiscali e commercialista</li>
          </ul>
        </li>
        <li>
          Autorità competenti, in caso di obbligo di legge o richiesta
          legittima.
        </li>
      </ul>
      <p>
        I dati non sono ceduti né venduti a terzi per finalità commerciali
        proprie.
      </p>

      <h2>6. Trasferimento dati extra-UE</h2>
      <p>
        Alcuni fornitori (Vercel, Supabase, Resend) hanno sede negli Stati Uniti.
        Il trasferimento avviene sulla base di Clausole Contrattuali Standard
        approvate dalla Commissione Europea e, dove applicabile, del Data Privacy
        Framework UE-USA.
      </p>
      <p>
        L'utente può richiedere copia delle garanzie applicate scrivendo a{" "}
        <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>.
      </p>

      <h2>7. Diritti dell'interessato</h2>
      <p>Ai sensi degli artt. 15-22 GDPR, l'utente ha diritto di:</p>
      <ul>
        <li>Accedere ai propri dati e ottenerne copia (art. 15)</li>
        <li>Rettificare dati inesatti o incompleti (art. 16)</li>
        <li>Cancellare i dati ("diritto all'oblio", art. 17)</li>
        <li>Limitare il trattamento (art. 18)</li>
        <li>Ottenere la portabilità dei dati in formato strutturato (art. 20)</li>
        <li>Opporsi al trattamento (art. 21), in particolare per finalità di marketing</li>
        <li>
          Revocare il consenso in qualsiasi momento, senza pregiudizio per i
          trattamenti precedenti
        </li>
        <li>
          Proporre reclamo all'Autorità Garante per la Protezione dei Dati
          Personali (
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
            www.garanteprivacy.it
          </a>
          )
        </li>
      </ul>
      <p>
        Per esercitare i diritti, scrivere a:{" "}
        <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>.
      </p>
      <p>La risposta avverrà entro 30 giorni dalla richiesta.</p>

      <h2>8. Sicurezza dei dati</h2>
      <p>
        Special Sushi Poke adotta misure tecniche e organizzative adeguate per
        proteggere i dati da accessi non autorizzati, perdita, distruzione o
        divulgazione, tra cui: cifratura in transito (HTTPS/TLS), cifratura
        at-rest del database, autenticazione robusta, log degli accessi, backup
        periodici.
      </p>

      <h2>9. Modifiche all'informativa</h2>
      <p>
        Special Sushi Poke si riserva il diritto di modificare la presente
        informativa. Le modifiche saranno pubblicate su questa pagina con
        indicazione della data di aggiornamento. Si invita a consultare
        periodicamente questa pagina.
      </p>
    </article>
  );
}
