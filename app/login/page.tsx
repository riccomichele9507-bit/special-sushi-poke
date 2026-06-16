import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { LoginForm } from "./login-form";

type SearchParams = {
  returnTo?: string;
  error?: string;
};

export default async function LoginPage({
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
    // Se è già loggato e ha un returnTo lo onora (validato anti open-redirect)
    if (params.returnTo) {
      redirect(safeRedirect(params.returnTo, "/account"));
    }
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    redirect(adminRow ? "/admin" : "/account");
  }

  // Sanitizza returnTo che passiamo al form
  const safeReturnTo = params.returnTo
    ? safeRedirect(params.returnTo, "/account")
    : undefined;

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="absolute top-4 right-4 text-sm font-bold text-ink hover:text-bamboo"
      >
        Torna alla home →
      </Link>
      <div className="w-full max-w-sm space-y-6">
        {/* Branding: logo + furgoncino + frase d'impatto */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Link href="/" aria-label="Torna alla home">
              <Image
                src="/logo-mark.png"
                alt="Special Sushi Poke"
                width={56}
                height={56}
                priority
                className="h-14 w-14 object-contain"
              />
            </Link>
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
              Bentornato 🍣
            </h1>
            <p className="text-sm text-warm-gray">
              Ritrova indirizzo e ordini, e ordina in un tap. <strong className="text-bamboo-deep">Consegna gratuita</strong> a Bari.
            </p>
          </div>
        </div>

        {params.error && (
          <div className="rounded-lg bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-3">
            {params.error}
          </div>
        )}

        <LoginForm returnTo={safeReturnTo} />

        <div className="text-center text-sm text-warm-gray space-y-2">
          <p>
            Non hai un account?{" "}
            <Link
              href={
                safeReturnTo
                  ? `/signup?returnTo=${encodeURIComponent(safeReturnTo)}`
                  : "/signup"
              }
              className="text-bamboo font-semibold hover:underline"
            >
              Registrati
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="text-warm-gray hover:text-ink underline"
            >
              Password dimenticata?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
