import { notFound } from 'next/navigation';

import { SiteRenderer } from '@/components/site/SiteRenderer';
import { getPublishedSiteForRender } from '@/lib/site';

type SitePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string | string[] }>;
};

function isEmbedMode(embedParam: string | string[] | undefined): boolean {
  const embedValue = Array.isArray(embedParam) ? embedParam[0] : embedParam;
  return embedValue === '1' || embedValue === 'true';
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const embedMode = isEmbedMode(query.embed);

  const site = await getPublishedSiteForRender(slug);

  if (!site) {
    notFound();
  }

  return <SiteRenderer site={site} embedMode={embedMode} fullPage={!embedMode} />;
}
