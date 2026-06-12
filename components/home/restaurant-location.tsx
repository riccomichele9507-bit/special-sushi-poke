import { MapPin, Clock, ExternalLink } from "lucide-react";
import { restaurant } from "@/data/restaurant";

/**
 * Card "Dove siamo" sulla home: mappa interattiva Google + indirizzo preciso +
 * orari del locale. La mappa è caricata via iframe gratuito di Google
 * (senza consumare quota API).
 */
export function RestaurantLocation() {
  // Usa la ricerca testuale Google Maps (free, no API key required for embed)
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${restaurant.name}, ${restaurant.address.fullAddress}`,
  )}&z=16&output=embed`;

  return (
    <section className="px-4 pt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-heading text-base font-semibold text-ink">
          Dove siamo
        </h2>
        <a
          href={restaurant.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[12px] font-medium text-bamboo hover:text-bamboo-deep"
        >
          Raggiungi il locale →
        </a>
      </div>

      <div className="overflow-hidden rounded-3xl bg-paper ring-1 ring-border shadow-[0_6px_20px_-8px_rgba(28,28,28,0.08)]">
        {/* Mappa Google embed */}
        <div className="relative aspect-[16/10] w-full bg-paper-warm">
          <iframe
            title={`Mappa di ${restaurant.name}`}
            src={mapEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>

        {/* Indirizzo + bottone diretto */}
        <div className="border-t border-border p-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-bold text-ink">
                {restaurant.name}
              </p>
              <p className="mt-0.5 font-sans text-xs text-warm-gray">
                {restaurant.address.fullAddress}
              </p>
            </div>
            <a
              href={restaurant.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Apri il locale in Google Maps"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bamboo px-3 font-sans text-xs font-semibold text-paper shadow-[0_2px_8px_-2px_rgba(90,122,100,0.4)] hover:bg-bamboo-deep"
            >
              Apri
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Orari */}
        <div className="border-t border-border bg-paper-warm/30 p-4">
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-bamboo" strokeWidth={2} />
            <div className="flex-1 space-y-1.5">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-warm-gray">
                Orari del locale
              </p>
              <dl className="space-y-1 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="w-20 shrink-0 font-medium text-ink">Mar — Ven</dt>
                  <dd className="text-warm-gray tabular-nums">
                    {restaurant.hours.weekdays}
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="w-20 shrink-0 font-medium text-ink">Sab — Dom</dt>
                  <dd className="text-warm-gray tabular-nums">
                    {restaurant.hours.weekend}
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="w-20 shrink-0 font-medium text-sushi-red/90">
                    Lunedì
                  </dt>
                  <dd className="text-sushi-red/90">Chiuso</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
