import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getViewerContext } from '@/lib/rbac';
import { getSiteForOwnerRender } from '@/lib/site';

export default async function EditorPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await getViewerContext();

  if (!viewer.userId) {
    notFound();
  }

  const site = await getSiteForOwnerRender(slug, viewer.userId);

  if (!site) {
    notFound();
  }

  return <SiteRenderer site={site} embedMode />;
}
