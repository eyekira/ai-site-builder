import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE, DRAFT_COOKIE, getDraftIdsFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type LoginPayload = {
  email?: string;
  name?: string;
};

function normalizeEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeName(value: string | undefined, fallbackEmail: string) {
  const trimmed = value?.trim();
  if (trimmed) {
    return trimmed;
  }

  const fallback = fallbackEmail.split('@')[0];
  return fallback || 'User';
}

export async function POST(request: NextRequest) {
  let body: LoginPayload;

  try {
    body = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  const name = normalizeName(body.name, email);

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { name },
      })
    : await prisma.user.create({
        data: { email, name },
      });

  const draftIds = getDraftIdsFromRequest(request);
  const claimResult =
    draftIds.length > 0
      ? await prisma.site.updateMany({
          where: {
            id: { in: draftIds },
            ownerId: null,
          },
          data: { ownerId: user.id },
        })
      : { count: 0 };

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    claimedDrafts: claimResult.count,
  });

  response.cookies.set(AUTH_COOKIE, String(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set(DRAFT_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
