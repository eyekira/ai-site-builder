import { normalizeHoursText } from '@/lib/hours';

export type SectionType = 'HERO' | 'ABOUT' | 'CONTACT' | 'PHOTOS' | 'MENU' | 'GALLERY' | 'REVIEWS';

export type HeroContent = {
  headline: string;
  subheadline: string;
  ctas: Array<{ label: string; href: string }>;
};

export type AboutContent = {
  title: string;
  body: string;
  bullets: string[];
  text: string;
};

export type ContactContent = {
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  title: string;
  body: string;
  ctaLabel: string;
};

export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

export type MenuContent = {
  title: string;
  items: MenuItem[];
};

export type GalleryItem = {
  url: string;
  caption: string;
};

export type GalleryContent = {
  title: string;
  items: GalleryItem[];
};

export type PhotosContent = {
  assetIds: number[];
};

export type ReviewItem = {
  author: string;
  quote: string;
  rating: number;
};

export type ReviewsContent = {
  title: string;
  items: ReviewItem[];
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: 'Welcome to our business',
  subheadline: 'We help our customers with great service.',
  ctas: [{ label: 'Learn more', href: '#' }],
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  title: 'About us',
  body: 'Tell visitors what makes your business special.',
  bullets: ['Locally owned', 'Warm atmosphere', 'Quality ingredients'],
  text: 'Tell visitors what makes your business special.',
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  address: null,
  phone: null,
  website: null,
  hours: null,
  title: 'Plan your visit',
  body: 'We would love to welcome you. Reach out with any questions.',
  ctaLabel: 'Get in touch',
};

export const DEFAULT_MENU_CONTENT: MenuContent = {
  title: 'Menu',
  items: [
    {
      name: 'Signature Item',
      description: 'Our most popular offering, made fresh daily.',
      price: '$12',
    },
    {
      name: 'Seasonal Special',
      description: 'Limited-time flavors with local ingredients.',
      price: '$15',
    },
  ],
};

export const DEFAULT_GALLERY_CONTENT: GalleryContent = {
  title: 'Gallery',
  items: [
    {
      url: 'https://placehold.co/600x400/png',
      caption: 'Storefront',
    },
    {
      url: 'https://placehold.co/600x400/png',
      caption: 'Signature dish',
    },
    {
      url: 'https://placehold.co/600x400/png',
      caption: 'Team at work',
    },
  ],
};

export const DEFAULT_REVIEWS_CONTENT: ReviewsContent = {
  title: 'Reviews',
  items: [
    {
      author: 'Alex P.',
      quote: 'Friendly service and incredible attention to detail.',
      rating: 5,
    },
    {
      author: 'Jordan M.',
      quote: 'Loved the atmosphere and the quality. We will be back.',
      rating: 4,
    },
  ],
};

export const DEFAULT_PHOTOS_CONTENT: PhotosContent = {
  assetIds: [],
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
  const bullets = Array.isArray(record.bullets)
    ? record.bullets.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
    : [];
  const body = cleanString(record.body ?? record.text, DEFAULT_ABOUT_CONTENT.body);

  return {
    title: cleanString(record.title, DEFAULT_ABOUT_CONTENT.title),
    body,
    bullets: bullets.length > 0 ? bullets : DEFAULT_ABOUT_CONTENT.bullets,
    text: cleanString(record.text ?? body, DEFAULT_ABOUT_CONTENT.text),
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
    title: cleanString(record.title, DEFAULT_CONTACT_CONTENT.title),
    body: cleanString(record.body, DEFAULT_CONTACT_CONTENT.body),
    ctaLabel: cleanString(record.ctaLabel ?? record.cta_label, DEFAULT_CONTACT_CONTENT.ctaLabel),
  };
}

export function parsePhotosContent(raw: string): PhotosContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  const assetIds = Array.isArray(record.assetIds)
    ? record.assetIds.filter((entry) => typeof entry === 'number' && Number.isInteger(entry))
    : [];

  return {
    assetIds,
  };
}

