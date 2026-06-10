"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateRestaurant } from "@/app/actions/admin/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RestaurantRow = {
  name: string;
  tagline: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  full_address: string | null;
  phone: string | null;
  phone_display: string | null;
  whatsapp: string | null;
  whatsapp_display: string | null;
  email: string | null;
  hours_weekdays: string | null;
  hours_weekend: string | null;
  hours_closed: string | null;
  instagram: string | null;
  facebook: string | null;
  lat: number | null;
  lng: number | null;
  map_embed_url: string | null;
  delivery_radius_km: number | null;
  cuisine: string[] | null;
  price_range: string | null;
  manual_pause: boolean;
} | null;

export function RestaurantForm({ data }: { data: RestaurantRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await updateRestaurant(fd);
      if (r.ok) toast.success("Dati ristorante aggiornati");
      else setError(r.error);
    });
  }

  return (
    <form action={action} className="space-y-5">
      <Section title="Identità">
        <Row>
          <F label="Nome" name="name" defaultValue={data?.name ?? ""} required />
          <F label="Sottotitolo / tagline" name="tagline" defaultValue={data?.tagline ?? ""} />
        </Row>
        <F label="Tipo cucina" name="cuisine" defaultValue={(data?.cuisine ?? []).join(", ")} hint="Separati da virgola" />
        <Row>
          <F label="Fascia prezzo" name="price_range" defaultValue={data?.price_range ?? ""} hint="es. €€" />
        </Row>
      </Section>

      <Section title="Indirizzo">
        <Row>
          <F label="Via" name="street" defaultValue={data?.street ?? ""} />
          <F label="CAP" name="postal_code" defaultValue={data?.postal_code ?? ""} />
        </Row>
        <Row>
          <F label="Città" name="city" defaultValue={data?.city ?? ""} />
          <F label="Nazione" name="country" defaultValue={data?.country ?? "IT"} />
        </Row>
        <F label="Indirizzo completo (mostrato al pubblico)" name="full_address" defaultValue={data?.full_address ?? ""} />
        <Row>
          <F label="Latitudine" name="lat" type="number" step="any" defaultValue={data?.lat ?? ""} />
          <F label="Longitudine" name="lng" type="number" step="any" defaultValue={data?.lng ?? ""} />
        </Row>
        <F label="Map embed URL (Google Maps iframe src)" name="map_embed_url" defaultValue={data?.map_embed_url ?? ""} />
        <F label="Raggio max consegna km (informativo)" name="delivery_radius_km" type="number" defaultValue={data?.delivery_radius_km ?? ""} hint="La regola vera è in Consegne & orari" />
      </Section>

      <Section title="Contatti">
        <Row>
          <F label="Telefono" name="phone" defaultValue={data?.phone ?? ""} />
          <F label="Telefono (formattato display)" name="phone_display" defaultValue={data?.phone_display ?? ""} />
        </Row>
        <Row>
          <F label="WhatsApp (E.164)" name="whatsapp" defaultValue={data?.whatsapp ?? ""} hint="es. +393793697798" />
          <F label="WhatsApp display" name="whatsapp_display" defaultValue={data?.whatsapp_display ?? ""} />
        </Row>
        <F label="Email" name="email" type="email" defaultValue={data?.email ?? ""} />
      </Section>

      <Section title="Orari pubblici">
        <F label="Giorni feriali" name="hours_weekdays" defaultValue={data?.hours_weekdays ?? ""} hint="es. 12:30-14:30 · 19:00-22:30" />
        <F label="Weekend" name="hours_weekend" defaultValue={data?.hours_weekend ?? ""} />
        <F label="Giorno di chiusura" name="hours_closed" defaultValue={data?.hours_closed ?? ""} hint="es. Lunedì" />
      </Section>

      <Section title="Social">
        <Row>
          <F label="Instagram URL" name="instagram" defaultValue={data?.instagram ?? ""} />
          <F label="Facebook URL" name="facebook" defaultValue={data?.facebook ?? ""} />
        </Row>
      </Section>

      <Section title="Pausa manuale">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="manual_pause"
            defaultChecked={data?.manual_pause ?? false}
            className="h-5 w-5 rounded border-sushi-red/50 text-sushi-red focus:ring-sushi-red"
          />
          <span className="text-sm">
            <strong className="text-sushi-red">Pausa ordini ON</strong> — Quando
            attiva, il sito rifiuta tutti i nuovi ordini con messaggio &quot;ristorante in pausa&quot;.
          </span>
        </label>
      </Section>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
        {pending ? "Salvataggio..." : "Salva tutto"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border border-bamboo/15 rounded-lg p-4">
      <legend className="text-sm font-semibold text-ink px-2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function F({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  required,
  step,
}: {
  label: string;
  name: string;
  defaultValue: string | number | null;
  type?: string;
  hint?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}{required && <span className="text-sushi-red ml-0.5">*</span>}</Label>
      <Input name={name} type={type} step={step} defaultValue={defaultValue ?? ""} required={required} />
      {hint && <p className="text-xs text-warm-gray">{hint}</p>}
    </div>
  );
}
