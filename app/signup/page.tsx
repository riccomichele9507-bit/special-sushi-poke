import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { SignupForm } from "./signup-form";

type SearchParams = { returnTo?: string };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(safeRedirect(params.returnTo, "/account"));
  }

  const safeReturnTo = params.returnTo
    ? safeRedirect(params.returnTo, "/account")
    : undefined;

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding: logo + furgoncino + frase d'impatto */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo-mark.png"
              alt="Special Sushi Poke"
              width={56}
              height={56}
              priority
              className="h-14 w-14 object-contain"
            />
          </div>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-border shadow-[0_8px_28px_-10px_rgba(28,28,28,0.25)]">
            <Image
              src="/hero/hero-van.png"
              alt="Furgone delle consegne Special Sushi Poke"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-cover"
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-heading text-2xl font-bold text-ink">
              Iscriviti e sblocca i premi 🎁
            </h1>
            <p className="text-sm text-warm-gray">
              Accumula punti a ogni ordine e ricevi la <strong className="text-bamboo-deep">consegna gratuita</strong> a Bari.
            </p>
          </div>
        </div>

        <SignupForm returnTo={safeReturnTo} />

        <div className="text-center text-sm text-warm-gray">
          Hai già un account?{" "}
          <Link
            href={
              safeReturnTo
                ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}`
                : "/login"
            }
            className="text-bamboo font-semibold hover:underline"
          >
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
}
