import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getSiteForRender } from '@/lib/site';

export default async function EditorPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await getSiteForRender(slug);

  if (!site) {
    notFound();
  }

  return <SiteRenderer site={site} embedMode />;
}
