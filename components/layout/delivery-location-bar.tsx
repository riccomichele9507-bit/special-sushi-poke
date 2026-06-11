"use client";

import { Map, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { restaurant } from "@/data/restaurant";

export function DeliveryLocationBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-1 flex-col leading-tight">
          <p className="font-heading text-base font-semibold text-ink">
            {restaurant.name}
          </p>
          <p className="font-sans text-[11px] text-warm-gray">
            <span className="text-bamboo font-medium">Consegna gratuita</span> · {restaurant.address.city}
          </p>
        </div>
        <motion.a
          href={restaurant.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.93 }}
          aria-label="Apri posizione su Google Maps"
          className="inline-flex items-center gap-1.5 rounded-full bg-bamboo/10 px-3 py-1.5 text-xs font-medium text-bamboo ring-1 ring-bamboo/20 transition hover:bg-bamboo/15"
        >
          <Map className="h-3.5 w-3.5" strokeWidth={2} />
          Mappa
          <ChevronRight className="h-3 w-3 -mr-1" strokeWidth={2} />
        </motion.a>
      </div>
    </header>
  );
}
