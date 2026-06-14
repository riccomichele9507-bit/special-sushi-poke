"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function action(formData: FormData) {
    startTransition(async () => {
      await requestPasswordReset(formData);
      setSent(true); // non riveliamo se l'email esiste (sicurezza)
    });
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-bamboo/30 bg-bamboo/5 p-4 text-center space-y-2">
        <p className="text-2xl">📧</p>
        <p className="font-semibold text-ink">Controlla la tua email</p>
        <p className="text-sm text-warm-gray">
          Se esiste un account con quell&apos;indirizzo, ti abbiamo inviato un link
          per reimpostare la password. Controlla anche lo spam.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
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
          disabled={pending}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-bamboo hover:bg-bamboo/90 text-paper"
        disabled={pending}
      >
        {pending ? "Invio in corso..." : "Invia link di reset"}
      </Button>
    </form>
  );
}
