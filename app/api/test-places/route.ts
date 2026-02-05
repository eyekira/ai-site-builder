import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PLACE_ID = "ChIJN1t_tDeuEmsRUsoyG83frY4";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        error: "Missing GOOGLE_PLACES_SERVER_KEY environment variable",
        raw: "",
      },
      { status: 500 }
    );
  }

  const placeId =
    request.nextUrl.searchParams.get("place_id") || DEFAULT_PLACE_ID;

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
      cache: "no-store",
    });

    const rawText = await response.text();

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
        error: response.ok ? null : `Google Places request failed with status ${response.status}`,
        raw: rawText,
      },
      { status: response.ok ? 200 : 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
        raw: "",
      },
      { status: 500 }
    );
  }
}
