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
  } catch {
    return NextResponse.json({ error: 'Failed to fetch place suggestions.' }, { status: 502 });
  }
}
