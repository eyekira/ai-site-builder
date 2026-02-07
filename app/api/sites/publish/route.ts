import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/rbac';

type PublishPayload = {
  siteId?: unknown;
};

function parseSiteId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() && Number.isInteger(Number(value))) {
    return Number(value);
  }

  return null;
}

export async function POST(request: NextRequest) {
  let body: PublishPayload = {};
  try {
    body = (await request.json()) as PublishPayload;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const siteId = parseSiteId(body.siteId);
  if (!siteId) {
    return NextResponse.json({ error: 'SITE_ID_REQUIRED' }, { status: 400 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (!user.subscribed) {
    return NextResponse.json({ error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 });
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, slug: true, ownerId: true, status: true },
  });

  if (!site) {
    return NextResponse.json({ error: 'SITE_NOT_FOUND' }, { status: 404 });
  }

  if (!site.ownerId) {
    return NextResponse.json({ error: 'SITE_UNCLAIMED' }, { status: 403 });
  }

  if (site.ownerId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
    select: { id: true, slug: true, status: true },
  });

  revalidatePath(`/s/${updated.slug}`);
  revalidatePath(`/editor/${updated.slug}`);
  revalidatePath(`/editor/${updated.slug}/preview`);

  return NextResponse.json({ ok: true, slug: updated.slug });
}
