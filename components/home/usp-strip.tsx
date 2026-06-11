import { Fish, Bike, ShoppingBag } from "lucide-react";
import { Container } from "@/components/shared/container";

const usps = [
  {
    icon: Fish,
    title: "Pesce fresco ogni giorno",
    description: "Lavorato e tagliato a vista, mai congelato all'arrivo.",
  },
  {
    icon: Bike,
    title: "Consegna gratuita",
    description: "Gratis entro 6 km. Oltre, minimo d'ordine €30.",
  },
  {
    icon: ShoppingBag,
    title: "Asporto a Bari",
    description: "Preferisci ritirare? Vieni in Via G. Petroni quando vuoi.",
  },
] as const;

export function UspStrip() {
  return (
    <section
      aria-label="Punti di forza"
      className="relative border-y border-gold/15 bg-ink/95"
    >
      <Container>
        <div className="grid grid-cols-1 divide-y divide-white/[0.05] py-2 md:grid-cols-3 md:divide-x md:divide-y-0">
          {usps.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 px-2 py-7 md:px-8"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
                <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold text-paper">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-white/55">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
