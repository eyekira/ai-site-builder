export type MenuPhotoLabel =
  | 'menu_board'
  | 'printed_menu'
  | 'menu_screenshot'
  | 'food'
  | 'interior'
  | 'exterior'
  | 'logo'
  | 'other';

export type MenuPhotoClassification = {
  label: MenuPhotoLabel;
  is_menu: boolean;
  confidence: number;
  text_density: 'low' | 'med' | 'high';
  has_prices: boolean;
  notes: string;
  score: number;
  status: 'classified' | 'unclassified';
  errorCode?: string;
};

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
  const res = await fetch(resolvedUrl, { cache: 'no-store' });
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
    const firstObj = raw.match(/\{[\s\S]*\}/);
    if (firstObj?.[0]) {
      try {
        return JSON.parse(firstObj[0]) as Record<string, unknown>;
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
    return {
      label: 'other',
      is_menu: false,
      confidence: h,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-unavailable; heuristic-only',
      score: h,
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
    const h = heuristicScore({ ref });
    return {
      label: 'other',
      is_menu: false,
      confidence: h,
      text_density: 'low',
      has_prices: false,
      notes: `image-fetch-failed:${message}`,
      score: h,
      status: 'unclassified',
      errorCode: message,
    };
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
              'Classify this restaurant image. Distinguish menu photos from food photos. Return ONLY JSON with exact keys: {"label":"menu_board|printed_menu|menu_screenshot|food|interior|exterior|logo|other","is_menu":boolean,"confidence":0..1,"text_density":"low|med|high","has_prices":boolean,"notes":string}.',
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
      payloadShape: {
        hasInputArray: Array.isArray(payload.input),
        contentTypes: ['input_text', 'input_image'],
        imageEncoding: 'data_url',
      },
      payloadBytes: JSON.stringify(payload).length,
    });
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (process.env.NODE_ENV !== 'production') {
      console.error('[menu-photo-classifier][http-fail]', {
        ref,
        model,
        imageUrl,
        inputType: 'data-url',
        payloadBytes: JSON.stringify(payload).length,
        status: response.status,
        errorBody: errorBody.slice(0, 500),
      });
    }

    const h = heuristicScore({ ref });
    return {
      label: 'other',
      is_menu: false,
      confidence: h,
      text_density: 'low',
      has_prices: false,
      notes: `vision-request-failed:${errorBody.slice(0, 120) || 'no-body'}`,
      score: h,
      status: 'unclassified',
      errorCode: `HTTP_${response.status}`,
    };
  }

  const data = (await response.json()) as { output_text?: string };
  if (process.env.NODE_ENV !== 'production') {
    console.info('[menu-photo-classifier][response]', {
      ref,
      outputPreview: (data.output_text ?? '').slice(0, 240),
    });
  }
  const parsed = parseJsonLoose((data.output_text ?? '').trim());
  if (!parsed) {
    const h = heuristicScore({ ref });
    return {
      label: 'other',
      is_menu: false,
      confidence: h,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-parse-failed',
      score: h,
      status: 'unclassified',
      errorCode: 'PARSE_FAILED',
    };
  }

  const rawLabel = String(parsed.label ?? '').toLowerCase().replace(/[\s-]+/g, '_');
  const labelMap: Record<string, MenuPhotoLabel> = {
    menu_board: 'menu_board',
    printed_menu: 'printed_menu',
    menu_screenshot: 'menu_screenshot',
    food: 'food',
    food_photo: 'food',
    interior: 'interior',
    exterior: 'exterior',
    logo: 'logo',
    other: 'other',
  };
  const label = labelMap[rawLabel] ?? 'other';

  const confidence = clamp(Number(parsed.confidence ?? heuristicScore({ ref })));
  const densityRaw = String(parsed.text_density ?? '').toLowerCase();
  const text_density = densityRaw === 'high' ? 'high' : densityRaw === 'medium' || densityRaw === 'med' ? 'med' : 'low';
  const has_prices = Boolean(parsed.has_prices ?? parsed.price_pattern_detected);
  const is_menu = Boolean(parsed.is_menu ?? ['menu_board', 'printed_menu', 'menu_screenshot'].includes(label));
  const notes = typeof parsed.notes === 'string' ? parsed.notes : typeof parsed.reason === 'string' ? parsed.reason : '';
  const score = menuScoreFromClassification({ label, confidence, text_density, has_prices });

  return {
    label,
    is_menu,
    confidence,
    text_density,
    has_prices,
    notes,
    score,
    status: 'classified',
  };
}
