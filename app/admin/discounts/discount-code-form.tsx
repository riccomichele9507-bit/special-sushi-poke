"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addDiscountCode } from "@/app/actions/admin/discount-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DiscountCodeForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"percent" | "fixed">("fixed");

  async function action(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await addDiscountCode(fd);
      if (r.ok) {
        toast.success("Codice creato");
        document
          .querySelector<HTMLFormElement>('form[data-form="add-discount"]')
          ?.reset();
        setKind("fixed");
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <form action={action} data-form="add-discount" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Codice</Label>
          <Input
            name="code"
            placeholder="ESTATE5"
            required
            maxLength={20}
            className="font-mono uppercase"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Etichetta (opzionale, interna)</Label>
          <Input name="label" placeholder="Promo estate WhatsApp" maxLength={60} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Tipo sconto</Label>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as "percent" | "fixed")}
            className="flex h-9 w-full rounded-md border border-border bg-paper px-3 text-sm"
          >
            <option value="fixed">Importo fisso (€)</option>
            <option value="percent">Percentuale (%)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            {kind === "fixed" ? "Sconto in € (es. 5)" : "Sconto in % (1-100)"}
          </Label>
          <Input
            name="value"
            type="number"
            step={kind === "fixed" ? "0.01" : "1"}
            min={kind === "fixed" ? "0.01" : "1"}
            max={kind === "percent" ? "100" : undefined}
            placeholder={kind === "fixed" ? "5,00" : "10"}
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Ordine minimo € (opzionale)</Label>
          <Input name="min_order_euro" type="number" step="0.01" min="0" placeholder="0" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valido dal (opzionale)</Label>
          <Input name="valid_from" type="datetime-local" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valido al (opzionale)</Label>
          <Input name="valid_to" type="datetime-local" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Usi massimi (opzionale)</Label>
          <Input name="max_redemptions" type="number" step="1" min="1" placeholder="illimitato" />
        </div>
        <label className="flex items-center gap-2 text-sm pb-1">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="h-4 w-4 rounded border-bamboo/40 text-bamboo"
          />
          Attivo da subito
        </label>
      </div>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
        {pending ? "Creazione..." : "Crea codice"}
      </Button>
    </form>
  );
}
