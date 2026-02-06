import { notFound } from 'next/navigation';
import { SiteStatus } from '@prisma/client';

import EditorShell from './EditorShell';
import { prisma } from '@/lib/prisma';
import { type SectionType } from '@/lib/section-content';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const isDraft = site.status === SiteStatus.DRAFT;
  const isUnclaimed = !site.ownerId && isDraft;

  if (site.ownerId && !isUnclaimed) {
    notFound();
  }

  return (
    <EditorShell
      siteId={site.id}
      slug={site.slug}
      isDraft={isDraft}
      isUnclaimed={isUnclaimed}
      sections={site.sections.map((section) => ({
        id: section.id,
        type: section.type as SectionType,
        order: section.order,
        contentJson: section.contentJson,
      }))}
    />
  );
}
