import { NextRequest, NextResponse } from 'next/server';

import { extractMenuFromUploadedFiles, mapOcrError } from '@/lib/menu-ocr';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
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
    const menu = await extractMenuFromUploadedFiles(files);
    return NextResponse.json({ menu });
  } catch (error) {
    const mapped = mapOcrError(error);
    const status = mapped.code === 'RATE_LIMIT' ? 429 : 400;
    return NextResponse.json({ error: mapped.code, message: mapped.message }, { status });
  }
}
