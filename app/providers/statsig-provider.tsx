'use client';

import { useEffect, type ReactNode } from 'react';

let hasWarned = false;

function warnOnce(message: string) {
  if (hasWarned) {
    return;
  }

  hasWarned = true;
  console.warn(message);
}

export default function StatsigProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
    if (!clientKey) {
      return;
    }

    const statsig = (window as typeof window & { Statsig?: { initialize?: (key: string) => Promise<unknown> | void } })
      .Statsig;
    if (!statsig?.initialize) {
      warnOnce('Statsig SDK not available; skipping initialization.');
      return;
    }

    try {
      const result = statsig.initialize(clientKey);
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        (result as Promise<unknown>).catch(() => {
          warnOnce('Statsig initialization failed; continuing without feature gates.');
        });
      }
    } catch {
      warnOnce('Statsig initialization failed; continuing without feature gates.');
    }
  }, []);

  return <>{children}</>;
}
