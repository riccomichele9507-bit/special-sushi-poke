import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif-jp text-ink">Accedi</h1>
          <p className="text-sm text-warm-gray">
            Bentornato/a su Special Sushi Poke 🍣
          </p>
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
