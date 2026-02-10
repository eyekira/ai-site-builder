export type PhotoCategory = 'exterior' | 'interior' | 'food' | 'menu' | 'drink' | 'people' | 'other';

export type ClassifierInput = {
  url?: string | null;
  filename?: string | null;
  altText?: string | null;
  googleRef?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ClassificationResult = {
  category: PhotoCategory;
  confidence: number;
  tags: string[];
};

const CATEGORY_KEYWORDS: Record<Exclude<PhotoCategory, 'other'>, string[]> = {
  exterior: ['exterior', 'outside', 'outdoor', 'storefront', 'building', 'facade', 'front'],
  interior: ['interior', 'inside', 'indoor', 'dining room', 'table', 'bar area', 'counter'],
  food: ['food', 'dish', 'meal', 'plate', 'dessert', 'pizza', 'burger', 'pasta', 'salad'],
  menu: ['menu', 'board', 'menu-board', 'price-list'],
  drink: ['drink', 'cocktail', 'coffee', 'tea', 'beer', 'wine', 'latte'],
  people: ['people', 'person', 'staff', 'team', 'chef', 'customer', 'group', 'portrait'],
};

function tokenize(input: ClassifierInput): string[] {
  const parts = [input.url, input.filename, input.altText, input.googleRef]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .join(' ')
    .toLowerCase();

  return parts
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function classifyPhotoWithAi(_input: ClassifierInput): Promise<ClassificationResult | null> {
  // Optional extension point for future AI-classification; deterministic fallback is default.
  return null;
}

export async function classifyPhoto(input: ClassifierInput): Promise<ClassificationResult> {
  const ai = await classifyPhotoWithAi(input);
  if (ai) {
    const confidence = Math.max(0, Math.min(1, ai.confidence));
    return {
      category: confidence < 0.5 ? 'other' : ai.category,
      confidence,
      tags: ai.tags,
    };
  }

  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return { category: 'other', confidence: 0.2, tags: [] };
  }

  const scores: Array<{ category: Exclude<PhotoCategory, 'other'>; score: number }> =
    (Object.keys(CATEGORY_KEYWORDS) as Array<Exclude<PhotoCategory, 'other'>>).map((category) => {
      const keywords = CATEGORY_KEYWORDS[category];
      const score = keywords.reduce((sum, keyword) => {
        const keywordTokens = keyword.split(/\s+/g);
        const hasAll = keywordTokens.every((token) => tokens.includes(token));
        return sum + (hasAll ? 1 : 0);
      }, 0);

      return { category, score };
    });

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];

  if (!winner || winner.score <= 0) {
    return { category: 'other', confidence: 0.35, tags: tokens.slice(0, 6) };
  }

  const confidence = Math.min(0.45 + winner.score * 0.2, 0.95);

  return {
    category: confidence < 0.5 ? 'other' : winner.category,
    confidence,
    tags: tokens.slice(0, 8),
  };
}
