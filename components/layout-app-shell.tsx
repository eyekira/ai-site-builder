'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import LogoutButton from '@/components/auth/LogoutButton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type LayoutAppShellProps = {
  children: ReactNode;
  isAuthenticated: boolean;
};

const INTERNAL_SINGLE_SEGMENT_ROUTES = new Set(['', 'dashboard', 'login']);

function isPublishedSiteRoute(pathname: string): boolean {
  if (pathname.startsWith('/s/')) {
    return pathname.split('/').filter(Boolean).length === 2;
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length !== 1) {
    return false;
  }

  return !INTERNAL_SINGLE_SEGMENT_ROUTES.has(segments[0]);
}

export default function LayoutAppShell({ children, isAuthenticated }: LayoutAppShellProps) {
  const pathname = usePathname();
  const hideChrome = isPublishedSiteRoute(pathname);
  const buttonBase =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center justify-between">
          <Link className="text-lg font-semibold tracking-tight" href="/">
            AI Site Builder
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">MVP</Badge>
            {isAuthenticated ? (
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
  );
}
