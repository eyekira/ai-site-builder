import { NextRequest, NextResponse } from 'next/server';

import { classifyMenuPhotoViaVision, heuristicScore } from '@/lib/menu-photo-detect';
import { fetchPlaceDetails } from '@/lib/places';
import { getPreviewSessionRecord } from '@/lib/preview-session';
import { prisma } from '@/lib/prisma';

type ScanCacheEntry = {
  ref: string;
  thumbUrl: string;
  mediumUrl: string;
  source: 'Google photo';
  score: number;
  label: string;
  reason: string;
  textDensity: 'low' | 'med' | 'high';
  hasPrices: boolean;
  status: 'classified' | 'unclassified';
  errorCode?: string;
};

type ScanState = {
  cursor?: string;
  scannedCount: number;
  lastScanAt?: string;
  cache: Record<string, ScanCacheEntry>;
};

const SCAN_CAP = 120;
const LOAD_BATCH = 20;

function toPhotoUrl(ref: string, maxwidth: number) {
  return `/api/places/photo?ref=${encodeURIComponent(ref)}&maxwidth=${maxwidth}`;
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

  const beforeRefs = [
    ...(site.photos ?? []).map((p) => p.googlePhotoRef).filter((x): x is string => Boolean(x)),
  ];

  let detailRefs: Array<{ ref: string; width: number | null; height: number | null }> = [];
  try {
    if (site.placeId) {
      const details = await fetchPlaceDetails(site.placeId);
      detailRefs = details.photos.map((p) => ({ ref: p.ref, width: p.width, height: p.height }));
    }
  } catch {
    detailRefs = [];
  }

  const merged = [...beforeRefs, ...detailRefs.map((p) => p.ref)].slice(0, SCAN_CAP * 2);
  const allRefs = Array.from(new Set(merged)).slice(0, SCAN_CAP);

  const dimensionMap = new Map(detailRefs.map((p) => [p.ref, { width: p.width, height: p.height }]));

  const existingState = ((parsed.__menuPhotoScan as ScanState | undefined) ?? {
    cursor: undefined,
    scannedCount: 0,
    cache: {},
  }) as ScanState;

  const state: ScanState = body.action === 'rescan' ? { cursor: undefined, scannedCount: 0, cache: {} } : existingState;

  const start = state.cursor ? Math.max(0, allRefs.findIndex((r) => r === state.cursor) + 1) : 0;
  const refsToProcess =
    body.action === 'rescan'
      ? allRefs.slice(0, SCAN_CAP)
      : allRefs.slice(start, start + LOAD_BATCH);

  const heuristicSorted = refsToProcess
    .map((ref) => {
      const dim = dimensionMap.get(ref);
      return { ref, h: heuristicScore({ ref, width: dim?.width ?? null, height: dim?.height ?? null }) };
    })
    .sort((a, b) => b.h - a.h)
    .map((x) => x.ref);

  let menuHits = 0;
  let lastProcessed: string | undefined;
  for (const ref of heuristicSorted) {
    lastProcessed = ref;
    if (state.cache[ref]) {
      if (['menu_board', 'printed_menu', 'menu_screenshot'].includes(state.cache[ref].label)) menuHits += 1;
      continue;
    }

    const thumbUrl = toPhotoUrl(ref, 420);
    const mediumUrl = toPhotoUrl(ref, 1200);
    const vision = await classifyMenuPhotoViaVision(thumbUrl, ref);

    state.cache[ref] = {
      ref,
      thumbUrl,
      mediumUrl,
      source: 'Google photo',
      score: vision.score,
      label: vision.label,
      reason: vision.notes,
      textDensity: vision.text_density,
      hasPrices: vision.has_prices,
      status: vision.status,
      errorCode: vision.errorCode,
    };
    state.scannedCount += 1;
    if (['menu_board', 'printed_menu', 'menu_screenshot'].includes(vision.label)) menuHits += 1;

    if (body.action === 'rescan' && menuHits >= 3) break;
  }

  state.cursor = lastProcessed ?? state.cursor;
  state.lastScanAt = new Date().toISOString();

  const candidatesAll = Object.values(state.cache)
    .sort((a, b) => b.score - a.score)
    .map((entry) => ({
      key: entry.ref,

      ref: entry.ref,
      url: entry.mediumUrl,
      thumbUrl: entry.thumbUrl,
      source: entry.source,
      score: entry.score,
      label: entry.label,
      reason: entry.reason,
      textDensity: entry.textDensity,
      hasPrices: entry.hasPrices,
      status: entry.status,
      errorCode: entry.errorCode,
      selected: entry.score >= 0.65,
    }));

  const filtered = body.menuOnly
    ? candidatesAll.filter((c) => ['menu_board', 'printed_menu', 'menu_screenshot'].includes(c.label) || c.score >= 0.65)
    : candidatesAll;

  const updatedJson = JSON.stringify({
    ...parsed,
    __menuPhotoScan: {
      cursor: state.cursor,
      scannedCount: state.scannedCount,
      lastScanAt: state.lastScanAt,
      topCandidates: candidatesAll.slice(0, 8).map((c) => ({ ref: c.ref, score: c.score, reason: c.label })),
      cache: state.cache,
    },
  });

  await prisma.previewSession.update({
    where: { id: body.previewId },
    data: { dataJson: updatedJson },
  });

  const labelCounts = candidatesAll.reduce<Record<string, number>>((acc, c) => {
    const k = c.label ?? 'other';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const payload = {
    scannedCount: state.scannedCount,
    returnedCount: filtered.length,
    candidateRefs: filtered.map((c) => c.ref),
    deduped: { before: merged.length, after: allRefs.length, duplicatesDropped: merged.length - allRefs.length },
    cursor: state.cursor ?? null,
    labelCounts,
  };

  const debug = {
    placeId: site.placeId ?? null,
    endpoint: 'GET https://places.googleapis.com/v1/places/{placeId}',
    fieldMask: 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,regularOpeningHours,location,addressComponents,photos',
    fetchedCount: merged.length,
    uniqueCount: allRefs.length,
    duplicatesDropped: merged.length - allRefs.length,
    selectionStrategy: body.action === 'rescan' ? 'paged+deep-rescan' : 'paged-load-more',
    orderedAsReturned: true,
    cursor: state.cursor ?? null,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.info('[menu-photo-candidates][selection-debug]', debug);
    console.info('[menu-photo-candidates][counts]', payload);
  }

  return NextResponse.json({
    candidates: filtered,
    menuPhotoScan: {
      cursor: state.cursor,
      scannedCount: state.scannedCount,
      lastScanAt: state.lastScanAt,
      topCandidates: candidatesAll.slice(0, 8).map((c) => ({ ref: c.ref, score: c.score, reason: c.label })),
    },
    ...payload,
    debug: process.env.NODE_ENV !== 'production' ? debug : undefined,
  });
}
