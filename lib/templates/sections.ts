import { SectionType } from '@prisma/client';

import type { TemplateKey } from '@/lib/templates/types';

type CopyPayload = {
  hero: { headline: string; subheadline: string; primaryCtaLabel: string };
  about: { title: string; body: string; bullets: string[] };
  cta: { title: string; body: string; ctaLabel: string };
};

type BuildTemplateSectionsInput = {
  templateKey: TemplateKey;
  copy: CopyPayload;
  heroCtaHref: string;
  assetIds: number[];
  place: {
    address: string | null;
    phone: string | null;
    website: string | null;
  };
  hoursText: string | null;
};

type SectionDraft = {
  type: SectionType;
  contentJson: string;
};

function getSectionPlan(templateKey: TemplateKey): SectionType[] {
  if (templateKey === 'fast_casual') {
    return [SectionType.HERO, SectionType.MENU, SectionType.PHOTOS, SectionType.CONTACT];
  }

  if (templateKey === 'fine_dining_premium') {
    return [SectionType.HERO, SectionType.ABOUT, SectionType.REVIEWS, SectionType.PHOTOS, SectionType.CONTACT];
  }

  if (templateKey === 'brunch_bakery') {
    return [SectionType.HERO, SectionType.MENU, SectionType.ABOUT, SectionType.PHOTOS, SectionType.CONTACT];
  }

  return [SectionType.HERO, SectionType.ABOUT, SectionType.PHOTOS, SectionType.CONTACT];
}

function buildMenuContent(templateKey: TemplateKey) {
  if (templateKey === 'fast_casual') {
    return {
      title: 'Popular picks',
      items: [
        { name: 'Signature combo', description: 'Quick favorite with sides', price: '$12' },
        { name: 'Fresh bowl', description: 'Balanced and filling', price: '$11' },
        { name: 'Family pack', description: 'Great for sharing', price: '$29' },
      ],
    };
  }

  return {
    title: 'Today’s menu highlights',
    items: [
      { name: 'House special', description: 'Customer favorite', price: '$16' },
      { name: 'Seasonal pick', description: 'Limited-time choice', price: '$14' },
      { name: 'Chef recommendation', description: 'Balanced and flavorful', price: '$18' },
    ],
  };
}

function buildReviewsContent(templateKey: TemplateKey) {
  if (templateKey === 'fine_dining_premium') {
    return {
      title: 'Guest impressions',
      items: [
        { author: 'Local guide', quote: 'Refined atmosphere and memorable dishes.', rating: 5 },
        { author: 'Weekend diner', quote: 'Great pacing and service for a special night.', rating: 5 },
      ],
    };
  }

  return {
    title: 'What guests say',
    items: [{ author: 'Customer', quote: 'Great food and welcoming service.', rating: 5 }],
  };
}

export function buildTemplateSections(input: BuildTemplateSectionsInput): SectionDraft[] {
  const plan = getSectionPlan(input.templateKey);

  return plan.map((type) => {
    if (type === SectionType.HERO) {
      return {
        type,
        contentJson: JSON.stringify({
          headline: input.copy.hero.headline,
          subheadline: input.copy.hero.subheadline,
          ctas: [{ label: input.copy.hero.primaryCtaLabel, href: input.heroCtaHref }],
        }),
      };
    }

    if (type === SectionType.ABOUT) {
      return {
        type,
        contentJson: JSON.stringify({
          title: input.copy.about.title,
          body: input.copy.about.body,
          bullets: input.copy.about.bullets,
          text: input.copy.about.body,
        }),
      };
    }

    if (type === SectionType.MENU) {
      return {
        type,
        contentJson: JSON.stringify(buildMenuContent(input.templateKey)),
      };
    }

    if (type === SectionType.REVIEWS) {
      return {
        type,
        contentJson: JSON.stringify(buildReviewsContent(input.templateKey)),
      };
    }

    if (type === SectionType.PHOTOS) {
      return {
        type,
        contentJson: JSON.stringify({ assetIds: input.assetIds }),
      };
    }

    return {
      type: SectionType.CONTACT,
      contentJson: JSON.stringify({
        title: input.copy.cta.title,
        body: input.copy.cta.body,
        ctaLabel: input.copy.cta.ctaLabel,
        address: input.place.address,
        phone: input.place.phone,
        website: input.place.website,
        hours: input.hoursText,
      }),
    };
  });
}
