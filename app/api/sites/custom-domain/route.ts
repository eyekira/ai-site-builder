import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

type CustomDomainPayload = {
  siteId?: number;
  domain?: string | null;
};

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase();
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 255) {
    return false;
  }

  if (domain.includes('/') || domain.includes(':') || domain.includes(' ')) {
    return false;
  }

  const labels = domain.split('.');
  if (labels.length < 2) {
    return false;
  }

  return labels.every((label) => label.length > 0 && label.length <= 63 && /^[a-z0-9-]+$/.test(label) && !label.startsWith('-') && !label.endsWith('-'));
}

export async function POST(request: NextRequest) {
  let body: CustomDomainPayload;

  try {
    body = (await request.json()) as CustomDomainPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!user.subscribed) {
    return NextResponse.json({ error: 'Subscription required.' }, { status: 402 });
  }

  const siteId = body.siteId;
  if (!siteId || Number.isNaN(Number(siteId))) {
    return NextResponse.json({ error: 'siteId is required.' }, { status: 400 });
  }

  const rawDomain = body.domain ?? '';
  const normalized = rawDomain ? normalizeDomain(rawDomain) : '';

  if (normalized && !isValidDomain(normalized)) {
    return NextResponse.json({ error: 'Invalid domain format.' }, { status: 400 });
  }

  const site = await prisma.site.findUnique({
    where: { id: Number(siteId) },
    select: { id: true, ownerId: true },
  });

  if (!site || site.ownerId !== user.id) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  try {
    const updated = await prisma.site.update({
      where: { id: site.id },
      data: { customDomain: normalized || null },
      select: { id: true, customDomain: true },
    });

    return NextResponse.json({ siteId: updated.id, customDomain: updated.customDomain });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'Domain already in use.' }, { status: 409 });
    }
    console.error('Failed to update custom domain', error);
    return NextResponse.json({ error: 'Failed to update custom domain.' }, { status: 500 });
  }
}
