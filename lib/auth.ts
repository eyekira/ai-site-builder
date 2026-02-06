import type { NextRequest } from 'next/server';

export const DRAFT_COOKIE = 'aisb_drafts';

export type DraftCookiePayload = number[];

export function parseDraftCookie(value: string | undefined): DraftCookiePayload {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as DraftCookiePayload;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id) => Number.isInteger(id));
  } catch {
    return [];
  }
}

export function getDraftIdsFromRequest(request: NextRequest): number[] {
  return parseDraftCookie(request.cookies.get(DRAFT_COOKIE)?.value);
}

export function buildDraftCookieValue(existing: number[], nextId: number) {
  const unique = Array.from(new Set([nextId, ...existing]));
  return JSON.stringify(unique.slice(0, 20));
}
