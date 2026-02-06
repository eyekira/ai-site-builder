import { NextRequest, NextResponse } from 'next/server';
import { SiteStatus } from '@prisma/client';

import { getMvpUserIdFromHeaders } from '@/lib/mvp-auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const mvpUserId = getMvpUserIdFromHeaders(request.headers);

  if (!mvpUserId) {
    return NextResponse.json({ error: 'Missing MVP user header.' }, { status: 401 });
  }

  const site = await prisma.site.findUnique({ where: { slug } });

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  if (!site.ownerId) {
    return NextResponse.json({ error: 'Unclaimed drafts cannot be published.' }, { status: 403 });
  }

  if (site.ownerId !== mvpUserId) {
    return NextResponse.json({ error: 'Not allowed to publish this site.' }, { status: 403 });
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      status: SiteStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    site: {
      slug: updated.slug,
      status: updated.status,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    },
  });
}
