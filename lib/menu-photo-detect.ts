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
    if (ratio > 0.6 && ratio < 0.95) score += 0.25; // document-ish portrait
    if (ratio > 2.3 || ratio < 0.45) score -= 0.1;
  }
  if (/(menu|board|price|special|pdf|scan|list|poster|receipt)/.test(ref)) score += 0.2;
  if (/(food|dish|interior|exterior|facade|table|plating)/.test(ref)) score -= 0.12;
  return clamp(score);
}

function parseJsonLoose(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const fence = raw.match(/```json\s*([\s\S]*?)```/i);
    if (!fence?.[1]) return null;
    try {
      return JSON.parse(fence[1]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

export async function classifyMenuPhotoViaVision(url: string): Promise<MenuPhotoClassification> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // deterministic non-constant fallback
    return {
      label: 'other',
      is_menu: false,
      confidence: 0.18,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-unavailable',
      score: 0.18,
      status: 'unclassified',
      errorCode: 'MISSING_API_KEY',
    };
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
            { type: 'input_image', image_url: url },
          ],
        },
      ],
      max_output_tokens: 220,
    }),
  });

  if (!response.ok) {
    return {
      label: 'other',
      is_menu: false,
      confidence: 0,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-request-failed',
      score: 0,
      status: 'unclassified',
      errorCode: `HTTP_${response.status}`,
    };
  }

  const data = (await response.json()) as { output_text?: string };
  const parsed = parseJsonLoose((data.output_text ?? '').trim());
  if (!parsed) {
    return {
      label: 'other',
      is_menu: false,
      confidence: 0,
      text_density: 'low',
      has_prices: false,
      notes: 'vision-parse-failed',
      score: 0,
      status: 'unclassified',
      errorCode: 'PARSE_FAILED',
    };
  }

  const label = (parsed.label as MenuPhotoLabel) ?? 'other';
  const confidence = clamp(Number(parsed.confidence ?? 0));
  const text_density = parsed.text_density === 'high' || parsed.text_density === 'med' ? (parsed.text_density as 'high' | 'med') : 'low';
  const has_prices = Boolean(parsed.has_prices);
  const is_menu = Boolean(parsed.is_menu);
  const notes = typeof parsed.notes === 'string' ? parsed.notes : '';
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
