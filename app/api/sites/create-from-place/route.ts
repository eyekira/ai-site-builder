import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SiteStatus } from '@prisma/client';

import { fetchPlaceDetails, GooglePlacesError } from '@/lib/places';
import { prisma } from '@/lib/prisma';

const LOCAL_ORIGINS = new Set(['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000']);

function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }

  if (LOCAL_ORIGINS.has(origin)) {
    return origin;
  }

  const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (envOrigins.includes(origin)) {
    return origin;
  }

  if (process.env.NODE_ENV !== 'production') {
    return origin;
  }

  return null;
}

function buildCorsHeaders(request: NextRequest): HeadersInit {
  const allowedOrigin = getAllowedOrigin(request);
  if (!allowedOrigin) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-mvp-user-id',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(request) });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(name: string, placeId: string) {
  const base = slugify(name) || 'site';
  const suffix = placeId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-6) || 'draft';
  const initial = `${base}-${suffix}`;

  const existing = await prisma.site.findUnique({ where: { slug: initial } });
  if (!existing) {
    return initial;
  }

  let counter = 2;
  while (counter < 1000) {
    const candidate = `${initial}-${counter}`;
    const match = await prisma.site.findUnique({ where: { slug: candidate } });
    if (!match) {
      return candidate;
    }
    counter += 1;
  }

  return `${initial}-${Date.now().toString(36)}`;
}

