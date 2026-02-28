import { prisma } from '@/lib/prisma';
import type { SiteForRender } from '@/lib/site';

export const PREVIEW_SESSION_TTL_MS = 1000 * 60 * 60 * 24;

type PreviewSessionRecord = {
  id: string;
  dataJson: string;
  expiresAt: Date;
  menuReviewCompleted: boolean;
};

type SiteWithFlowFlag = SiteForRender & { __menuReviewCompleted?: boolean };

function encodeSite(site: SiteForRender, completed: boolean): string {
  return JSON.stringify({ ...site, __menuReviewCompleted: completed } satisfies SiteWithFlowFlag);
}

function decodeSite(dataJson: string): { site: SiteForRender | null; menuReviewCompleted: boolean } {
  try {
    const parsed = JSON.parse(dataJson) as SiteWithFlowFlag;
    const { __menuReviewCompleted, ...site } = parsed;
    return {
      site: site as SiteForRender,
      menuReviewCompleted: Boolean(__menuReviewCompleted),
    };
  } catch {
    return { site: null, menuReviewCompleted: false };
  }
}

export async function createPreviewSession(site: SiteForRender) {
  const expiresAt = new Date(Date.now() + PREVIEW_SESSION_TTL_MS);
  const dataJson = encodeSite(site, false);

  try {
    return await prisma.previewSession.create({
      data: {
        dataJson,
        menuReviewCompleted: false,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
        menuReviewCompleted: true,
      },
    });
  } catch {
    // Fallback for DBs that have not applied menuReviewCompleted migration yet.
    return prisma.previewSession.create({
      data: {
        dataJson,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });
  }
}

export async function getPreviewSession(previewId: string): Promise<SiteForRender | null> {
  const session = await getPreviewSessionRecord(previewId);
  if (!session) return null;
  return decodeSite(session.dataJson).site;
}

export async function getPreviewSessionRecord(previewId: string): Promise<PreviewSessionRecord | null> {
  try {
    const session = await prisma.previewSession.findUnique({
      where: { id: previewId },
      select: { id: true, dataJson: true, expiresAt: true, menuReviewCompleted: true },
    });

    if (!session || session.expiresAt <= new Date()) return null;

    return {
      id: session.id,
      dataJson: session.dataJson,
      expiresAt: session.expiresAt,
      menuReviewCompleted: session.menuReviewCompleted,
    };
  } catch {
    const fallback = await prisma.previewSession.findUnique({
      where: { id: previewId },
      select: { id: true, dataJson: true, expiresAt: true },
    });

    if (!fallback || fallback.expiresAt <= new Date()) return null;

    const decoded = decodeSite(fallback.dataJson);
    return {
      id: fallback.id,
      dataJson: fallback.dataJson,
      expiresAt: fallback.expiresAt,
      menuReviewCompleted: decoded.menuReviewCompleted,
    };
  }
}

export async function updatePreviewSessionSite(previewId: string, site: SiteForRender): Promise<{ id: string }> {
  return prisma.previewSession.update({
    where: { id: previewId },
    data: { dataJson: encodeSite(site, false) },
    select: { id: true },
  });
}

export async function completeMenuReview(previewId: string, site: SiteForRender): Promise<{ id: string; menuReviewCompleted: boolean }> {
  const dataJson = encodeSite(site, true);

  try {
    return await prisma.previewSession.update({
      where: { id: previewId },
      data: {
        dataJson,
        menuReviewCompleted: true,
      },
      select: { id: true, menuReviewCompleted: true },
    });
  } catch {
    const updated = await prisma.previewSession.update({
      where: { id: previewId },
      data: { dataJson },
      select: { id: true },
    });
    return { id: updated.id, menuReviewCompleted: true };
  }
}
