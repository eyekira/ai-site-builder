import { notFound } from 'next/navigation';

import SiteRenderer from '@/app/components/site-renderer';
import { prisma } from '@/lib/prisma';

export default async function EditorPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  return <SiteRenderer siteTitle={site.title} sections={site.sections} embedMode={true} />;
}
