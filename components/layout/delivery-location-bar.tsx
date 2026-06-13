"use client";

import Link from "next/link";
import { Map, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { restaurant } from "@/data/restaurant";
import { useUser } from "@/lib/auth/use-user";

/**
 * Header sticky: saluto cliente loggato + CTA raggiungi locale.
 * Se anonimo: niente saluto, ma resta il bottone mappa.
 */
export function DeliveryLocationBar() {
  const { user, loading } = useUser();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const firstName = fullName.split(/\s+/)[0];
  const initials = fullName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2.5">
        {/* Sinistra: avatar + saluto se loggato, altrimenti placeholder discreto */}
        {!loading && user ? (
          <Link
            href="/account"
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
            aria-label="Vai al profilo"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bamboo font-heading text-[11px] font-bold uppercase text-paper ring-2 ring-bamboo/20 transition group-hover:ring-bamboo/40">
              {initials || "·"}
            </span>
            <div className="min-w-0">
              <p className="font-heading text-sm font-bold leading-tight text-ink truncate">
                Ciao, {firstName}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-warm-gray">
                Bari, Italia
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 min-w-0 flex-1"
          >
            <p className="font-sans text-xs text-warm-gray">
              <span className="text-bamboo font-medium">Accedi</span> · Ordina con i tuoi punti fedeltà
            </p>
          </Link>
        )}

        {/* Destra: raggiungi il locale (sempre visibile) */}
        <motion.a
          href={restaurant.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.93 }}
          aria-label="Raggiungi il locale Special Sushi Poke su Google Maps"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bamboo/10 px-3 text-xs font-medium text-bamboo ring-1 ring-bamboo/20 transition hover:bg-bamboo/15"
        >
          <Map className="h-3.5 w-3.5" strokeWidth={2} />
          Raggiungi il locale
          <ChevronRight className="h-3 w-3 -mr-1" strokeWidth={2} />
        </motion.a>
      </div>
    </header>
  );
}
