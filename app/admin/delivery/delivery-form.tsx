"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateDeliverySettings } from "@/app/actions/admin/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WEEKDAYS = [
  { id: 0, label: "Dom" },
  { id: 1, label: "Lun" },
  { id: 2, label: "Mar" },
  { id: 3, label: "Mer" },
  { id: 4, label: "Gio" },
  { id: 5, label: "Ven" },
  { id: 6, label: "Sab" },
];

type Settings = {
  prep_minutes: number;
  buffer_minutes: number;
  baseline_min_minutes: number;
  baseline_pickup_min: number;
  max_orders_per_slot: number;
  slot_duration_minutes: number;
  service_lunch_start_time: string;
  service_lunch_last_order_time: string;
  service_lunch_last_delivery_time: string;
  service_dinner_start_time: string;
  service_dinner_last_order_time: string;
  service_dinner_last_delivery_time: string;
  service_dinner_weekend_last_order_time: string;
  service_dinner_weekend_last_delivery_time: string;
  closed_weekdays: number[];
  max_distance_km: number;
  free_delivery_max_km: number;
  min_cart_cents_above_free: number;
  travel_buckets: unknown;
} | null;

export function DeliveryForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState<number[]>(settings?.closed_weekdays ?? [1]);

  async function action(fd: FormData) {
    setError(null);
    fd.set("closed_weekdays", closed.join(","));
    startTransition(async () => {
      const r = await updateDeliverySettings(fd);
      if (r.ok) toast.success("Impostazioni consegna aggiornate");
      else setError(r.error);
    });
  }

  return (
    <form action={action} className="space-y-5">
      <Section title="ETA + slot (modello Glovo)">
        <Row>
          <F label="Tempo preparazione (min)" name="prep_minutes" type="number" value={settings?.prep_minutes ?? 25} />
          <F label="Buffer sicurezza (min)" name="buffer_minutes" type="number" value={settings?.buffer_minutes ?? 10} />
        </Row>
        <Row>
          <F label="Baseline minima consegna (min)" name="baseline_min_minutes" type="number" value={settings?.baseline_min_minutes ?? 45} />
          <F label="Baseline minima ritiro (min)" name="baseline_pickup_min" type="number" value={settings?.baseline_pickup_min ?? 30} />
        </Row>
        <Row>
          <F label="Max ordini per slot" name="max_orders_per_slot" type="number" value={settings?.max_orders_per_slot ?? 8} />
          <F label="Durata slot (min)" name="slot_duration_minutes" type="number" value={settings?.slot_duration_minutes ?? 30} />
        </Row>
      </Section>

      <Section title="Zona consegna">
        <Row>
          <F label="Distanza max km" name="max_distance_km" type="number" value={settings?.max_distance_km ?? 12} />
          <F label="Consegna gratis entro km" name="free_delivery_max_km" type="number" value={settings?.free_delivery_max_km ?? 6} />
        </Row>
        <F label="Min carrello oltre il gratuito (€)" name="min_cart_cents_above_free" type="number" value={settings?.min_cart_cents_above_free ?? 3000} hint="In CENTESIMI: 3000 = €30,00" />
      </Section>

      <Section title="Orari pranzo">
        <Row>
          <F label="Inizio" name="service_lunch_start_time" type="time" value={settings?.service_lunch_start_time ?? "12:30"} />
          <F label="Ultimo ordine" name="service_lunch_last_order_time" type="time" value={settings?.service_lunch_last_order_time ?? "14:30"} />
        </Row>
        <F label="Ultima consegna" name="service_lunch_last_delivery_time" type="time" value={settings?.service_lunch_last_delivery_time ?? "15:00"} />
      </Section>

      <Section title="Orari cena (feriali)">
        <Row>
          <F label="Inizio" name="service_dinner_start_time" type="time" value={settings?.service_dinner_start_time ?? "19:00"} />
          <F label="Ultimo ordine" name="service_dinner_last_order_time" type="time" value={settings?.service_dinner_last_order_time ?? "23:00"} />
        </Row>
        <F label="Ultima consegna" name="service_dinner_last_delivery_time" type="time" value={settings?.service_dinner_last_delivery_time ?? "23:30"} />
      </Section>

      <Section title="Orari cena (weekend)">
        <Row>
          <F label="Ultimo ordine weekend" name="service_dinner_weekend_last_order_time" type="time" value={settings?.service_dinner_weekend_last_order_time ?? "23:30"} />
          <F label="Ultima consegna weekend" name="service_dinner_weekend_last_delivery_time" type="time" value={settings?.service_dinner_weekend_last_delivery_time ?? "00:00"} />
        </Row>
      </Section>

      <Section title="Giorni di chiusura fissi">
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() =>
                setClosed((c) =>
                  c.includes(d.id) ? c.filter((x) => x !== d.id) : [...c, d.id],
                )
              }
              className={`px-3 py-1.5 rounded border text-sm ${
                closed.includes(d.id)
                  ? "bg-sushi-red text-paper border-sushi-red"
                  : "bg-paper border-bamboo/30 text-warm-gray"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-warm-gray">
          Default: Lunedì chiuso. Click per toggle.
        </p>
      </Section>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
        {pending ? "Salvataggio..." : "Salva impostazioni"}
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
  value,
  type = "text",
  hint,
  textarea,
}: {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  hint?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={String(value)}
          rows={6}
          className="w-full rounded-md border border-bamboo/30 bg-paper px-3 py-2 font-mono text-xs"
        />
      ) : (
        <Input name={name} type={type} defaultValue={value} />
      )}
      {hint && <p className="text-xs text-warm-gray">{hint}</p>}
    </div>
  );
}
