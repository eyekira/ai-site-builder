import { NextRequest, NextResponse } from 'next/server';

import { fetchPlaceDetailsWithDebug } from '@/lib/places';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const placeId = request.nextUrl.searchParams.get('placeId')?.trim() ?? '';
  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
  }

  const photoCap = Number(request.nextUrl.searchParams.get('photoCap') ?? '0');
  const cap = Number.isFinite(photoCap) && photoCap > 0 ? photoCap : undefined;

  try {
    const { place, debug } = await fetchPlaceDetailsWithDebug(placeId, {
      photoCap: cap,
      truncatedBy: 'GET /api/debug/place-photos',
    });

    return NextResponse.json({
      endpointUsed: debug.endpoint,
      requestedFields: debug.fieldMask,
      rawGoogleCount: debug.rawGoogleCount,
      postProcessedCount: debug.postProcessedCount,
      photoRefsLength: debug.photoRefsLength,
      nextPageToken: debug.nextPageToken,
      truncation: {
        truncated: debug.truncated,
        truncatedBy: debug.truncatedBy ?? null,
      },
      callSiteStackNote: {
        function: 'fetchPlaceDetailsWithDebug',
        passedPhotoCap: cap ?? null,
      },
      photoRefs: place.photos.map((p) => p.ref),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch place details';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
