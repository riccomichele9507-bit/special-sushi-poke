import { verifyUnsubscribe, normalizeEmail } from "@/lib/marketing/unsubscribe-token";
import { UnsubscribeConfirm } from "./unsubscribe-confirm";

export const metadata = {
  title: "Annulla iscrizione — Special Sushi Poke",
  robots: { index: false, follow: false },
};

type SearchParams = { e?: string; t?: string };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { e, t } = await searchParams;
  const email = e ? normalizeEmail(e) : "";
  const valid = !!email && !!t && verifyUnsubscribe(email, t);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-bamboo/15 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-warm-gray">
            Special Sushi Poke
          </p>
          <h1 className="mt-2 font-serif-jp text-2xl text-ink">
            Gestione iscrizione
          </h1>
        </div>

        {valid ? (
          <UnsubscribeConfirm email={email} token={t!} />
        ) : (
          <p className="text-center text-sm text-warm-gray">
            Il link di disiscrizione non è valido o è incompleto. Se vuoi non
            ricevere più email promozionali, rispondi a una nostra email
            scrivendo &quot;Cancellami&quot;.
          </p>
        )}
      </div>
    </main>
  );
}
