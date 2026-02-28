import type { MenuContent } from '@/lib/section-content';

function normalizePrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (!match) return trimmed;
  return `$${match[1]}`;
}

function toAbsoluteUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';
  return `${base.replace(/\/$/, '')}/${input.replace(/^\//, '')}`;
}

async function imageToDataUrl(url: string): Promise<string> {
  const absolute = toAbsoluteUrl(url);
  const res = await fetch(absolute);
  if (!res.ok) throw new Error(`Failed to fetch menu image: ${absolute}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${contentType};base64,${buf.toString('base64')}`;
}

function parseJsonFromText(text: string): Array<{ name: string; description: string; price: string }> {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const payload = fence?.[1] ?? text;
  const arr = JSON.parse(payload) as Array<{ name?: string; description?: string; price?: string }>;
  return arr
    .map((item) => ({
      name: item.name?.trim() ?? '',
      description: item.description?.trim() ?? '',
      price: normalizePrice(item.price ?? ''),
    }))
    .filter((item) => item.name.length > 0)
    .slice(0, 24);
}

export async function extractMenuFromImages(imageUrls: string[]): Promise<MenuContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OCR menu import.');
  }

  const images = await Promise.all(imageUrls.slice(0, 4).map((url) => imageToDataUrl(url)));

  const input: Array<Record<string, unknown>> = [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text:
            'Read these menu images and return ONLY JSON array. Format: [{"name":"", "description":"", "price":""}]. Keep prices concise like "$12". Skip unreadable lines. Max 24 items.',
        },
        ...images.map((dataUrl) => ({ type: 'input_image', image_url: dataUrl })),
      ],
    },
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_output_tokens: 1200,
      input,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI OCR failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as { output_text?: string };
  const raw = data.output_text ?? '[]';
  const items = parseJsonFromText(raw);

  if (items.length === 0) {
    throw new Error('No menu items detected from images.');
  }

  return {
    title: 'Menu',
    items,
  };
}
