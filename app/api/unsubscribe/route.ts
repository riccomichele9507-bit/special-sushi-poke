// Endpoint disiscrizione one-click (RFC 8058).
//  - POST: usato dal pulsante nativo del client email → sopprime subito, 200.
//  - GET : nessun side-effect (evita disiscrizioni da link-scanner) → redirect
//          alla pagina di conferma con lo stesso token.
// Il token HMAC è verificato prima di qualsiasi scrittura.

import { NextResponse } from "next/server";
import { verifyUnsubscribe } from "@/lib/marketing/unsubscribe-token";
import { suppressEmail } from "@/lib/marketing/unsubscribe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";

  if (!email || !verifyUnsubscribe(email, token)) {
    return new NextResponse("Link non valido", { status: 400 });
  }

  try {
    await suppressEmail(email, "one-click");
  } catch {
    return new NextResponse("Errore", { status: 500 });
  }
  return new NextResponse("Iscrizione annullata.", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const e = url.searchParams.get("e") ?? "";
  const t = url.searchParams.get("t") ?? "";
  // Nessuna scrittura: reindirizza alla pagina di conferma (con bottone).
  return NextResponse.redirect(
    new URL(`/unsubscribe?e=${encodeURIComponent(e)}&t=${encodeURIComponent(t)}`, request.url),
  );
}
