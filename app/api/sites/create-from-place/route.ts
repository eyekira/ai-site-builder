import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SiteStatus } from '@prisma/client';

import { fetchPlaceDetails } from '@/lib/places';
import { prisma } from '@/lib/prisma';

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
    const existingSite = await prisma.site.findFirst({ where: { placeId }, orderBy: { id: 'desc' } });
    if (existingSite) {
      return NextResponse.json({ siteId: existingSite.id, slug: existingSite.slug, existed: true });
    }

    const place = await fetchPlaceDetails(placeId);

    const user = await prisma.user.upsert({
      where: { email: 'demo@local' },
      create: {
        email: 'demo@local',
        name: 'Demo User',
      },
      update: {},
    });

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
        themeJson: null,
        ownerId: user.id,
        placeId: place.id,
        sections: {
          create: [
            {
              type: SectionType.HERO,
              order: 1,
              contentJson: JSON.stringify({
                headline: place.name,
                subheadline: place.city,
                ctas: [
                  { type: 'CALL', value: place.phone },
                  { type: 'DIRECTIONS', value: place.address },
                ].filter((cta) => Boolean(cta.value)),
              }),
            },
            {
              type: SectionType.ABOUT,
              order: 2,
              contentJson: JSON.stringify({
                body: `Welcome to ${place.name}${place.city ? ` in ${place.city}` : ''}. We’re glad you’re here.`,
              }),
            },
            {
              type: SectionType.CONTACT,
              order: 3,
              contentJson: JSON.stringify({
                address: place.address,
                phone: place.phone,
                website: place.website,
                hoursJson: place.hoursJson,
                lat: place.lat,
                lng: place.lng,
              }),
            },
          ],
        },
      },
    });

    return NextResponse.json({ siteId: site.id, slug: site.slug });
  } catch {
    return NextResponse.json({ error: 'Failed to create site from place.' }, { status: 502 });
  }
}
