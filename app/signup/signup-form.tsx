"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ returnTo: _returnTo }: { returnTo?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signup(formData);
      if (result.ok) {
        setSuccess(true);
        toast.success("Ti abbiamo inviato un'email di conferma");
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-bamboo/10 border border-bamboo/30 p-4 space-y-2">
          <p className="text-2xl">📧</p>
          <p className="font-semibold text-ink">Controlla la tua email</p>
          <p className="text-sm text-warm-gray">
            Ti abbiamo mandato un link di conferma. Clicca per attivare il tuo
            account, poi torna qui per accedere.
          </p>
        </div>
        <p className="text-xs text-warm-gray">
          Non hai ricevuto l&apos;email? Controlla in spam o richiedila di nuovo
          dalla pagina di login.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome e cognome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={80}
          placeholder="Mario Rossi"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="mario.rossi@email.com"
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
          autoComplete="tel"
          inputMode="tel"
          placeholder="333 1234567"
          disabled={isPending}
        />
        <p className="text-xs text-warm-gray">
          Utile per chiamarti se il rider ha bisogno.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          disabled={isPending}
        />
        <p className="text-xs text-warm-gray">Almeno 8 caratteri.</p>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            name="termsAccepted"
            required
            className="mt-0.5 h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
            disabled={isPending}
          />
          <span>
            Ho letto e accetto{" "}
            <Link href="/terms" className="text-bamboo underline">
              Termini
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="text-bamboo underline">
              Privacy
            </Link>{" "}
            <span className="text-sushi-red">*</span>
          </span>
        </label>

        <label className="flex items-start gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-0.5 h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
            disabled={isPending}
          />
          <span>
            Voglio ricevere via email offerte e novità di Special Sushi Poke
            (puoi disiscriverti in ogni momento).
          </span>
        </label>
      </div>

      {error && (
        <div className="text-sm text-sushi-red bg-sushi-red/10 border border-sushi-red/30 rounded p-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-bamboo hover:bg-bamboo/90 text-paper"
        disabled={isPending}
      >
        {isPending ? "Creazione account..." : "Crea il mio account"}
      </Button>
    </form>
  );
}
