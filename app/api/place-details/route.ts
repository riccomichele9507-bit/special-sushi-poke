// Proxy server-side per Google Places API (New) Place Details.
// Recupera lat/lng + formatted address dal placeId selezionato dall'autocomplete.
// La presenza del sessionToken in questa chiamata chiude la sessione Google
// (1 sessione = 1 charge invece di N keystroke separati).

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_DETAILS_BASE = "https://places.googleapis.com/v1/places/";

interface RequestBody {
  placeId: string;
  sessionToken: string;
}

// Whitelist origin allineata con places-autocomplete
const ALLOWED_ORIGINS = new Set([
  "https://specialsushipokebari.com",
  "https://www.specialsushipokebari.com",
  "https://special-sushi-poke.vercel.app",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (/^https:\/\/special-sushi-poke[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  return false;
}

export async function POST(req: Request) {
  // Anti-abuse: solo dalle nostre origin
  const origin = req.headers.get("origin");
  if (origin && !isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Origin non autorizzata" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Servizio mappe non configurato" },
      { status: 503 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  if (!body.placeId || typeof body.placeId !== "string" || body.placeId.length > 256) {
    return NextResponse.json({ error: "placeId non valido" }, { status: 400 });
  }
  if (!body.sessionToken || typeof body.sessionToken !== "string" || body.sessionToken.length > 64) {
    return NextResponse.json({ error: "sessionToken non valido" }, { status: 400 });
  }

  const url = `${GOOGLE_DETAILS_BASE}${encodeURIComponent(body.placeId)}?sessionToken=${encodeURIComponent(body.sessionToken)}&languageCode=it&regionCode=IT`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,formattedAddress,location",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Place details error", res.status, errText);
      return NextResponse.json(
        { error: "Errore servizio mappe" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      id?: string;
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
    };

    if (!data.location || !data.formattedAddress) {
      return NextResponse.json(
        { error: "Dettagli posto incompleti" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      placeId: data.id,
      formattedAddress: data.formattedAddress,
      lat: data.location.latitude,
      lng: data.location.longitude,
    });
  } catch (e) {
    console.error("Place details fetch failed", e);
    return NextResponse.json({ error: "Errore di rete" }, { status: 502 });
  }
}
