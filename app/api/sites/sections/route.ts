import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { canAccessSite, getViewerContext } from '@/lib/rbac';
import { parseSectionContent, type SectionType } from '@/lib/section-content';

type PatchPayload = {
  sectionId?: unknown;
  siteId?: unknown;
  contentJson?: unknown;
};

function parseNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() && Number.isInteger(Number(value))) {
    return Number(value);
  }
  return null;
}

export async function PATCH(request: NextRequest) {
  let body: PatchPayload = {};
  try {
    body = (await request.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const sectionId = parseNumericId(body.sectionId);
  const siteId = parseNumericId(body.siteId);
  const contentJson = typeof body.contentJson === 'string' ? body.contentJson : null;

  if (!sectionId || !siteId || !contentJson) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const viewer = await getViewerContext();
  const section = await prisma.section.findFirst({
    where: { id: sectionId, siteId },
    include: {
      site: {
        select: { slug: true, ownerId: true, anonSessionId: true },
      },
    },
  });

  if (!section) {
    return NextResponse.json({ error: 'SECTION_NOT_FOUND' }, { status: 404 });
  }

  if (!canAccessSite(section.site, viewer)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const normalized = parseSectionContent(section.type as SectionType, contentJson);

  await prisma.section.update({
    where: { id: sectionId },
    data: { contentJson: JSON.stringify(normalized) },
  });

  return NextResponse.json({ ok: true });
}
