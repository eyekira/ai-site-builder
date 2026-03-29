import { withRetry } from '@/lib/net-retry';

const GOOGLE_PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const GOOGLE_PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';
const PLACE_DETAILS_FIELD_MASK =
  'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,regularOpeningHours,location,addressComponents,photos';

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
};

type GooglePlaceDetailsResponse = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: unknown;
  photos?: Array<{
    name?: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: Array<{
      displayName?: string;
    }>;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
};

export type PlaceSuggestion = {
  placeId: string;
  description: string;
};

export type NormalizedPlaceDetails = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hoursJson: Record<string, unknown> | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  photos: Array<{ ref: string; width: number | null; height: number | null }>;
};

export type PlacePhotoDebugMeta = {
  endpoint: string;
  fieldMask: string;
  rawGoogleCount: number;
  postProcessedCount: number;
  photoRefsLength: number;
  nextPageToken: string | null;
  truncated: boolean;
  truncatedBy?: string;
};

function getServerKey() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_SERVER_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY environment variable.');
  }

  return apiKey;
}

export async function fetchPlaceAutocomplete(query: string): Promise<PlaceSuggestion[]> {
  const apiKey = getServerKey();
  const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: query,
      includedPrimaryTypes: ['restaurant'],
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Google Places autocomplete request failed.');
  }

  const data = (await response.json()) as GoogleAutocompleteResponse;

  return (data.suggestions ?? [])
    .map((item) => ({
      placeId: item.placePrediction?.placeId,
      description: item.placePrediction?.text?.text,
    }))
    .filter((item): item is PlaceSuggestion => Boolean(item.placeId && item.description));
}

function getCityFromAddressComponents(
  components: GooglePlaceDetailsResponse['addressComponents'],
): string | null {
  if (!components) {
    return null;
  }

  const locality = components.find((component) => component.types?.includes('locality'));
  if (locality?.longText) {
    return locality.longText;
  }

  const sublocality = components.find((component) =>
    component.types?.includes('sublocality_level_1'),
  );

  return sublocality?.longText ?? null;
}

export async function fetchPlaceDetailsWithDebug(
  placeId: string,
  opts?: { photoCap?: number; truncatedBy?: string },
): Promise<{ place: NormalizedPlaceDetails; debug: PlacePhotoDebugMeta }> {
  const apiKey = getServerKey();
  const response = await withRetry(
    async () => {
      const res = await fetch(`${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': PLACE_DETAILS_FIELD_MASK,
        },
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`GOOGLE_DETAILS_HTTP_${res.status}:${body.slice(0, 120)}`);
      }
      return res;
    },
    { retries: 2, baseDelayMs: 300 },
  );

  const place = (await response.json()) as GooglePlaceDetailsResponse & { nextPageToken?: string };
  const rawPhotos = (place.photos ?? [])
    .map((photo) => ({
      ref: photo.name ?? '',
      width: typeof photo.widthPx === 'number' ? photo.widthPx : null,
      height: typeof photo.heightPx === 'number' ? photo.heightPx : null,
    }))
    .filter((photo) => Boolean(photo.ref));

  const photoCap = typeof opts?.photoCap === 'number' && opts.photoCap > 0 ? opts.photoCap : null;
  const photos = photoCap ? rawPhotos.slice(0, photoCap) : rawPhotos;

  return {
    place: {
      id: place.id ?? placeId,
      name: place.displayName?.text ?? 'Untitled Place',
      address: place.formattedAddress ?? null,
      phone: place.nationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      hoursJson:
        place.regularOpeningHours && typeof place.regularOpeningHours === 'object'
          ? (place.regularOpeningHours as Record<string, unknown>)
          : null,
      lat: place.location?.latitude ?? null,
      lng: place.location?.longitude ?? null,
      city: getCityFromAddressComponents(place.addressComponents),
      photos,
    },
    debug: {
      endpoint: `${GOOGLE_PLACES_DETAILS_URL}/{placeId}`,
      fieldMask: PLACE_DETAILS_FIELD_MASK,
      rawGoogleCount: rawPhotos.length,
      postProcessedCount: photos.length,
      photoRefsLength: photos.length,
      nextPageToken: typeof place.nextPageToken === 'string' ? place.nextPageToken : null,
      truncated: photoCap !== null && rawPhotos.length > photos.length,
      truncatedBy: photoCap !== null && rawPhotos.length > photos.length ? opts?.truncatedBy ?? 'unknown-call-site' : undefined,
    },
  };
}

export async function fetchPlaceDetails(placeId: string): Promise<NormalizedPlaceDetails> {
  const { place } = await fetchPlaceDetailsWithDebug(placeId);
  return place;
}
