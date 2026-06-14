import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reimposta password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <Image
            src="/logo-mark.png"
            alt="Special Sushi Poke"
            width={56}
            height={56}
            priority
            className="mx-auto h-14 w-14 object-contain"
          />
          <h1 className="font-heading text-2xl font-bold text-ink">
            Imposta una nuova password
          </h1>
        </div>

        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="rounded-lg border border-sushi-red/30 bg-sushi-red/5 p-4 text-center space-y-2">
            <p className="font-semibold text-sushi-red">Link non valido o scaduto</p>
            <p className="text-sm text-warm-gray">
              Richiedi un nuovo link per reimpostare la password.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-semibold text-bamboo hover:underline"
            >
              Richiedi nuovo link →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
