'use client';

import { useEffect, useMemo, useState } from 'react';

type PlaceSuggestion = {
  id: string;
  name: string;
  address?: string;
};

export function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/test-places?input=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('검색 결과를 불러오지 못했습니다.');
        }

        const data = (await response.json()) as { results?: PlaceSuggestion[] };
        setResults(data.results ?? []);
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

  return (
    <section className="w-full max-w-2xl">
      <div className="rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:shadow-md">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="식당 이름 또는 주소를 입력하세요"
          className="w-full bg-transparent text-base text-gray-800 outline-none"
          aria-label="식당 검색"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {loading && <p className="text-sm text-gray-500">검색 중...</p>}
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
              <li key={place.id} className="rounded-xl border border-gray-100 px-4 py-3">
                <p className="font-medium text-gray-900">{place.name}</p>
                {place.address && <p className="text-sm text-gray-500">{place.address}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
