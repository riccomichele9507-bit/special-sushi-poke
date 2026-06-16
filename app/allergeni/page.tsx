import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Allergeni e Informazioni Prodotti",
  description:
    "Informazioni su prodotti, allergeni e trattamenti sanitari di Special Sushi Poke: abbattimento anti-Anisakis, provenienza, 14 allergeni e contaminazione crociata.",
};

export default function AllergeniPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 prose prose-sm">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink no-underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <h1 className="font-serif-jp text-3xl text-ink">
        Informazioni su Prodotti, Allergeni e Trattamenti Sanitari
      </h1>
      <p className="text-warm-gray">Ultimo aggiornamento: 16 giugno 2026</p>

      <h2>
        1. Trattamento di bonifica preventiva (abbattimento) del pesce destinato
        al consumo crudo
      </h2>
      <p>
        Dichiarazione resa ai sensi del Regolamento CE 853/2004, Allegato III,
        Sezione VIII, Capitolo III, lettera D, come modificato dal Regolamento UE
        1276/2011.
      </p>
      <p>
        Tutti i prodotti ittici serviti crudi, marinati o praticamente crudi —
        quali sashimi, nigiri, tartare, carpaccio, tataki, poke bowl, uramaki,
        hosomaki, temaki, gunkan, chirashi e ogni altra preparazione contenente
        pesce non sottoposto a cottura completa al cuore del prodotto — sono
        sottoposti, prima della preparazione e somministrazione, a trattamento di
        bonifica preventiva mediante congelamento secondo uno dei seguenti
        parametri:
      </p>
      <ul>
        <li>
          <strong>−20°C</strong> (meno venti gradi centigradi) per un periodo di
          almeno <strong>24 ore</strong> continuative, oppure
        </li>
        <li>
          <strong>−35°C</strong> (meno trentacinque gradi centigradi) per un
          periodo di almeno <strong>15 ore</strong> continuative,
        </li>
      </ul>
      <p>misurati al cuore del prodotto.</p>
      <p>
        Il trattamento avviene tramite abbattitore di temperatura certificato,
        periodicamente sottoposto a controllo e manutenzione, presso il nostro
        laboratorio interno e/o presso i fornitori autorizzati, conformemente al
        piano di autocontrollo HACCP (Hazard Analysis and Critical Control
        Points) di Special Sushi Poke.
      </p>
      <p>
        Tale trattamento è finalizzato all&apos;inattivazione del parassita{" "}
        <em>Anisakis simplex</em> e di altri parassiti eventualmente presenti nei
        prodotti della pesca, in ottemperanza alle prescrizioni sanitarie
        nazionali ed europee.
      </p>

      <h2>2. Provenienza dei prodotti ittici</h2>
      <p>
        I prodotti ittici utilizzati provengono da fornitori autorizzati e
        tracciati, conformi ai Regolamenti CE 178/2002 (sicurezza alimentare),
        852/2004 e 853/2004 (igiene degli alimenti).
      </p>
      <p>
        Su richiesta del cliente, è possibile fornire informazioni dettagliate
        sulla zona di pesca o di allevamento di ogni singolo prodotto, ai sensi
        del Reg. UE 1379/2013 (etichettatura prodotti della pesca).
      </p>

      <h2>3. Informazioni sugli allergeni</h2>
      <p>
        Ai sensi del Regolamento UE 1169/2011, Special Sushi Poke fornisce a
        tutti i clienti le informazioni sugli allergeni presenti nei propri
        piatti.
      </p>

      <h3>I 14 allergeni regolamentati</h3>
      <ol>
        <li>Cereali contenenti glutine (grano, segale, orzo, avena, farro, kamut)</li>
        <li>Crostacei e prodotti a base di crostacei</li>
        <li>Uova e prodotti a base di uova</li>
        <li>Pesce e prodotti a base di pesce</li>
        <li>Arachidi e prodotti a base di arachidi</li>
        <li>Soia e prodotti a base di soia</li>
        <li>Latte e prodotti a base di latte (incluso lattosio)</li>
        <li>Frutta a guscio (mandorle, nocciole, noci, anacardi, pistacchi e altri)</li>
        <li>Sedano e prodotti a base di sedano</li>
        <li>Senape e prodotti a base di senape</li>
        <li>Semi di sesamo e prodotti a base di semi di sesamo</li>
        <li>Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg o mg/L</li>
        <li>Lupini e prodotti a base di lupini</li>
        <li>Molluschi e prodotti a base di molluschi</li>
      </ol>

      <h3>Allergeni ricorrenti nel nostro menu</h3>
      <p>
        I seguenti allergeni sono frequentemente presenti nelle nostre
        preparazioni:
      </p>
      <ul>
        <li>Pesce (salmone, tonno, spigola, ricciola, gamberi e altri)</li>
        <li>Crostacei (gamberi, gamberoni, astice)</li>
        <li>Soia (salsa di soia, edamame, salsa teriyaki)</li>
        <li>Glutine (salsa di soia non gluten-free, pastella tempura, pasta gyoza, panko)</li>
        <li>Uova (maionese, alcune paste)</li>
        <li>Latte (philadelphia, alcune salse)</li>
        <li>Sesamo (decorazione su uramaki, goma wakame, alcune salse)</li>
        <li>Frutta a guscio (mandorla, pistacchio in piatti specifici)</li>
        <li>Solfiti (in alcune bevande)</li>
      </ul>
      <p>
        Per la lista completa degli allergeni piatto per piatto, è possibile
        richiedere il documento dettagliato in sede oppure scrivere a{" "}
        <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>.
      </p>

      <h2>4. Contaminazione crociata</h2>
      <p>
        I nostri piatti sono preparati in una cucina dove sono manipolati tutti
        gli allergeni elencati. Nonostante le procedure di igiene e separazione
        previste dal piano HACCP, non possiamo escludere completamente il rischio
        di contaminazione crociata accidentale.
      </p>
      <p>
        Si raccomanda alle persone con allergie gravi di valutare attentamente la
        propria scelta e, in caso di dubbio, di contattare direttamente il locale
        al numero <strong>+39 353 326 3829</strong> prima di ordinare.
      </p>

      <h2>5. Prodotti congelati e prodotti freschi</h2>
      <p>
        Ai sensi del D.M. 17.07.2012 (modifiche al D.Lgs. 109/1992), il
        consumatore ha diritto di conoscere se un prodotto è stato somministrato
        previo congelamento.
      </p>
      <p>
        I prodotti del nostro menu derivanti da materia prima sottoposta a
        congelamento (al di fuori del trattamento di bonifica anti-Anisakis di
        cui al punto 1) sono indicati nella lista interna del locale,
        consultabile su richiesta.
      </p>

      <h2>6. Etichetta nutrizionale</h2>
      <p>
        Le informazioni nutrizionali dettagliate (calorie, macronutrienti) per
        ciascun piatto sono disponibili su richiesta presso il locale o scrivendo
        a <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>.
      </p>

      <h2>7. Contatti per richieste sanitarie</h2>
      <p>
        Per qualsiasi domanda relativa a allergeni, intolleranze, ingredienti o
        trattamenti sanitari:
      </p>
      <ul>
        <li>
          Email:{" "}
          <a href="mailto:specialsushipoke@gmail.com">specialsushipoke@gmail.com</a>
        </li>
        <li>Telefono: +39 353 326 3829</li>
        <li>In sede: Via Giulio Petroni 12/H-i, 70124 Bari</li>
      </ul>
      <p>
        Il personale è formato per fornire informazioni accurate sui prodotti.
      </p>
    </article>
  );
}
