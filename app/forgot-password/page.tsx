import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Password dimenticata",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/account");

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
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Password dimenticata?
            </h1>
            <p className="mt-1 text-sm text-warm-gray">
              Inserisci la tua email: ti mandiamo un link per reimpostarla.
            </p>
          </div>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-warm-gray">
          <Link href="/login" className="text-bamboo font-semibold hover:underline">
            ← Torna all&apos;accesso
          </Link>
        </p>
      </div>
    </div>
  );
}
