import { headers } from 'next/headers';

export function parseMvpUserId(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function getMvpUserIdFromHeaders(source: Headers): number | null {
  return parseMvpUserId(source.get('x-mvp-user-id'));
}

export async function getMvpUserIdFromRequest(): Promise<number | null> {
  const headerList = await headers();
  return getMvpUserIdFromHeaders(headerList);
}
