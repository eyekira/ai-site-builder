import { NextRequest, NextResponse } from 'next/server';

import { extractMenuFromImageUrls, extractMenuFromUploadedFiles, mapOcrError } from '@/lib/menu-ocr';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => null)) as { imageUrls?: string[]; refs?: string[] } | null;
    const imageUrls = body?.imageUrls?.filter((u) => typeof u === 'string' && u.trim().length > 0).slice(0, 4) ?? [];
    const refs = body?.refs?.slice(0, 4) ?? [];

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'IMAGE_URLS_REQUIRED', message: 'Provide imageUrls for OCR.' }, { status: 400 });
    }

    try {
      const result = await extractMenuFromImageUrls(imageUrls, refs);
      return NextResponse.json(result);
    } catch (error) {
      const mapped = mapOcrError(error);
      const status = mapped.code === 'RATE_LIMIT' ? 429 : 400;
      return NextResponse.json({ error: mapped.code, message: mapped.message }, { status });
    }
  }

  const form = await request.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: 'FILES_REQUIRED', message: 'Upload at least one menu image.' }, { status: 400 });
  }

  const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
  if (oversized) {
    return NextResponse.json({ error: 'FILE_TOO_LARGE', message: `${oversized.name} exceeds 8MB.` }, { status: 400 });
  }

  try {
    const result = await extractMenuFromUploadedFiles(files);
    return NextResponse.json(result);
  } catch (error) {
    const mapped = mapOcrError(error);
    const status = mapped.code === 'RATE_LIMIT' ? 429 : 400;
    return NextResponse.json({ error: mapped.code, message: mapped.message }, { status });
  }
}
