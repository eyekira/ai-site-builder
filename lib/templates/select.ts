import type { PhotoCategory } from '@/lib/photo-classifier';
import type { TemplateKey, TemplateSelectionResult } from '@/lib/templates/types';

const KEYWORDS: Array<{ key: TemplateKey; terms: string[] }> = [
  { key: 'fine_dining_premium', terms: ['fine dining', 'steakhouse', 'omakase', 'tasting'] },
  { key: 'cozy_cafe', terms: ['cafe', 'coffee', 'espresso'] },
  { key: 'brunch_bakery', terms: ['bakery', 'brunch', 'pastry', 'dessert'] },
  { key: 'fast_casual', terms: ['fast food', 'takeout', 'delivery', 'quick'] },
  { key: 'family_korean_asian', terms: ['korean', 'bbq', 'hotpot', 'asian'] },
];

export function selectTemplate(input: { textSignals: string[]; photoCategories?: PhotoCategory[] }): TemplateSelectionResult {
  const haystack = input.textSignals.join(' ').toLowerCase();
  const keywordMatches: string[] = [];
  const scores: Record<TemplateKey, number> = {
    fine_dining_premium: 0,
    cozy_cafe: 0,
    fast_casual: 0,
    family_korean_asian: 0,
    brunch_bakery: 0,
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

    if (interiorRatio >= 0.45) scores.fine_dining_premium += 0.2;
    if (foodRatio >= 0.45) scores.fast_casual += 0.15;
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
      keywordMatch: [...new Set(keywordMatches)].slice(0, 6),
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
