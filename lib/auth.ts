import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

export const AUTH_COOKIE = 'aisb_user';
export const DRAFT_COOKIE = 'aisb_drafts';

type DraftCookiePayload = number[];

function parseDraftCookie(value: string | undefined): DraftCookiePayload {
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

export async function getDraftIdsFromCookies(): Promise<number[]> {
  const cookieStore = await cookies();
  return parseDraftCookie(cookieStore.get(DRAFT_COOKIE)?.value);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_COOKIE)?.value;
  const userId = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isInteger(userId)) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: userId } });
}

export async function setAuthCookie(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function buildDraftCookieValue(existing: number[], nextId: number) {
  const unique = Array.from(new Set([nextId, ...existing]));
  return JSON.stringify(unique.slice(0, 20));
}

export async function setDraftCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearDraftCookie() {
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
