"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Salad, Bike, Truck } from "lucide-react";

/**
 * Hero immersiva edge-to-edge: il furgone occupa TUTTA la larghezza dello schermo
 * (no riquadro, no padding orizzontale). Sotto, 2 CTA prominenti food-photography style.
 */
export function HeroCard() {
  return (
    <section className="relative">
      {/* Furgone illustrato FULL-WIDTH (edge-to-edge) */}
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
          {/* Vignette per integrare la transizione col contenuto sotto */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-paper to-transparent"
          />
        </div>
      </div>

      {/* Badge "Consegna gratuita" tra furgone e CTA, centrato + bouncy */}
      <div className="mx-auto -mt-3 flex max-w-md justify-center px-4">
        <motion.span
          animate={{ y: [0, -2, 0] }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-bamboo px-3.5 py-1.5 text-xs font-bold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.55)] ring-2 ring-paper"
        >
          <Truck className="h-3.5 w-3.5" strokeWidth={2.5} />
          Consegna gratuita
          <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            a Bari
          </span>
        </motion.span>
      </div>

      {/* 2 CTA pulsanti food-photography style, padding tornato per allineare al resto */}
      <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-3 px-4">
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
