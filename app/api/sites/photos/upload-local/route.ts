import { NextRequest, NextResponse } from 'next/server';

import { classifyPlacePhoto } from '@/lib/photo-classifier';
import { getUploadMode, saveLocalUpload } from '@/lib/photo-storage';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (getUploadMode() !== 'local') {
    return NextResponse.json({ error: 'LOCAL_UPLOAD_DISABLED' }, { status: 400 });
  }

  const form = await request.formData();
  const siteId = Number(form.get('siteId'));
  const file = form.get('file');

  if (!Number.isInteger(siteId) || !(file instanceof File)) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const url = await saveLocalUpload({ siteId, fileName: file.name, bytes });
  const sortOrder = await prisma.photo.count({ where: { siteId, isDeleted: false, deletedAt: null } });
  const classification = await classifyPlacePhoto({ url, filename: file.name });

  const photo = await prisma.photo.create({
    data: {
      siteId,
      source: 'upload',
      url,
      category: classification.category,
      confidence: classification.confidence,
      categoryConfidence: classification.confidence,
      tagsJson: JSON.stringify(classification.tags),
      sortOrder,
      deletedAt: null,
    },
  });

  return NextResponse.json({ photo });
}
