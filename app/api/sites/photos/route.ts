import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

function parseSiteId(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const siteId = parseSiteId(request.nextUrl.searchParams.get('siteId'));
  if (!siteId) {
    return NextResponse.json({ error: 'SITE_ID_REQUIRED' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: { siteId, isDeleted: false, deletedAt: null },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });

  return NextResponse.json({ photos });
}
