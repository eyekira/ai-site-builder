import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { auth } from '@/auth';
import LayoutAppShell from '@/components/layout-app-shell';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Site Builder',
  description: 'Next.js App Router project scaffold',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutAppShell isAuthenticated={Boolean(session?.user?.id)}>{children}</LayoutAppShell>
      </body>
    </html>
  );
}
