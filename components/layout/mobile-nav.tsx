"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/shared/social-icons";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { restaurant } from "@/data/restaurant";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#menu", label: "Menu" },
  { href: "/#about", label: "Chi siamo" },
  { href: "/#location", label: "Dove siamo" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/10 bg-ink/40 backdrop-blur-md transition hover:ring-gold/40 hover:bg-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:hidden"
      >
        <Menu className="h-[18px] w-[18px] text-paper" strokeWidth={1.75} />
      </button>

      <DrawerContent className="border-white/10 bg-ink text-paper data-[vaul-drawer-direction=left]:max-w-xs">
        <DrawerHeader className="border-b border-white/[0.06] px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle className="font-heading text-2xl font-semibold text-gold">
                Special Sushi Poke
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                Sushi · Poke · Bari
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi menu"
              className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-paper/[0.06] hover:text-paper"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </DrawerHeader>

        <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 font-heading text-xl font-medium text-paper transition hover:bg-paper/[0.04] hover:text-gold"
            >
              {link.label}
              <span className="h-px w-6 bg-gold/30" />
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] px-5 py-5 space-y-3">
          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 text-sm text-white/65 transition hover:text-paper"
          >
            <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
            {restaurant.phoneDisplay}
          </a>
          <p className="flex items-start gap-3 text-sm text-white/65">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.75} />
            {restaurant.address.fullAddress}
          </p>
          <div className="flex gap-2 pt-2">
            <a
              href={restaurant.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/10 text-white/65 transition hover:text-gold hover:ring-gold/40"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={restaurant.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/10 text-white/65 transition hover:text-gold hover:ring-gold/40"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
