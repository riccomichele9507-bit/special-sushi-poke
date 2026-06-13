"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Salad, Bike, Truck } from "lucide-react";

/**
 * Hero immersiva edge-to-edge: il furgone occupa TUTTA la larghezza dello schermo
 * (no riquadro, no padding orizzontale). Badge "Consegna gratuita" sovrapposto
 * direttamente sul furgone. Sotto, 2 CTA prominenti food-photography style.
 */
export function HeroCard() {
  return (
    <section className="relative">
      {/* Furgone illustrato FULL-WIDTH edge-to-edge */}
      <div className="relative w-full bg-gradient-to-br from-ink/90 via-ink/85 to-bamboo-deep/80">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/hero/hero-van.png"
            alt="Special Sushi Poke — Bari · Sushi · Poke"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Badge 'Consegna gratuita' SOVRAPPOSTO sul furgone (in alto a sinistra) */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: [0, -1.5, 1.5, -1.5, 0],
            }}
            transition={{
              opacity: { duration: 0.4 },
              y: { duration: 0.4 },
              rotate: {
                delay: 1.5,
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 4,
              },
            }}
            className="absolute left-3 top-3 sm:left-4 sm:top-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sushi-red/95 px-3 py-1.5 text-xs font-extrabold text-paper shadow-[0_4px_14px_-3px_rgba(200,16,46,0.65)] ring-2 ring-paper/90 backdrop-blur">
              <Truck className="h-3.5 w-3.5" strokeWidth={2.5} />
              Consegna gratuita
            </span>
          </motion.div>

          {/* Vignette gradient verso paper in basso per integrare con contenuto sotto */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-paper to-transparent"
          />
        </div>
      </div>

      {/* 2 CTA food-photography style */}
      <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-3 px-4">
        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
        >
          <Link
            href="/menu"
            className="group relative flex h-24 items-end overflow-hidden rounded-2xl bg-paper-warm/90 p-3 ring-1 ring-bamboo/30 shadow-[0_6px_24px_-8px_rgba(28,28,28,0.12)]"
          >
            <div className="absolute inset-0 opacity-25">
              <Image
                src="/menu/uramaki-dragon.png"
                alt=""
                fill
                sizes="200px"
                className="object-cover object-center"
                aria-hidden
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-paper-warm/95 via-paper-warm/70 to-paper-warm/50" />
            <div className="relative z-10 flex flex-col items-start gap-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bamboo">
                <Bike className="h-3.5 w-3.5 text-paper" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-base font-bold leading-tight text-bamboo-deep">
                Ordina ora
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-bamboo-deep/80">
                Vai al menu
                <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
        >
          <Link
            href="/menu/crea-la-tua-poke"
            className="group relative flex h-24 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-bamboo to-bamboo-deep p-3 shadow-[0_6px_24px_-8px_rgba(90,122,100,0.55)]"
          >
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/menu/poke-fresh.png"
                alt=""
                fill
                sizes="200px"
                className="object-cover object-center mix-blend-multiply"
                aria-hidden
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bamboo-deep/95 via-bamboo-deep/60 to-transparent" />
            <div className="relative z-10 flex flex-col items-start gap-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper/95">
                <Salad className="h-3.5 w-3.5 text-bamboo-deep" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-base font-bold leading-tight text-paper drop-shadow">
                Crea la tua poke
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-paper/90">
                Personalizza
                <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
