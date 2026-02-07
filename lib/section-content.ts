import { normalizeHoursText } from '@/lib/hours';

export type SectionType = 'HERO' | 'ABOUT' | 'CONTACT' | 'MENU' | 'GALLERY' | 'REVIEWS';

export type HeroContent = {
  headline: string;
  subheadline: string;
  ctas: Array<{ label: string; href: string }>;
};

export type AboutContent = {
  text: string;
};

export type ContactContent = {
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: 'Welcome to our business',
  subheadline: 'We help our customers with great service.',
  ctas: [{ label: 'Learn more', href: '#' }],
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  text: 'Tell visitors what makes your business special.',
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  address: null,
  phone: null,
  website: null,
  hours: null,
};

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function cleanString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function cleanNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function parseCtas(value: unknown): HeroContent['ctas'] {
  if (!Array.isArray(value)) {
    return DEFAULT_HERO_CONTENT.ctas;
  }

  const ctas = value
    .filter((entry) => typeof entry === 'object' && entry !== null)
    .map((entry) => {
      const item = entry as Record<string, unknown>;

      return {
        label: cleanString(item.label, 'Learn more'),
        href: cleanString(item.href, '#'),
      };
    })
    .filter((entry) => entry.label.trim().length > 0);

  return ctas.length > 0 ? ctas : DEFAULT_HERO_CONTENT.ctas;
}

export function parseHeroContent(raw: string): HeroContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    headline: cleanString(record.headline, DEFAULT_HERO_CONTENT.headline),
    subheadline: cleanString(record.subheadline, DEFAULT_HERO_CONTENT.subheadline),
    ctas: parseCtas(record.ctas),
  };
}

export function parseAboutContent(raw: string): AboutContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    text: cleanString(record.text ?? record.body, DEFAULT_ABOUT_CONTENT.text),
  };
}

export function parseContactContent(raw: string): ContactContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    address: cleanNullableString(record.address),
    phone: cleanNullableString(record.phone),
    website: cleanNullableString(record.website),
    hours: normalizeHoursText(cleanNullableString(record.hours)),
  };
}

export function parseSectionContent(type: SectionType, raw: string): HeroContent | AboutContent | ContactContent | Record<string, never> {
  if (type === 'HERO') {
    return parseHeroContent(raw);
  }

  if (type === 'ABOUT') {
    return parseAboutContent(raw);
  }

  if (type === 'CONTACT') {
    return parseContactContent(raw);
  }

  return {};
}

export function defaultContentForType(type: SectionType): string {
  if (type === 'HERO') {
    return JSON.stringify(DEFAULT_HERO_CONTENT);
  }

  if (type === 'ABOUT') {
    return JSON.stringify(DEFAULT_ABOUT_CONTENT);
  }

  if (type === 'CONTACT') {
    return JSON.stringify(DEFAULT_CONTACT_CONTENT);
  }

  return JSON.stringify({});
}
