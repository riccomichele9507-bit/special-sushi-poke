// Proxy server-side per Google Places API (New) Autocomplete.
// Bias geometrico su Bari, filtro country IT.
// Riusa GOOGLE_MAPS_API_KEY esistente (no nuova chiave client-side).

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

// Centro Bari (Via G. Petroni, ristorante) + raggio bias
const BIAS_LAT = 41.0967058;
const BIAS_LNG = 16.8676296;
const BIAS_RADIUS_METERS = 15000; // 15 km — copre Bari + comuni limitrofi

interface RequestBody {
  input: string;
  sessionToken: string;
}

export async function POST(req: Request) {
  // Anti-abuse: rifiuta chiamate da origini esterne (CSRF / cost amplification)
  const origin = req.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (origin && siteUrl && origin !== siteUrl) {
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

  // Validazione minima sessionToken: deve essere stringa non-vuota max 64 char
  if (!body.sessionToken || typeof body.sessionToken !== "string" || body.sessionToken.length > 64) {
    return NextResponse.json({ error: "sessionToken non valido" }, { status: 400 });
  }

  const input = body.input?.trim() ?? "";
  if (input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const googleBody = {
    input,
    sessionToken: body.sessionToken,
    languageCode: "it",
    regionCode: "IT",
    includedRegionCodes: ["IT"],
    locationBias: {
      circle: {
        center: { latitude: BIAS_LAT, longitude: BIAS_LNG },
        radius: BIAS_RADIUS_METERS,
      },
    },
  };

  try {
    const res = await fetch(GOOGLE_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify(googleBody),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Places autocomplete error", res.status, errText);
      return NextResponse.json(
        { error: "Errore servizio mappe", predictions: [] },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }>;
    };

    const predictions = (data.suggestions ?? [])
      .filter((s) => s.placePrediction)
      .map((s) => {
        const p = s.placePrediction!;
        return {
          placeId: p.placeId,
          description: p.text.text,
          mainText: p.structuredFormat?.mainText?.text ?? p.text.text,
          secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
        };
      });

    return NextResponse.json({ predictions });
  } catch (e) {
    console.error("Places autocomplete fetch failed", e);
    return NextResponse.json(
      { error: "Errore di rete", predictions: [] },
      { status: 502 },
    );
  }
}
