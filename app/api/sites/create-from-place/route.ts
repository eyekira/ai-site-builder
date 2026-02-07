import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SiteStatus } from '@prisma/client';

import { auth } from '@/auth';
import {
  ANON_SESSION_COOKIE,
  ANON_SESSION_MAX_AGE_SECONDS,
  createAnonSessionId,
  getAnonSessionIdFromRequest,
} from '@/lib/auth';
import { formatHoursFromJson } from '@/lib/hours';
import { fetchPlaceDetails } from '@/lib/places';
import { prisma } from '@/lib/prisma';
import { serializeTheme } from '@/lib/theme';

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

async function resolvePlaceForCreation(placeId: string): Promise<ResolvedPlace> {
  try {
    return await fetchPlaceDetails(placeId);
  } catch {
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
  let body: { placeId?: string };

  try {
    body = (await request.json()) as { placeId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const placeId = body.placeId?.trim();

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required.' }, { status: 400 });
  }

  try {
    const place = await resolvePlaceForCreation(placeId);
    const session = await auth();
    const ownerId = session?.user?.id ? Number(session.user.id) : null;
    const isLoggedIn = Boolean(ownerId && !Number.isNaN(ownerId));
    const anonSessionId = !isLoggedIn ? getAnonSessionIdFromRequest(request) ?? createAnonSessionId() : null;

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

    const slug = await generateUniqueSlug(place.name, place.id);

    const site = await prisma.site.create({
      data: {
        slug,
        title: place.name,
        status: SiteStatus.DRAFT,
        themeJson: serializeTheme('classic'),
        ownerId: isLoggedIn ? ownerId : null,
        anonSessionId: isLoggedIn ? null : anonSessionId,
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
                hours: formatHoursFromJson(place.hoursJson),
              }),
            },
          ],
        },
      },
    });

    const response = NextResponse.json({ siteId: site.id, slug: site.slug });
    if (!isLoggedIn && anonSessionId) {
      response.cookies.set(ANON_SESSION_COOKIE, anonSessionId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: ANON_SESSION_MAX_AGE_SECONDS,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  } catch (error) {
    console.error('Failed to create site from place', error);
    return NextResponse.json(
      {
        error: 'Failed to create site from place.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
