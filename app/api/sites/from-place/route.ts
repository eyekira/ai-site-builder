import { NextRequest, NextResponse } from 'next/server';
import { SectionType, SiteStatus } from '@prisma/client';

import { fetchPlaceDetails } from '@/lib/places';
import { createPreviewSession } from '@/lib/preview-session';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';
import type { SiteForRender } from '@/lib/site';
import { serializeTheme } from '@/lib/theme';
import { classifyPhoto } from '@/lib/photo-classifier';

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
} as const;

function getOpenAiKey(): string | null {
  return process.env.OPENAI_API_KEY ?? null;
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

function generatePreviewSlug(baseTitle: string, city: string | null): string {
  const rawBase = [baseTitle, city].filter(Boolean).join(' ');
  const baseSlug = slugify(rawBase) || 'site';
  return `${baseSlug}-${Date.now().toString(36)}`;
}

function pickPhotos(photos: PlacePhoto[]): PlacePhoto[] {
  if (photos.length <= 10) {
    return photos;
  }
  return photos.slice(0, 10);
}


async function resolvePlaceForCreation(placeId: string) {
  try {
    return await fetchPlaceDetails(placeId);
  } catch {
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
      photos: [] as PlacePhoto[],
    };
  }
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


function buildFallbackCopy(payload: {
  businessTitle: string;
  address: string | null;
  phone: string | null;
  website: string | null;
}): CopyPayload {
  const locationText = payload.address ? ` at ${payload.address}` : '';
  const contactLine = payload.phone
    ? `Call us at ${payload.phone}.`
    : payload.website
      ? `Visit us online at ${payload.website}.`
      : 'Reach out to learn more.';

  return {
    hero: {
      headline: payload.businessTitle,
      subheadline: payload.address ?? 'Local business serving the community.',
      primaryCtaLabel: payload.phone ? 'Call now' : payload.website ? 'Visit website' : 'Learn more',
    },
    about: {
      title: `About ${payload.businessTitle}`,
      body: `Welcome to ${payload.businessTitle}${locationText}. We focus on quality and friendly service.`,
      bullets: ['Friendly service', 'Quality offerings', 'Local favorite'],
    },
    cta: {
      title: 'Plan your visit',
      body: contactLine,
      ctaLabel: payload.phone ? 'Call us' : payload.website ? 'Visit website' : 'Contact us',
    },
  };
}

async function generateCopy(payload: {
  businessTitle: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hoursText: string | null;
}): Promise<CopyPayload> {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return buildFallbackCopy(payload);
  }

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
      text: {
        format: {
          type: 'json_schema',
          name: 'site_copy',
          schema: COPY_SCHEMA,
          strict: true,
        },
      },

    }),
  });
 if (!response.ok) {
  const status = response.status;
  const text = await response.text().catch(() => '');
  console.error('OpenAI copy generation failed, using fallback copy:', {
    status,
    statusText: response.statusText,
    body: text,
  });
  return buildFallbackCopy(payload);
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
    return buildFallbackCopy(payload);
  }

  try {
    return JSON.parse(textContent) as CopyPayload;
  } catch {
    return buildFallbackCopy(payload);
  }
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

async function parsePlaceId(request: NextRequest): Promise<string | null> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as { placeId?: string };
    return body.placeId?.trim() ?? null;
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    return params.get('placeId')?.trim() ?? null;
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const value = formData.get('placeId');
    return typeof value === 'string' ? value.trim() : null;
  }

  const body = (await request.json()) as { placeId?: string };
  return body.placeId?.trim() ?? null;
}

