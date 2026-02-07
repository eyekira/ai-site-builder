import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { auth } from '@/auth';
import LogoutButton from '@/components/auth/LogoutButton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Site Builder',
  description: 'Next.js App Router project scaffold',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const buttonBase =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container flex h-16 items-center justify-between">
              <a className="text-lg font-semibold tracking-tight" href="/">
                AI Site Builder
              </a>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">MVP</Badge>
                {session?.user?.id ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={cn(
                        buttonBase,
                        'h-9 px-3 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      Dashboard
                    </Link>
                    <LogoutButton className={cn(buttonBase, 'h-9 px-3 border border-input bg-background hover:bg-muted')} />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={cn(
                      buttonBase,
                      'h-9 px-3 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </header>
          <Separator />
          <main className="container flex-1 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
