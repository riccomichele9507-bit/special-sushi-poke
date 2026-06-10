"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountForm({
  defaultName,
  defaultPhone,
  defaultMarketingConsent,
}: {
  defaultName: string;
  defaultPhone: string;
  defaultMarketingConsent: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) {
        toast.success("Profilo aggiornato");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome e cognome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultName}
          maxLength={80}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Telefono <span className="text-warm-gray text-xs">(opzionale)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          inputMode="tel"
          placeholder="333 1234567"
          disabled={isPending}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-ink cursor-pointer pt-2">
        <input
          type="checkbox"
          name="marketingConsent"
          defaultChecked={defaultMarketingConsent}
          className="mt-0.5 h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
          disabled={isPending}
        />
        <span>
          Ricevi via email offerte e novità di Special Sushi Poke.
        </span>
      </label>

      {error && (
        <div className="text-sm text-sushi-red bg-sushi-red/10 border border-sushi-red/30 rounded p-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="bg-bamboo hover:bg-bamboo/90 text-paper"
        disabled={isPending}
      >
        {isPending ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
