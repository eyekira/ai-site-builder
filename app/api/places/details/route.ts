import { NextRequest, NextResponse } from 'next/server';

import { fetchPlaceDetails } from '@/lib/places';

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')?.trim() ?? '';

  if (!placeId) {
    return NextResponse.json({ error: 'place_id is required.' }, { status: 400 });
  }

  try {
    const place = await fetchPlaceDetails(placeId);

    return NextResponse.json({
      place: {
        id: place.id,
        name: place.name,
        address: place.address,
        phone: place.phone,
        website: place.website,
        hoursJson: place.hoursJson,
        lat: place.lat,
        lng: place.lng,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch place details.' }, { status: 502 });
  }
}
