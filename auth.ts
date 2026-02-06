import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

import { ANON_SESSION_COOKIE, getAnonSessionIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type CredentialsPayload = {
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

async function upsertUser(email: string, name: string | null) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { name: name ?? existing.name },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name: name ?? 'User',
    },
  });
}

async function claimDraftsForUser(userId: number) {
  const cookieStore = await cookies();
  const anonSessionId = getAnonSessionIdFromCookies(cookieStore);

  if (!anonSessionId) {
    return 0;
  }

  const result = await prisma.site.updateMany({
    where: {
      anonSessionId,
      ownerId: null,
    },
    data: { ownerId: userId, anonSessionId: null },
  });

  cookieStore.set(ANON_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return result.count;
}

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? 'dev-secret',
  session: { strategy: 'jwt' },
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      authorize: async (credentials) => {
        const payload = credentials as CredentialsPayload;
        const email = normalizeEmail(payload.email);
        if (!email || !email.includes('@')) {
          return null;
        }

        const name = normalizeName(payload.name, email);
        const user = await upsertUser(email, name);

        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (!user.email) {
        return false;
      }

      const name = user.name ?? normalizeName(user.name ?? undefined, user.email);
      const dbUser = await upsertUser(user.email, name);
      user.id = String(dbUser.id);
      user.name = dbUser.name;

      await claimDraftsForUser(dbUser.id);
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
      }
      return session;
    },
  },
});
