import type { Metadata } from "next";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { reviews } from "@/data/reviews";
import { formatDate } from "@/lib/format";
import { InstagramIcon, FacebookIcon } from "@/components/shared/social-icons";

export const metadata: Metadata = {
  title: "Il nostro locale",
  description: "Chi siamo, recensioni dei clienti, dove trovarci.",
};

export default function LocalePage() {
  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-4">
      <header className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-ink">Il nostro locale</h1>
        <p className="mt-1 font-sans text-xs text-warm-gray">
          La nostra storia, recensioni e contatti.
        </p>
      </header>

      <section className="mb-7 overflow-hidden rounded-2xl bg-paper ring-1 ring-border shadow-[0_4px_18px_-6px_rgba(28,28,28,0.08)]">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/hero/chef.png"
            alt="Lo chef di Special Sushi Poke al lavoro"
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
          />
        </div>
        <div className="p-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-bamboo">
            Lo chef
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-ink">
            Tecnica giapponese,<br />materie prime pugliesi.
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-warm-gray">
            Quindici anni dietro al banco di un sushi-ya a Osaka, poi il ritorno a Bari
            per portare la stessa precisione al pesce dell&apos;Adriatico. Niente compromessi,
            niente fretta — solo cura artigianale, anche sull&apos;asporto.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-paper-warm/50 px-3 py-2.5 text-center">
              <p className="font-heading text-xl font-bold text-bamboo">15</p>
              <p className="font-sans text-[9px] uppercase tracking-wider text-warm-gray">
                anni
              </p>
            </div>
            <div className="rounded-xl bg-paper-warm/50 px-3 py-2.5 text-center">
              <p className="font-heading text-xl font-bold text-bamboo">Osaka</p>
              <p className="font-sans text-[9px] uppercase tracking-wider text-warm-gray">
                formazione
              </p>
            </div>
            <div className="rounded-xl bg-paper-warm/50 px-3 py-2.5 text-center">
              <p className="font-heading text-xl font-bold text-bamboo">Bari</p>
              <p className="font-sans text-[9px] uppercase tracking-wider text-warm-gray">
                oggi
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-ink">
            Recensioni clienti
          </h2>
          <span className="font-sans text-[11px] uppercase tracking-wider text-warm-gray">
            {reviews.length} · ★ 4.8
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl bg-paper p-4 ring-1 ring-border"
            >
              <div className="flex items-center gap-1 mb-2" aria-label={`${r.rating} su 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < r.rating ? "text-bamboo" : "text-warm-gray/20"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="font-heading text-sm italic leading-relaxed text-ink">
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-semibold text-ink">
                  {r.author}
                  <span className="ml-1.5 font-sans font-normal text-warm-gray">
                    · {formatDate(r.date)}
                  </span>
                </p>
                {r.source && (
                  <span className="rounded-full bg-paper-warm/60 px-2 py-0.5 text-[9px] uppercase tracking-wider text-warm-gray">
                    {r.source}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="mb-3 font-heading text-base font-semibold text-ink">
          Dove siamo
        </h2>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-border">
          <iframe
            title={`Mappa di ${restaurant.name}`}
            src={restaurant.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
        <a
          href={restaurant.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-bamboo px-4 font-sans text-sm font-semibold text-paper shadow-[0_2px_10px_-2px_rgba(90,122,100,0.45)] hover:bg-bamboo-deep"
        >
          Apri in Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>

      <section className="mb-7 rounded-2xl bg-paper p-5 ring-1 ring-border">
        <h2 className="mb-4 font-heading text-base font-semibold text-ink">
          Contatti
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={1.75} />
            <div className="font-sans text-sm">
              <p className="font-medium text-ink">{restaurant.address.street}</p>
              <p className="text-warm-gray">
                {restaurant.address.postalCode} {restaurant.address.city}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={1.75} />
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="font-sans text-sm text-ink transition hover:text-bamboo"
            >
              {restaurant.phoneDisplay}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={1.75} />
            <a
              href={`mailto:${restaurant.email}`}
              className="font-sans text-sm text-ink transition hover:text-bamboo"
            >
              {restaurant.email}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={1.75} />
            <div className="font-sans text-sm">
              <p className="text-ink">
                <span className="text-warm-gray">Lun — Ven · </span>
                {restaurant.hours.weekdays}
              </p>
              <p className="text-ink">
                <span className="text-warm-gray">Sab — Dom · </span>
                {restaurant.hours.weekend}
              </p>
              <p className="mt-0.5 text-xs text-warm-gray">{restaurant.hours.closed}</p>
            </div>
          </li>
        </ul>
        <div className="mt-5 flex gap-2 border-t border-border pt-4">
          <a
            href={restaurant.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-warm-gray ring-1 ring-border transition hover:text-bamboo hover:ring-bamboo/30"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href={restaurant.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-warm-gray ring-1 ring-border transition hover:text-bamboo hover:ring-bamboo/30"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a
            href={restaurant.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 font-sans text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Scrivici su WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