export async function POST(request: NextRequest) {
  let placeId: string | null;

  try {
    placeId = await parsePlaceId(request);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required.' }, { status: 400 });
  }

  try {
    const user = await getAuthenticatedUser();
    const ownerId = user?.id ?? null;
    const isLoggedIn = Boolean(ownerId);

    if (isLoggedIn) {
      const existingSite = await prisma.site.findUnique({
        where: { placeId },
        select: { id: true, slug: true, ownerId: true },
      });
      if (existingSite) {
        if (existingSite.ownerId === ownerId) {
          return NextResponse.json({ siteId: existingSite.id, slug: existingSite.slug, existed: true });
        }
        return NextResponse.json({ error: 'PLACE_ALREADY_CLAIMED' }, { status: 409 });
      }
    }

    const place = await resolvePlaceForCreation(placeId);
    const placeTitle = place.name;
    const limitedPhotos = pickPhotos(place.photos);

    const slug = isLoggedIn
      ? await generateUniqueSlug(placeTitle, place.city)
      : generatePreviewSlug(placeTitle, place.city);
    const hoursText = formatHoursText(place.hoursJson);
    const copy = await generateCopy({
      businessTitle: placeTitle,
      address: place.address,
      phone: place.phone,
      website: place.website,
      hoursText,
    });

    const heroCtaHref = buildCtaHref(place.phone, place.website);

    if (!isLoggedIn) {
      const assets = limitedPhotos.map((photo, index) => ({
        id: index + 1,
        ref: photo.ref,
      }));
      const assetIds = assets.map((asset) => asset.id);
      const sectionsPayload = [
        {
          id: 1,
          type: SectionType.HERO,
          contentJson: JSON.stringify({
            headline: copy.hero.headline,
            subheadline: copy.hero.subheadline,
            ctas: [{ label: copy.hero.primaryCtaLabel, href: heroCtaHref }],
          }),
        },
        {
          id: 2,
          type: SectionType.ABOUT,
          contentJson: JSON.stringify({
            title: copy.about.title,
            body: copy.about.body,
            bullets: copy.about.bullets,
            text: copy.about.body,
          }),
        },
        {
          id: 3,
          type: SectionType.PHOTOS,
          contentJson: JSON.stringify({
            assetIds,
          }),
        },
        {
          id: 4,
          type: SectionType.CONTACT,
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

      const previewSite: SiteForRender = {
        id: 0,
        slug,
        title: placeTitle,
        businessTitle: placeTitle,
        status: SiteStatus.DRAFT,
        formattedAddress: place.address,
        phone: place.phone,
        hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
        lat: place.lat,
        lng: place.lng,
        sections: sectionsPayload.map((section, index) => ({
          id: section.id ?? index + 1,
          type: section.type,
          contentJson: section.contentJson,
        })),
        assets,
        photos: [],
        place: {
          address: place.address,
          phone: place.phone,
          hoursJson: place.hoursJson ? JSON.stringify(place.hoursJson) : null,
          lat: place.lat,
          lng: place.lng,
        },
      };

      const previewSession = await createPreviewSession(previewSite);
      return NextResponse.json({
        previewId: previewSession.id,
        expiresAt: previewSession.expiresAt.toISOString(),
      });
    }

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
          ownerId,
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

      let photoSortOrder = 1;
      try {
        for (const [index, photo] of limitedPhotos.entries()) {
          const classification = await classifyPhoto({ googleRef: photo.ref, metadata: { index } });
          await tx.photo.create({
            data: {
              siteId: site.id,
              source: 'google',
              url: `/api/places/photo?ref=${encodeURIComponent(photo.ref)}&maxwidth=1200`,
              category: classification.category,
              confidence: classification.confidence,
              tagsJson: JSON.stringify(classification.tags),
              sortOrder: photoSortOrder,
            },
          });
          photoSortOrder += 1;
        }
      } catch (photoError) {
        console.warn('Skipping photo table writes during site creation.', photoError);
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

    return NextResponse.json({ siteId: created.id, slug: created.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const missingDbUrl = message.includes('Environment variable not found: DATABASE_URL');

    console.error('Failed to create site from place', error);
    return NextResponse.json(
      {
        error: 'Failed to create site from place.',
        detail: missingDbUrl ? 'Server is missing DATABASE_URL configuration.' : message,
      },
      { status: 500 },
    );
  }
}
