"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Salad, Bike } from "lucide-react";

/**
 * Hero ridisegnata:
 * - Illustrazione 3D del furgone Special Sushi Poke (con logo brand reale)
 * - 2 CTA prominenti food-photography style: "Ordina ora" + "Crea la tua poke"
 */
export function HeroCard() {
  return (
    <section className="relative px-4 pt-3">
      <div className="relative mx-auto max-w-md">
        {/* Illustrazione furgone */}
        <div className="relative overflow-hidden rounded-3xl shadow-[0_10px_40px_-15px_rgba(28,28,28,0.18)] ring-1 ring-border bg-gradient-to-br from-ink/90 via-ink/85 to-bamboo-deep/80">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/hero/hero-van.png"
              alt="Special Sushi Poke — Bari · Sushi · Poke"
              fill
              priority
              quality={85}
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* 2 CTA pulsanti food-photography style, sovrapposti al furgone in basso */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <Link
              href="/menu"
              className="group relative flex h-24 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-sushi-red to-sushi-red/80 p-3 shadow-[0_6px_24px_-8px_rgba(200,16,46,0.5)]"
            >
              <div className="absolute inset-0 opacity-30">
                <Image
                  src="/menu/uramaki-dragon.png"
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover object-center mix-blend-multiply"
                  aria-hidden
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-sushi-red/95 via-sushi-red/60 to-transparent" />
              <div className="relative z-10 flex flex-col items-start gap-1">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper/95">
                  <Bike className="h-3.5 w-3.5 text-sushi-red" strokeWidth={2.5} />
                </span>
                <span className="font-heading text-base font-bold leading-tight text-paper drop-shadow">
                  Ordina ora
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-paper/90">
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
      </div>
    </section>
  );
}
