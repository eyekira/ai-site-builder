'use client';

import { useEffect, useMemo, useState } from 'react';

type PlaceSuggestion = {
  place_id: string;
  name: string;
  address?: string;
};

type PlacesApiResponse = PlaceSuggestion[] | { results?: PlaceSuggestion[] };

function normalizePlacesResponse(payload: PlacesApiResponse): PlaceSuggestion[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

export function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceSuggestion[]>([]);

  const hasQuery = useMemo(() => debouncedQuery.trim().length > 0, [debouncedQuery]);
  const shouldShowDropdown = query.trim().length > 0;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!hasQuery) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/test-places?input=${encodeURIComponent(debouncedQuery.trim())}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Unable to load search results.');
        }

        const data = (await response.json()) as PlacesApiResponse;
        setResults(normalizePlacesResponse(data));
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }
        setError('Something went wrong while searching. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchPlaces();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, hasQuery]);

  return (
    <section className="w-full max-w-2xl">
      <div className="relative">
        <div className="rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:shadow-md">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurants by name or address"
            className="w-full bg-transparent text-base text-gray-800 outline-none"
            aria-label="Search restaurants"
          />
        </div>

        {shouldShowDropdown && (
          <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {!loading && error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && results.length === 0 && (
              <p className="text-sm text-gray-500">No search results found.</p>
            )}
            {!loading && !error && results.length > 0 && (
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {results.map((place) => (
                  <li key={place.place_id}>
                    <button
                      type="button"
                      onClick={() => console.log(place.place_id)}
                      className="w-full rounded-xl border border-gray-100 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <p className="font-medium text-gray-900">{place.name}</p>
                      {place.address && <p className="text-sm text-gray-500">{place.address}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
