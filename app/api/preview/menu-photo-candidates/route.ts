import { NextRequest, NextResponse } from 'next/server';

import { classifyMenuPhotoViaVision, heuristicScore } from '@/lib/menu-photo-detect';
import { fetchPlaceDetails } from '@/lib/places';
import { getPreviewSessionRecord } from '@/lib/preview-session';
import { prisma } from '@/lib/prisma';

type ScanCacheEntry = {
  ref: string;
  url: string;
  source: 'Google photo';
  score: number;
  reason: string;
  textDensity: 'low' | 'medium' | 'high';
  pricePatternDetected: boolean;
};

type ScanState = {
  cursor?: string;
  scannedCount: number;
  lastScanAt?: string;
  cache: Record<string, ScanCacheEntry>;
};

function toPhotoUrl(ref: string) {
  return `/api/places/photo?ref=${encodeURIComponent(ref)}&maxwidth=1200`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { previewId?: string; action?: 'load_more' | 'rescan'; menuOnly?: boolean }
    | null;

  if (!body?.previewId) return NextResponse.json({ error: 'PREVIEW_ID_REQUIRED' }, { status: 400 });

  const session = await getPreviewSessionRecord(body.previewId);
  if (!session) return NextResponse.json({ error: 'PREVIEW_NOT_FOUND' }, { status: 404 });

  const parsed = JSON.parse(session.dataJson) as Record<string, unknown>;
  const site = parsed as { placeId?: string | null; photos?: Array<{ googlePhotoRef?: string | null; url?: string }> };

  const baseRefs = (site.photos ?? []).map((p) => p.googlePhotoRef).filter((x): x is string => Boolean(x));
  let detailRefs: string[] = [];
  try {
    if (site.placeId) {
      const details = await fetchPlaceDetails(site.placeId);
      detailRefs = details.photos.map((p) => p.ref);
    }
  } catch {
    detailRefs = [];
  }

  const allRefs = Array.from(new Set([...baseRefs, ...detailRefs])).slice(0, 60);

  const existingState = ((parsed.__menuPhotoScan as ScanState | undefined) ?? {
    cursor: undefined,
    scannedCount: 0,
    cache: {},
  }) as ScanState;

  const state: ScanState = body.action === 'rescan' ? { cursor: undefined, scannedCount: 0, cache: {} } : existingState;

  const start = state.cursor ? Math.max(0, allRefs.findIndex((r) => r === state.cursor) + 1) : 0;
  const batchRefs = allRefs.slice(start, start + 12);

  const heuristicSorted = batchRefs
    .map((ref) => ({ ref, h: heuristicScore({ ref }) }))
    .sort((a, b) => b.h - a.h)
    .slice(0, 30)
    .map((x) => x.ref);

  for (const ref of heuristicSorted) {
    if (state.cache[ref]) continue;
    const url = toPhotoUrl(ref);
    const vision = await classifyMenuPhotoViaVision(url);
    state.cache[ref] = {
      ref,
      url,
      source: 'Google photo',
      score: vision.menuLikelihoodScore,
      reason: vision.reason,
      textDensity: vision.text_density,
      pricePatternDetected: vision.price_pattern_detected,
    };
    state.scannedCount += 1;
  }

  state.cursor = batchRefs.length > 0 ? batchRefs[batchRefs.length - 1] : state.cursor;
  state.lastScanAt = new Date().toISOString();

  const topCandidates = Object.values(state.cache)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((entry) => ({
      ref: entry.ref,
      url: entry.url,
      source: entry.source,
      score: entry.score,
      reason: entry.reason,
      status: 'pending' as const,
      selected: entry.score >= 0.65,
    }));

  const filtered = body.menuOnly ? topCandidates.filter((c) => c.score >= 0.5) : topCandidates;

  const updatedJson = JSON.stringify({
    ...parsed,
    __menuPhotoScan: {
      cursor: state.cursor,
      scannedCount: state.scannedCount,
      lastScanAt: state.lastScanAt,
      topCandidates: topCandidates.map((c) => ({ ref: c.ref, score: c.score, reason: c.reason })),
      cache: state.cache,
    },
  });

  await prisma.previewSession.update({
    where: { id: body.previewId },
    data: { dataJson: updatedJson },
  });

  return NextResponse.json({
    candidates: filtered,
    menuPhotoScan: {
      cursor: state.cursor,
      scannedCount: state.scannedCount,
      lastScanAt: state.lastScanAt,
      topCandidates: topCandidates.map((c) => ({ ref: c.ref, score: c.score, reason: c.reason })),
    },
  });
}
