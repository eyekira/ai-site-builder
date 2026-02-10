import { NextRequest, NextResponse } from 'next/server';

import { buildUploadKey, getSignedPhotoUploadUrl, getUploadMode } from '@/lib/photo-storage';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

type Body = {
  siteId?: number;
  fileName?: string;
  contentType?: string;
};

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const siteId = Number(body.siteId);
  const fileName = body.fileName?.trim();
  const contentType = body.contentType?.trim() || 'application/octet-stream';

  if (!Number.isInteger(siteId) || !fileName) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const mode = getUploadMode();
  if (mode === 'local') {
    return NextResponse.json({ mode: 'local' });
  }

  const key = buildUploadKey(siteId, fileName);

  try {
    const signed = await getSignedPhotoUploadUrl({ key, contentType });
    return NextResponse.json({ mode: 's3', key, uploadUrl: signed.uploadUrl, publicUrl: signed.publicUrl });
  } catch (error) {
    console.warn('Signed upload unavailable, falling back to local upload mode.', error);
    return NextResponse.json({ mode: 'local' });
  }
}
