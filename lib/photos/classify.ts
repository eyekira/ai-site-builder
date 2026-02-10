export type PhotoCategory = 'exterior' | 'interior' | 'food' | 'drink' | 'menu' | 'people' | 'other';

export type ClassifierInput = {
  url?: string | null;
  filename?: string | null;
  altText?: string | null;
  googlePhotoRef?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ClassificationResult = {
  category: PhotoCategory;
  confidence: number;
  tags: string[];
};

const MENU_HINTS = ['menu', 'price', 'special', 'today', 'board'];
const FALLBACK_BUCKETS: PhotoCategory[] = ['exterior', 'interior', 'food', 'drink', 'menu', 'people'];

function tokenize(input: ClassifierInput): string[] {
  const raw = [input.url, input.filename, input.altText, input.googlePhotoRef]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .join(' ')
    .toLowerCase();

  return raw
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function heuristicMenuDetection(tokens: string[]): ClassificationResult | null {
  const hitCount = MENU_HINTS.filter((hint) => tokens.includes(hint)).length;
  if (hitCount === 0) {
    return null;
  }

  return {
    category: 'menu',
    confidence: Math.min(0.55 + hitCount * 0.1, 0.78),
    tags: ['heuristic-menu', ...tokens.slice(0, 6)],
  };
}

async function classifyWithVisionStub(_input: ClassifierInput): Promise<ClassificationResult> {
  // TODO: integrate real vision model provider here.
  return {
    category: 'other',
    confidence: 0.2,
    tags: ['vision-stub'],
  };
}

function deterministicFallback(input: ClassifierInput, tokens: string[]): ClassificationResult {
  const ref = input.googlePhotoRef ?? input.url ?? input.filename ?? input.altText ?? 'photo';
  const indexValue = input.metadata?.index;
  const index = typeof indexValue === 'number' && Number.isInteger(indexValue) ? indexValue : null;
  const bucket = index !== null ? index % FALLBACK_BUCKETS.length : hashString(ref) % FALLBACK_BUCKETS.length;
  const category = FALLBACK_BUCKETS[bucket] ?? 'other';

  return {
    category,
    confidence: 0.56,
    tags: ['deterministic-fallback', category, ...tokens.slice(0, 4)],
  };
}

export async function classifyPlacePhoto(input: ClassifierInput): Promise<ClassificationResult> {
  const tokens = tokenize(input);

  const menuHeuristic = heuristicMenuDetection(tokens);
  if (menuHeuristic) {
    return menuHeuristic;
  }

  const vision = await classifyWithVisionStub(input);
  if (vision.confidence >= 0.5 && vision.category !== 'other') {
    return vision;
  }

  return deterministicFallback(input, tokens);
}

export async function classifyPlacePhotosBatch(
  photos: ClassifierInput[],
  batchSize = 10,
): Promise<ClassificationResult[]> {
  const normalizedBatchSize = Number.isInteger(batchSize) && batchSize > 0 ? batchSize : 10;
  const results: ClassificationResult[] = [];

  for (let index = 0; index < photos.length; index += normalizedBatchSize) {
    const chunk = photos.slice(index, index + normalizedBatchSize);
    const chunkResults = await Promise.all(chunk.map((photo) => classifyPlacePhoto(photo)));
    results.push(...chunkResults);
  }

  return results;
}
