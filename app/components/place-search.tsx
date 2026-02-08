'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
        setError('Something went wrong while searching. Please try again soon.');
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

      const response = await fetch('/api/sites/from-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ placeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create site.');
      }

      const data = (await response.json()) as { slug?: string; existed?: boolean };
      if (!data.slug) {
        throw new Error('Missing slug in response.');
      }

      router.push(`/editor/${data.slug}`);
    } catch {
      setError('Failed to create the site. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl">
      <CardHeader>
        <CardTitle className="text-left text-xl">Search places</CardTitle>
        <CardDescription className="text-left">Enter a restaurant name or address to start your site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a restaurant name or address"
            className="pl-9"
            aria-label="Restaurant search"
            disabled={creating}
          />
        </div>

        {creating && (
          <Badge variant="secondary" className="gap-1.5 rounded-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Creating site...
          </Badge>
        )}

        {!creating && loading && <p className="text-sm text-muted-foreground">Searching...</p>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && !hasQuery && (
          <p className="text-sm text-muted-foreground">Search for a restaurant to get started.</p>
        )}
        {!loading && !error && hasQuery && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found.</p>
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
