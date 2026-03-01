import { notFound, redirect } from 'next/navigation';

import { getPreviewSession, getPreviewSessionRecord } from '@/lib/preview-session';
import { MenuReviewClient } from '../menu-review-client';

export default async function PreviewMenuReviewPage({ params }: { params: Promise<{ previewId: string }> }) {
  const { previewId } = await params;
  const record = await getPreviewSessionRecord(previewId);

  if (process.env.NODE_ENV !== 'production') {
    console.info('[menu-review-page]', {
      previewId,
      hasSession: Boolean(record),
      menuReviewCompleted: record?.menuReviewCompleted ?? null,
      decision: !record ? 'notFound' : record.menuReviewCompleted ? 'redirectPreview' : 'renderMenuReview',
    });
  }

  if (!record) {
    notFound();
  }

  if (record.menuReviewCompleted) {
    redirect(`/preview/${encodeURIComponent(previewId)}`);
  }

  const site = await getPreviewSession(previewId);
  if (!site) {
    notFound();
  }

  return <MenuReviewClient previewId={previewId} initialSite={site} continueHref={`/preview/${encodeURIComponent(previewId)}`} />;
}
