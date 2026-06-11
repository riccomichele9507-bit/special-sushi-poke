import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VerificaConsegnaClient } from "./verifica-consegna-client";

export const metadata: Metadata = {
  title: "Verifica consegna",
  description:
    "Inserisci il tuo indirizzo per vedere se consegniamo nella tua zona, quanto costa e quando arriva.",
};

export default function VerificaConsegnaPage() {
  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Indietro
      </Link>

      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-serif-jp text-ink">Verifica consegna</h1>
        <p className="text-sm text-warm-gray">
          Inserisci il tuo indirizzo. Ti diciamo se consegniamo nella tua zona,
          il costo e in che fascia oraria.
        </p>
      </div>

      <VerificaConsegnaClient />
    </div>
  );
}
