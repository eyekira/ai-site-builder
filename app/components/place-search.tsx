'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type PlaceSuggestion = {
  placeId: string;
  description: string;
};

export function PlaceSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceSuggestion[]>([]);

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

  useEffect(() => {
    if (!hasQuery) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch autocomplete suggestions.');
        }

        const data = (await response.json()) as { suggestions?: PlaceSuggestion[] };
        setResults(data.suggestions ?? []);
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }
        setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [hasQuery, query]);

  const handleSelect = async (placeId: string) => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/sites/create-from-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create site.');
      }

      const data = (await response.json()) as { slug?: string; existed?: boolean };
      if (!data.slug) {
        throw new Error('Missing slug in response.');
      }

      router.push(data.existed ? `/editor/${data.slug}` : `/s/${data.slug}`);
    } catch {
      setError('사이트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="w-full max-w-2xl">
      <div className="rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:shadow-md">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="식당 이름 또는 주소를 입력하세요"
          className="w-full bg-transparent text-base text-gray-800 outline-none"
          aria-label="식당 검색"
          disabled={creating}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {creating && <p className="text-sm text-blue-600">Creating site...</p>}
        {!creating && loading && <p className="text-sm text-gray-500">검색 중...</p>}
        {!loading && error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && !hasQuery && (
          <p className="text-sm text-gray-500">원하는 식당을 검색해보세요.</p>
        )}
        {!loading && !error && hasQuery && results.length === 0 && (
          <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
        )}
        {!loading && !error && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((place) => (
              <li key={place.placeId}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-gray-100 px-4 py-3 text-left transition hover:border-gray-300"
                  onClick={() => handleSelect(place.placeId)}
                  disabled={creating}
                >
                  <p className="font-medium text-gray-900">{place.description}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
