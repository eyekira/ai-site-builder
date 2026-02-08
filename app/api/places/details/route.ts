import { NextRequest, NextResponse } from 'next/server';

import { formatHoursFromJson } from '@/lib/hours';
import { fetchPlaceDetails } from '@/lib/places';

export async function GET(request: NextRequest) {
  const rawPlaceId =
    request.nextUrl.searchParams.get('placeId')?.trim() ??
    request.nextUrl.searchParams.get('place_id')?.trim() ??
    '';

  if (!rawPlaceId) {
    return NextResponse.json({ error: 'placeId is required.' }, { status: 400 });
  }

  try {
    const place = await fetchPlaceDetails(rawPlaceId);

    const hoursText =
      place.hoursJson && typeof place.hoursJson === 'object' ? formatHoursFromJson(place.hoursJson) : null;

    return NextResponse.json({
      place: {
        id: place.id,
        businessTitle: place.name,
        title: place.name,
        address: place.address,
        formattedAddress: place.address,
        phone: place.phone,
        website: place.website,
        hoursJson: place.hoursJson,
        hoursText,
        lat: place.lat,
        lng: place.lng,
        photos: place.photos,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch place details.' }, { status: 502 });
  }
}
