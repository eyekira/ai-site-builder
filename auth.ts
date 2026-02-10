import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

import { ANON_SESSION_COOKIE, getAnonSessionIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';

type CredentialsPayload = {
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
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

function normalizePhone(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D+/g, '');
  const normalizedDigits = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (normalizedDigits.length !== 10) {
    return null;
  }

  return `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6)}`;
}

async function upsertUser(email: string, name: string | null, phone: string | null) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { name: name ?? existing.name, phone: phone ?? existing.phone },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name: name ?? 'User',
      phone,
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
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const payload = credentials as CredentialsPayload;
        const email = normalizeEmail(payload.email);
        if (!email || !email.includes('@')) {
          return null;
        }

        const password = payload.password?.trim() ?? '';
        if (password.length < 6) {
          return null;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing?.passwordHash) {
          const isValid = await verifyPassword(password, existing.passwordHash);
          if (!isValid) {
            return null;
          }
          return { id: String(existing.id), email: existing.email, name: existing.name };
        }

        const name = normalizeName(payload.name, email);
        if (!name) {
          return null;
        }

        const rawPhone = payload.phone?.trim();
        const phone = normalizePhone(payload.phone);
        if (rawPhone && !phone) {
          return null;
        }
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
          data: {
            email,
            name,
            phone,
            passwordHash,
          },
        });

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
      const dbUser = await upsertUser(user.email, name, null);
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
