import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getPublishedSiteForRender } from '@/lib/site';

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await getPublishedSiteForRender(slug);

  if (!site) {
    notFound();
  }

  const session = await auth();
  const canEdit = Number(session?.user?.id) === site.ownerId;

  return <SiteRenderer site={site} fullPage canEdit={canEdit} editorHref={`/editor/${site.slug}`} />;
}
