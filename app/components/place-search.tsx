'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type PlaceSuggestion = {
  placeId: string;
  description: string;
};

export function PlaceSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const isNavigatingRef = useRef(false);
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
    if (isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    setCreating(true);
    setError(null);

    try {
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

      const data = (await response.json()) as { ok?: boolean; site?: { slug?: string } };
      if (!data?.site?.slug) {
        throw new Error('Missing slug in response.');
      }

      router.push(`/editor/${data.site.slug}`);
    } catch {
      isNavigatingRef.current = false;
      setCreating(false);
      setError('사이트 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Card className="w-full rounded-2xl">
      <CardHeader>
        <CardTitle className="text-left text-xl">장소 검색</CardTitle>
        <CardDescription className="text-left">식당 이름 또는 주소를 입력해 사이트를 시작하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="식당 이름 또는 주소를 입력하세요"
            className="pl-9"
            aria-label="식당 검색"
            disabled={creating}
          />
        </div>

        {creating && (
          <Badge variant="secondary" className="gap-1.5 rounded-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Creating site...
          </Badge>
        )}

        {!creating && loading && <p className="text-sm text-muted-foreground">검색 중...</p>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && !hasQuery && <p className="text-sm text-muted-foreground">원하는 식당을 검색해보세요.</p>}
        {!loading && !error && hasQuery && results.length === 0 && (
          <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        )}

        {!loading && !error && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((place) => (
              <li key={place.placeId}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start rounded-2xl px-4 py-3 text-left"
                  onClick={() => handleSelect(place.placeId)}
                  disabled={creating}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">{place.description}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
