import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Truck, Euro, Clock } from "lucide-react";
import { restaurant } from "@/data/restaurant";

export const metadata: Metadata = {
  title: "Zone di consegna a Bari",
  description:
    "Consegna a domicilio di sushi e poke a Bari e comuni limitrofi entro 12 km. Consegna gratuita entro 6 km. Scopri le zone servite e i tempi di consegna.",
  alternates: { canonical: "/consegna" },
};

const zoneBari = [
  "Murat (centro)",
  "Libertà",
  "Madonnella",
  "San Nicola",
  "Japigia",
  "Carrassi",
  "San Pasquale",
  "Picone",
  "Poggiofranco",
  "San Girolamo · Fesca",
  "Torre a Mare",
  "Carbonara",
  "Ceglie del Campo",
];

const comuni = ["Modugno", "Triggiano", "Valenzano", "Capurso", "Bitritto"];

export default function ConsegnaPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink no-underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <h1 className="font-serif-jp text-3xl text-ink">
        Consegna sushi e poke a domicilio a Bari
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-warm-gray">
        Portiamo sushi e poke freschi direttamente a casa tua, a Bari e nei
        comuni limitrofi. Ordini dal sito, prepariamo al momento e consegniamo.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-bamboo/15 p-4">
          <Truck className="h-5 w-5 text-bamboo" strokeWidth={1.75} />
          <p className="mt-2 text-sm font-semibold text-ink">Raggio consegna</p>
          <p className="text-xs text-warm-gray">
            Fino a {restaurant.deliveryRadiusKm} km dal locale
          </p>
        </div>
        <div className="rounded-xl border border-bamboo/15 p-4">
          <Euro className="h-5 w-5 text-bamboo" strokeWidth={1.75} />
          <p className="mt-2 text-sm font-semibold text-ink">Consegna gratuita</p>
          <p className="text-xs text-warm-gray">
            Entro {restaurant.freeDeliveryMaxKm} km · oltre, minimo €30
          </p>
        </div>
        <div className="rounded-xl border border-bamboo/15 p-4">
          <Clock className="h-5 w-5 text-bamboo" strokeWidth={1.75} />
          <p className="mt-2 text-sm font-semibold text-ink">Tempi medi</p>
          <p className="text-xs text-warm-gray">Circa 45–60 minuti</p>
        </div>
      </div>

      <h2 className="mt-8 font-serif-jp text-xl text-ink">Zone di Bari servite</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {zoneBari.map((z) => (
          <span
            key={z}
            className="rounded-full border border-bamboo/20 bg-paper-warm/40 px-3 py-1 text-xs text-ink"
          >
            {z}
          </span>
        ))}
      </div>

      <h2 className="mt-8 font-serif-jp text-xl text-ink">
        Comuni limitrofi (entro {restaurant.deliveryRadiusKm} km)
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {comuni.map((c) => (
          <span
            key={c}
            className="rounded-full border border-bamboo/20 bg-paper-warm/40 px-3 py-1 text-xs text-ink"
          >
            {c}
          </span>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-warm-gray">
        La copertura esatta viene verificata automaticamente quando inserisci
        l&apos;indirizzo in fase d&apos;ordine. Consegna gratuita entro{" "}
        {restaurant.freeDeliveryMaxKm} km dal locale ({restaurant.address.fullAddress});
        oltre tale distanza è previsto un ordine minimo di €30. In alternativa
        puoi sempre scegliere il ritiro d&apos;asporto al locale.
      </p>

      <Link
        href="/#menu"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-sushi-red px-6 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90"
      >
        Ordina ora
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </article>
  );
}
