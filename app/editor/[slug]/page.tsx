import { randomUUID } from 'crypto';
import { notFound } from 'next/navigation';

import EditorShell from './EditorShell';
import { getMvpUserIdFromRequest } from '@/lib/mvp-auth';
import { prisma } from '@/lib/prisma';
import { type SectionType } from '@/lib/section-content';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mvpUserId = await getMvpUserIdFromRequest();

  if (!mvpUserId) {
    notFound();
  }

  let site = await prisma.site.findFirst({
    where: { slug, ownerId: mvpUserId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  if (!site.previewToken) {
    site = await prisma.site.update({
      where: { id: site.id },
      data: { previewToken: randomUUID() },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  return (
    <EditorShell
      siteId={site.id}
      slug={site.slug}
      status={site.status}
      publishedAt={site.publishedAt ? site.publishedAt.toISOString() : null}
      previewToken={site.previewToken}
      mvpUserId={mvpUserId}
      sections={site.sections.map((section) => ({
        id: section.id,
        type: section.type as SectionType,
        order: section.order,
        contentJson: section.contentJson,
      }))}
    />
  );
}
