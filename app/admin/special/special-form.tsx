"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateDailySpecial } from "@/app/actions/admin/special";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SpecialForm({
  special,
  dishes,
}: {
  special: {
    dish_id: string | null;
    label: string | null;
    badge_label: string | null;
    discount_percent: number | null;
    end_time_local: string | null;
    is_active: boolean;
  } | null;
  dishes: Array<{ id: string; name: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await updateDailySpecial(fd);
      if (r.ok) toast.success("Offerta aggiornata");
      else setError(r.error);
    });
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label className="text-sm">Piatto in offerta</Label>
        <select
          name="dish_id"
          defaultValue={special?.dish_id ?? ""}
          className="w-full rounded-md border border-bamboo/30 bg-paper px-3 py-2"
        >
          <option value="">— Nessuna offerta —</option>
          {dishes.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Etichetta</Label>
        <Input name="label" defaultValue={special?.label ?? ""} placeholder="Offerta Pranzo" />
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Badge (testo del pulsante in homepage)</Label>
        <Input name="badge_label" defaultValue={special?.badge_label ?? ""} placeholder="PRANZO -20% OFF" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-sm">Sconto %</Label>
          <Input name="discount_percent" type="number" min="0" max="100" defaultValue={special?.discount_percent ?? ""} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Termina alle (HH:mm)</Label>
          <Input name="end_time_local" type="time" defaultValue={special?.end_time_local ?? ""} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={special?.is_active ?? true}
          className="h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
        />
        Offerta attiva
      </label>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
        {pending ? "Salvataggio..." : "Salva"}
      </Button>
    </form>
  );
}