function parseMenuItems(value: unknown): MenuItem[] {
  if (!Array.isArray(value)) {
    return DEFAULT_MENU_CONTENT.items;
  }

  const items = value
    .filter((entry) => typeof entry === 'object' && entry !== null)
    .map((entry) => {
      const item = entry as Record<string, unknown>;

      return {
        name: cleanString(item.name, 'Menu item'),
        description: cleanString(item.description, ''),
        price: cleanString(item.price, ''),
      };
    })
    .filter((item) => item.name.trim().length > 0);

  return items.length > 0 ? items : DEFAULT_MENU_CONTENT.items;
}

function parseGalleryItems(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) {
    return DEFAULT_GALLERY_CONTENT.items;
  }

  const items = value
    .filter((entry) => typeof entry === 'object' && entry !== null)
    .map((entry) => {
      const item = entry as Record<string, unknown>;

      return {
        url: cleanString(item.url, 'https://placehold.co/600x400/png'),
        caption: cleanString(item.caption, ''),
      };
    })
    .filter((item) => item.url.trim().length > 0);

  return items.length > 0 ? items : DEFAULT_GALLERY_CONTENT.items;
}

function parseReviewItems(value: unknown): ReviewItem[] {
  if (!Array.isArray(value)) {
    return DEFAULT_REVIEWS_CONTENT.items;
  }

  const items = value
    .filter((entry) => typeof entry === 'object' && entry !== null)
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      const rating = typeof item.rating === 'number' ? item.rating : Number(item.rating);
      const normalizedRating = Number.isFinite(rating) ? Math.min(Math.max(Math.round(rating), 1), 5) : 5;

      return {
        author: cleanString(item.author, 'Happy customer'),
        quote: cleanString(item.quote, ''),
        rating: normalizedRating,
      };
    })
    .filter((item) => item.quote.trim().length > 0 || item.author.trim().length > 0);

  return items.length > 0 ? items : DEFAULT_REVIEWS_CONTENT.items;
}

export function parseMenuContent(raw: string): MenuContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    title: cleanString(record.title, DEFAULT_MENU_CONTENT.title),
    items: parseMenuItems(record.items),
  };
}

export function parseGalleryContent(raw: string): GalleryContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    title: cleanString(record.title, DEFAULT_GALLERY_CONTENT.title),
    items: parseGalleryItems(record.items),
  };
}

export function parseReviewsContent(raw: string): ReviewsContent {
  const parsed = parseJson(raw);
  const record = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  return {
    title: cleanString(record.title, DEFAULT_REVIEWS_CONTENT.title),
    items: parseReviewItems(record.items),
  };
}

export function parseSectionContent(
  type: SectionType,
  raw: string,
):
  | HeroContent
  | AboutContent
  | ContactContent
  | PhotosContent
  | MenuContent
  | GalleryContent
  | ReviewsContent
  | Record<string, never> {
  if (type === 'HERO') {
    return parseHeroContent(raw);
  }

  if (type === 'ABOUT') {
    return parseAboutContent(raw);
  }

  if (type === 'CONTACT') {
    return parseContactContent(raw);
  }

  if (type === 'PHOTOS') {
    return parsePhotosContent(raw);
  }

  if (type === 'MENU') {
    return parseMenuContent(raw);
  }

  if (type === 'GALLERY') {
    return parseGalleryContent(raw);
  }

  if (type === 'REVIEWS') {
    return parseReviewsContent(raw);
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

  if (type === 'PHOTOS') {
    return JSON.stringify(DEFAULT_PHOTOS_CONTENT);
  }

  if (type === 'MENU') {
    return JSON.stringify(DEFAULT_MENU_CONTENT);
  }

  if (type === 'GALLERY') {
    return JSON.stringify(DEFAULT_GALLERY_CONTENT);
  }

  if (type === 'REVIEWS') {
    return JSON.stringify(DEFAULT_REVIEWS_CONTENT);
  }

  return JSON.stringify({});
}
