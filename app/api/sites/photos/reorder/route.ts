import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

type Body = {
  siteId?: number;
  category?: string;
  photoIds?: number[];
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
  const photoIds = Array.isArray(body.photoIds) ? body.photoIds.filter((id) => Number.isInteger(id)) : [];

  if (!Number.isInteger(siteId) || photoIds.length === 0) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const photos = await prisma.photo.findMany({
    where: {
      id: { in: photoIds },
      siteId,
      site: { ownerId: user.id },
      isDeleted: false,
    },
    select: { id: true },
  });

  if (photos.length !== photoIds.length) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.$transaction(
    photoIds.map((photoId, index) =>
      prisma.photo.update({
        where: { id: photoId },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
