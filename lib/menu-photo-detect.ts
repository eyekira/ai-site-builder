import { z } from 'zod';

import { withRetry } from '@/lib/net-retry';

export type MenuPhotoLabel =
  | 'menu_board'
  | 'printed_menu'
  | 'menu_screenshot'
  | 'food'
  | 'interior'
  | 'exterior'
  | 'logo'
  | 'other';

export type CategoryScores = {
  menu: number;
  food: number;
  interior: number;
  exterior: number;
  ambience: number;
};

export type MenuPhotoClassification = {
  label: MenuPhotoLabel;
  is_menu: boolean;
  confidence: number;
  text_density: 'low' | 'med' | 'high';
  has_prices: boolean;
  notes: string;
  score: number;
  categoryScores: CategoryScores;
  primaryCategory: keyof CategoryScores;
  status: 'classified' | 'unclassified' | 'failed';
  errorCode?: string;
  rawModelText?: string;
};

const classificationSchema = z.object({
  label: z.enum(['menu_board', 'printed_menu', 'menu_screenshot', 'food', 'interior', 'exterior', 'logo', 'other']),
  is_menu: z.boolean(),
  confidence: z.number().min(0).max(1),
  text_density: z.enum(['low', 'med', 'high']),
  has_prices: z.boolean(),
  notes: z.string(),
});

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

function menuScoreFromClassification(input: {
  label: MenuPhotoLabel;
  confidence: number;
  text_density: 'low' | 'med' | 'high';
  has_prices: boolean;
}): number {
  if (['menu_board', 'printed_menu', 'menu_screenshot'].includes(input.label)) {
    return clamp(Math.max(input.confidence, 0.55) + (input.text_density === 'high' ? 0.15 : 0) + (input.has_prices ? 0.15 : 0));
  }
  return clamp(input.confidence * 0.35);
}

function computeCategoryScores(input: {
  label: MenuPhotoLabel;
  confidence: number;
  text_density: 'low' | 'med' | 'high';
  has_prices: boolean;
  notes?: string;
}): { categoryScores: CategoryScores; primaryCategory: keyof CategoryScores } {
  const textBoost = input.text_density === 'high' ? 0.22 : input.text_density === 'med' ? 0.1 : 0;
  const priceBoost = input.has_prices ? 0.2 : 0;
  const noteText = (input.notes ?? '').toLowerCase();
  const noteMenuBoost = /(menu|price|special|combo|lunch|dinner|starter|dessert|appetizer)/.test(noteText) ? 0.14 : 0;

  const scores: CategoryScores = {
    menu: clamp(input.confidence * 0.35 + textBoost + priceBoost + noteMenuBoost),
    food: clamp(input.confidence * 0.2),
    interior: clamp(input.confidence * 0.15),
    exterior: clamp(input.confidence * 0.15),
    ambience: clamp(input.confidence * 0.12),
  };

  if (input.label === 'food') scores.food = clamp(Math.max(scores.food, input.confidence * 0.85));
  if (input.label === 'interior') {
    scores.interior = clamp(Math.max(scores.interior, input.confidence * 0.82));
    scores.ambience = clamp(Math.max(scores.ambience, input.confidence * 0.56));
  }
  if (input.label === 'exterior') scores.exterior = clamp(Math.max(scores.exterior, input.confidence * 0.84));
  if (['menu_board', 'printed_menu', 'menu_screenshot'].includes(input.label)) {
    scores.menu = clamp(Math.max(scores.menu, Math.max(0.62, input.confidence) + textBoost + priceBoost));
  }

  const primaryCategory = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'menu') as keyof CategoryScores;
  return { categoryScores: scores, primaryCategory };
}

function failedResult(errorCode: string, notes: string, rawModelText?: string): MenuPhotoClassification {
  return {
    label: 'other',
    is_menu: false,
    confidence: 0,
    text_density: 'low',
    has_prices: false,
    notes,
    score: 0,
    categoryScores: { menu: 0, food: 0, interior: 0, exterior: 0, ambience: 0 },
    primaryCategory: 'menu',
    status: 'failed',
    errorCode,
    rawModelText: process.env.NODE_ENV !== 'production' ? rawModelText?.slice(0, 400) : undefined,
  };
}

export function heuristicScore(input: { ref: string; width?: number | null; height?: number | null }): number {
  const ref = input.ref.toLowerCase();
  let score = 0.2;
  const w = input.width ?? 0;
  const h = input.height ?? 0;
  if (w > 0 && h > 0) {
    const ratio = w / h;
    if (ratio > 0.6 && ratio < 0.95) score += 0.25;
    if (ratio > 2.3 || ratio < 0.45) score -= 0.1;
  }
  if (/(menu|board|price|special|pdf|scan|list|poster|receipt)/.test(ref)) score += 0.2;
  if (/(food|dish|interior|exterior|facade|table|plating)/.test(ref)) score -= 0.12;
  return clamp(score);
}

function toAbsoluteImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';
  return `${base.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
}

async function imageUrlToDataUrl(imageUrl: string): Promise<{ dataUrl: string; resolvedUrl: string }> {
  const resolvedUrl = toAbsoluteImageUrl(imageUrl);
  const res = await withRetry(() => fetch(resolvedUrl, { cache: 'no-store' }), { retries: 2, baseDelayMs: 250 });
  if (!res.ok) {
    throw new Error(`IMAGE_FETCH_${res.status}`);
  }
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return { dataUrl: `data:${contentType};base64,${buf.toString('base64')}`, resolvedUrl };
}

function parseJsonLoose(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const fence = raw.match(/```json\s*([\s\S]*?)```/i);
    if (fence?.[1]) {
      try {
        return JSON.parse(fence[1]) as Record<string, unknown>;
      } catch {
        // continue
      }
    }
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(raw.slice(first, last + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function classifyMenuPhotoViaVision(imageUrl: string, ref: string): Promise<MenuPhotoClassification> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const h = heuristicScore({ ref });
    const category = computeCategoryScores({ label: 'other', confidence: h, text_density: 'low', has_prices: false, notes: 'vision-unavailable; heuristic-only' });
    return {
      label: 'other',
      is_menu: false,
      confidence: h,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-unavailable; heuristic-only',
      score: h,
      categoryScores: category.categoryScores,
      primaryCategory: category.primaryCategory,
      status: 'unclassified',
      errorCode: 'MISSING_API_KEY',
    };
  }

  let dataUrl: string;
  let resolvedUrl: string;
  try {
    const converted = await imageUrlToDataUrl(imageUrl);
    dataUrl = converted.dataUrl;
    resolvedUrl = converted.resolvedUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'IMAGE_FETCH_FAILED';
    return failedResult(message, `image-fetch-failed:${message}`);
  }

  const model = 'gpt-4o-mini';
  const payload = {
    model,
    temperature: 0,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              'Classify this restaurant image. Return ONLY JSON with exact keys: {"label":"menu_board|printed_menu|menu_screenshot|food|interior|exterior|logo|other","is_menu":boolean,"confidence":0..1,"text_density":"low|med|high","has_prices":boolean,"notes":string}.',
          },
          { type: 'input_image', image_url: dataUrl },
        ],
      },
    ],
    max_output_tokens: 220,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.info('[menu-photo-classifier][request]', {
      ref,
      model,
      finalImageUrl: resolvedUrl,
      payloadBytes: JSON.stringify(payload).length,
    });
  }

  let response: Response;
  try {
    response = await withRetry(
      async () => {
        const res = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (res.status === 429 || res.status >= 500) {
          const body = await res.text().catch(() => '');
          throw new Error(`HTTP_${res.status}:${body.slice(0, 120)}`);
        }
        return res;
      },
      { retries: 3, baseDelayMs: 700, factor: 2 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'HTTP_429';
    const isRateLimited = /HTTP_429/.test(message);
    return failedResult(isRateLimited ? 'HTTP_429' : 'HTTP_RETRY_FAILED', `vision-request-failed:${message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    return failedResult(`HTTP_${response.status}`, `vision-request-failed:${errorBody.slice(0, 140) || 'no-body'}`);
  }

  const data = (await response.json()) as { output_text?: string };
  const rawText = (data.output_text ?? '').trim();

  if (process.env.NODE_ENV !== 'production') {
    console.info('[menu-photo-classifier][response]', {
      ref,
      outputPreview: rawText.slice(0, 240),
    });
  }

  const parsed = parseJsonLoose(rawText);
  if (!parsed) {
    return failedResult('PARSE_FAILED', 'vision-parse-failed', rawText);
  }

  const validated = classificationSchema.safeParse(parsed);
  if (!validated.success) {
    return failedResult('PARSE_FAILED', `schema-invalid:${validated.error.issues[0]?.message ?? 'unknown'}`, rawText);
  }

  const value = validated.data;
  const score = menuScoreFromClassification({
    label: value.label,
    confidence: clamp(value.confidence),
    text_density: value.text_density,
    has_prices: value.has_prices,
  });
  const category = computeCategoryScores({
    label: value.label,
    confidence: clamp(value.confidence),
    text_density: value.text_density,
    has_prices: value.has_prices,
    notes: value.notes,
  });

  return {
    label: value.label,
    is_menu: value.is_menu,
    confidence: clamp(value.confidence),
    text_density: value.text_density,
    has_prices: value.has_prices,
    notes: value.notes,
    score,
    categoryScores: category.categoryScores,
    primaryCategory: category.primaryCategory,
    status: 'classified',
  };
}
