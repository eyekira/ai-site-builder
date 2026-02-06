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
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const siteId = parseSiteId(body.siteId);
  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required.' }, { status: 400 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!user.subscribed) {
    return NextResponse.json({ error: 'Subscription required.' }, { status: 402 });
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, slug: true, ownerId: true, status: true },
  });

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  if (site.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not allowed to publish this site.' }, { status: 403 });
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: { status: 'PUBLISHED' },
    select: { id: true, slug: true, status: true },
  });

  revalidatePath(`/s/${updated.slug}`);
  revalidatePath(`/editor/${updated.slug}`);
  revalidatePath(`/editor/${updated.slug}/preview`);

  return NextResponse.json({ siteId: updated.id, slug: updated.slug, status: updated.status });
}