type ResolvedPlace = {
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

async function resolvePlaceForCreation(
  placeId: string,
  options?: { signal?: AbortSignal },
): Promise<ResolvedPlace> {
  try {
    return await fetchPlaceDetails(placeId, { signal: options?.signal });
  } catch (error) {
    if (error instanceof GooglePlacesError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    const existingPlace = await prisma.place.findUnique({ where: { id: placeId } });

    if (existingPlace) {
      return {
        id: existingPlace.id,
        name: existingPlace.name,
        address: existingPlace.address,
        phone: existingPlace.phone,
        website: existingPlace.website,
        hoursJson: (() => {
          if (typeof existingPlace.hoursJson !== 'string') {
            return null;
          }

          try {
            return JSON.parse(existingPlace.hoursJson) as Record<string, unknown>;
          } catch {
            return null;
          }
        })(),
        lat: existingPlace.lat,
        lng: existingPlace.lng,
        city: null,
      };
    }

    return {
      id: placeId,
      name: 'New Site',
      address: null,
      phone: null,
      website: null,
      hoursJson: null,
      lat: null,
      lng: null,
      city: null,
    };
  }
}

function buildHeroCtas(place: ResolvedPlace): Array<{ label: string; href: string }> {
  if (place.phone) {
    return [{ label: 'Call us', href: `tel:${place.phone}` }];
  }

  if (place.website) {
    return [{ label: 'Visit website', href: place.website }];
  }

  return [{ label: 'Learn more', href: '#' }];
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request);
  const requestId = randomUUID();
  const startedAt = Date.now();
  const debugEnabled = request.nextUrl.searchParams.get('debug') === '1';
  const debugInfo = debugEnabled
    ? {
        requestId,
        steps: [] as string[],
        timingsMs: {} as Record<string, number>,
      }
    : null;

  const recordStep = (step: string) => {
    if (!debugInfo) {
      return;
    }
    debugInfo.steps.push(step);
    debugInfo.timingsMs[step] = Date.now() - startedAt;
  };

  const respondError = (status: number, error: string, detail: string) =>
    NextResponse.json(
      { ok: false, error, detail, ...(debugInfo ? { debug: debugInfo } : {}) },
      { status, headers: corsHeaders },
    );

  try {
    recordStep('start');

    if (!process.env.GOOGLE_PLACES_SERVER_KEY) {
      return respondError(500, 'Missing GOOGLE_PLACES_SERVER_KEY', 'Set GOOGLE_PLACES_SERVER_KEY to proceed.');
    }

    // Expected payload: { placeId: string } (also accepts place_id).
    let body: { placeId?: string; place_id?: string };
    try {
      body = (await request.json()) as { placeId?: string; place_id?: string };
    } catch (error) {
      console.error('create-from-place invalid JSON', { requestId, error });
      return respondError(400, 'Invalid JSON body.', 'Provide a JSON body with a placeId.');
    }

    const placeId = (body.placeId ?? body.place_id ?? '').trim();

    if (!placeId) {
      return respondError(400, 'placeId is required.', 'Provide a non-empty placeId.');
    }

    recordStep('validated');

    let existingSite;
    try {
      existingSite = await prisma.site.findFirst({ where: { placeId }, orderBy: { id: 'desc' } });
    } catch (error) {
      const prismaCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : null;
      console.error('create-from-place prisma find error', { requestId, prismaCode, error });
      return respondError(500, 'Database error', prismaCode ? `Prisma error code: ${prismaCode}` : 'Unknown error.');
    }

    if (existingSite) {
      recordStep('existing-site');
      return NextResponse.json(
        { siteId: existingSite.id, slug: existingSite.slug, existed: true, ...(debugInfo ? { debug: debugInfo } : {}) },
        { headers: corsHeaders },
      );
    }

    recordStep('fetch-place');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    let place: ResolvedPlace;

    try {
      place = await resolvePlaceForCreation(placeId, { signal: controller.signal });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof GooglePlacesError) {
        console.error('create-from-place google details error', {
          requestId,
          status: error.status,
          bodyExcerpt: error.bodyExcerpt,
        });
        return respondError(
          502,
          'Google Places details request failed.',
          `Upstream status ${error.status}. ${error.bodyExcerpt ?? 'No response body.'}`,
        );
      }

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('create-from-place google details timeout', { requestId });
        return respondError(504, 'Google Places request timed out.', 'Try again later.');
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const prismaCode = String(error.code);
        console.error('create-from-place prisma resolve error', { requestId, prismaCode, error });
        return respondError(500, 'Database error', `Prisma error code: ${prismaCode}`);
      }

      console.error('create-from-place unexpected place error', { requestId, error });
      return respondError(500, 'Failed to resolve place details.', 'Unexpected error while resolving place.');
    } finally {
      clearTimeout(timeoutId);
    }

    recordStep('upsert-place');

    try {
      await prisma.place.upsert({
        where: { id: place.id },
        update: {
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          lat: place.lat,
          lng: place.lng,
        },
        create: {
          id: place.id,
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          lat: place.lat,
          lng: place.lng,
        },
      });
    } catch (error) {
      const prismaCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : null;
      console.error('create-from-place prisma upsert error', { requestId, prismaCode, error });
      return respondError(500, 'Database error', prismaCode ? `Prisma error code: ${prismaCode}` : 'Unknown error.');
    }

    recordStep('create-site');

    const slug = await generateUniqueSlug(place.name, place.id);

    let site;
    try {
      site = await prisma.site.create({
        data: {
          slug,
          title: place.name,
          status: SiteStatus.DRAFT,
          publishedAt: null,
          previewToken: randomUUID(),
          themeJson: null,
          ownerId: null,
          placeId: place.id,
          sections: {
            create: [
              {
                type: SectionType.HERO,
                order: 1,
                contentJson: JSON.stringify({
                  headline: place.name,
                  subheadline: place.city ?? '',
                  ctas: buildHeroCtas(place),
                }),
              },
              {
                type: SectionType.ABOUT,
                order: 2,
                contentJson: JSON.stringify({
                  text: `Welcome to ${place.name}${place.city ? ` in ${place.city}` : ''}. We’re glad you’re here.`,
                }),
              },
              {
                type: SectionType.CONTACT,
                order: 3,
                contentJson: JSON.stringify({
                  address: place.address,
                  phone: place.phone,
                  website: place.website,
                  hours: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
                }),
              },
            ],
          },
        },
      });
    } catch (error) {
      const prismaCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : null;
      console.error('create-from-place prisma create error', { requestId, prismaCode, error });
      return respondError(500, 'Database error', prismaCode ? `Prisma error code: ${prismaCode}` : 'Unknown error.');
    }

    recordStep('done');

    return NextResponse.json(
      { siteId: site.id, slug: site.slug, ...(debugInfo ? { debug: debugInfo } : {}) },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('create-from-place unhandled error', { requestId, error });
    return respondError(500, 'Failed to create site from place.', 'Unexpected server error.');
  }
}
