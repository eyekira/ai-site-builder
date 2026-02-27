import type { TemplateKey } from '@/lib/templates/types';

type CopyPayload = {
  hero: { headline: string; subheadline: string; primaryCtaLabel: string };
  about: { title: string; body: string; bullets: string[] };
  cta: { title: string; body: string; ctaLabel: string };
};

export function adaptCopyForTemplate(copy: CopyPayload, templateKey: TemplateKey): CopyPayload {
  if (templateKey === 'fine_dining_premium' || templateKey === 'omakase_counter' || templateKey === 'steakhouse_classic') {
    return {
      ...copy,
      hero: { ...copy.hero, primaryCtaLabel: 'Reserve a Table' },
      cta: { ...copy.cta, title: 'Reserve your experience', ctaLabel: 'Book now' },
    };
  }

  if (templateKey === 'takeout_delivery_first' || templateKey === 'fast_casual') {
    return {
      ...copy,
      hero: { ...copy.hero, primaryCtaLabel: 'Order now' },
      cta: { ...copy.cta, title: 'Order pickup or delivery', ctaLabel: 'Start order' },
    };
  }

  if (templateKey === 'cafe_cozy' || templateKey === 'bakery_patisserie' || templateKey === 'brunch_social') {
    return {
      ...copy,
      hero: { ...copy.hero, primaryCtaLabel: 'See today\'s menu' },
      about: {
        ...copy.about,
        title: copy.about.title || 'A cozy place for coffee and food',
      },
      cta: { ...copy.cta, title: 'Drop by today', ctaLabel: 'Get directions' },
    };
  }

  if (templateKey === 'family_korean' || templateKey === 'bbq_group') {
    return {
      ...copy,
      hero: { ...copy.hero, primaryCtaLabel: 'View menu' },
      cta: { ...copy.cta, title: 'Plan your group meal', ctaLabel: 'Call to reserve' },
    };
  }

  return copy;
}
