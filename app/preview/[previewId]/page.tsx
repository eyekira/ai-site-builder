import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { Button } from '@/components/ui/button';
import { getPreviewSession } from '@/lib/preview-session';

export default async function PreviewPage({ params }: { params: Promise<{ previewId: string }> }) {
  const { previewId } = await params;
  const site = await getPreviewSession(previewId);

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Preview mode</p>
        <h1 className="mt-2 text-2xl font-semibold">Your site is ready to preview.</h1>
        <p className="mt-2 text-sm text-amber-800">
          This preview is temporary. Log in to save it and unlock editing tools.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/login?next=/preview/${encodeURIComponent(previewId)}`}>Log in to save</Link>
          </Button>
        </div>
      </div>

      <SiteRenderer site={site} />
    </div>
  );
}
