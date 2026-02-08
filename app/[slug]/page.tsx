import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getPublishedSiteForRender } from '@/lib/site';

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await getPublishedSiteForRender(slug);

  if (!site) {
    notFound();
  }

  return <SiteRenderer site={site} />;
}
