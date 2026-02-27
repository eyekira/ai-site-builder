import type { PhotoCategory } from '@/lib/photo-classifier';
import type { TemplateKey, TemplateSelectionResult } from '@/lib/templates/types';

const KEYWORDS: Array<{ key: TemplateKey; terms: string[] }> = [
  { key: 'fine_dining_premium', terms: ['fine dining', 'tasting menu', 'chef table', 'michelin'] },
  { key: 'omakase_counter', terms: ['omakase', 'sushi bar', 'counter seating'] },
  { key: 'steakhouse_classic', terms: ['steakhouse', 'dry aged', 'private dining'] },
  { key: 'family_korean', terms: ['korean restaurant', 'kimchi', 'family style korean'] },
  { key: 'bbq_group', terms: ['bbq', 'barbecue', 'group dining', 'catering trays'] },
  { key: 'cafe_cozy', terms: ['cafe', 'coffee', 'espresso', 'latte'] },
  { key: 'bakery_patisserie', terms: ['bakery', 'patisserie', 'pastry', 'cake'] },
  { key: 'brunch_social', terms: ['brunch', 'mimosa', 'weekend brunch'] },
  { key: 'fast_casual', terms: ['fast casual', 'counter service', 'build your own'] },
  { key: 'takeout_delivery_first', terms: ['takeout', 'delivery', 'ghost kitchen', 'order direct'] },
];

export function selectTemplate(input: { textSignals: string[]; photoCategories?: PhotoCategory[] }): TemplateSelectionResult {
  const haystack = input.textSignals.join(' ').toLowerCase();
  const keywordMatches: string[] = [];
  const scores: Record<TemplateKey, number> = {
    fine_dining_premium: 0,
    omakase_counter: 0,
    steakhouse_classic: 0,
    family_korean: 0,
    bbq_group: 0,
    cafe_cozy: 0,
    bakery_patisserie: 0,
    brunch_social: 0,
    fast_casual: 0,
    takeout_delivery_first: 0,
    default_bistro: 0,
  };

  for (const rule of KEYWORDS) {
    for (const term of rule.terms) {
      if (haystack.includes(term)) {
        scores[rule.key] += 0.35;
        keywordMatches.push(term);
      }
    }
  }

  const totalPhotos = input.photoCategories?.length ?? 0;
  const photoMix = (input.photoCategories ?? []).reduce<Record<string, number>>((acc, category) => {
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  if (totalPhotos > 0) {
    const interiorRatio = (photoMix.interior ?? 0) / totalPhotos;
    const foodRatio = (photoMix.food ?? 0) / totalPhotos;
    const menuRatio = (photoMix.menu ?? 0) / totalPhotos;

    if (interiorRatio >= 0.5) scores.fine_dining_premium += 0.2;
    if (interiorRatio >= 0.45) scores.omakase_counter += 0.1;
    if (foodRatio >= 0.45) scores.fast_casual += 0.15;
    if (foodRatio >= 0.5) scores.bbq_group += 0.1;
    if (menuRatio >= 0.35) scores.takeout_delivery_first += 0.2;
    if (foodRatio >= 0.4 && interiorRatio < 0.3) scores.bakery_patisserie += 0.1;
  }

  let best: TemplateKey = 'default_bistro';
  let bestScore = 0.45;

  for (const [key, value] of Object.entries(scores) as Array<[TemplateKey, number]>) {
    if (value > bestScore) {
      best = key;
      bestScore = value;
    }
  }

  return {
    templateKey: best,
    confidence: Math.max(0.45, Math.min(0.95, bestScore)),
    signals: {
      keywordMatch: [...new Set(keywordMatches)].slice(0, 8),
      photoMix: totalPhotos
        ? {
            exterior: (photoMix.exterior ?? 0) / totalPhotos,
            interior: (photoMix.interior ?? 0) / totalPhotos,
            food: (photoMix.food ?? 0) / totalPhotos,
            menu: (photoMix.menu ?? 0) / totalPhotos,
            drink: (photoMix.drink ?? 0) / totalPhotos,
            people: (photoMix.people ?? 0) / totalPhotos,
            other: (photoMix.other ?? 0) / totalPhotos,
          }
        : {},
    },
  };
}
