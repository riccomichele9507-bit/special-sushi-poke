"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addClosure } from "@/app/actions/admin/closures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClosureForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await addClosure(fd);
      if (r.ok) {
        toast.success("Chiusura aggiunta");
        const form = document.querySelector<HTMLFormElement>(
          'form[data-form="add-closure"]',
        );
        form?.reset();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <form action={action} data-form="add-closure" className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Da</Label>
          <Input name="start_date" type="date" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">A</Label>
          <Input name="end_date" type="date" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Motivo (opzionale)</Label>
        <Input name="reason" placeholder="Ferie estive, evento, ecc." />
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="closes_lunch"
            defaultChecked
            className="h-4 w-4 rounded border-bamboo/40 text-bamboo"
          />
          Chiudi pranzo
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="closes_dinner"
            defaultChecked
            className="h-4 w-4 rounded border-bamboo/40 text-bamboo"
          />
          Chiudi cena
        </label>
      </div>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
        {pending ? "Aggiunta..." : "Aggiungi chiusura"}
      </Button>
    </form>
  );
}
