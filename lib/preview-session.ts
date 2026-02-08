import { prisma } from '@/lib/prisma';
import type { SiteForRender } from '@/lib/site';

export const PREVIEW_SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export async function createPreviewSession(site: SiteForRender) {
  const expiresAt = new Date(Date.now() + PREVIEW_SESSION_TTL_MS);
  return prisma.previewSession.create({
    data: {
      dataJson: JSON.stringify(site),
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });
}

export async function getPreviewSession(previewId: string): Promise<SiteForRender | null> {
  const session = await prisma.previewSession.findUnique({
    where: { id: previewId },
    select: {
      dataJson: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  try {
    return JSON.parse(session.dataJson) as SiteForRender;
  } catch {
    return null;
  }
}
