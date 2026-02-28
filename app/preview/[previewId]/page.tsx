import { notFound, redirect } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getPreviewSession, getPreviewSessionRecord } from '@/lib/preview-session';

export default async function PreviewPage({ params }: { params: Promise<{ previewId: string }> }) {
  const { previewId } = await params;
  const record = await getPreviewSessionRecord(previewId);

  if (!record) notFound();

  if (!record.menuReviewCompleted) {
    redirect(`/preview/${encodeURIComponent(previewId)}/menu-review`);
  }

  const site = await getPreviewSession(previewId);
  if (!site) notFound();

  return <SiteRenderer site={site} fullPage />;
}
