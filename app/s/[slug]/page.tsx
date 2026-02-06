import { notFound } from 'next/navigation';
import { SiteStatus } from '@prisma/client';

import SiteRenderer from '@/app/components/site-renderer';
import { prisma } from '@/lib/prisma';

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

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      place: true,
    },
  });

  if (!site) {
    notFound();
  }

  if (site.status !== SiteStatus.PUBLISHED) {
    notFound();
  }

  return <SiteRenderer siteTitle={site.title} sections={site.sections} embedMode={embedMode} />;
}
