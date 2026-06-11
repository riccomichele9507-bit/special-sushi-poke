import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { pokeBuilderConfig } from "@/data/poke-builder";
import { PokeBuilderClient } from "./poke-builder-client";

export const metadata: Metadata = {
  title: pokeBuilderConfig.title,
  description: pokeBuilderConfig.subtitle,
};

export default function CreaLaTuaPokePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
      <Link
        href="/menu?category=poke"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-ink mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Torna alle poke
      </Link>

      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-serif-jp text-ink">
          {pokeBuilderConfig.title}
        </h1>
        <p className="text-sm text-warm-gray">{pokeBuilderConfig.subtitle}</p>
      </div>

      <PokeBuilderClient config={pokeBuilderConfig} />
    </div>
  );
}
