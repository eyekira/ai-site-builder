import type { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const ANON_SESSION_COOKIE = 'aisb_anon_session';
export const ANON_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function createAnonSessionId(): string {
  return crypto.randomUUID();
}

export function getAnonSessionIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(ANON_SESSION_COOKIE)?.value ?? null;
}

export function getAnonSessionIdFromCookies(cookieStore: CookieStore): string | null {
  return cookieStore.get(ANON_SESSION_COOKIE)?.value ?? null;
}
