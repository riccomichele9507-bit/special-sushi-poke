"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "./mobile-nav";
import { restaurant } from "@/data/restaurant";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#menu", label: "Menu" },
  { href: "/#about", label: "Chi siamo" },
  { href: "/#location", label: "Dove siamo" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-ink/85 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <Container size="wide" className="!px-4 sm:!px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-6 md:flex-1">
            <MobileNav />
            <Link
              href="/"
              className="group flex items-baseline gap-2 transition"
              aria-label={`${restaurant.name} - Home`}
            >
              <span className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-gold transition group-hover:text-paper">
                {restaurant.name}
              </span>
              <span
                aria-hidden
                className="hidden sm:inline font-heading text-xs uppercase tracking-[0.22em] text-white/40"
              >
                Bari
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1" aria-label="Navigazione principale">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3 py-2 font-sans text-sm transition",
                    isActive
                      ? "text-paper"
                      : "text-white/55 hover:text-paper",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:flex-1 md:justify-end">
            <CartIcon />
          </div>
        </div>
      </Container>
    </header>
  );
}
