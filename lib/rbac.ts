import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export type AuthenticatedUser = {
  id: number;
  subscribed: boolean;
};

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
