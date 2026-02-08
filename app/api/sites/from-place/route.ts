import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SiteStatus } from '@prisma/client';

import { auth } from '@/auth';
import {
  ANON_SESSION_COOKIE,
  ANON_SESSION_MAX_AGE_SECONDS,
  createAnonSessionId,
  getAnonSessionIdFromRequest,
} from '@/lib/auth';
import { fetchPlaceDetails } from '@/lib/places';
import { prisma } from '@/lib/prisma';
import { serializeTheme } from '@/lib/theme';

type PlacePhoto = {
  ref: string;
  width: number | null;
  height: number | null;
};

type CopyPayload = {
  hero: {
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
  };
  about: {
    title: string;
    body: string;
    bullets: string[];
  };
  cta: {
    title: string;
    body: string;
    ctaLabel: string;
  };
};

const COPY_SCHEMA = {
  name: 'site_copy',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      hero: {
        type: 'object',
        additionalProperties: false,
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          primaryCtaLabel: { type: 'string' },
        },
        required: ['headline', 'subheadline', 'primaryCtaLabel'],
      },
      about: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          bullets: {
            type: 'array',
            minItems: 3,
            maxItems: 5,
            items: { type: 'string' },
          },
        },
        required: ['title', 'body', 'bullets'],
      },
      cta: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
          ctaLabel: { type: 'string' },
        },
        required: ['title', 'body', 'ctaLabel'],
      },
    },
    required: ['hero', 'about', 'cta'],
  },
} as const;

function getOpenAiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable.');
  }
  return apiKey;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(baseTitle: string, city: string | null): Promise<string> {
  const rawBase = [baseTitle, city].filter(Boolean).join(' ');
  const baseSlug = slugify(rawBase) || 'site';

  const existing = await prisma.site.findUnique({ where: { slug: baseSlug } });
  if (!existing) {
    return baseSlug;
  }

  let counter = 2;
  while (counter < 1000) {
    const candidate = `${baseSlug}-${counter}`;
    const candidateMatch = await prisma.site.findUnique({ where: { slug: candidate } });
    if (!candidateMatch) {
      return candidate;
    }
    counter += 1;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

function pickPhotos(photos: PlacePhoto[]): PlacePhoto[] {
  if (photos.length <= 10) {
    return photos;
  }
  return photos.slice(0, 10);
}

function buildCtaHref(placePhone: string | null, placeWebsite: string | null): string {
  if (placePhone) {
    return `tel:${placePhone}`;
  }
  if (placeWebsite) {
    return placeWebsite;
  }
  return '#';
}

async function generateCopy(payload: {
  businessTitle: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hoursText: string | null;
}): Promise<CopyPayload> {
  const apiKey = getOpenAiKey();
  const promptFacts = [
    `Business title: ${payload.businessTitle}`,
    payload.address ? `Address: ${payload.address}` : 'Address: (not provided)',
    payload.phone ? `Phone: ${payload.phone}` : 'Phone: (not provided)',
    payload.website ? `Website: ${payload.website}` : 'Website: (not provided)',
    payload.hoursText ? `Hours: ${payload.hoursText}` : 'Hours: (not provided)',
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a marketing copywriter for local business landing pages. Use only provided facts. Do not invent awards, years in business, or unverifiable claims. Keep language warm, modern, and concise. If a fact is missing, do not mention it.',
        },
        {
          role: 'user',
          content: `Generate structured JSON for the landing page copy.\n\nFacts:\n${promptFacts}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: COPY_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI copy generation failed.');
  }

  const data = (await response.json()) as {
    output?: Array<{
      content?: Array<{ type?: string; text?: string; json?: CopyPayload }>;
    }>;
  };

  const outputContent = data.output?.[0]?.content ?? [];
  const jsonContent = outputContent.find((entry) => entry.type === 'output_json')?.json;
  if (jsonContent) {
    return jsonContent;
  }

  const textContent = outputContent.find((entry) => entry.type === 'output_text')?.text ?? '';
  if (!textContent) {
    throw new Error('OpenAI response did not include structured JSON.');
  }

  return JSON.parse(textContent) as CopyPayload;
}

function formatHoursText(hoursJson: Record<string, unknown> | null): string | null {
  if (!hoursJson) {
    return null;
  }

  const weekdayText = hoursJson.weekdayDescriptions;
  if (Array.isArray(weekdayText) && weekdayText.every((entry) => typeof entry === 'string')) {
    return weekdayText.join(', ');
  }

  return null;
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
    const existingSite = await prisma.site.findUnique({ where: { placeId } });
    if (existingSite) {
      return NextResponse.json({ siteId: existingSite.id, slug: existingSite.slug, existed: true });
    }

    const place = await fetchPlaceDetails(placeId);
    const placeTitle = place.name;
    const limitedPhotos = pickPhotos(place.photos);
    const session = await auth();
    const ownerId = session?.user?.id ? Number(session.user.id) : null;
    const owner = ownerId && !Number.isNaN(ownerId) ? await prisma.user.findUnique({ where: { id: ownerId } }) : null;
    const resolvedOwnerId = owner?.id ?? null;
    const isLoggedIn = Boolean(resolvedOwnerId);
    const anonSessionId = !isLoggedIn ? getAnonSessionIdFromRequest(request) ?? createAnonSessionId() : null;

    const slug = await generateUniqueSlug(placeTitle, place.city);
    const hoursText = formatHoursText(place.hoursJson);
    const copy = await generateCopy({
      businessTitle: placeTitle,
      address: place.address,
      phone: place.phone,
      website: place.website,
      hoursText,
    });

    const heroCtaHref = buildCtaHref(place.phone, place.website);

    const created = await prisma.$transaction(async (tx) => {
      await tx.place.upsert({
        where: { id: place.id },
        update: {
          name: placeTitle,
          address: place.address,
          phone: place.phone,
          website: place.website,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          lat: place.lat,
          lng: place.lng,
        },
        create: {
          id: place.id,
          name: placeTitle,
          address: place.address,
          phone: place.phone,
          website: place.website,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          lat: place.lat,
          lng: place.lng,
        },
      });

      const site = await tx.site.create({
        data: {
          slug,
          title: placeTitle,
          businessTitle: placeTitle,
          formattedAddress: place.address,
          phone: place.phone,
          website: place.website,
          lat: place.lat,
          lng: place.lng,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          status: SiteStatus.DRAFT,
          themeJson: serializeTheme('classic'),
          ownerId: resolvedOwnerId,
          anonSessionId: isLoggedIn ? null : anonSessionId,
          placeId: place.id,
        },
      });

      const assetIds: number[] = [];
      for (const photo of limitedPhotos) {
        const asset = await tx.asset.create({
          data: {
            siteId: site.id,
            kind: 'PHOTO',
            source: 'GOOGLE_PLACES',
            ref: photo.ref,
            width: photo.width,
            height: photo.height,
          },
        });
        assetIds.push(asset.id);
      }

      const sectionsPayload = [
        {
          type: SectionType.HERO,
          order: 1,
          contentJson: JSON.stringify({
            headline: copy.hero.headline,
            subheadline: copy.hero.subheadline,
            ctas: [{ label: copy.hero.primaryCtaLabel, href: heroCtaHref }],
          }),
        },
        {
          type: SectionType.ABOUT,
          order: 2,
          contentJson: JSON.stringify({
            title: copy.about.title,
            body: copy.about.body,
            bullets: copy.about.bullets,
            text: copy.about.body,
          }),
        },
        {
          type: SectionType.PHOTOS,
          order: 3,
          contentJson: JSON.stringify({
            assetIds,
          }),
        },
        {
          type: SectionType.CONTACT,
          order: 4,
          contentJson: JSON.stringify({
            title: copy.cta.title,
            body: copy.cta.body,
            ctaLabel: copy.cta.ctaLabel,
            address: place.address,
            phone: place.phone,
            website: place.website,
            hours: hoursText,
          }),
        },
      ];

      await tx.section.createMany({
        data: sectionsPayload.map((section) => ({
          siteId: site.id,
          type: section.type,
          order: section.order,
          contentJson: section.contentJson,
        })),
      });

      return site;
    });

    const response = NextResponse.json({ siteId: created.id, slug: created.slug });
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create site from place', error);
    return NextResponse.json({ error: 'Failed to create site from place.', detail: message }, { status: 500 });
  }
}
