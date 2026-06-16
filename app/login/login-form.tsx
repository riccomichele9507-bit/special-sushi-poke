"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useCartStore } from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result.ok) {
        // Nuova sessione → carrello pulito (evita residui di chi usava prima il browser)
        useCartStore.getState().clear();
        usePricing.getState().setTip(0);
        toast.success("Accesso effettuato");
        // Priorità: returnTo esplicito → redirectTo dell'action (es. /admin) → /menu
        router.push(returnTo ?? result.redirectTo ?? "/menu");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <GoogleSignInButton returnTo={returnTo} label="Accedi con Google" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-bamboo/20"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-paper px-2 text-warm-gray">oppure con email</span>
        </div>
      </div>

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
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={8}
            disabled={isPending}
          />
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
          {isPending ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>
    </div>
  );
}
