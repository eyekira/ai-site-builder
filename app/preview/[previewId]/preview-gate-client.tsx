'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function PreviewGateClient({ previewId }: { previewId: string }) {
  const router = useRouter();
  const href = `/preview/${encodeURIComponent(previewId)}/menu-review`;

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-zinc-200 bg-white p-6 text-center">
      <p className="text-sm text-zinc-600">Menu review is required before preview.</p>
      <Link href={href} className="mt-3 inline-flex rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
        Complete Menu Review
      </Link>
    </div>
  );
}
