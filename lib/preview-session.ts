import { prisma } from '@/lib/prisma';
import type { SiteForRender } from '@/lib/site';

export const PREVIEW_SESSION_TTL_MS = 1000 * 60 * 60 * 24;

type PreviewSessionRecord = {
  id: string;
  dataJson: string;
  expiresAt: Date;
  menuReviewCompleted: boolean;
};

export async function createPreviewSession(site: SiteForRender) {
  const expiresAt = new Date(Date.now() + PREVIEW_SESSION_TTL_MS);
  return prisma.previewSession.create({
    data: {
      dataJson: JSON.stringify(site),
      menuReviewCompleted: false,
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
      menuReviewCompleted: true,
    },
  });
}

export async function getPreviewSession(previewId: string): Promise<SiteForRender | null> {
  const session = await getPreviewSessionRecord(previewId);

  if (!session) return null;

  try {
    return JSON.parse(session.dataJson) as SiteForRender;
  } catch {
    return null;
  }
}

export async function getPreviewSessionRecord(previewId: string): Promise<PreviewSessionRecord | null> {
  const session = await prisma.previewSession.findUnique({
    where: { id: previewId },
    select: { id: true, dataJson: true, expiresAt: true, menuReviewCompleted: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  return session;
}

export async function updatePreviewSessionSite(previewId: string, site: SiteForRender): Promise<{ id: string }> {
  return prisma.previewSession.update({
    where: { id: previewId },
    data: { dataJson: JSON.stringify(site) },
    select: { id: true },
  });
}

export async function completeMenuReview(previewId: string, site: SiteForRender): Promise<{ id: string; menuReviewCompleted: boolean }> {
  return prisma.previewSession.update({
    where: { id: previewId },
    data: {
      dataJson: JSON.stringify(site),
      menuReviewCompleted: true,
    },
    select: { id: true, menuReviewCompleted: true },
  });
}
