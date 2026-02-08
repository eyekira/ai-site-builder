import { NextRequest, NextResponse } from 'next/server';

import { fetchPlaceAutocomplete } from '@/lib/places';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ error: 'q must be at least 2 characters.' }, { status: 400 });
  }

  try {
    const suggestions = await fetchPlaceAutocomplete(q);
    return NextResponse.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('GOOGLE_MAPS_API_KEY') || message.includes('GOOGLE_PLACES_SERVER_KEY')) {
      return NextResponse.json({ suggestions: [], warning: 'places_not_configured' });
    }
    return NextResponse.json({ error: 'Failed to fetch place suggestions.' }, { status: 502 });
  }
}
