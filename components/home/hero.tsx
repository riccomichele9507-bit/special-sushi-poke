"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/shared/container";
import { restaurant } from "@/data/restaurant";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const kanjiRef = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [
          eyebrowRef.current,
          titleRef.current,
          taglineRef.current,
          ctasRef.current,
          addressRef.current,
        ],
        { autoAlpha: 0, y: 32 },
      );

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.1)
        .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.35")
        .to(taglineRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.55")
        .to(ctasRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(addressRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35");

      if (bgRef.current && sectionRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (kanjiRef.current && sectionRef.current) {
        gsap.to(kanjiRef.current, {
          xPercent: -10,
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[92svh] w-full items-center overflow-hidden bg-ink text-paper"
    >
      <div ref={bgRef} className="absolute inset-0 -top-[10%] -z-10 h-[120%]">
        <Image
          src="/hero/hero-home.png"
          alt="Selezione di sushi e poke su lastra di ardesia scura"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/90"
        />
      </div>

      <span
        ref={kanjiRef}
        aria-hidden
        className="pointer-events-none absolute -left-8 top-16 select-none font-heading text-[18rem] sm:text-[24rem] md:text-[30rem] leading-none tracking-tighter text-gold/[0.08] will-change-transform"
      >
        寿司
      </span>

      <Container className="relative">
        <div className="flex max-w-2xl flex-col gap-7 py-20 sm:py-28">
          <div
            ref={eyebrowRef}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-gold will-change-transform"
          >
            <span className="h-px w-8 bg-gold/60" />
            <span className="font-sans">Sushi · Poke · Consegna a domicilio</span>
          </div>

          <h1
            ref={titleRef}
            className="font-heading text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] tracking-tight text-paper will-change-transform"
          >
            {restaurant.name}
          </h1>

          <p
            ref={taglineRef}
            className="max-w-lg font-heading text-xl sm:text-2xl font-normal italic text-white/75 leading-snug will-change-transform"
          >
            Ingredienti freschi, tecnica giapponese,<br className="hidden sm:block" />
            consegna o asporto in 30 minuti a Bari.
          </p>

          <div ref={ctasRef} className="mt-2 flex flex-wrap items-center gap-3 will-change-transform">
            <Link
              href="/#menu"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-sushi-red px-6 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_36px_rgba(200,16,46,0.5)] active:scale-95"
            >
              Ordina online
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/#category-poke-bowls"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink/40 px-6 font-sans text-sm font-medium text-gold backdrop-blur transition hover:border-gold hover:bg-gold/10 active:scale-95"
            >
              Vedi il menu
            </Link>
          </div>

          <div
            ref={addressRef}
            className="mt-4 flex items-center gap-2 text-xs text-white/60 will-change-transform"
          >
            <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
            <span className="font-sans">{restaurant.address.fullAddress}</span>
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
    </section>
  );
}
