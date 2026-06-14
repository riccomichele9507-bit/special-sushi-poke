"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Atterraggio post-pagamento: NON usiamo redirect() server (in Next.js il 307
 * può perdere i Set-Cookie del refresh sessione Supabase → logout al ritorno).
 * Renderizziamo una pagina 200 (consegna i cookie aggiornati al browser) e poi
 * navighiamo lato client con una richiesta pulita → la sessione sopravvive.
 */
export function PostPaymentRedirect({ target }: { target: string }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.replace(target), 700);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-bamboo" strokeWidth={1.5} />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">
        Pagamento confermato!
      </h1>
      <p className="mt-2 text-sm text-warm-gray">
        Ti portiamo ai tuoi premi…
      </p>
      <a
        href={target}
        className="mt-6 inline-block text-sm font-medium text-bamboo underline-offset-2 hover:underline"
      >
        Se non vieni reindirizzato, tocca qui
      </a>
    </div>
  );
}
