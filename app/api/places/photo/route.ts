import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PHOTO_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/photo';

function getGoogleMapsKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_SERVER_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY environment variable.');
  }
  return apiKey;
}

export async function GET(request: NextRequest) {
  const photoRef = request.nextUrl.searchParams.get('ref')?.trim() ?? '';
  const maxWidthParam = request.nextUrl.searchParams.get('maxwidth')?.trim() ?? '1200';
  const maxWidth = Number(maxWidthParam);

  if (!photoRef) {
    return NextResponse.json({ error: 'ref is required.' }, { status: 400 });
  }

  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return NextResponse.json({ error: 'maxwidth must be a positive number.' }, { status: 400 });
  }

  try {
    const apiKey = getGoogleMapsKey();
    const endpoint = new URL(GOOGLE_PHOTO_ENDPOINT);
    endpoint.searchParams.set('photoreference', photoRef);
    endpoint.searchParams.set('maxwidth', Math.min(maxWidth, 1600).toString());
    endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint.toString(), {
      cache: 'no-store',
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Failed to fetch photo.' }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch photo.', detail: message }, { status: 500 });
  }
}
