import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatsigProvider from '@/app/providers/statsig-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Site Builder',
  description: 'Next.js App Router project scaffold',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StatsigProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <div className="container flex h-16 items-center justify-between">
                <a className="text-lg font-semibold tracking-tight" href="/">AI Site Builder</a>
                <Badge variant="secondary">MVP</Badge>
              </div>
            </header>
            <Separator />
            <main className="container flex-1 py-10">{children}</main>
          </div>
        </StatsigProvider>
      </body>
    </html>
  );
}
