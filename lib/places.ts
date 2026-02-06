const GOOGLE_PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const GOOGLE_PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';

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
};

function getServerKey() {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_PLACES_SERVER_KEY environment variable.');
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

export async function fetchPlaceDetails(placeId: string): Promise<NormalizedPlaceDetails> {
  const apiKey = getServerKey();
  const response = await fetch(`${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,regularOpeningHours,location,addressComponents',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Google Places details request failed.');
  }

  const place = (await response.json()) as GooglePlaceDetailsResponse;

  return {
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
  };
}
