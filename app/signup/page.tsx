import { redirect } from "next/navigation";
import Link from "next/link";
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
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif-jp text-ink">Registrati</h1>
          <p className="text-sm text-warm-gray">
            Crea il tuo account per ordinare 🍱
          </p>
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
