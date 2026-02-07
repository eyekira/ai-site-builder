import { NextRequest, NextResponse } from 'next/server';

import { SiteStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

function normalizeDomain(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = normalizeDomain(searchParams.get('domain'));

  if (!domain) {
    return NextResponse.json({ error: 'domain is required.' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: {
      customDomain: domain,
      status: SiteStatus.PUBLISHED,
    },
    select: { slug: true },
  });

  if (!site) {
    return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });
  }

  return NextResponse.json({ slug: site.slug });
}
