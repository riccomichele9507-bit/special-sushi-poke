import { MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { restaurant } from "@/data/restaurant";

export function MapEmbed() {
  return (
    <section className="relative bg-ink py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Dove siamo"
          title="A due passi dal centro di Bari"
          kanji="場"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-[7fr_5fr]">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
            <iframe
              title={`Mappa di ${restaurant.name} in ${restaurant.address.fullAddress}`}
              src={restaurant.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full grayscale-[0.4] contrast-[1.1]"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-6 rounded-2xl bg-paper/[0.03] p-6 ring-1 ring-white/[0.06]">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.2em] text-paper">
                  Indirizzo
                </p>
                <p className="mt-1 font-sans text-base text-white/75">
                  {restaurant.address.street}<br />
                  {restaurant.address.postalCode} {restaurant.address.city}
                </p>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex gap-4">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.2em] text-paper">
                  Telefono
                </p>
                <a
                  href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-block font-sans text-base text-white/75 transition hover:text-gold"
                >
                  {restaurant.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex gap-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.2em] text-paper">
                  Orari
                </p>
                <p className="mt-1 font-sans text-sm text-white/75">
                  <span className="text-white/55">Mar — Ven · </span>
                  {restaurant.hours.weekdays}
                </p>
                <p className="font-sans text-sm text-white/75">
                  <span className="text-white/55">Sab — Dom · </span>
                  {restaurant.hours.weekend}
                </p>
                <p className="mt-1 font-sans text-xs text-white/45">
                  {restaurant.hours.closed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
