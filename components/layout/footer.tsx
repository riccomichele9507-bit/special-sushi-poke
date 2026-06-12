import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Container } from "@/components/shared/container";
import { InstagramIcon, FacebookIcon } from "@/components/shared/social-icons";
import { restaurant } from "@/data/restaurant";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/locale", label: "Il nostro locale" },
  { href: "/account", label: "Il mio profilo" },
] as const;

export function Footer() {
  return (
    <footer className="relative border-t border-gold/15 bg-ink text-paper">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-heading text-xl font-semibold text-gold">
              {restaurant.name}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
              Sushi · Poke · Asporto
            </p>
            <p className="mt-5 max-w-xs text-sm text-white/55 leading-relaxed">
              Tecnica giapponese, materie prime pugliesi.<br />
              Asporto fresco a Bari, ogni giorno.
            </p>
          </div>

          <div>
            <p className="font-heading text-sm uppercase tracking-[0.2em] text-paper">
              Naviga
            </p>
            <nav className="mt-4 flex flex-col gap-2">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-sans text-sm text-white/60 transition hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="font-heading text-sm uppercase tracking-[0.2em] text-paper">
              Contatti
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.75} />
                <div className="flex flex-col items-start gap-1.5">
                  <span>
                    {restaurant.address.street}<br />
                    {restaurant.address.postalCode} {restaurant.address.city}
                  </span>
                  <a
                    href={restaurant.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-paper/[0.05] px-2.5 py-1 text-[11px] font-medium text-gold ring-1 ring-gold/25 transition hover:bg-gold/10 hover:ring-gold/50"
                  >
                    Apri in Google Maps
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </li>
              <li>
                <a
                  href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2.5 transition hover:text-gold"
                >
                  <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                  {restaurant.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${restaurant.email}`}
                  className="inline-flex items-center gap-2.5 transition hover:text-gold"
                >
                  <Mail className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                  {restaurant.email}
                </a>
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
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
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-white/[0.06] pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p>
              © {new Date().getFullYear()} {restaurant.name}. Tutti i diritti riservati.
            </p>
            <span className="hidden sm:inline text-white/20">·</span>
            <div className="flex gap-3">
              <Link href="/privacy" className="hover:text-gold transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gold transition">
                Termini di servizio
              </Link>
            </div>
          </div>
          <p className="font-heading italic text-white/50">
            おもてなし · L&apos;arte dell&apos;ospitalità
          </p>
        </div>
      </Container>
    </footer>
  );
}
