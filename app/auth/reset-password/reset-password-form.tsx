"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await updatePassword(formData);
      if (r.ok) {
        toast.success("Password aggiornata!");
        router.push(r.redirectTo ?? "/account");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password">Nuova password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="Almeno 8 caratteri"
          disabled={pending}
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
        disabled={pending}
      >
        {pending ? "Salvataggio..." : "Salva nuova password"}
      </Button>
    </form>
  );
}
