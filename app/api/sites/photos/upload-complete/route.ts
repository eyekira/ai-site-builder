import { NextRequest, NextResponse } from 'next/server';

import { classifyPlacePhoto } from '@/lib/photo-classifier';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

type Body = {
  siteId?: number;
  url?: string;
  fileName?: string;
  altText?: string;
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
  const url = body.url?.trim();

  if (!Number.isInteger(siteId) || !url) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const sortOrder = await prisma.photo.count({ where: { siteId, isDeleted: false, deletedAt: null } });
  const classification = await classifyPlacePhoto({ url, filename: body.fileName, altText: body.altText });

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
