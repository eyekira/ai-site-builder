import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

type Body = {
  category?: string;
  isHero?: boolean;
  restore?: boolean;
};

function parseId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { photoId: raw } = await params;
  const photoId = parseId(raw);
  if (!photoId) {
    return NextResponse.json({ error: 'INVALID_PHOTO_ID' }, { status: 400 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const existing = await prisma.photo.findFirst({
    where: { id: photoId, site: { ownerId: user.id } },
    select: { id: true, siteId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.isHero === 'boolean') {
    data.isHero = body.isHero;
  }

  if (typeof body.restore === 'boolean') {
    data.isDeleted = !body.restore;
  }

  const validCategories = ['exterior', 'interior', 'food', 'menu', 'drink', 'people', 'other'];
  if (typeof body.category === 'string' && validCategories.includes(body.category)) {
    data.category = body.category;
  }

  const updated = await prisma.photo.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ photo: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { photoId: raw } = await params;
  const photoId = parseId(raw);
  if (!photoId) {
    return NextResponse.json({ error: 'INVALID_PHOTO_ID' }, { status: 400 });
  }

  const existing = await prisma.photo.findFirst({
    where: { id: photoId, site: { ownerId: user.id } },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.photo.update({ where: { id: existing.id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
