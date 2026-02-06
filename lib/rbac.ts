import { cookies } from 'next/headers';

import { auth } from '@/auth';
import { getAnonSessionIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AuthenticatedUser = {
  id: number;
  subscribed: boolean;
};

export type ViewerContext = {
  userId: number | null;
  anonSessionId: string | null;
};

export function canAccessSite(
  site: { ownerId: number | null; anonSessionId: string | null },
  viewer: ViewerContext,
): boolean {
  if (site.ownerId) {
    return site.ownerId === viewer.userId;
  }

  if (site.anonSessionId) {
    return site.anonSessionId === viewer.anonSessionId;
  }

  return false;
}

export async function getViewerContext(): Promise<ViewerContext> {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const cookieStore = await cookies();
  const anonSessionId = getAnonSessionIdFromCookies(cookieStore);

  return {
    userId: !userId || Number.isNaN(userId) ? null : userId,
    anonSessionId,
  };
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  if (!userId || Number.isNaN(userId)) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, subscribed: true },
  });
}
