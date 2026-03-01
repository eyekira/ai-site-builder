import type { MenuContent } from '@/lib/section-content';

class OcrError extends Error {
  code: 'MISSING_API_KEY' | 'EMPTY_RESULT' | 'RATE_LIMIT' | 'INVALID_JSON' | 'UPSTREAM' | 'BAD_INPUT';

  constructor(code: OcrError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

export type OcrPerImageResult = {
  ref: string;
  status: 'success' | 'empty' | 'error';
  errorCode?: string;
  extractedItemCount: number;
};

export type OcrResult = {
  menu: MenuContent;
  usedPhotoRefs: string[];
  perImageResults: OcrPerImageResult[];
};

function normalizePrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const normalized = trimmed.replace(/[^\d.]/g, '');
  if (!normalized) return '';
  const num = Number.parseFloat(normalized);
  if (Number.isNaN(num)) return '';
  return `$${Number.isInteger(num) ? num : num.toFixed(2)}`;
}

function toAbsoluteUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';
  return `${base.replace(/\/$/, '')}/${input.replace(/^\//, '')}`;
}

async function imageToDataUrl(url: string): Promise<string> {
  const absolute = toAbsoluteUrl(url);
  const res = await fetch(absolute);
  if (!res.ok) throw new OcrError('BAD_INPUT', `Failed to fetch menu image: ${absolute}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${contentType};base64,${buf.toString('base64')}`;
}

function parseJsonFromText(text: string): Array<{ name: string; description: string; price: string }> {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const payload = (fence?.[1] ?? text).trim();

  let arr: Array<{ name?: string; description?: string; price?: string }>;
  try {
    arr = JSON.parse(payload) as Array<{ name?: string; description?: string; price?: string }>;
  } catch {
    throw new OcrError('INVALID_JSON', 'OCR returned malformed JSON.');
  }

  return arr
    .map((item) => ({
      name: item.name?.trim() ?? '',
      description: item.description?.trim() ?? '',
      price: normalizePrice(item.price ?? ''),
    }))
    .filter((item) => item.name.length > 0)
    .slice(0, 24);
}

async function runOcrWithDataUrls(dataUrls: string[]): Promise<MenuContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OcrError('MISSING_API_KEY', 'OPENAI_API_KEY is missing. You can still enter menu items manually or skip for now.');
  }

  if (dataUrls.length === 0) {
    throw new OcrError('BAD_INPUT', 'No images uploaded for OCR.');
  }

  const input: Array<Record<string, unknown>> = [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text:
            'Read these menu images and return ONLY JSON array. Format: [{"name":"", "description":"", "price":""}]. Keep prices concise like "$12". Skip unreadable lines. Max 24 items.',
        },
        ...dataUrls.map((dataUrl) => ({ type: 'input_image', image_url: dataUrl })),
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

  if (response.status === 429) {
    throw new OcrError('RATE_LIMIT', 'OCR service is rate-limited. Try again in a moment, or continue with manual entry.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new OcrError('UPSTREAM', `OCR provider failed (${response.status}). ${body.slice(0, 160)}`);
  }

  const data = (await response.json()) as { output_text?: string };
  const raw = data.output_text ?? '[]';
  const items = parseJsonFromText(raw);

  if (items.length === 0) {
    throw new OcrError('EMPTY_RESULT', 'No readable menu items were found. You can add items manually or skip for now.');
  }

  return {
    title: 'Menu',
    items,
  };
}

export async function extractMenuFromImages(imageUrls: string[]): Promise<MenuContent> {
  const images = await Promise.all(imageUrls.slice(0, 4).map((url) => imageToDataUrl(url)));
  return runOcrWithDataUrls(images);
}

export async function extractMenuFromUploadedFiles(files: File[]): Promise<OcrResult> {
  const accepted = files.filter((file) => file.type.startsWith('image/')).slice(0, 4);
  if (accepted.length === 0) {
    throw new OcrError('BAD_INPUT', 'Please upload at least one image file.');
  }

  const dataUrls = await Promise.all(
    accepted.map(async (file) => {
      const buf = Buffer.from(await file.arrayBuffer());
      const contentType = file.type || 'image/jpeg';
      return `data:${contentType};base64,${buf.toString('base64')}`;
    }),
  );

  const refs = accepted.map((file, i) => `upload:${i}:${file.name}`);
  const menu = await runOcrWithDataUrls(dataUrls);
  return {
    menu,
    usedPhotoRefs: refs,
    perImageResults: refs.map((ref) => ({ ref, status: 'success', extractedItemCount: menu.items.length })),
  };
}

export async function extractMenuFromImageUrls(imageUrls: string[], refs?: string[]): Promise<OcrResult> {
  const refsResolved = (refs?.slice(0, 4) ?? imageUrls.slice(0, 4).map((_, i) => `google:${i}`));
  const menu = await extractMenuFromImages(imageUrls);
  return {
    menu,
    usedPhotoRefs: refsResolved,
    perImageResults: refsResolved.map((ref) => ({ ref, status: 'success', extractedItemCount: menu.items.length })),
  };
}

export function mapOcrError(error: unknown): { code: string; message: string } {
  if (error instanceof OcrError) {
    return { code: error.code, message: error.message };
  }

  if (error instanceof Error) {
    return { code: 'UNKNOWN', message: error.message };
  }

  return { code: 'UNKNOWN', message: 'OCR failed unexpectedly.' };
}
