export type MenuPhotoReason = 'menu board' | 'printed menu' | 'food photo' | 'interior' | 'exterior' | 'screenshot' | 'other';

export type MenuPhotoClassification = {
  is_menu: boolean;
  confidence: number;
  reason: MenuPhotoReason;
  text_density: 'low' | 'medium' | 'high';
  price_pattern_detected: boolean;
  menuLikelihoodScore: number;
};

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function heuristicScore(input: { ref: string; width?: number | null; height?: number | null }): number {
  const ref = input.ref.toLowerCase();
  let score = 0.35;
  const w = input.width ?? 0;
  const h = input.height ?? 0;
  if (w > 0 && h > 0) {
    const ratio = w / h;
    if (ratio > 0.6 && ratio < 0.95) score += 0.2;
    if (ratio < 0.55 || ratio > 1.8) score -= 0.1;
  }
  if (/(menu|board|price|special|pdf|scan|list|poster)/.test(ref)) score += 0.2;
  if (/(food|dish|interior|exterior|facade|table)/.test(ref)) score -= 0.1;
  return clamp(score);
}

export async function classifyMenuPhotoViaVision(url: string): Promise<MenuPhotoClassification> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      is_menu: false,
      confidence: 0.4,
      reason: 'other',
      text_density: 'low',
      price_pattern_detected: false,
      menuLikelihoodScore: 0.4,
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
              text: 'Classify this image as menu photo vs non-menu. Return ONLY JSON: {"is_menu":bool,"confidence":0..1,"reason":"menu board|printed menu|food photo|interior|exterior|screenshot|other","text_density":"low|medium|high","price_pattern_detected":bool}',
            },
            { type: 'input_image', image_url: url },
          ],
        },
      ],
      max_output_tokens: 200,
    }),
  });

  if (!response.ok) {
    return {
      is_menu: false,
      confidence: 0.35,
      reason: 'other',
      text_density: 'low',
      price_pattern_detected: false,
      menuLikelihoodScore: 0.35,
    };
  }

  const data = (await response.json()) as { output_text?: string };
  const raw = (data.output_text ?? '{}').trim();
  let parsed: Partial<MenuPhotoClassification> = {};
  try {
    parsed = JSON.parse(raw) as Partial<MenuPhotoClassification>;
  } catch {
    parsed = {};
  }

  const confidence = clamp(Number(parsed.confidence ?? 0.4));
  const text_density = parsed.text_density === 'high' || parsed.text_density === 'medium' ? parsed.text_density : 'low';
  const price_pattern_detected = Boolean(parsed.price_pattern_detected);
  const score = clamp(confidence + (text_density === 'high' ? 0.15 : 0) + (price_pattern_detected ? 0.15 : 0));

  return {
    is_menu: Boolean(parsed.is_menu),
    confidence,
    reason: (parsed.reason as MenuPhotoReason) ?? 'other',
    text_density,
    price_pattern_detected,
    menuLikelihoodScore: score,
  };
}
