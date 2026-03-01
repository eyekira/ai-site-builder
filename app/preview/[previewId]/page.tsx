import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getPreviewSession, getPreviewSessionRecord } from '@/lib/preview-session';
import { PreviewGateClient } from './preview-gate-client';

export default async function PreviewPage({ params }: { params: Promise<{ previewId: string }> }) {
  const { previewId } = await params;
  const record = await getPreviewSessionRecord(previewId);

  if (process.env.NODE_ENV !== 'production') {
    console.info('[preview-page]', {
      previewId,
      hasSession: Boolean(record),
      menuReviewCompleted: record?.menuReviewCompleted ?? null,
      decision: !record ? 'notFound' : record.menuReviewCompleted ? 'renderPreview' : 'redirectToMenuReview',
    });
  }

  if (!record) notFound();

  if (!record.menuReviewCompleted) {
    return <PreviewGateClient previewId={previewId} />;
  }

  const site = await getPreviewSession(previewId);
  if (!site) notFound();

  return <SiteRenderer site={site} fullPage />;
}
