import { NextRequest, NextResponse } from 'next/server';

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

const GOOGLE_PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_PLACES_SERVER_KEY environment variable.' },
      { status: 500 },
    );
  }

  const input = request.nextUrl.searchParams.get('input')?.trim();
  const keywordParam = request.nextUrl.searchParams.get('keyword')?.trim();
  const keyword = input || keywordParam || 'Seoul Restaurant';

  try {
    const googleResponse = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify({
        textQuery: keyword,
      }),
      cache: 'no-store',
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text();
      return NextResponse.json(
        {
          error: 'Google Places API request failed.',
          status: googleResponse.status,
          details: errorBody,
        },
        { status: 500 },
      );
    }

    const data = (await googleResponse.json()) as { places?: GooglePlace[] };

    const results = (data.places ?? []).map((place) => ({
      id: place.id ?? null,
      name: place.displayName?.text ?? null,
      address: place.formattedAddress ?? null,
      location: place.location
        ? {
            latitude: place.location.latitude ?? null,
            longitude: place.location.longitude ?? null,
          }
        : null,
    }));

    return NextResponse.json({ keyword, results });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error while calling Google Places API.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
