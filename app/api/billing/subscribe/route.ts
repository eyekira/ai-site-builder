import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { subscribed: true },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, subscribed: true });
}
