import { NextRequest, NextResponse } from 'next/server';

function getGoogleMapsKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_SERVER_KEY ?? null;
}

export async function GET(request: NextRequest) {
  const rawRef = request.nextUrl.searchParams.get('ref') ?? '';
  const maxWidthParam = request.nextUrl.searchParams.get('maxwidth')?.trim() ?? '1200';
  const maxWidth = Number(maxWidthParam);

  // Decode once just in case the client sends encoded text
  const ref = (() => {
    try {
      return decodeURIComponent(rawRef).trim();
    } catch {
      return rawRef.trim();
    }
  })();

  if (!ref) {
    return NextResponse.json({ error: 'ref is required.' }, { status: 400 });
  }

  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return NextResponse.json({ error: 'maxwidth must be a positive number.' }, { status: 400 });
  }

  const apiKey = getGoogleMapsKey();
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY environment variable.' }, { status: 500 });
  }

  // ref should look like: "places/PLACE_ID/photos/PHOTO_ID"
  const normalizedRef = ref.startsWith('places/') ? ref : `places/${ref}`;

  const upstreamUrl = new URL(`https://places.googleapis.com/v1/${normalizedRef}/media`);
  upstreamUrl.searchParams.set('maxWidthPx', Math.min(maxWidth, 1600).toString());
  upstreamUrl.searchParams.set('skipHttpRedirect', 'false');
  console.log('DEBUG photo route hit'); 
  console.log('DEBUG photo ref raw:', rawRef);
  console.log('DEBUG photo ref decoded:', ref);
  console.log('DEBUG photo upstreamUrl:', upstreamUrl.toString());

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'X-Goog-Api-Key': apiKey,
      },
    });
  } catch (error) {
    console.error('Places v1 photo fetch network error:', error);
    return NextResponse.json({ error: 'Failed to fetch photo (network error).' }, { status: 502 });
  }

  if (!upstream.ok) {
    const bodyText = await upstream.text().catch(() => '');
    console.error('Places v1 photo upstream error:', {
      status: upstream.status,
      statusText: upstream.statusText,
      bodyPreview: bodyText.slice(0, 500),
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch photo from Places v1.',
        upstreamStatus: upstream.status,
        upstreamStatusText: upstream.statusText,
        detail: bodyText,
      },
      { status: upstream.status },
    );
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
